const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Maintenance Mode Check
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne();
    if (settings && settings.isMaintenanceMode && decoded.role !== 'Super Admin') {
      return res.status(503).json({ 
        message: 'Platform is currently under maintenance. Only Super Admins can access at this time.',
        maintenance: true 
      });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
