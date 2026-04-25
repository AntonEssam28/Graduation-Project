const User = require('../models/User');

const getStaff = async (req, res) => {
  try {
    const filter = { role: 'Staff' };
    if (req.query.shelter) {
      filter.assignedShelter = req.query.shelter;
    }
    const staffMembers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(staffMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch staff members' });
  }
};

// Create a new staff member (only accessible by Shelter Admin)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone = '', city = '', photo = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    // Ensure email is unique
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const staff = await User.create({
      name,
      email,
      password,
      phone,
      city,
      role: 'Staff',
      status: 'Active',
      photo,
      assignedShelter: req.body.assignedShelter,
    });
    res.status(201).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create staff' });
  }
};

// Update a staff member
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, city, status, photo } = req.body;
    
    // If email is provided, ensure it's not taken by another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }
    
    const updateData = { name, email, phone, city, status, photo };
    if (password) updateData.password = password;

    const staffMember = await User.findById(id);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Use save() if password is being updated to trigger hashing middleware
    if (password) {
      Object.assign(staffMember, updateData);
      await staffMember.save();
      return res.status(200).json(staffMember);
    }

    const updatedStaff = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedStaff);
    
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update staff' });
  }
};

// Delete a staff member
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Staff removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete staff' });
  }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };
