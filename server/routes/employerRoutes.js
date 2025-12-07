const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const {
  getEmployerProfile,
  createOrUpdateEmployer,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/employerController");

// 1. Get Profile
router.get("/", auth, getEmployerProfile);

// 2. Create Profile (POST)
router.post("/", auth, createOrUpdateEmployer);

// 👇👇👇 THIS IS THE FIX FOR THE 404 ERROR 👇👇👇
// 3. Update Profile (PUT)
router.put("/", auth, createOrUpdateEmployer); 
// 👆👆👆

// 4. Add Team Member
router.post(
  "/team",
  auth,
  [
    body("name").notEmpty().withMessage("Name required"),
    body("role").notEmpty().withMessage("Role required"),
    body("email").isEmail().withMessage("Valid email required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  addTeamMember
);

// 5. Update/Delete Team Members
router.put("/team/:memberId", auth, updateTeamMember);
router.delete("/team/:memberId", auth, deleteTeamMember);

module.exports = router;