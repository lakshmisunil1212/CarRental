const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const mongoose = require("mongoose");
const { calculateDynamicPricing } = require("../services/dynamicPricing");

function isDateArrived(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);
  return target <= today;
}

function normalizeBookingPoint(rawPoint, defaultCity) {
  const point = rawPoint || {};
  return {
    city: String(point.city || defaultCity || "").trim(),
    area: String(point.area || "").trim(),
    addressLine: String(point.addressLine || "").trim(),
    landmark: String(point.landmark || "").trim(),
    notes: String(point.notes || "").trim(),
  };
}

function isBookingPointValid(point) {
  return Boolean(point.city && point.area && point.addressLine);
}

// POST /api/bookings  (create booking) - protected
router.post("/", authMiddleware, async (req, res) => {
  const { carId, pickupDate, pickupTime, returnDate, returnTime, name, phone, pickupLocation, returnLocation } = req.body;
  if (!carId || !pickupDate || !returnDate) return res.status(400).json({ message: "Missing required fields" });

  if (!mongoose.Types.ObjectId.isValid(carId)) return res.status(400).json({ message: "Invalid car id" });

  const car = await Car.findById(carId);
  if (!car) return res.status(404).json({ message: "Car not found" });

  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  if (end <= start) return res.status(400).json({ message: "Return date must be after pickup date" });

  const normalizedPickupLocation = normalizeBookingPoint(pickupLocation, car.location);
  const normalizedReturnLocation = normalizeBookingPoint(returnLocation, car.location);

  if (!isBookingPointValid(normalizedPickupLocation) || !isBookingPointValid(normalizedReturnLocation)) {
    return res.status(400).json({ message: "Pickup and return location details are required" });
  }

  const pricing = await calculateDynamicPricing({
    Booking,
    car,
    pickupDate: start,
    returnDate: end,
  });

  const booking = new Booking({
    user: req.user.id,
    car: car._id,
    pickupDate: start,
    pickupTime: pickupTime || "10:00",
    returnDate: end,
    returnTime: returnTime || "18:00",
    name,
    phone,
    pickupLocation: normalizedPickupLocation,
    returnLocation: normalizedReturnLocation,
    totalPrice: pricing.totalPrice,
    dynamicPricePerDay: pricing.dynamicPricePerDay,
    pricingFactors: pricing.factors,
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

// GET /api/bookings/car/:carId  (public) - list bookings for a specific car
router.get("/car/:carId", async (req, res) => {
  const { carId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(carId)) return res.status(400).json({ message: "Invalid car id" });
  const bookings = await Booking.find({ car: carId }).populate("user").sort({ pickupDate: 1 });
  res.json(bookings);
});

// GET /api/bookings/:id  (protected) - fetch a single booking
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid booking id" });
  const booking = await Booking.findById(id).populate("car user");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  // Allow admins or the booking owner
  if (req.user.role !== "admin" && booking.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Not allowed to view this booking" });
  }

  res.json(booking);
});


// PUT /api/bookings/:id/status (admin update status, now supports new statuses)
router.put("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = [
    "pending", "confirmed", "awaiting_pickup_confirmation", "active",
    "awaiting_return_confirmation", "completed", "cancelled"
  ];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const transitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["active", "cancelled"],
    awaiting_pickup_confirmation: ["active", "cancelled"],
    active: ["awaiting_return_confirmation", "completed", "cancelled"],
    awaiting_return_confirmation: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const current = booking.status;
  if (current !== status && !(transitions[current] || []).includes(status)) {
    return res.status(400).json({ message: `Invalid status transition: ${current} -> ${status}` });
  }

  booking.status = status;
  await booking.save();
  const populated = await booking.populate("car user");
  res.json(populated);
});

// PATCH /api/bookings/:id/confirm-pickup (customer or admin confirms pickup)
router.patch("/:id/confirm-pickup", authMiddleware, async (req, res) => {
  const { role } = req.user;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (!["confirmed", "awaiting_pickup_confirmation"].includes(booking.status)) {
    return res.status(400).json({ message: "Pickup can only be confirmed for confirmed bookings" });
  }
  if (!isDateArrived(booking.pickupDate)) {
    return res.status(400).json({ message: "Pickup confirmation is available on/after pickup date" });
  }

  let changed = false;
  if (role === "admin") {
    booking.pickupConfirmedByAdmin = true;
    changed = true;
  } else if (booking.user.toString() === req.user.id.toString()) {
    booking.pickupConfirmedByCustomer = true;
    changed = true;
  } else {
    return res.status(403).json({ message: "Not allowed" });
  }
  // If both confirmed, set status to active
  if (booking.pickupConfirmedByAdmin && booking.pickupConfirmedByCustomer) {
    booking.status = "active";
  } else {
    booking.status = "awaiting_pickup_confirmation";
  }
  if (changed) await booking.save();
  res.json(booking);
});

// PATCH /api/bookings/:id/confirm-return (customer or admin confirms return)
router.patch("/:id/confirm-return", authMiddleware, async (req, res) => {
  const { role } = req.user;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (!["active", "awaiting_return_confirmation"].includes(booking.status)) {
    return res.status(400).json({ message: "Return can only be confirmed for active trips" });
  }
  if (!isDateArrived(booking.returnDate)) {
    return res.status(400).json({ message: "Return confirmation is available on/after return date" });
  }

  let changed = false;
  if (role === "admin") {
    booking.returnConfirmedByAdmin = true;
    changed = true;
  } else if (booking.user.toString() === req.user.id.toString()) {
    booking.returnConfirmedByCustomer = true;
    changed = true;
  } else {
    return res.status(403).json({ message: "Not allowed" });
  }
  // If both confirmed, set status to completed
  if (booking.returnConfirmedByAdmin && booking.returnConfirmedByCustomer) {
    booking.status = "completed";
  } else {
    booking.status = "awaiting_return_confirmation";
  }
  if (changed) await booking.save();
  res.json(booking);
});

// POST /api/bookings/:id/cancel (customer cancel booking)
router.post("/:id/cancel", authMiddleware, async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Not allowed to cancel this booking" });
  }
  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Booking already cancelled" });
  }

  // If booking is pending, cancel immediately
  if (booking.status === "pending") {
    booking.status = "cancelled";
    booking.cancellationStatus = "approved";
    booking.cancellationApprovedAt = new Date();
    await booking.save();
    const updated = await booking.populate("car user");
    return res.json(updated);
  }

  // If booking is confirmed, request cancellation approval
  if (booking.status === "confirmed") {
    booking.cancellationStatus = "requested";
    booking.cancellationReason = reason || "";
    booking.cancellationRequestedAt = new Date();
    await booking.save();
    const updated = await booking.populate("car user");
    return res.json(updated);
  }

  res.status(400).json({ message: "Cannot cancel this booking" });
});

// PUT /api/bookings/:id/cancel-approve (admin approve cancellation)
router.put("/:id/cancel-approve", authMiddleware, adminOnly, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.cancellationStatus !== "requested") {
    return res.status(400).json({ message: "No cancellation request pending" });
  }

  booking.status = "cancelled";
  booking.cancellationStatus = "approved";
  booking.cancellationApprovedAt = new Date();
  booking.cancellationApprovedBy = req.user.id;
  await booking.save();
  
  const updated = await booking.populate("car user cancellationApprovedBy");
  res.json(updated);
});

// PUT /api/bookings/:id/cancel-reject (admin reject cancellation)
router.put("/:id/cancel-reject", authMiddleware, adminOnly, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.cancellationStatus !== "requested") {
    return res.status(400).json({ message: "No cancellation request pending" });
  }

  booking.cancellationStatus = "rejected";
  booking.cancellationRequestedAt = null;
  await booking.save();
  
  const updated = await booking.populate("car user");
  res.json(updated);
});

module.exports = router;