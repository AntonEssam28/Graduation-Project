const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platform_name: { type: String, default: 'Street2Home' },
  site_title: { type: String, default: 'Street2Home Control Center' },
  default_language: { type: String, default: 'English' },
  timezone: { type: String, default: 'Africa/Cairo' },
  brand_color: { type: String, default: '#0f172a' },
  currency: { type: String, default: 'EGP' },
  admin_name: { type: String },
  admin_email: { type: String },
  admin_phone: { type: String },
  office_location: { type: String },
  admin_bio: { type: String },
  session_timeout: { type: String, default: '30 minutes' },
  enable_2fa: { type: Boolean, default: true },
  force_password_change: { type: Boolean, default: true },
  logout_idle_sessions: { type: Boolean, default: true },
  notify_new_shelters: { type: Boolean, default: true },
  notify_donations: { type: Boolean, default: true },
  notify_dog_reports: { type: Boolean, default: true },
  notify_adoption_requests: { type: Boolean, default: true },
  notify_email: { type: Boolean, default: true },
  notify_sms: { type: Boolean, default: false },
  
  // Roles & Permissions (Dynamic flattened)
  superAdmin_shelters: { type: Boolean, default: true },
  superAdmin_dogs: { type: Boolean, default: true },
  superAdmin_adoptions: { type: Boolean, default: true },
  superAdmin_donations: { type: Boolean, default: true },
  superAdmin_users: { type: Boolean, default: true },
  superAdmin_reports: { type: Boolean, default: true },
  
  shelterAdmin_shelters: { type: Boolean, default: true },
  shelterAdmin_dogs: { type: Boolean, default: true },
  shelterAdmin_adoptions: { type: Boolean, default: true },
  shelterAdmin_donations: { type: Boolean, default: true },
  shelterAdmin_users: { type: Boolean, default: false },
  shelterAdmin_reports: { type: Boolean, default: true },
  
  user_shelters: { type: Boolean, default: false },
  user_dogs: { type: Boolean, default: false },
  user_adoptions: { type: Boolean, default: true },
  user_donations: { type: Boolean, default: true },
  user_users: { type: Boolean, default: false },
  user_reports: { type: Boolean, default: true },

  auto_approve_shelters: { type: String, default: 'No (Manual Review)' },
  assignment_radius: { type: String, default: '10 km' },
  auto_route_reports: { type: Boolean, default: true },
  require_adoption_approval: { type: Boolean, default: true },
  
  // Danger Zone
  isMaintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
