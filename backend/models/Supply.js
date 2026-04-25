const mongoose = require("mongoose");

const supplySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Food", "Medicine", "Bedding", "Accessories", "Care", "Toys"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock", "Requested"],
      default: "Available",
    },
    shelter: {
      type: String,
      required: true,
      trim: true,
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    history: [
      {
        date: { type: String },
        quantity: { type: Number },
        source: { type: String },
        notes: { type: String },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supply", supplySchema);
