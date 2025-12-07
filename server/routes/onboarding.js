const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Candidate = require("../models/Candidate");
const protect = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    // ---------------------------------------------------------
    // 1. Fetch Applications (Direct Hires)
    // ---------------------------------------------------------
    const appsRaw = await Application.find({ status: "Hired" })
      .populate("position", "title department") // Get Job Title
      .populate("candidate", "firstName lastName email candidateName") // 🟢 FIX: Fetch Linked Candidate Details
      .populate("createdBy", "profile email") 
      .lean();

    const apps = appsRaw.map((app) => {
      let name = "Unknown Candidate";
      let email = app.email || "";

      // 🟢 FIX: Strategy to find the name
      // 1. Check inside the populated 'candidate' reference (Primary source)
      if (app.candidate) {
        if (app.candidate.candidateName) {
           name = app.candidate.candidateName;
        } else if (app.candidate.firstName) {
           name = `${app.candidate.firstName} ${app.candidate.lastName || ""}`.trim();
        }
        // Use candidate email if app email is missing
        if (!email && app.candidate.email) email = app.candidate.email;
      }

      // 2. Check direct fields on Application (Fallback)
      if (name === "Unknown Candidate" && app.candidateName) {
         name = app.candidateName;
      }

      // 3. Check createdBy profile (Last resort - e.g. for manual entries)
      if (name === "Unknown Candidate" && app.createdBy?.profile) {
         name = `${app.createdBy.profile.firstName} ${app.createdBy.profile.lastName}`.trim();
      }
      
      // 4. Final Fallback if name is still empty
      if (!name || name === "Unknown Candidate") {
          name = email || "Unknown Candidate"; 
      }

      // Position & Department Safety Checks
      const positionTitle = app.position?.title || "Unknown Position";
      const departmentName = app.position?.department || "-";

      return {
        _id: app._id,
        candidateName: name,
        email: email,
        position: positionTitle, 
        department: departmentName, 
        status: app.status,
        appliedAt: app.appliedAt,
        onboardingStatus: app.onboardingStatus || "Pending",
        type: "Direct"
      };
    });

    // ---------------------------------------------------------
    // 2. Fetch Submissions (Agency Hires)
    // ---------------------------------------------------------
    const submissionsRaw = await Submission.find()
      .populate({
        path: "candidate",
        match: { status: "Hired" }, 
      })
      .populate("position", "title department") 
      .lean();

    const submissions = submissionsRaw
      .map((sub) => {
        if (!sub.candidate || !sub.position) return null;

        return {
          _id: sub.candidate._id, 
          candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
          email: sub.candidate.email,
          position: sub.position.title || "Unknown Position",
          department: sub.position.department || "-",
          status: sub.candidate.status,
          appliedAt: sub.createdAt,
          onboardingStatus: sub.candidate.onboardingStatus || "Pending",
          type: "Agency"
        };
      })
      .filter((item) => item !== null);

    // ---------------------------------------------------------
    // 3. Merge & Sort
    // ---------------------------------------------------------
    const unifiedList = [...apps, ...submissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);

  } catch (err) {
    console.error("Error fetching onboarding:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------------------------------------------
// Update Onboarding Status
// ---------------------------------------------------------
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { onboardingStatus } = req.body;

    // Try updating Application first
    let updated = await Application.findByIdAndUpdate(
      req.params.id,
      { onboardingStatus },
      { new: true }
    );

    // If not found, try updating Candidate (Agency hire)
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