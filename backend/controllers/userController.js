const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
      role,
      status,
      assignedShelter,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      city,
      role,
      status,
      assignedShelter,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      password,
      phone,
      city,
      role,
      status,
      assignedShelter,
    } = req.body;

    // Super Admin specific fields
    if (req.user && req.user.role === "Super Admin") {
      if (password) user.password = password; // Trigger pre-save hook
      if (role) user.role = role;
    }

    // Common fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (status) user.status = status;
    if (assignedShelter !== undefined) user.assignedShelter = assignedShelter;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user && req.user.id !== req.params.id && req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};