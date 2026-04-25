const Donation = require("../models/Donation");

const getDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shelter) {
      filter.shelter = req.query.shelter;
    }
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(donations);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json(donation);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch donation",
      error: error.message,
    });
  }
};

const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      phone,
      type,
      value,
      amount,
      unit,
      shelter,
      city,
      status,
      notes,
    } = req.body;

    const finalValue = Number(value ?? amount);

    if (!donorName || Number.isNaN(finalValue)) {
      return res.status(400).json({
        message: "donorName and value are required",
      });
    }

    const donation = await Donation.create({
      donorName,
      donorEmail,
      phone,
      type,
      value: finalValue,
      unit,
      shelter,
      city,
      status,
      notes,
    });

    // Also create a corresponding Request entry for tracking in shelter admin
    const Request = require('../models/Request');
    const donationDetails = `Type: ${type}${type === 'Cash' ? ` - Amount: ${finalValue} ${unit || 'EGP'}` : ''}${notes ? ` - Notes: ${notes}` : ''}`;
    
    await Request.create({
      requesterName: donorName,
      requesterEmail: donorEmail,
      requesterPhone: phone,
      type: 'Donation',
      title: `${type} Donation`, // Set specific title like "Food Donation"
      shelter,
      message: donationDetails,
      donationId: donation._id,
    });

    return res.status(201).json(donation);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create donation",
      error: error.message,
    });
  }
};

const updateDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      phone,
      type,
      value,
      amount,
      unit,
      shelter,
      city,
      status,
      notes,
    } = req.body;

    const updateData = {
      donorName,
      donorEmail,
      phone,
      type,
      value: value !== undefined ? Number(value) : amount !== undefined ? Number(amount) : undefined,
      unit,
      shelter,
      city,
      status,
      notes,
    };

    if (updateData.value !== undefined && Number.isNaN(updateData.value)) {
      return res.status(400).json({ message: "value must be a number" });
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json(donation);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update donation",
      error: error.message,
    });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete donation",
      error: error.message,
    });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
};