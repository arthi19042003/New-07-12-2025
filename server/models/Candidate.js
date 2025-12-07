const mongoose = require("mongoose");
const { Schema } = mongoose;

const CandidateSchema = new Schema({
  // Link Login to Profile
  // 🟢 UPDATE: Removed 'required: true' and added 'sparse: true'
  // This allows Recruiters to create candidates who don't have a login account yet.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, 
    unique: true,
    sparse: true // Allows multiple candidates to have no user account (null)
  },

  // Link to Job Model
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position", 
    required: false
  },

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

  // 🟢 NEW FIELDS: Added to support Recruiter Submissions
  submittedByRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company: { type: String },
  hiringManager: { type: String },

  status: {
    type: String,
    // 🟢 UPDATE: Added "Submitted" to the allowed list
    enum: ["Active", "Hired", "Rejected", "Passive", "Submitted"],
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