const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  position: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Position", 
    required: true 
  },
  agencyEmail: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("Invitation", invitationSchema);