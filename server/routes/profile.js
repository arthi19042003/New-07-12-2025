const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const User = require("../models/User"); // ✅ Import User Model
const auth = require("../middleware/auth");

// --- 1. GET PROFILE ---
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role || "";

    // 🟢 CASE 1: RECRUITERS, EMPLOYERS, HIRING MANAGERS (Stored in User Model)
    if (["recruiter", "employer", "hiringManager", "admin"].includes(userRole)) {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      // Return the user object directly, as profile data is embedded
      return res.json({ success: true, user: user });
    }

    // 🔵 CASE 2: CANDIDATES (Stored in Candidate Model)
    // Find the candidate profile linked to this user
    const candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate profile not found" });
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
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role || "";

    // 🟢 CASE 1: RECRUITERS (Update User Model)
    if (userRole === "recruiter") {
      const { 
        address, majorskillsarea, resumeskills, partnerships, 
        companyWebsite, companyPhone, companyAddress, location, 
        companyCertifications, dunsNumber, numberofemployees, ratecards 
      } = req.body;

      // Construct the update object targeting 'profile.fieldName'
      const updateFields = {};
      if (address) updateFields["profile.address"] = address;
      if (majorskillsarea) updateFields["profile.majorskillsarea"] = majorskillsarea;
      if (resumeskills) updateFields["profile.resumeskills"] = resumeskills;
      if (partnerships) updateFields["profile.partnerships"] = partnerships;
      if (companyWebsite) updateFields["profile.companyWebsite"] = companyWebsite;
      if (companyPhone) updateFields["profile.companyPhone"] = companyPhone;
      if (companyAddress) updateFields["profile.companyAddress"] = companyAddress;
      if (location) updateFields["profile.location"] = location;
      if (companyCertifications) updateFields["profile.companyCertifications"] = companyCertifications;
      if (dunsNumber) updateFields["profile.dunsNumber"] = dunsNumber;
      if (numberofemployees) updateFields["profile.numberofemployees"] = numberofemployees;
      if (ratecards) updateFields["profile.ratecards"] = ratecards;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      ).select("-password");

      return res.json({ 
        success: true, 
        message: "Recruiter profile updated", 
        user: updatedUser 
      });
    }

    // 🔵 CASE 2: CANDIDATES (Update Candidate Model)
    const { firstName, lastName, phone, address, city, state, zipCode, bio, skills } = req.body;

    const profileFields = {
      user: userId,
      firstName,
      lastName,
      email: req.user.email,
      phone,
      address,
      city,
      state,
      zipCode,
      bio,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    };

    let candidate = await Candidate.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: { ...req.user, profile: candidate } 
    });

  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 3. ADD EXPERIENCE (POST) - Candidate Only ---
router.post("/experience", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    candidate.experience.unshift(req.body); 
    await candidate.save();
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 4. UPDATE EXPERIENCE (PUT) - Candidate Only ---
router.put("/experience/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    const exp = candidate.experience.id(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Experience not found" });
    Object.assign(exp, req.body);
    await candidate.save();
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 5. DELETE EXPERIENCE (DELETE) - Candidate Only ---
router.delete("/experience/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    candidate.experience.pull(req.params.id);
    await candidate.save();
    res.json({ success: true, experience: candidate.experience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 6. ADD EDUCATION (POST) - Candidate Only ---
router.post("/education", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    candidate.education.unshift(req.body);
    await candidate.save();
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 7. UPDATE EDUCATION (PUT) - Candidate Only ---
router.put("/education/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    const edu = candidate.education.id(req.params.id);
    if (!edu) return res.status(404).json({ success: false, message: "Education not found" });
    Object.assign(edu, req.body);
    await candidate.save();
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 8. DELETE EDUCATION (DELETE) - Candidate Only ---
router.delete("/education/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user.id });
    if (!candidate) return res.status(404).json({ success: false, message: "Profile not found" });
    candidate.education.pull(req.params.id);
    await candidate.save();
    res.json({ success: true, education: candidate.education });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;