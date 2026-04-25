const StoreItem = require("../models/StoreItem");
const Shelter = require("../models/Shelter");
const jwt = require("jsonwebtoken");

// @desc    Get all store items
// @route   GET /api/store
// @access  Public / Shelter Admin
const getStoreItems = async (req, res) => {
  try {
    const filter = {};

    // For soft-auth on GET route
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token && !req.user) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Ignore invalid token on public route
      }
    }
    
    // User role check if authenticated
    if (req.user && req.user.role === "Shelter Admin" && req.user.assignedShelter) {
      const shelter = await Shelter.findOne({ name: { $regex: new RegExp(`^${req.user.assignedShelter.trim()}$`, "i") } });
      if (shelter) {
        filter.shelter = shelter._id;
      } else {
        return res.status(200).json([]);
      }
    } else if (req.query.shelter) {
      if (req.query.shelter.match(/^[0-9a-fA-F]{24}$/)) {
        filter.shelter = req.query.shelter;
      } else {
        const shelter = await Shelter.findOne({ name: { $regex: new RegExp(`^${req.query.shelter.trim()}$`, "i") } });
        if (shelter) filter.shelter = shelter._id;
        else return res.status(200).json([]);
      }
    }

    const items = await StoreItem.find(filter)
      .populate("shelter", "name city address")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch store items" });
  }
};


// @desc    Create a store item
// @route   POST /api/store
// @access  Shelter Admin
const createStoreItem = async (req, res) => {
  try {
    const { name, category, price, stock, status, shelter, photo } = req.body;
    
    // Auto-set status if stock is 0 and status is Active
    const finalStatus = (stock === 0 && status === "Active") ? "Out of Stock" : (status || "Active");

    let finalShelter = shelter || req.body.assignedShelter || "";
    if (req.user && req.user.role === "Shelter Admin" && req.user.assignedShelter) {
      const shelterDoc = await Shelter.findOne({ name: { $regex: new RegExp(`^${req.user.assignedShelter.trim()}$`, "i") } });
      if (shelterDoc) {
        finalShelter = shelterDoc._id;
      }
    }

    const item = await StoreItem.create({
      name,
      category,
      price,
      stock: stock || 0,
      status: finalStatus,
      photo: photo || "",
      shelter: finalShelter,
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create store item" });
  }
};

// @desc    Update a store item
// @route   PUT /api/store/:id
// @access  Shelter Admin
const updateStoreItem = async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Store item not found" });
    }

    // Ownership check
    if (req.user && req.user.role === "Shelter Admin") {
      if (!req.user.assignedShelter) {
        return res.status(403).json({ message: "No shelter assigned to this admin." });
      }
      const shelterDoc = await Shelter.findOne({ name: { $regex: new RegExp(`^${req.user.assignedShelter.trim()}$`, "i") } });
      if (!shelterDoc || item.shelter.toString() !== shelterDoc._id.toString()) {
        return res.status(403).json({ message: "You can only manage your own shelter's items." });
      }
    }

    // Business logic: if stock hits 0, auto update status
    let { status, stock, photo } = req.body;
    if (stock !== undefined && stock === 0 && (!status || status === "Active")) {
      status = "Out of Stock";
    } else if (stock !== undefined && stock > 0 && status === "Out of Stock") {
      status = "Active";
    }

    const updatedItem = await StoreItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(status && { status }) },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update store item" });
  }
};

// @desc    Delete a store item
// @route   DELETE /api/store/:id
// @access  Shelter Admin
const deleteStoreItem = async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Store item not found" });
    }

    // Ownership check
    if (req.user && req.user.role === "Shelter Admin") {
      if (!req.user.assignedShelter) {
        return res.status(403).json({ message: "No shelter assigned to this admin." });
      }
      const shelterDoc = await Shelter.findOne({ name: { $regex: new RegExp(`^${req.user.assignedShelter.trim()}$`, "i") } });
      if (!shelterDoc || item.shelter.toString() !== shelterDoc._id.toString()) {
        return res.status(403).json({ message: "You can only manage your own shelter's items." });
      }
    }

    await StoreItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Store item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete store item" });
  }
};

// @desc    Get single store item
// @route   GET /api/store/:id
// @access  Public / Shelter Admin
const getStoreItemById = async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Store item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch store item" });
  }
};

module.exports = {
  getStoreItems,
  getStoreItemById,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
};
