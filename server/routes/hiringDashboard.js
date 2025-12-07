const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Position = require("../models/Position");
const protect = require("../middleware/auth");

router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.userId; 

    const myJobs = await Position.find({ createdBy: userId }).select("_id");
    const myJobIds = myJobs.map(job => job._id);

    const query = {
      $or: [
        { position: { $in: myJobIds } }, 
        { positionId: { $in: myJobIds } },
        { job: { $in: myJobIds } },
        { createdBy: userId } 
      ]
    };

    const [totalSubmissions, interviewsScheduled, offersMade, hired] = await Promise.all([
      Submission.countDocuments(query),
      
      Submission.countDocuments({ ...query, status: { $regex: "interviewed", $options: "i" } }), 
      
      Submission.countDocuments({ ...query, status: { $regex: "reviewed", $options: "i" } }), 
      
      Submission.countDocuments({ ...query, status: { $regex: "hired", $options: "i" } }) 
    ]);

    res.json({
      totalSubmissions,
      interviewsScheduled, 
      offersMade: offersMade, 
      hired
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.json({
      totalSubmissions: 0,
      interviewsScheduled: 0,
      offersMade: 0,
      hired: 0
    });
  }
});

module.exports = router;