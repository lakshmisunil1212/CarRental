const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  pricePerDay: { type: Number, required: true },
  seats: Number,
  transmission: { type: String, enum: ["automatic", "manual"] },
  fuelType: { type: String, enum: ["petrol", "diesel", "cng", "electric", "hybrid"] },
  regNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  ownerName: { type: String, default: "Rent My Ride" },
  ownerEmail: { type: String, default: "" },
  ownerPhone: { type: String, default: "+91-9876543210" },
  img: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Car", carSchema);