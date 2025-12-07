require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    const email = "admin@smartsubmissions.com";
    const password = "admin@123"; 

    // 2. CLEANUP: Delete existing admin if present (fixes the double-hash issue)
    await User.findOneAndDelete({ email });
    console.log("🗑️  Cleaned up any existing admin user.");

    // 3. Create the Admin User with PLAIN TEXT password
    // The User.js model's pre('save') hook will handle the hashing automatically.
    const adminUser = new User({
      email: email,
      password: password, // <--- Sending plain text here!
      role: "admin",
      isApproved: true,
      profile: {
        firstName: "System",
        lastName: "Admin",
      }
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`Pd Password: ${password}`);

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    // 4. Close connection
    mongoose.connection.close();
    process.exit();
  }
};

createAdmin();