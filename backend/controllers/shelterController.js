const Shelter = require("../models/Shelter");

const getShelters = async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: new RegExp(`^${req.query.name.trim()}$`, "i") };
    }
    
    const shelters = await Shelter.find(filter).sort({ createdAt: -1 });
    res.json(shelters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shelters" });
  }
};

const getShelterById = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.json(shelter);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shelter" });
  }
};

const createShelter = async (req, res) => {
  try {
    if (!req.body.name || !req.body.city || !req.body.address) {
      return res.status(400).json({
        message: "name, city, and address are required",
      });
    }

    const shelter = await Shelter.create(req.body);

    res.status(201).json(shelter);
  } catch (error) {
    res.status(500).json({ message: "Failed to create shelter" });
  }
};

const updateShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    // Permission check: Super Admin can edit anything. 
    // Shelter Admin can only edit their assigned shelter.
    if (req.user.role !== 'Super Admin') {
      if (req.user.role === 'Shelter Admin') {
        if (req.user.assignedShelter !== shelter.name) {
          return res.status(403).json({ message: "You can only manage your own shelter." });
        }
      } else {
        return res.status(403).json({ message: "Unauthorized to update shelters." });
      }
    }

    const updatedShelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedShelter);
  } catch (error) {
    console.error("Update Shelter Error:", error);
    res.status(500).json({ message: "Failed to update shelter" });
  }
};

const deleteShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.json({ message: "Shelter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete shelter" });
  }
};

module.exports = {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
};