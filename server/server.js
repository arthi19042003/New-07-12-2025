require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

require("./models/User");
require("./models/Position");
require("./models/Candidate");
require("./models/Application");
require("./models/Submission");
require("./models/Interview");
require("./models/Invitation");
require("./models/Message");
require("./models/Onboarding");
require("./models/PurchaseOrder");
require("./models/Resume");
require("./models/Employer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB()
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");

    try {
      const collection = mongoose.connection.collection("purchaseorders");
      const indexes = await collection.indexes();
      const indexExists = indexes.some((idx) => idx.name === "poId_1");

      if (indexExists) {
        console.log("⚠️ Found conflicting index 'poId_1'. Dropping it...");
        await collection.dropIndex("poId_1");
        console.log("✅ Index 'poId_1' dropped. You can now create POs!");
      }
    } catch (err) {
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

const protect = require("./middleware/auth");

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/profile", require("./routes/profile"));
app.use("/api/resume", require("./routes/resume"));

app.use("/api/employer", require("./routes/employerRoutes"));

app.use("/api/hiring-dashboard", protect, require("./routes/hiringDashboard"));
app.use("/api/positions", require("./routes/positions"));
app.use("/api/purchase-orders", protect, require("./routes/purchaseOrders"));
app.use("/api/applications", protect, require("./routes/applications"));
app.use("/api/onboarding", require("./routes/onboarding"));
app.use("/api/agencies", protect, require("./routes/agencies"));

app.use("/api/recruiter", protect, require("./routes/recruiter"));

app.use("/api/inbox", protect, require("./routes/inbox"));
app.use("/api/candidates", protect, require("./routes/candidates"));
app.use("/api/interviews", protect, require("./routes/interviewRoutes"));
app.use("/api/dashboard", protect, require("./routes/dashboard"));
app.use("/api/submissions", protect, require("./routes/submissions"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Smart Submissions API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Smart Submissions Server running on port ${PORT}`);
});