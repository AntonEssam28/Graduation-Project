const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "Super Admin",
        "Shelter Admin",
        "Volunteer",
        "Adopter",
        "User",
        "Vet",
        "Staff",
      ],
      default: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Pending Approval", "Suspended", "Invited"],
      default: "Active",
    },
    assignedShelter: {
      type: String,
      default: "",
      trim: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    photo: {
      type: String,
      default: "",
    },
    resetPasswordCode: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);