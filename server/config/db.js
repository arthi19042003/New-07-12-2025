const mongoose = require("mongoose");

let retryCount = 0;
const MAX_RETRIES = 5; 

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MONGODB_URI is missing in your .env file");
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, 
    });

    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`🌍 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    retryCount = 0; 

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected. Attempting reconnection...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Reconnected Successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Error:", err.message);
    });
  } catch (error) {
    console.error(`🚨 MongoDB Connection Failed: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔁 Retrying connection (${retryCount}/${MAX_RETRIES}) in 5s...`);
      setTimeout(connectDB, 5000);
    } else {
      console.error("❌ Maximum retry limit reached. Exiting process...");
      process.exit(1);
    }
  }
};

module.exports = connectDB;
