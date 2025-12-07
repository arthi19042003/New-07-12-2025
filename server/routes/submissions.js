const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const protect = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.userId; 
    const { candidateName, email, phone, hiringManager, company, submissionId } = req.query;

    let query = { submittedBy: userId };

    if (submissionId) {
      query._id = submissionId;
    }

    let submissions = await Submission.find(query)
      .populate("candidate") 
      .populate("position")  
      .sort({ createdAt: -1 })
      .lean(); 

    if (candidateName || email || phone || hiringManager || company) {
      submissions = submissions.filter((sub) => {
        if (!sub.candidate) return false; 
        
        const c = sub.candidate;
        
        const nameMatch = !candidateName || 
          (`${c.firstName} ${c.lastName}`).toLowerCase().includes(candidateName.toLowerCase());
        
        const emailMatch = !email || 
          (c.email && c.email.toLowerCase().includes(email.toLowerCase()));
        
        const phoneMatch = !phone || 
          (c.phone && c.phone.includes(phone));

        const hmMatch = !hiringManager || 
          (c.hiringManager && c.hiringManager.toLowerCase().includes(hiringManager.toLowerCase()));

        const compMatch = !company || 
          (c.company && c.company.toLowerCase().includes(company.toLowerCase()));

        return nameMatch && emailMatch && phoneMatch && hmMatch && compMatch;
      });
    }

    res.json(submissions);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { jobId, positionTitle, resumeUrl } = req.body;
    const candidateId = req.user.id || req.user._id;
    
    const profile = req.user.profile || {};
    const candidateName = (profile.firstName && profile.lastName) 
      ? `${profile.firstName} ${profile.lastName}` 
      : (profile.firstName || req.user.email);

    const candidateEmail = req.user.email;

    const newApplication = new Application({
      jobId: jobId,
      position: positionTitle,
      candidateName: candidateName,
      email: candidateEmail,
      resumeUrl: resumeUrl,
      status: "Applied",
      createdBy: candidateId,
      appliedAt: new Date()
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/my-submissions", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const subs = await Application.find({ createdBy: userId });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findOneAndDelete({
      _id: req.params.id,
      submittedBy: req.userId 
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found or unauthorized" });
    }

    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    console.error("Error deleting submission:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;