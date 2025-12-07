const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  // 1. Link to the Position Collection
  position: { 
    type: Schema.Types.ObjectId, 
    ref: "Position", // Must match the "Position" model name
    required: true 
  },

  // 2. Link to the Candidate Collection
  candidate: { 
    type: Schema.Types.ObjectId, 
    ref: "Candidate", // Must match the "Candidate" model name
    required: true 
  },

  status: {
    type: String,
    enum: ["Applied", "Screening", "Under Review", "Interview", "Offer", "Hired", "Rejected"],
    default: "Applied",
  },

  resumeUrl: { type: String },

  interviews: [{
    date: Date,
    time: String,
    type: { type: String }, 
    notes: String,
    status: { type: String, default: "Scheduled" }
  }],

  communication: [{
    from: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],

  onboardingStatus: { 
    type: String, 
    enum: ["Pending", "In Progress", "Completed"], 
    default: "Pending" 
  },

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", ApplicationSchema);