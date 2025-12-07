const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose"); 
const Invitation = require("../models/Invitation");
const protect = require("../middleware/auth");

require("../models/User"); 
const User = mongoose.model("User"); 

router.post("/invite", protect, async (req, res) => {
  try {
    const { agencyEmail, positionId } = req.body;
    
    const invitedBy = req.userId; 

    if (!agencyEmail || !positionId) {
      return res.status(400).json({ message: "Agency Email and Position are required." });
    }

    const existingUser = await User.findOne({ email: agencyEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const existingInvite = await Invitation.findOne({ 
      agencyEmail, 
      position: positionId, 
      status: "pending" 
    });
    
    if (existingInvite) {
      return res.status(400).json({ message: "Invite already pending for this email and position." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    
    const invite = new Invitation({
      agencyEmail,       
      position: positionId, 
      token, 
      invitedBy,          
      status: "pending"
    });

    await invite.save();

    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register-invite?token=${token}`;
    console.log(`✅ Invite sent to ${agencyEmail}: ${inviteLink}`);
    
    await invite.populate('position', 'title');

    res.status(201).json(invite); 
  } catch (err) {
    console.error("❌ Error sending invite:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.get("/invites", protect, async (req, res) => {
  try {
    const invites = await Invitation.find({ invitedBy: req.userId })
      .populate('position', 'title') 
      .sort({ createdAt: -1 });
    res.json(invites);
  } catch (err) {
    console.error("Error fetching invites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/invite/:id", protect, async (req, res) => {
  try {
    const invite = await Invitation.findOneAndDelete({
      _id: req.params.id,
      invitedBy: req.userId,
    });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    res.json({ message: "Invite deleted" });
  } catch (err) {
    console.error("Error deleting invite:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
      res.status(501).json({message: "Registration flow not fully implemented in this snippet"});
  } catch (err) {
      res.status(500).json({message: "Server error"});
  }
});

module.exports = router;