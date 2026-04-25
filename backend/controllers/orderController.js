const Order = require("../models/Order");
const StoreItem = require("../models/StoreItem");
const Donation = require("../models/Donation");
const Sale = require("../models/Sale");
const Request = require("../models/Request");
const Shelter = require("../models/Shelter");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingDetails, paymentMethod, orderType, userId, paymentScreenshot } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 1. Check stock and update stock
    for (const item of items) {
      const product = await StoreItem.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      // Update stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.status = "Out of Stock";
      }
      await product.save();
    }

    // 2. Create the order
    const order = await Order.create({
      userId: userId || null,
      items,
      totalAmount,
      shippingDetails,
      paymentMethod,
      orderType: orderType || "Purchase",
      status: paymentMethod === "Cash on Delivery" ? "Processing" : "Pending",
      paymentStatus: "Unpaid",
      paymentScreenshot: paymentScreenshot || "",
    });

    // 3. Record into Sale model for compatibility with reports
    for (const item of items) {
      await Sale.create({
        orderId: `${order._id.toString().slice(-6)}-${item.productId.toString().slice(-4)}`,
        item: item.name,
        buyer: shippingDetails.fullName,
        amount: item.price * item.quantity,
        qty: item.quantity,
        status: orderType === "Donation" ? "Completed" : "Pending",
        shelter: item.shelterId,
      });
    }

    // 4. Create requests for shelters
    const uniqueShelterIds = [...new Set(items.map(i => i.shelterId.toString()))];
    
    for (const shelterId of uniqueShelterIds) {
      const shelterDoc = await Shelter.findById(shelterId);
      const shelterName = shelterDoc ? shelterDoc.name : "Unknown Shelter";

      const shelterItems = items.filter(i => i.shelterId.toString() === shelterId);
      const shelterValue = shelterItems.reduce((acc, current) => acc + (current.price * current.quantity), 0);
      const itemNames = shelterItems.map(i => `${i.name} (x${i.quantity})`).join(", ");

      if (orderType === "Donation") {
        const donation = await Donation.create({
          donorName: shippingDetails.fullName,
          donorEmail: shippingDetails.email,
          phone: shippingDetails.phone,
          type: "Supplies",
          value: shelterValue,
          unit: "EGP",
          shelter: shelterId,
          status: "Pending",
          notes: `Supplies Donation via Order #${order._id}. Items: ${itemNames}`,
        });

        await Request.create({
          requesterName: shippingDetails.fullName,
          requesterEmail: shippingDetails.email,
          requesterPhone: shippingDetails.phone,
          type: "Donation",
          title: `Supply Donation - ${itemNames}`,
          donationId: donation._id,
          orderId: order._id,
          shelter: shelterName,
          message: `User donated supplies worth ${shelterValue} EGP. ${paymentScreenshot ? "Payment screenshot attached." : ""}`,
          status: "Pending"
        });
      } else {
        await Request.create({
          requesterName: shippingDetails.fullName,
          requesterEmail: shippingDetails.email,
          requesterPhone: shippingDetails.phone,
          type: "Supply Order",
          title: `Purchase Order - ${itemNames}`,
          orderId: order._id,
          shelter: shelterName,
          message: `User purchased supplies worth ${shelterValue} EGP. ${paymentScreenshot ? "Payment screenshot attached." : ""}`,
          status: "Pending"
        });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order" });
  }
};


// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Get all orders (for super admin or shelter admin filtering)
// @route   GET /api/orders
// @access  Admin
const getOrders = async (req, res) => {
  try {
    const filter = {};
    const { shelterId, shelterName } = req.query;

    if (shelterId) {
      filter["items.shelterId"] = shelterId;
    } else if (shelterName) {
      const shelter = await Shelter.findOne({ name: { $regex: new RegExp(`^${shelterName.trim()}$`, "i") } });
      if (shelter) {
        filter["items.shelterId"] = shelter._id;
      } else {
        // If name provided but not found, return empty
        return res.status(200).json([]);
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderById,
};
