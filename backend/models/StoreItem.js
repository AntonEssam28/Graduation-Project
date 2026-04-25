const mongoose = require("mongoose");

const storeItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Draft", "Out of Stock"],
      default: "Active",
    },
    photo: {
      type: String,
      default: "",
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
    },
    isDonationOnly: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const StoreItem = mongoose.models.StoreItem || mongoose.model("StoreItem", storeItemSchema);

module.exports = StoreItem;

