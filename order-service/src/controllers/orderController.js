const Order = require("../models/Order");

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    const order = await Order.create({
      userId: req.userId,
      userName: req.userName,
      items,
      totalAmount,
      shippingAddress: shippingAddress || "Default Address",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("[createOrder]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("[getMyOrders]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    console.error("[getOrderById]", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
