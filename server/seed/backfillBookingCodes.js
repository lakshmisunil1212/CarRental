require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Booking = require("../models/Booking");

function bookingCodeFromObjectId(idValue) {
  const idText = String(idValue || "");
  return `BK-${idText.slice(-8).toUpperCase()}`;
}

async function run() {
  try {
    await connectDB();

    const bookings = await Booking.find({
      $or: [
        { bookingCode: { $exists: false } },
        { bookingCode: null },
        { bookingCode: "" },
      ],
    }).select("_id bookingCode");

    let updated = 0;
    for (const booking of bookings) {
      booking.bookingCode = bookingCodeFromObjectId(booking._id);
      await booking.save();
      updated += 1;
    }

    console.log(`Backfilled booking codes for ${updated} booking(s).`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Failed to backfill booking codes:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();
