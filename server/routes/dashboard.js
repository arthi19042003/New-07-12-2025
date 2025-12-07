const express = require("express");
const Candidate = require("../models/Candidate");
const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const total = await Candidate.countDocuments();
    const shortlisted = await Candidate.countDocuments({ status: "Shortlisted" });
    const hired = await Candidate.countDocuments({ status: "Hired" });

    res.json({ total, shortlisted, hired });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    next(err);
  }
});

router.get("/submissions", async (req, res, next) => {
  try {
    const data = await Candidate.find().sort({ createdAt: -1 }).limit(20);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
