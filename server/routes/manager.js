const express = require("express");
const router = express.Router();
const Position = require("../models/Position");
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const Interview = require("../models/Interview"); 
const PurchaseOrder = require("../models/PurchaseOrder");
const Onboarding = require("../models/Onboarding");

router.get("/summary", async (req, res) => {
  try {
    const totalInterviews = await Interview.countDocuments();
    const upcoming = await Interview.countDocuments({ status: "upcoming" }); 
    const completed = await Interview.countDocuments({ status: "completed" }); 
    const passed = await Interview.countDocuments({ result: "Pass" });       
    const failed = await Interview.countDocuments({ result: "Fail" });      
    const pending = await Interview.countDocuments({ result: "Pending" });  

    res.json({
      totalInterviews,
      upcoming,
      completed,
      passed,
      failed,
      pending,
    });
  } catch (err) {
    console.error("Error fetching manager summary:", err.message);
    res.status(500).json({ message: "Server error fetching summary", error: err.message });
  }
});

router.get("/interviews", async (req, res) => { 
  try {
    const interviews = await Interview.find()
      .populate('candidate', 'name email') 
      .populate('position', 'title')      
      .sort({ date: -1 });

     const transformedInterviews = interviews.map(interview => ({
       _id: interview._id,
       candidateName: interview.candidate?.name || 'N/A', 
       interviewerName: interview.interviewer || 'N/A', 
       date: interview.date,
       result: interview.result || 'Pending', 
       status: interview.status,
       rating: interview.rating, 
     }));


    res.json(transformedInterviews); 
  } catch (err) {
    console.error("Error fetching manager interviews:", err.message);
    res.status(500).json({ message: "Server error fetching interviews", error: err.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const [positions, candidates, interviews] = await Promise.all([
      Position.countDocuments(),
      Candidate.countDocuments(),
      Interview.countDocuments(), 
    ]);
    res.json({ positions, candidates, interviews });
  } catch (err) {
    console.error("Error fetching manager dashboard counts:", err.message);
    res.status(500).json({ message: "Server error fetching dashboard counts", error: err.message });
  }
});


router.get("/positions", async (req, res) => {
  try {
    const { project, department, skills } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (department) filter.department = department;
    if (skills) filter.skills = { $in: skills.split(",") };
    const positions = await Position.find(filter);
    res.json(positions);
  } catch (err) {
      console.error("Error fetching manager positions:", err.message);
      res.status(500).json({ message: "Server error fetching positions", error: err.message });
  }
});

router.post("/submission/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    sub.status = status;
    if (!Array.isArray(sub.history)) {
      sub.history = [];
    }
    sub.history.push({ status, note, date: new Date() }); 
    await sub.save();
    res.json(sub);
  } catch (err) {
      console.error("Error updating submission status:", err.message);
      res.status(500).json({ message: "Server error updating status", error: err.message });
  }
});

module.exports = router;