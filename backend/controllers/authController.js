const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role, assignedShelter: user.assignedShelter },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, password, phone, city, assignedShelter } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Maintenance Mode Check
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isMaintenanceMode) {
       return res.status(503).json({ 
         message: 'Platform is currently under maintenance. Registration is temporarily disabled.',
         maintenance: true 
       });
    }

    const user = await User.create({ name, email, password, phone: phone || '', city: city || '', role: 'User', assignedShelter: assignedShelter || '' });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, assignedShelter: user.assignedShelter } });
  } catch (err) {
    // Log full error stack for debugging
    console.error('⚠️ Register error:', err);
    // Return the error message to the client (temporary for debugging)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Maintenance Mode Check
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isMaintenanceMode && user.role !== 'Super Admin') {
      return res.status(503).json({ 
        message: 'Platform is currently under maintenance. Only Super Admins can login at this time.',
        maintenance: true 
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, assignedShelter: user.assignedShelter } });
  } catch (err) {
    // Log full error stack for debugging
    console.error('⚠️ Login error:', err);
    // Return the error message to the client (temporary for debugging)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook hashes the new password

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('⚠️ Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const message = `Your password reset code is: ${resetCode}\n\nIt expires in 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Code - Street2Home',
      message
    });

    if (!process.env.SMTP_PASSWORD) {
      res.json({ message: 'Verification code sent to email', developmentCode: resetCode });
    } else {
      res.json({ message: 'Verification code sent to email' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.json({ message: 'Code is valid' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset completely successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, changePassword, forgotPassword, verifyResetCode, resetPassword };
