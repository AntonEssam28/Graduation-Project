const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Pending Approval", "Under Review", "Suspended"],
      default: "Pending Approval",
    },
    dogsCount: {
      type: Number,
      default: 0,
    },
    reportsCount: {
      type: Number,
      default: 0,
    },
    suppliesAlerts: {
      type: Number,
      default: 0,
    },
    // GENERAL SETTINGS
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    timezone: { type: String, default: "Africa/Cairo" },
    social_link: { type: String, default: "" },
    
    // PROFILE SETTINGS
    capacity: { type: Number, default: 0 },
    open_days: { type: String, default: "" },
    opening_time: { type: String, default: "" },
    closing_time: { type: String, default: "" },
    description: { type: String, default: "" },
    
    // TEAM SETTINGS
    assistant_admin: { type: String, default: "" },
    vet_contact: { type: String, default: "" },
    staff_count: { type: Number, default: 0 },
    allow_staff_invites: { type: Boolean, default: true },
    allow_volunteer_acceptance: { type: Boolean, default: true },
    show_public_team: { type: Boolean, default: false },
    
    // NOTIFICATIONS
    notify_new_dogs: { type: Boolean, default: true },
    notify_reports: { type: Boolean, default: true },
    notify_donations: { type: Boolean, default: true },
    notify_volunteers: { type: Boolean, default: true },
    notify_email: { type: Boolean, default: true },
    notify_in_app: { type: Boolean, default: true },

    // EMERGENCY SUPPORT
    emergency_contact_name: { type: String, default: "" },
    emergency_contact_phone: { type: String, default: "" },
    nearest_clinic: { type: String, default: "" },
    backup_transport: { type: String, default: "" },
    emergency_notes: { type: String, default: "" },
    
    // CLINIC SETTINGS
    clinicServices: [{
      name: { type: String }, // e.g., Grooming, Nails, etc.
      price: { type: Number, default: 0 },
      available: { type: Boolean, default: true },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shelter", shelterSchema);