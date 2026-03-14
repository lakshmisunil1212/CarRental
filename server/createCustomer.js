require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

async function createCustomer() {
  await connectDB();
  try {
    // Check if customer already exists
    const existing = await User.findOne({ email: "customer@rentalapp.com" });
    if (existing) {
      console.log("\n✅ CUSTOMER ALREADY EXISTS:");
      console.log("Email: customer@rentalapp.com");
      console.log("Password: Customer123");
      mongoose.connection.close();
      return;
    }

    // Create new customer
    const hashedPassword = await bcrypt.hash("Customer123", 12);
    const customer = new User({
      name: "Test Customer",
      email: "customer@rentalapp.com",
      password: hashedPassword,
      role: "user"
    });

    await customer.save();
    
    console.log("\n✅ CUSTOMER CREATED SUCCESSFULLY:");
    console.log("Email: customer@rentalapp.com");
    console.log("Password: Customer123");
    console.log("\nLogin at: /auth/login/customer");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

createCustomer();
