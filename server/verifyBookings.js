require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const User = require("./models/User");
const Car = require("./models/Car");
const connectDB = require("./config/db");

async function verifyBookings() {
  await connectDB();
  
  try {
    console.log("\n" + "=".repeat(60));
    console.log("RENTAL APP - BOOKING VERIFICATION");
    console.log("=".repeat(60));
    
    // Get all users (customers)
    const allUsers = await User.find();
    console.log("\n📋 TOTAL USERS:", allUsers.length);
    allUsers.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) [${u.role}]`);
    });
    
    // Get all cars
    const allCars = await Car.find();
    console.log("\n🚗 TOTAL CARS:", allCars.length);
    if (allCars.length > 0) {
      allCars.slice(0, 5).forEach(c => {
        console.log(`   - ${c.make} ${c.model} (Owner: ${c.ownerName || 'N/A'})`);
      });
      if (allCars.length > 5) {
        console.log(`   ... and ${allCars.length - 5} more`);
      }
    }
    
    // Get all bookings with details
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("car", "make model")
      .sort({ createdAt: -1 });
    
    console.log("\n📅 TOTAL BOOKINGS:", bookings.length);
    
    if (bookings.length === 0) {
      console.log("\n⚠️  NO BOOKINGS FOUND!");
      console.log("   Customers need to book cars first.");
    } else {
      console.log("\n" + "-".repeat(60));
      bookings.forEach((b, idx) => {
        console.log(`\nBOOKING #${idx + 1}:`);
        console.log(`  Customer: ${b.user?.name || 'Unknown'} (${b.user?.email || 'Unknown'})`);
        console.log(`  Car:      ${b.car?.make} ${b.car?.model}`);
        console.log(`  Status:   ${b.status.toUpperCase()}`);
        console.log(`  Pickup:   ${new Date(b.pickupDate).toLocaleDateString()}`);
        console.log(`  Return:   ${new Date(b.returnDate).toLocaleDateString()}`);
        console.log(`  Total:    ₹${b.totalPrice}`);
        console.log(`  Created:  ${new Date(b.createdAt).toLocaleString()}`);
      });
      console.log("\n" + "-".repeat(60));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("ADMIN BOOKING MANAGEMENT WORKFLOW:");
    console.log("=".repeat(60));
    console.log("\n1️⃣  CUSTOMER BOOKS CAR:");
    console.log("   - Status: PENDING (waiting for admin approval)");
    console.log("\n2️⃣  ADMIN LOGS IN:");
    console.log("   - Email:    lohith@gmail.com");
    console.log("   - Password: Admin@123");
    console.log("   - URL:      http://localhost:3000/auth/login/admin");
    console.log("\n3️⃣  ADMIN VIEWS BOOKINGS:");
    console.log("   - Go to Admin Dashboard");
    console.log("   - Navigate to Bookings/Reservations");
    console.log("   - See all pending booking requests");
    console.log("\n4️⃣  ADMIN APPROVES/REJECTS:");
    console.log("   - Click 'Approve' button → Status becomes CONFIRMED");
    console.log("   - Click 'Reject' button  → Status becomes CANCELLED");
    console.log("\n5️⃣  CUSTOMER SEES UPDATE:");
    console.log("   - When status is CONFIRMED:");
    console.log("     ✓ Booking shows as 'Confirmed' (not 'Pending')");
    console.log("     ✓ Access Details appear (Registration #, Owner info)");
    console.log("=".repeat(60) + "\n");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

verifyBookings();
