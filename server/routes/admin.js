const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// All admin routes prefixed with /api/admin
router.use(authMiddleware, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const users = await User.countDocuments();
  const cars = await Car.countDocuments();
  const bookings = await Booking.countDocuments();
  res.json({ users, cars, bookings });
});

// you can add more admin-specific endpoints here (reports, export, etc.)

module.exports = router;