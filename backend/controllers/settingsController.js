const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    // Checkboxes only send value if checked when using FormData
    // We identify all boolean fields from the model
    const booleanFields = [
      'enable_2fa', 'force_password_change', 'logout_idle_sessions', 
      'notify_new_shelters', 'notify_donations', 'notify_dog_reports', 
      'notify_adoption_requests', 'notify_email', 'notify_sms', 
      'auto_route_reports', 'require_adoption_approval', 'isMaintenanceMode',
      // Permissions
      'superAdmin_shelters', 'superAdmin_dogs', 'superAdmin_adoptions', 'superAdmin_donations', 'superAdmin_users', 'superAdmin_reports',
      'shelterAdmin_shelters', 'shelterAdmin_dogs', 'shelterAdmin_adoptions', 'shelterAdmin_donations', 'shelterAdmin_users', 'shelterAdmin_reports',
      'user_shelters', 'user_dogs', 'user_adoptions', 'user_donations', 'user_users', 'user_reports'
    ];
    
    booleanFields.forEach(field => {
        if(req.body[field] === 'on' || req.body[field] === true || req.body[field] === 'true') {
            settings[field] = true;
        } else {
             settings[field] = false; // Missing or explicitly false/off means false
        }
    });

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error("Update Settings Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetSettings = async (req, res) => {
    try {
        await Settings.deleteMany({});
        const settings = await Settings.create({});
        res.json({ message: 'Settings reset to defaults successfully', settings });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
