const express = require("express");
const router = express.Router();
const Interview = require("../models/Interview");

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
    res.status(500).json({ message: err.message });
  }
});

router.get("/candidates", async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ date: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
