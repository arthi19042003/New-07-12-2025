const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require("../middleware/auth");

// Middleware to ensure user is Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

// Get pending users
router.get("/pending-users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve user
router.put("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ message: "User approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject/Delete user
router.delete("/reject/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;