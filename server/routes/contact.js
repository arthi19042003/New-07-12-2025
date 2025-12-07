const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.post("/", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: "Email and message content are required." });
    }

    await Message.create({
      to: "System", 
      from: email,
      subject: "New Inquiry from Landing Page",
      message: `Sender Email: ${email}\n\nMessage: ${message}`,
      status: "unread",
    });

    res.status(201).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Contact form submission error:", error.message);
    res.status(500).json({ message: "Server error during submission." });
  }
});

module.exports = router;