const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Could be guest?
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StoreItem",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        shelterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Shelter",
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingDetails: {
      fullName: String,
      email: String,
      phone: String,
      city: String,
      address: String,
      notes: String,
    },
    paymentMethod: {
      type: String,
      enum: ["Instapay", "Cash on Delivery", "Wallet"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["Purchase", "Donation"],
      default: "Purchase",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded"],
      default: "Unpaid",
    },
    paymentScreenshot: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
