const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const mongoose = require("mongoose");

// POST /api/bookings  (create booking) - protected
router.post("/", authMiddleware, async (req, res) => {
  const { carId, pickupDate, returnDate, name, phone } = req.body;
  if (!carId || !pickupDate || !returnDate) return res.status(400).json({ message: "Missing required fields" });

  if (!mongoose.Types.ObjectId.isValid(carId)) return res.status(400).json({ message: "Invalid car id" });

  const car = await Car.findById(carId);
  if (!car) return res.status(404).json({ message: "Car not found" });

  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  if (end <= start) return res.status(400).json({ message: "Return date must be after pickup date" });

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.ceil((end - start) / msPerDay);
  const totalPrice = days * (car.pricePerDay || 0);

  const booking = new Booking({
    user: req.user.id,
    car: car._id,
    pickupDate: start,
    returnDate: end,
    name,
    phone,
    totalPrice
  });

  await booking.save();
  res.status(201).json(booking);
});

// GET /api/bookings/mine  (list my bookings) - protected
router.get("/mine", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate("car").sort({ createdAt: -1 });
  res.json(bookings);
});

// GET /api/bookings  (admin view all)
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  const bookings = await Booking.find().populate("car user").sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = router;