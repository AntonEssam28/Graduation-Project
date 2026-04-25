const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Pending", "Assigned", "In Progress", "Resolved", "Dismissed", "Closed"],
      default: "New",
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      default: null,
    },
    reporterName: {
      type: String,
      default: "",
      trim: true,
    },
    reporterPhone: {
      type: String,
      default: "",
      trim: true,
    },
    reporterEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    shelter: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    dogCondition: {
      type: String,
      default: "",
    },
    photoAvailable: {
      type: Boolean,
      default: false,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
