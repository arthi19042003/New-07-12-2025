const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const Interview = require("../models/Interview");
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/auth"); 

// --- CREATE or UPDATE Candidate Profile ---
router.post("/profile", auth, async (req, res) => {
  try {
    // ✅ Accept jobId and position from the request
    const { 
        firstName, lastName, email, phone, bio, skills, resumePath,
        jobId, position 
    } = req.body;
    
    const userId = req.user.id || req.user._id;

    // Check if Profile exists
    let candidate = await Candidate.findOne({ user: userId });
    
    if (!candidate && email) {
        candidate = await Candidate.findOne({ email });
    }

    // Prepare Data Object
    const profileFields = {
        user: userId,
        firstName,
        lastName,
        email,
        phone,
        bio,
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []), 
        resumePath,

        // ✅ Save these fields to DB
        jobId: jobId || undefined, 
        position: position || ""
    };

    if (candidate) {
        // UPDATE existing profile
        candidate = await Candidate.findOneAndUpdate(
            { user: userId },
            { $set: profileFields },
            { new: true }
        );
        return res.json(candidate);
    } else {
        // CREATE new profile
        candidate = new Candidate(profileFields);
        await candidate.save();
        return res.json(candidate);
    }

  } catch (err) {
    console.error("❌ Error saving profile:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// --- GET All Candidates ---
router.get("/", auth, async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("jobId", "title department") // ✅ Populates Job Title for Dropdown
      .sort({ createdAt: -1 });
      
    res.json(candidates);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// --- GET Candidate Details ---
router.get("/:id/details", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("jobId", "title department"); 

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    const submissions = await Submission.find({ candidate: req.params.id })
      .populate("position", "title department")
      .sort({ createdAt: -1 });
      
    const interviews = await Interview.find({ candidate: req.params.id })
      .populate("position", "title")
      .sort({ date: -1 });

    res.json({ candidate, submissions, interviews });
  } catch (err) {
    console.error("Error fetching candidate details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- DOWNLOAD Resume ---
router.get("/resume/:id", auth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resumePath) {
      return res.status(404).json({ message: "Resume not found" });
    }
    const filePath = path.resolve(candidate.resumePath);
    if (fs.existsSync(filePath)) {
      const downloadName = candidate.resumeOriginalName || "resume.pdf";
      res.download(filePath, downloadName);
    } else {
      res.status(404).json({ message: "File not found on server" });
    }
  } catch (err) {
    console.error("Error downloading resume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE Status ---
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Status updated successfully", candidate });
  } catch (err) {
    console.error("Error updating candidate:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;