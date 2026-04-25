const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    type: {
      type: String,
      enum: ["Cash", "Food", "Medicine", "Supplies"],
      default: "Cash",
      required: true,
    },

    value: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "EGP", trim: true },

    shelter: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Received", "Rejected"],
      default: "Pending",
    },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);