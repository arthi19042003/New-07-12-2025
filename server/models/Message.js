const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // ✅ Linked to User Model
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  subject: { type: String, default: "No Subject" },
  
  // Content fields (New & Legacy)
  body: String,
  message: String, 

  // Legacy fields
  to: String,   
  from: String, 

  type: { type: String, default: "General" },
  
  status: { type: String, default: "unread" },
  isRead: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);