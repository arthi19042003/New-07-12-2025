const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Message = require("../models/Message");
const Position = require("../models/Position"); // ✅ 1. Import Position Model

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/recruiter_resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + path.extname(file.originalname)),
});
const resumeUpload = multer({ storage: resumeStorage });

router.post("/submit", auth, resumeUpload.single('resume'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      rate,
      currentLocation,
      availability,
      skypeId,
      githubProfile,
      linkedinProfile,
      positionId, 
      hiringManagerId,
      company,
      hiringManager,
    } = req.body;

    if (!email || !positionId || !firstName || !hiringManagerId) {
      return res.status(400).json({ message: "First Name, Email, Position, and Hiring Manager are required." });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "A resume file is required for submission." });
    }

    // ✅ 2. Fetch Position Title to save in Candidate Profile
    const positionDoc = await Position.findById(positionId);
    const positionTitle = positionDoc ? positionDoc.title : "Unknown Position";

    let candidate = await Candidate.findOne({ email: email.toLowerCase() });
    
    const candidateData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      rate,
      currentLocation,
      availability,
      skypeId,
      githubProfile,
      linkedinProfile,
      status: "Submitted",
      submittedByRecruiter: req.userId,
      resumePath: req.file.path, 
      resumeOriginalName: req.file.originalname,
      company: company,
      hiringManager: hiringManager,
      
      // ✅ 3. Save Position Link and Title (Fixes "Unknown Position")
      jobId: positionId, 
      position: positionTitle
    };

    if (!candidate) {
      candidate = new Candidate(candidateData);
    } else {
      candidate.set(candidateData);
    }
    await candidate.save();

    const existingSubmission = await Submission.findOne({
      candidate: candidate._id,
      position: positionId,
    });

    if (existingSubmission) {
      return res.status(409).json({ message: "This candidate has already been submitted for this position." });
    }

    const submission = new Submission({
      candidate: candidate._id,
      position: positionId,
      submittedBy: req.userId,
      status: "submitted",
    });
    await submission.save();

    const manager = await User.findById(hiringManagerId);
    if (manager) {
      const recruiter = await User.findById(req.userId);
      await Message.create({
        to: manager.email,
        from: recruiter.profile.agencyName || recruiter.email,
        subject: `New Candidate Submission: ${firstName} ${lastName}`,
        message: `${recruiter.profile.firstName || 'Recruiter'} has submitted ${firstName} ${lastName} for position ID ${positionId}.`,
        status: "unread",
      });
    }

    res.status(201).json({ message: "Candidate submitted successfully!", submission });

  } catch (error) {
    console.error("Recruiter submission error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/managers", auth, async (req, res) => {
    try {
        const managers = await User.find({ 
          role: { $in: ['hiringManager', 'recruiter'] } 
        }).select('profile.firstName profile.lastName profile.agencyName email role');
        res.json(managers);
    } catch (error) {
        console.error("Error fetching managers:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;