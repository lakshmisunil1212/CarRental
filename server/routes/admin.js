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
  // overall counts (could be useful for superadmins)
  const users = await User.countDocuments();
  const cars = await Car.countDocuments();
  const bookings = await Booking.countDocuments();

  // owner-specific metrics (count by email for consistency)
  const ownerEmail = req.user?.email || "";
  const ownerCars = await Car.countDocuments({ ownerEmail: new RegExp(`^${ownerEmail}$`, "i") });
  const pendingBookings = await Booking.countDocuments({ status: "pending" });
  const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });

  res.json({ users, cars, bookings, ownerCars, pendingBookings, confirmedBookings });
});

// you can add more admin-specific endpoints here (reports, export, etc.)

module.exports = router;