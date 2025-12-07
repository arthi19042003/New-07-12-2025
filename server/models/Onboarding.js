const mongoose = require('mongoose');

const OnboardingSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate', // or 'User' depending on your setup
    required: true
  },
  // 👇 ADD THIS SECTION 👇
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Make sure this matches your Job model name exactly (e.g. 'Job' or 'Position')
    required: false
  },
  // 👆 ----------------- 👆
  
  onboardingStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  // ... rest of your schema (documents, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Onboarding', OnboardingSchema);