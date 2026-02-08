const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  pricePerDay: { type: Number, required: true },
  seats: Number,
  img: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Car", carSchema);