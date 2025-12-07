// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    // Updated enum to include 'interviewer'
    enum: ['candidate', 'employer', 'hiringManager', 'recruiter', 'admin', 'interviewer'],
    default: 'candidate'
  },
  isApproved: {
    type: Boolean,
    default: false 
  },
  profile: {
    // --- Shared / Common Fields ---
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' }, // Personal phone
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    bio: { type: String, default: '' },
    
    // --- Candidate Specific ---
    skills: [{ type: String }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
      current: Boolean
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }],
    
    // --- Employer / Hiring Manager Specific ---
    companyName: { type: String, default: '' },
    hiringManagerFirstName: { type: String, default: '' }, 
    hiringManagerLastName: { type: String, default: '' },  
    hiringManagerPhone: { type: String, default: '' },   
    organization: { type: String, default: '' },
    costCenter: { type: String, default: '' },
    department: { type: String, default: '' },
    preferredCommunicationMode: { type: String, default: "Email" },
    projectSponsors: [{ type: String }],
    projects: [{
      projectName: String,
      teamSize: Number,
      teamMembers: [{
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        role: String
      }]
    }],

    // --- RECRUITER SPECIFIC FIELDS ---
    agencyName: { type: String, default: '' }, 
    majorskillsarea: [{ type: String }], 
    resumeskills: { type: String, default: '' }, 
    partnerships: { type: String, default: '' },
    
    companyWebsite: { type: String, default: '' }, 
    companyPhone: { type: String, default: '' },   
    companyAddress: { type: String, default: '' }, 
    location: { type: String, default: '' },       
    
    companyCertifications: [{ type: String }], 
    
    dunsNumber: { type: String, default: '' },
    numberofemployees: { type: String, default: '' }, 
    
    ratecards: [{ 
      role: String, 
      lpa: String 
    }],

    // --- INTERVIEWER SPECIFIC FIELDS ---
    expertise: [{ type: String }] // Added for interviewer specialization
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);