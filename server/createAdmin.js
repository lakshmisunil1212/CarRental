require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

async function createAdmin() {
  await connectDB();
  
  const adminEmail = "lohith@gmail.com";
  const adminPassword = "Admin@123"; // Default password - SET A STRONG PASSWORD IN PRODUCTION
  const adminName = "Admin Lohith";

  try {
    // Check if admin already exists
    let admin = await User.findOne({ role: "admin" });
    
    if (admin) {
      console.log("\n✅ ADMIN ACCOUNT EXISTS:");
      console.log("Email:", admin.email);
      console.log("\nRESETTING PASSWORD...");
      
      // Update password
      const hashed = await bcrypt.hash(adminPassword, 12);
      admin.password = hashed;
      await admin.save();
      
      console.log("\n✅ PASSWORD RESET SUCCESSFULLY!");
    } else {
      console.log("\n📝 CREATING NEW ADMIN ACCOUNT...\n");
      
      // Create new admin
      const hashed = await bcrypt.hash(adminPassword, 12);
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: "admin"
      });
      
      await admin.save();
      console.log("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("ADMIN LOGIN CREDENTIALS:");
    console.log("=".repeat(50));
    console.log("Email:    ", adminEmail);
    console.log("Password: ", adminPassword);
    console.log("=".repeat(50));
    console.log("\nUSE THESE CREDENTIALS TO:");
    console.log("1. Go to http://localhost:3000/auth/login/admin");
    console.log("2. Enter the email and password above");
    console.log("3. You will see all customer booking requests");
    console.log("4. You can Approve or Reject each booking");
    console.log("\n⚠️  IMPORTANT: Change this password in production!\n");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
