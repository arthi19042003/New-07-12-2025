const mongoose = require("mongoose");
 
const interviewSchema = new mongoose.Schema(
  {
    candidateFirstName: { type: String, required: true },
    candidateLastName: { type: String, required: true },
    // We store ID to link to the user, and Name for display caching
    interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    interviewerName: { type: String, required: true },
    
    date: { type: String, required: true },
    jobPosition: { type: String, required: true },
    interviewMode: { type: String, default: "Online" },
    status: { type: String, default: "Pending" },
    result: { type: String, default: "Pending" },
    rating: { type: Number, default: 0 },
    
    // New field for the link sent by interviewer
    meetingLink: { type: String, default: "" },

    questionsAsked: { type: String, default: "" },
    notes: { type: String, default: "" },
    feedback: { type: String, default: "" },
    resume: { type: String, default: "" },
    notifyManager: { type: Boolean, default: false },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Interview", interviewSchema);