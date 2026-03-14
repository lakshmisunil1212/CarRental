require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

async function findAdmin() {
  await connectDB();
  try {
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log("\n✅ EXISTING ADMIN FOUND:");
      console.log("Name:", admin.name);
      console.log("Email:", admin.email);
      console.log("Role:", admin.role);
      console.log("\nUse this email to login at /auth/login/admin");
    } else {
      console.log("\n❌ No admin account found. You can create one.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

findAdmin();
