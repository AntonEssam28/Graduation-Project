const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/", createOrder); // Allow checkout as guest or user

// Protected routes
router.get("/myorders", auth, getMyOrders);
router.get("/", auth, getOrders);
router.get("/:id", auth, getOrderById);
router.put("/:id/status", auth, updateOrderStatus);

module.exports = router;
