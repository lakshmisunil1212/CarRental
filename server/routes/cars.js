const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/cars  (list, supports query filters)
router.get("/", async (req, res) => {
  // optional filters: make, maxPrice, location, ownerName
  const q = {};
  if (req.query.make) q.make = new RegExp(req.query.make, "i");
  if (req.query.maxPrice) q.pricePerDay = { $lte: Number(req.query.maxPrice) };
  if (req.query.location) q.location = new RegExp(req.query.location, "i");
  if (req.query.ownerName) q.ownerName = new RegExp(`^${req.query.ownerName}$`, "i");
  const cars = await Car.find(q).sort({ createdAt: -1 });
  res.json(cars);
});

// IMPORTANT: /mine must come BEFORE /:id so Express matches it first
// GET /api/cars/mine (admin - fetch their own cars)
router.get("/mine", authMiddleware, adminOnly, async (req, res) => {
  const ownerEmail = req.user?.email || "";
  const cars = await Car.find({ ownerEmail: new RegExp(`^${ownerEmail}$`, "i") }).sort({ createdAt: -1 });
  res.json(cars);
});

// GET /api/cars/:id
router.get("/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

// POST /api/cars (admin)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { make, model, year, pricePerDay, seats, regNumber, location, ownerPhone, img } = req.body;
  if (!regNumber) return res.status(400).json({ message: "Registration number is required" });
  // owner details from authenticated user
  const ownerName = req.user?.name || "";
  const ownerEmail = req.user?.email || "";
  const car = new Car({ make, model, year, pricePerDay, seats, regNumber, location, ownerName, ownerPhone, img, ownerEmail });
  await car.save();
  res.status(201).json(car);
});

// PUT /api/cars/:id (admin)
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  // allow updating regNumber as well but ensure not empty
  if (req.body.regNumber === "" || req.body.regNumber == null) {
    return res.status(400).json({ message: "Registration number cannot be blank" });
  }
  const existing = await Car.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Car not found" });
  // only owner should be able to edit their car
  if (existing.ownerName && req.user && existing.ownerName.toLowerCase() !== req.user.name.toLowerCase()) {
    return res.status(403).json({ message: "Not allowed to modify this car" });
  }
  // do not allow ownerName change through body
  delete req.body.ownerName;
  // optionally update ownerEmail
  delete req.body.ownerEmail;
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(car);
});

// DELETE /api/cars/:id (admin)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });
  // only owner can delete
  if (car.ownerName && req.user && car.ownerName.toLowerCase() !== req.user.name.toLowerCase()) {
    return res.status(403).json({ message: "Not allowed to delete this car" });
  }
  await Car.findByIdAndDelete(req.params.id);
  res.json({ message: "Car deleted", car });
});

module.exports = router;