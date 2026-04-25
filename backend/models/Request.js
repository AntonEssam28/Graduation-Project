const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
    },
    requesterPhone: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Adoption", "Foster", "Boarding", "Suspension", "Activation", "Donation", "Supply Order", "Shelter Creation", "Clinic"],
      required: true,
    },
    clinicService: {
      type: String,
      enum: ["Grooming", "Nails", "Shower", "Vaccine", "Checkup", "Surgery", "Other"],
      required: false,
    },
    appointmentDate: {
      type: Date,
      required: false,
    },
    shelterData: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      description: String,
      capacity: Number,
      open_days: String,
      opening_time: String,
      closing_time: String,
      social_link: String,
    },
    title: {
      type: String,
      default: "",
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "In Review", "Approved", "Rejected"],
      default: "Pending",
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: false,
    },
    shelter: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
