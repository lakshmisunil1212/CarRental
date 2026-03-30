const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Car = require("../models/Car");
const { authMiddleware } = require("../middleware/auth");

// GET /api/reviews/:carId - Get reviews for a car
router.get("/:carId", async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId }).populate("user", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Add a review (customer only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { carId, rating, comment } = req.body;
    if (!carId || !rating) {
      return res.status(400).json({ message: "Car ID and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Check if user already reviewed this car
    const existingReview = await Review.findOne({ car: carId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this car" });
    }

    const review = new Review({
      car: carId,
      user: req.user.id,
      rating,
      comment: comment || ""
    });

    await review.save();
    await review.populate("user", "name");
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;