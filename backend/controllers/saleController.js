const Sale = require("../models/Sale");

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public / Shelter Admin
const getSales = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shelter) {
      filter.shelter = req.query.shelter;
    }
    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

// @desc    Create a sale record
// @route   POST /api/sales
// @access  Shelter Admin
const createSale = async (req, res) => {
  try {
    const { item, buyer, amount, qty, status, shelter } = req.body;
    
    // Generate a quick mock Order ID
    const randomHex = Math.random().toString(16).slice(2, 7).toUpperCase();
    const orderId = `ORD-${randomHex}`;

    const newSale = await Sale.create({
      orderId,
      item,
      buyer,
      amount: Number(amount),
      qty: Number(qty),
      status: status || "Completed",
      shelter: shelter || req.body.assignedShelter || "",
    });
    
    res.status(201).json(newSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create sales record" });
  }
};

module.exports = {
  getSales,
  createSale,
};
