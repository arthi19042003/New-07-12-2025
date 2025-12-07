const express = require("express");
const router = express.Router();
const Position = require("../models/Position");
const protect = require("../middleware/auth");

// ✅ PUBLIC ROUTE: Get all open positions
router.get("/open", async (req, res) => {
  try {
    const positions = await Position.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.json(positions);
  } catch (err) {
    console.error("Error fetching open positions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PRIVATE ROUTE: Get positions created by the logged-in Manager
router.get("/", protect, async (req, res) => {
  try {
    // 👇 ROBUST ID CHECK (Fixes the undefined issue)
    const userId = req.user._id || req.user.id || req.userId;

    const positions = await Position.find({ createdBy: userId })
      .select('title location requiredSkills openings status department project')
      .sort({ createdAt: -1 });
    
    res.json(positions);
  } catch (err) {
    console.error("Error fetching positions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PRIVATE ROUTE: Create a new Position (FIXED)
router.post("/", protect, async (req, res) => {
  try {
    // 👇 ROBUST ID CHECK
    const userId = req.user._id || req.user.id || req.userId;

    console.log(`📝 Creating Position. Manager ID detected: ${userId}`); // Debug Log

    const positionData = {
      ...req.body,
      requiredSkills: req.body.requiredSkills || [],
      createdBy: userId,
      // 👇 THIS WAS THE MISSING LINK
      hiringManager: userId 
    };

    const newPosition = await Position.create(positionData);
    console.log(`✅ Position Created: "${newPosition.title}" with Manager: ${newPosition.hiringManager}`);
    
    res.status(201).json(newPosition);
  } catch (err) {
    console.error("Error creating position:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ✅ PRIVATE ROUTE: Update a Position
router.put("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.userId;
    const updateData = { ...req.body };

    if (updateData.requiredSkills || updateData.skills) {
      const skillsToProcess = updateData.requiredSkills || updateData.skills;

      if (typeof skillsToProcess === 'string') {
        updateData.requiredSkills = skillsToProcess.split(',').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(skillsToProcess)) {
        updateData.requiredSkills = skillsToProcess.map(s => s.trim()).filter(s => s);
      } else {
        updateData.requiredSkills = [];
      }
      delete updateData.skills;
    }

    const updated = await Position.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Position not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating position:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PRIVATE ROUTE: Delete a Position
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.userId;
    const deleted = await Position.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    
    if (!deleted) return res.status(404).json({ message: "Position not found" });

    res.json({ message: "Position deleted" });
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PRIVATE ROUTE: Get Single Position Details
router.get("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.userId;
    const position = await Position.findOne({ _id: req.params.id, createdBy: userId });
    
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json({ position });
  } catch (err) {
    console.error("Error fetching position details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;