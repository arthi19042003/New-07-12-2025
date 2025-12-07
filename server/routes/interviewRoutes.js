const express = require("express");
const router = express.Router();
const multer = require("multer");
const Interview = require("../models/Interview");
const Message = require("../models/Message");
const Position = require("../models/Position");
const User = require("../models/User");
const protect = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- HELPER: Notify Hiring Manager ---
const notifyHiringManager = async (data) => {
  if (data.notifyManager !== "true" && data.notifyManager !== true) return;
  try {
    const position = await Position.findOne({ title: data.jobPosition });
    if (!position || !position.createdBy) return;
    const manager = await User.findById(position.createdBy);
    if (!manager || !manager.email) return;

    const subject = `Interview Update: ${data.candidateFirstName} ${data.candidateLastName}`;
    const messageBody = `Status: ${data.status}\nResult: ${data.result}\nRating: ${data.rating}/5`;

    await Message.create({
      to: manager.email,       
      from: "System",          
      subject: subject,
      message: messageBody,
      status: "unread",
      relatedId: data._id      
    });
  } catch (err) {
    console.error("Notification Error", err);
  }
};

// ==========================================
// ✅ NEW ROUTE: Get Logged-in Interviewer's Schedule
// This fixes the 404 Error in your console
// ==========================================
router.get("/my-schedule", protect, async (req, res) => {
  try {
    // Find interviews assigned to the logged-in user (req.userId from protect middleware)
    const interviews = await Interview.find({ interviewerId: req.userId }).sort({ date: 1 });
    res.json(interviews);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ message: "Server error fetching schedule" });
  }
});

// --- ROUTE: Get List of Interviewers (For Hiring Manager Dropdown) ---
router.get("/list-interviewers", protect, async (req, res) => {
  try {
    const interviewers = await User.find({ role: "interviewer" }).select("profile.firstName profile.lastName email");
    res.json(interviewers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTE: Send Meeting Link (For Interviewer) ---
router.put("/:id/send-link", protect, async (req, res) => {
  try {
    const { meetingLink } = req.body;
    if (!meetingLink) return res.status(400).json({ message: "Meeting link is required" });

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // Update DB
    interview.meetingLink = meetingLink;
    interview.status = "Scheduled"; 
    await interview.save();

    console.log(`📧 EMAIL SIMULATION: Sending link to candidate for interview ${interview._id}`);

    res.json({ message: "Meeting link sent successfully", interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending link" });
  }
});

// --- STANDARD CRUD ROUTES ---

// Create Interview
router.post("/", protect, upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;
    const interview = new Interview(data);
    await interview.save();
    await notifyHiringManager(data);
    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: "Error saving interview" });
  }
});

// Get All Interviews (For Managers/Admins)
router.get("/", protect, async (req, res) => {
  try {
    // If it's a candidate, filter by name (Legacy support)
    if (req.user.role === "candidate") {
       const { firstName, lastName } = req.user.profile;
       return res.json(await Interview.find({ 
         candidateFirstName: new RegExp(`^${firstName}$`, "i"),
         candidateLastName: new RegExp(`^${lastName}$`, "i")
       }).sort({ createdAt: -1 }));
    }
    
    // Otherwise return all (Managers)
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Interview
router.put("/:id", protect, upload.single("resume"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.resume = req.file.filename;
    const updated = await Interview.findByIdAndUpdate(req.params.id, data, { new: true });
    await notifyHiringManager(data);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating interview" });
  }
});

// Delete Interview
router.delete("/:id", protect, async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting interview" });
  }
});

module.exports = router;