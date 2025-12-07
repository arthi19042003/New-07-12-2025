const Employer = require("../models/Employer");

// @route   GET /api/employer
// @desc    Get current employer profile
exports.getEmployerProfile = async (req, res) => {
  try {
    const profile = await Employer.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   POST /api/employer (and PUT)
// @desc    Create or update employer profile
exports.createOrUpdateEmployer = async (req, res) => {
  const {
    companyName,
    hiringManagerFirstName,
    hiringManagerLastName,
    hiringManagerPhone,
    address,
    companyWebsite,
    companyPhone,
    companyAddress,
    companyLocation,
    organization,
    costCenter,
    department,
    preferredCommunicationMode,
    projectSponsors,
    projects
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (companyName) profileFields.companyName = companyName;
  if (hiringManagerFirstName) profileFields.hiringManagerFirstName = hiringManagerFirstName;
  if (hiringManagerLastName) profileFields.hiringManagerLastName = hiringManagerLastName;
  if (hiringManagerPhone) profileFields.hiringManagerPhone = hiringManagerPhone;
  if (address) profileFields.address = address;
  if (companyWebsite) profileFields.companyWebsite = companyWebsite;
  if (companyPhone) profileFields.companyPhone = companyPhone;
  if (companyAddress) profileFields.companyAddress = companyAddress;
  if (companyLocation) profileFields.companyLocation = companyLocation;
  if (organization) profileFields.organization = organization;
  if (costCenter) profileFields.costCenter = costCenter;
  if (department) profileFields.department = department;
  if (preferredCommunicationMode) profileFields.preferredCommunicationMode = preferredCommunicationMode;
  if (projectSponsors) profileFields.projectSponsors = projectSponsors;
  if (projects) profileFields.projects = projects;

  try {
    let profile = await Employer.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Employer.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new Employer(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   POST /api/employer/team
// @desc    Add a team member
exports.addTeamMember = async (req, res) => {
  // Placeholder function to prevent crash
  try {
    // You can implement specific logic here if needed
    res.json({ msg: "Team member addition not implemented yet, but route works." });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// @route   PUT /api/employer/team/:memberId
// @desc    Update a team member
exports.updateTeamMember = async (req, res) => {
   // Placeholder function to prevent crash
   res.json({ msg: "Update team member route works" });
};

// @route   DELETE /api/employer/team/:memberId
// @desc    Delete a team member
exports.deleteTeamMember = async (req, res) => {
   // Placeholder function to prevent crash
   res.json({ msg: "Delete team member route works" });
};