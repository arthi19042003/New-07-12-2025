const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate"); // 👈 FIX: Use Candidate Model
const auth = require("../middleware/auth");

// --- 1. GET PROFILE ---
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // Handle different auth implementations
    
    // Find the candidate profile linked to this user
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    res.json({ success: true, user: { ...req.user, profile: candidate } });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 2. UPDATE/CREATE MAIN PROFILE (PUT /) ---
router.put("/", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, zipCode, bio, skills } = req.body;
    const userId = req.user.id || req.user._id;

    console.log(`📝 Updating Candidate Profile for User: ${userId}`);

    const profileFields = {
      user: userId, // Link to login
      firstName,
      lastName,
      email: req.user.email, // Ensure email is consistent
      phone,
      address,
      city,
      state,
      zipCode,
      bio,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    };

    // Find and Update OR Create if it doesn't exist (upsert: true)
    let candidate = await Candidate.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: { ...req.user, profile: candidate } // Return structure expected by frontend context
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 3. ADD EXPERIENCE (POST) ---
router.post("/experience", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    // Add to beginning of array
    candidate.experience.unshift(req.body); 
    await candidate.save();
    
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    console.error("Add experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 4. UPDATE EXPERIENCE (PUT) ---
router.put("/experience/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    const exp = candidate.experience.id(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Experience not found" });

    // Update fields
    Object.assign(exp, req.body);
    await candidate.save();
    
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    console.error("Update experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 5. DELETE EXPERIENCE (DELETE) ---
router.delete("/experience/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    candidate.experience.pull(req.params.id);
    await candidate.save();
    
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    console.error("Delete experience error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 6. ADD EDUCATION (POST) ---
router.post("/education", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    candidate.education.unshift(req.body);
    await candidate.save();
    
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    console.error("Add education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 7. UPDATE EDUCATION (PUT) ---
router.put("/education/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    const edu = candidate.education.id(req.params.id);
    if (!edu) return res.status(404).json({ success: false, message: "Education not found" });

    Object.assign(edu, req.body);
    await candidate.save();
    
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    console.error("Update education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 8. DELETE EDUCATION (DELETE) ---
router.delete("/education/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });

    candidate.education.pull(req.params.id);
    await candidate.save();
    
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    console.error("Delete education error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;