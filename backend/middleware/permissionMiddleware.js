const Settings = require('../models/Settings');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Super Admins bypass permission checks generally
      if (req.user && req.user.role === 'Super Admin') {
        return next();
      }

      // 2. Fetch platform settings
      const settings = await Settings.findOne();
      if (!settings) {
        return next(); // If no settings, allow by default or block? Let's allow for now.
      }

      // 3. Map user role to settings key
      const role = req.user.role;
      const roleKey = role === 'Shelter Admin' ? 'shelterAdmin' : 
                      role === 'Super Admin' ? 'superAdmin' : 'user';
      
      const permKey = `${roleKey}_${requiredPermission}`;

      // 4. Check if permission is granted
      if (settings[permKey] === true) {
        return next();
      }

      // 5. Special case: Shelter Admins might have implicit permissions for their own data
      // but if the super admin explicitly disabled it, we block here.
      
      return res.status(403).json({ 
        message: `Forbidden: You do not have the '${requiredPermission}' permission.` 
      });
      
    } catch (error) {
      console.error("Permission Middleware Error:", error);
      res.status(500).json({ message: "Internal server error during permission check" });
    }
  };
};

module.exports = checkPermission;
