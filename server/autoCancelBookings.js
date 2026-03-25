// Auto-cancel pending bookings whose pickup date has arrived or passed
require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const connectDB = require("./config/db");

async function autoCancelPendingBookings() {
  await connectDB();
  const today = new Date();
  today.setHours(0,0,0,0);
  try {
    const result = await Booking.updateMany(
      {
        status: "pending",
        pickupDate: { $lte: today }
      },
      {
        $set: { status: "cancelled" }
      }
    );
    console.log(`Auto-cancelled ${result.nModified || result.modifiedCount} pending bookings.`);
  } catch (err) {
    console.error("Error in auto-cancel:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  autoCancelPendingBookings();
}

module.exports = autoCancelPendingBookings;
