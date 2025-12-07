const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },

  companyName: String,
  hiringManagerFirstName: String,
  hiringManagerLastName: String,
  hiringManagerPhone: String,

  address: String,
  companyWebsite: String,
  companyPhone: String,
  companyAddress: String,
  companyLocation: String,

  organization: String,
  costCenter: String,
  department: String,
  preferredCommunicationMode: { type: String, default: "Email" },

  projectSponsors: [String],

  projects: [
    {
      projectName: String,
      teamSize: Number,
      teamMembers: [
        {
          firstName: String,
          lastName: String,
          email: String,
          phone: String,
          role: String
        }
      ]
    }
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Employer", EmployerSchema);
