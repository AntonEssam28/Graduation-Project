const Request = require("../models/Request");

const getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shelter) {
      filter.shelter = { $regex: new RegExp(`^${req.query.shelter.trim()}$`, "i") };
    }
    if (req.query.type) filter.type = req.query.type;
    
    const requests = await Request.find(filter).populate('dogId').sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('dogId');
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch request" });
  }
};

const createRequest = async (req, res) => {
  try {
    const { requesterName, requesterEmail, requesterPhone, type, title, dogId, shelter, message, donationId, shelterData, clinicService, appointmentDate } = req.body;
    
    // For Shelter Creation, 'shelter' info doesn't exist yet but model requires it
    const finalShelter = type === "Shelter Creation" ? "System" : shelter;

    if (!requesterName || !requesterEmail || !requesterPhone || !type || !finalShelter) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const request = await Request.create({
      requesterName, requesterEmail, requesterPhone, type, title, dogId, shelter: finalShelter, message, donationId, shelterData, clinicService, appointmentDate
    });
    res.status(201).json(request);
  } catch (error) {
    console.error("Create Request Error:", error);
    res.status(500).json({ message: "Failed to create request" });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Handle side effects of approval
    if (status === "Approved" && request.status !== "Approved") {
      if (request.type === "Suspension") {
        const Shelter = require("../models/Shelter");
        await Shelter.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${request.shelter.trim()}$`, "i") } },
          { status: "Suspended" }
        );
      } else if (request.type === "Activation") {
        const Shelter = require("../models/Shelter");
        await Shelter.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${request.shelter.trim()}$`, "i") } },
          { status: "Active" }
        );
      } else if (request.type === "Shelter Creation" && request.shelterData) {
        const Shelter = require("../models/Shelter");
        const User = require("../models/User");
        
        // 1. Create the shelter with all provided data
        const newShelter = await Shelter.create({
          ...request.shelterData,
          adminName: request.requesterName,
          status: "Active"
        });

        // 2. Promote the user who requested it
        await User.findOneAndUpdate(
          { email: request.requesterEmail },
          { 
            role: "Shelter Admin",
            assignedShelter: newShelter.name
          }
        );
      }
    }

    // After updating the request, sync donation status if this is a donation request
    if (request.type === 'Donation' && request.donationId) {
      const Donation = require('../models/Donation');
      // Map Request statuses to Donation statuses if necessary (e.g., "In Review" -> "Pending" or similar)
      // For now, syncing Approved/Rejected as they are same in both enums
      await Donation.findByIdAndUpdate(request.donationId, { status: status }, { new: true });
    }

    const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({ message: "Failed to update request" });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete request" });
  }
};

module.exports = { getRequests, getRequestById, createRequest, updateRequest, deleteRequest };
