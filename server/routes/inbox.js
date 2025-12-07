const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const protect = require("../middleware/auth");

// @route   GET /api/inbox
// @desc    Get all messages for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    // 1. Robustly determine User ID
    const userId = req.user._id || req.user.id || req.user.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    // 2. Fetch User details (to get email for legacy checks)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const email = user.email;
    const isManager = ["employer", "hiringManager", "admin"].includes(user.role) || user.userType === "hiringManager";

    // 3. Build Query
    // We look for messages where:
    // - 'recipient' is the User ID (This captures the Notification created in applications.js)
    // - OR 'to' is the User Email (Legacy/Direct messages)
    // - OR 'to' is "System" (If the user is a manager)
    const query = {
        $or: [
            { recipient: userId }, 
            { to: email }
        ]
    };

    if (isManager) {
        query.$or.push({ to: "System" });
    }

    // 4. Fetch Messages and Populate Sender
    const messages = await Message.find(query)
        .populate("sender", "firstName lastName name email role")
        .sort({ createdAt: -1, date: -1 });

    // 5. Transform Data for Frontend
    const formattedMessages = messages.map(msg => {
        
        // Determine "From" name
        let fromName = "System"; // Default
        
        if (msg.sender) {
            // If sender is a populated User object
            if (msg.sender.firstName) {
                fromName = `${msg.sender.firstName} ${msg.sender.lastName || ''}`.trim();
            } else if (msg.sender.name) {
                fromName = msg.sender.name;
            } else {
                fromName = msg.sender.email;
            }
        } else if (msg.from) {
            // Fallback to legacy string field
            fromName = msg.from;
        }

        // Determine Status (Handle both string 'read'/'unread' and boolean isRead)
        let status = "unread";
        if (msg.status && msg.status.toLowerCase() === "read") {
            status = "read";
        } else if (msg.isRead === true) {
            status = "read";
        }

        return {
            _id: msg._id,
            subject: msg.subject || "No Subject",
            from: fromName,
            // Critical: Check 'body' first (used in notifications), then 'message'
            message: msg.body || msg.message || "No content available", 
            status: status,
            createdAt: msg.createdAt || msg.date || new Date()
        };
    });

    res.json(formattedMessages);

  } catch (err) {
    console.error("Inbox fetch error:", err.message);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// @route   PUT /api/inbox/:id/status
// @desc    Mark message as read/unread
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Normalize status
    const isRead = status === 'read';
    
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { 
          status: status,
          isRead: isRead
      },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Status updated", updatedMessage });
  } catch (err) {
    console.error("Error updating message status:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;