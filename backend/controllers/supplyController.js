const Supply = require("../models/Supply");

const getSupplies = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shelter) filter.shelter = req.query.shelter;
    
    const supplies = await Supply.find(filter).sort({ createdAt: -1 });
    res.status(200).json(supplies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplies" });
  }
};

const getSupplyById = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) return res.status(404).json({ message: "Supply not found" });
    res.status(200).json(supply);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supply" });
  }
};

const createSupply = async (req, res) => {
  try {
    const { name, category, quantity, unit, shelter, requestedBy } = req.body;
    if (!name || !category || quantity === undefined || !unit || !shelter || !requestedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const supply = await Supply.create({ name, category, quantity, unit, shelter, requestedBy });
    res.status(201).json(supply);
  } catch (error) {
    res.status(500).json({ message: "Failed to create supply" });
  }
};

const updateSupply = async (req, res) => {
  try {
    const supply = await Supply.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supply) return res.status(404).json({ message: "Supply not found" });
    res.status(200).json(supply);
  } catch (error) {
    res.status(500).json({ message: "Failed to update supply" });
  }
};

const deleteSupply = async (req, res) => {
  try {
    const supply = await Supply.findByIdAndDelete(req.params.id);
    if (!supply) return res.status(404).json({ message: "Supply not found" });
    res.status(200).json({ message: "Supply deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supply" });
  }
};

module.exports = { getSupplies, getSupplyById, createSupply, updateSupply, deleteSupply };
