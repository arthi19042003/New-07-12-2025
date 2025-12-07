const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "submittedBy is required"], 
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "interviewed", "hired", "rejected"], 
      default: "submitted",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
