const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Submission = require("../models/Submission");
const Position = require("../models/Position"); 
const Message = require("../models/Message");   
const Interview = require("../models/Interview"); // ✅ ADDED: Import Interview Model
const protect = require("../middleware/auth");

// --- GET All Applications (with Safety Checks) ---
router.get("/", protect, async (req, res) => {
  try {
    // 1. Fetch Applications and POPULATE the relations
    const apps = await Application.find()
      .populate("candidate", "firstName lastName email phone resumePath status onboardingStatus")
      .populate("position", "title hiringManager")
      .lean();
    
    // 2. Normalize Applications to match the UI structure
    const normalizedApps = apps.map(app => {
        // Handle cases where candidate or position might be null (deleted or old data)
        const cand = app.candidate || {};
        const pos = app.position || {};
        
        // Debug log for "Name Unavailable" records
        if (!cand.firstName) {
            console.log(`⚠️ Data Warning: Application ${app._id} has missing Candidate data (Old Record)`);
        }

        return {
            _id: app._id,
            // Combine names for the UI. If missing, show "Name Unavailable"
            candidateName: cand.firstName ? `${cand.firstName} ${cand.lastName}` : "Name Unavailable",
            email: cand.email || "No Email",
            phone: cand.phone || "No Phone",
            // Show Position Title instead of ID
            position: pos.title || "Unknown Position", 
            status: app.status,
            resumeUrl: app.resumeUrl || cand.resumePath,
            appliedAt: app.appliedAt,
            onboardingStatus: cand.onboardingStatus || "Pending",
            isRecruiterSubmission: false 
        };
    });

    // 3. Fetch Submissions (Existing Logic)
    const submissions = await Submission.find()
      .populate("candidate")
      .populate("position")
      .lean();

    const normalizedSubmissions = submissions.map(sub => {
      if (!sub.candidate || !sub.position) return null;
      return {
        _id: sub.candidate._id,
        candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
        email: sub.candidate.email,
        phone: sub.candidate.phone,
        position: sub.position.title,
        status: sub.candidate.status,
        resumeUrl: sub.candidate.resumePath,
        appliedAt: sub.createdAt,
        onboardingStatus: sub.candidate.onboardingStatus || "Pending",
        isRecruiterSubmission: true
      };
    }).filter(item => item !== null);

    // 4. Combine and Sort
    const unifiedList = [...normalizedApps, ...normalizedSubmissions].sort(
      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json(unifiedList);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- POST: Handle Submission & Notification (WITH CANDIDATE SYNC FIX) ---
router.post("/", protect, async (req, res) => {
  console.log("\n--- 🟢 START: Handling Application Submission ---");

  try {
    const { positionId, resumeUrl } = req.body;
    
    // 1. Identify User Info from Token
    const userId = req.user._id || req.user.id; 
    const userEmail = req.user.email;
    console.log(`1️⃣ User requesting application: ID=${userId}, Email=${userEmail}`);

    // 2. 🛑 SMART LOOKUP: Find the Candidate Profile
    let candidateProfile = await Candidate.findOne({ user: userId });

    if (!candidateProfile && userEmail) {
        console.log("   👉 Method A failed. Trying Method B (Email lookup)...");
        candidateProfile = await Candidate.findOne({ email: userEmail });
    }

    if (!candidateProfile) {
        console.log("   👉 Method B failed. Trying Method C (Direct ID match)...");
        candidateProfile = await Candidate.findById(userId);
    }

    // 3. 🛑 BLOCKER: If profile is still missing, stop the application.
    if (!candidateProfile) {
        console.log("❌ ERROR: Application blocked. No Candidate Profile found.");
        return res.status(400).json({ 
            message: "Your Candidate Profile is incomplete. Please go to your Profile page and save your details before applying." 
        });
    }

    console.log(`✅ Profile Found: ${candidateProfile.firstName} ${candidateProfile.lastName} (ID: ${candidateProfile._id})`);

    // 4. Create the Application Record
    const newApplication = new Application({
      candidate: candidateProfile._id, 
      position: positionId,
      status: "Applied",
      resumeUrl: resumeUrl,
      appliedAt: Date.now()
    });

    await newApplication.save();
    console.log("2️⃣ Application saved to MongoDB.");

    // --- 🟢 NEW FIX: SYNC CANDIDATE WITH JOB DATA ---
    // Fetch Position Title to save as backup text
    const positionDoc = await Position.findById(positionId);
    const positionTitle = positionDoc ? positionDoc.title : "Unknown Position";

    await Candidate.findByIdAndUpdate(
        candidateProfile._id,
        { 
            $set: { 
                jobId: positionId,         // Link the Job Reference
                position: positionTitle    // Save the Text backup
            } 
        },
        { new: true }
    );
    console.log(`✅ Candidate Profile synced with Job: ${positionTitle}`);
    // --- 🏁 END FIX ---


    // 5. Send Notification to Manager
    if (positionDoc && positionDoc.hiringManager) {
        const candidateName = `${candidateProfile.firstName} ${candidateProfile.lastName}`;
        console.log(`3️⃣ Sending Notification to Manager: ${positionDoc.hiringManager}`);

        const notification = new Message({
            recipient: positionDoc.hiringManager,
            sender: candidateProfile._id,
            subject: `New Direct Application: ${candidateName}`, 
            body: `${candidateName} has applied for position "${positionTitle}".`,
            message: `${candidateName} has applied for position "${positionTitle}".`, 
            type: "Application",
            isRead: false,
            date: new Date(),
            createdAt: new Date()
        });

        await notification.save();
    }
    
    console.log("--- 🏁 END: Request Complete ---\n");

    res.status(201).json({ message: "Application submitted successfully", application: newApplication });

  } catch (err) {
    console.error("❌ CRITICAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- GET History (FIXED FOR NEW SCHEMA) ---
router.get("/history/:email", protect, async (req, res) => {
  try {
    const email = req.params.email;
    
    // 1. Find the Candidate first (since Application uses ID, not Email now)
    const candidate = await Candidate.findOne({ email });

    let appHistory = [];
    if (candidate) {
        // 2. If candidate exists, find their applications using their ID
        appHistory = await Application.find({ candidate: candidate._id })
            .populate('position') // Get the position title
            .lean();
    }

    // 3. Also check legacy/direct candidate records (if any)
    const candHistory = await Candidate.find({ email }).lean();

    // 4. Combine
    const unifiedHistory = [
      ...appHistory.map(app => ({
          ...app,
          candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : "Unknown",
          // Safely access position title
          position: app.position ? app.position.title : "Unknown Position", 
          resumeUrl: app.resumeUrl,
          appliedAt: app.appliedAt
      })),
      ...candHistory.map(c => ({
        ...c,
        candidateName: `${c.firstName} ${c.lastName}`,
        resumeUrl: c.resumePath,
        appliedAt: c.createdAt
      }))
    ].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    
    res.json(unifiedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Helper Function for Updates ---
const updateAnyStatus = async (id, status) => {
  let doc = await Application.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) {
    doc = await Candidate.findByIdAndUpdate(id, { status }, { new: true });
  }
  return doc;
};

// --- UPDATE Routes ---
router.put("/:id/review", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Under Review");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Status updated to Under Review", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ ADDED: Schedule Interview Route
router.put("/:id/schedule", protect, async (req, res) => {
  try {
    const { interviewDate, interviewTime, notes } = req.body;
    
    // 1. Find the Application and populate necessary fields
    const application = await Application.findById(req.params.id)
      .populate('candidate')
      .populate('position'); // Ensure position is populated to get title

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 2. Create the Interview Record
    const newInterview = new Interview({
      candidateFirstName: application.candidate.firstName,
      candidateLastName: application.candidate.lastName,
      // Fallback if position is just an ID or missing title
      jobPosition: application.position?.title || "Position", 
      date: `${interviewDate} ${interviewTime}`, // Combine date and time string
      status: "Scheduled",
      result: "Pending",
      interviewMode: "Online", // Default
      notes: notes || "",
      // Link to the user who scheduled it (likely the hiring manager)
      interviewerId: req.user._id, 
      interviewerName: req.user.profile ? `${req.user.profile.firstName} ${req.user.profile.lastName}` : req.user.email
    });

    await newInterview.save();

    // 3. Update Application Status and add to history array
    application.status = "Interview";
    
    if (!application.interviews) application.interviews = [];
    application.interviews.push({
      date: new Date(`${interviewDate}T${interviewTime}`),
      time: interviewTime,
      status: "Scheduled",
      notes: notes
    });

    await application.save();

    // 4. Also update Candidate Status
    await Candidate.findByIdAndUpdate(application.candidate._id, { status: "Interview" });

    res.json({ message: "Interview scheduled successfully", application });

  } catch (err) {
    console.error("Error scheduling interview:", err);
    res.status(500).json({ message: "Server error scheduling interview" });
  }
});

router.put("/:id/reject", protect, async (req, res) => {
  try {
    const updatedDoc = await updateAnyStatus(req.params.id, "Rejected");
    if (!updatedDoc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Application rejected", application: updatedDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/hire", protect, async (req, res) => {
  try {
    let doc = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: "Hired", onboardingStatus: "Pending" }, 
      { new: true }
    );

    if (!doc) {
      doc = await Candidate.findByIdAndUpdate(
        req.params.id, 
        { status: "Hired", onboardingStatus: "Pending" }, 
        { new: true }
      );
    }

    if (!doc) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Candidate hired! Onboarding started.", application: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;