const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Candidate = require("../models/Candidate");
const protect = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    // 1. Fetch Applications (Direct Hires)
    const appsRaw = await Application.find({ status: "Hired" })
      .populate("jobId", "title department") // Populates the 'jobId' field with Job details
      .populate("createdBy", "profile email") 
      .lean();

    const apps = appsRaw.map((app) => {
      let name = app.candidateName;
      if (!name && app.createdBy?.profile) {
        name = `${app.createdBy.profile.firstName} ${app.createdBy.profile.lastName}`;
      }
      if (!name || name.trim() === "") {
        name = app.createdBy?.email || "Unknown Candidate";
      }

      return {
        _id: app._id,
        candidateName: name,
        email: app.email || app.createdBy?.email,
        
        // 🔴 FIX: Access title from 'jobId' object, NOT 'app.position' directly
        position: app.jobId?.title || app.position || "Unknown Position", 
        
        department: app.jobId?.department || "-", 
        status: app.status,
        appliedAt: app.appliedAt,
        onboardingStatus: app.onboardingStatus || "Pending",
        type: "Direct"
      };
    });

    // 2. Fetch Submissions (Agency Hires)
    const submissionsRaw = await Submission.find()
      .populate({
        path: "candidate",
        match: { status: "Hired" }, 
      })
      .populate("position", "title department") // Populates the 'position' field (Job)
      .lean();

    const submissions = submissionsRaw
      .map((sub) => {
        if (!sub.candidate || !sub.position) return null;

        return {
          _id: sub.candidate._id, 
          candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
          email: sub.candidate.email,
          
          // ✅ This was already correct for submissions
          position: sub.position.title || "Unknown Position",
          
          department: sub.position.department,
          status: sub.candidate.status,
          appliedAt: sub.createdAt,
          onboardingStatus: sub.candidate.onboardingStatus || "Pending",
          type: "Agency"
        };
      })
      .filter((item) => item !== null);

    // 3. Merge & Sort
    const unifiedList = [...apps, ...submissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);
  } catch (err) {
    console.error("Error fetching onboarding:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { onboardingStatus } = req.body;

    let updated = await Application.findByIdAndUpdate(
      req.params.id,
      { onboardingStatus },
      { new: true }
    );

    if (!updated) {
      updated = await Candidate.findByIdAndUpdate(
        req.params.id,
        { onboardingStatus },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;