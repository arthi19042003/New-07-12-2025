const mongoose = require("mongoose");
const { Schema } = mongoose;

const CandidateSchema = new Schema({
  // Link Login to Profile
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true 
  },

  // ✅ 1. Link to Job Model (Matches your .populate('jobId'))
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position", // ⚠️ Ensure this matches your Job Model name (e.g. 'Job' or 'Position')
    required: false
  },

  // ✅ 2. Backup Text Field for Position (If no Job ID is linked)
  position: { 
    type: String, 
    required: false 
  }, 

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  bio: { type: String },
  
  skills: { type: [String], default: [] },
  resumePath: { type: String },
  resumeOriginalName: { type: String },

  status: {
    type: String,
    enum: ["Active", "Hired", "Rejected", "Passive"],
    default: "Active"
  },

  experience: [{
    position: String,
    company: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],

  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Candidate", CandidateSchema);