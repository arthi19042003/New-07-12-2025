const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    // FIX: Added 'interviewer' to the allowed roles list below
    body("role")
      .notEmpty()
      .isIn(["candidate", "employer", "hiringManager", "recruiter", "admin", "interviewer"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, role, ...profileData } = req.body;

      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      // Logic: Interviewers need approval (like recruiters/employers), Candidates/Admins are auto-approved
      const isApproved = role === 'candidate' || role === 'admin';

      user = new User({
        email,
        password,
        role,
        isApproved, 
        profile: profileData,
      });

      await user.save();

      // If not approved, send specific message and DO NOT return token
      if (!isApproved) {
        return res.status(200).json({
          success: true,
          requireApproval: true,
          message: "Registration successful! Waiting for Admin Access approval."
        });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error.message);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, role } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      if (role && user.role !== role) {
        return res.status(400).json({ message: `Invalid credentials for role ${role}` });
      }

      if (!user.isApproved) {
        return res.status(403).json({ 
          message: "Waiting for Access. Your account is pending admin approval." 
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Login Error:", error.message);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// ... (Keep Forgot Password logic same as before) ...
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email could not be sent" });
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    console.log(`\nPASSWORD RESET LINK: ${resetUrl}\n`);
    res.status(200).json({ success: true, data: "Email sent (check console for link)" });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: "Email could not be sent" });
  }
});

router.put("/reset-password/:resettoken", async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid token" });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true, data: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;