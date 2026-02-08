const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/cars  (list, supports query filters)
router.get("/", async (req, res) => {
  // optional filters: make, maxPrice
  const q = {};
  if (req.query.make) q.make = new RegExp(req.query.make, "i");
  if (req.query.maxPrice) q.pricePerDay = { $lte: Number(req.query.maxPrice) };
  const cars = await Car.find(q).sort({ createdAt: -1 });
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
  const { make, model, year, pricePerDay, seats, img } = req.body;
  const car = new Car({ make, model, year, pricePerDay, seats, img });
  await car.save();
  res.status(201).json(car);
});

// PUT /api/cars/:id (admin)
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

module.exports = router;