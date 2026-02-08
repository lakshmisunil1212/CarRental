const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  name: String,
  phone: String,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);