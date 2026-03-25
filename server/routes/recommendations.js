const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");
const { calculateDynamicPricing } = require("../services/dynamicPricing");

function buildUserProfile(bookings) {
  const makeCounts = new Map();
  const locationCounts = new Map();
  const dailyRates = [];

  for (const booking of bookings) {
    const car = booking.car;
    if (!car) continue;
    if (car.make) makeCounts.set(car.make, (makeCounts.get(car.make) || 0) + 1);
    if (car.location) locationCounts.set(car.location, (locationCounts.get(car.location) || 0) + 1);
    if (typeof car.pricePerDay === "number") dailyRates.push(car.pricePerDay);
  }

  const topMake = [...makeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topLocation = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const avgPrice = dailyRates.length
    ? dailyRates.reduce((s, n) => s + n, 0) / dailyRates.length
    : null;

  return { topMake, topLocation, avgPrice };
}

function normalizedWeights(raw) {
  return {
    makeWeight: Math.max(5, Math.min(60, raw?.makeWeight ?? 35)),
    locationWeight: Math.max(5, Math.min(40, raw?.locationWeight ?? 20)),
    priceWeight: Math.max(5, Math.min(50, raw?.priceWeight ?? 30)),
    valueWeight: Math.max(0, Math.min(20, raw?.valueWeight ?? 8)),
    transmissionWeight: Math.max(0, Math.min(30, raw?.transmissionWeight ?? 15)),
    fuelWeight: Math.max(0, Math.min(30, raw?.fuelWeight ?? 12)),
    seatsWeight: Math.max(0, Math.min(30, raw?.seatsWeight ?? 14)),
  };
}

function scoreCar(car, profile, preferences, weights) {
  let score = 0;
  const reasons = [];

  if (profile.topMake && car.make === profile.topMake) {
    score += weights.makeWeight;
    reasons.push("Matches your most-rented brand");
  }

  if (profile.topLocation && car.location === profile.topLocation) {
    score += weights.locationWeight;
    reasons.push("Popular in your preferred location");
  }

  if (typeof profile.avgPrice === "number" && typeof car.pricePerDay === "number") {
    const diffPct = Math.abs(car.pricePerDay - profile.avgPrice) / Math.max(1, profile.avgPrice);
    const priceScore = Math.max(0, weights.priceWeight - Math.round(diffPct * (weights.priceWeight * 2)));
    score += priceScore;
    if (priceScore >= Math.round(weights.priceWeight * 0.65)) reasons.push("Fits your typical budget");
  }

  if (typeof car.pricePerDay === "number" && car.pricePerDay < 2500) {
    score += weights.valueWeight;
    reasons.push("Good value option");
  }

  if (preferences?.preferredTransmission && preferences.preferredTransmission !== "any") {
    const carTransmission = (car.transmission || "").toLowerCase();
    if (carTransmission && carTransmission === preferences.preferredTransmission) {
      score += weights.transmissionWeight;
      reasons.push("Matches your transmission preference");
    }
  }

  if (preferences?.preferredFuelType && preferences.preferredFuelType !== "any") {
    const carFuel = (car.fuelType || "").toLowerCase();
    if (carFuel && carFuel === preferences.preferredFuelType) {
      score += weights.fuelWeight;
      reasons.push("Matches your fuel type preference");
    }
  }

  if (preferences?.preferredSeats && typeof car.seats === "number") {
    if (car.seats >= preferences.preferredSeats) {
      score += weights.seatsWeight;
      reasons.push("Meets your seating preference");
    }
  }

  return { score, reasons };
}

router.get("/cars", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences recommendationWeights recommendationFeedback");
    const preferences = user?.preferences || {
      preferredTransmission: "any",
      preferredFuelType: "any",
      preferredSeats: 5,
    };
    const weights = normalizedWeights(user?.recommendationWeights);

    const history = await Booking.find({ user: req.user.id, status: { $in: ["completed", "active", "confirmed"] } })
      .populate("car")
      .sort({ createdAt: -1 })
      .limit(50);

    const profile = buildUserProfile(history);

    const allCars = await Car.find({});
    const seenCarIds = new Set(
      history
        .map((b) => (b.car?._id ? String(b.car._id) : null))
        .filter(Boolean)
    );

    const ranked = allCars
      .filter((car) => !seenCarIds.has(String(car._id)))
      .map((car) => {
        const scored = scoreCar(car, profile, preferences, weights);
        return {
          ...car.toObject(),
          matchScore: scored.score,
          matchReasons: scored.reasons,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    res.json({
      profile: { ...profile, preferences },
      feedback: user?.recommendationFeedback || { usefulCount: 0, notUsefulCount: 0 },
      recommendations: ranked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

router.post("/feedback", authMiddleware, async (req, res) => {
  try {
    const { useful } = req.body;
    if (typeof useful !== "boolean") {
      return res.status(400).json({ message: "'useful' must be true or false" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const weights = normalizedWeights(user.recommendationWeights);

    if (useful) {
      user.recommendationFeedback.usefulCount += 1;
      weights.makeWeight += 1;
      weights.locationWeight += 1;
      weights.priceWeight += 1;
      weights.transmissionWeight += 1;
      weights.fuelWeight += 1;
      weights.seatsWeight += 1;
    } else {
      user.recommendationFeedback.notUsefulCount += 1;
      weights.priceWeight += 1;
      weights.valueWeight += 1;
      weights.makeWeight -= 1;
      weights.locationWeight -= 1;
    }

    user.recommendationWeights = normalizedWeights(weights);
    await user.save();

    res.json({
      message: "Feedback recorded",
      recommendationWeights: user.recommendationWeights,
      recommendationFeedback: user.recommendationFeedback,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to save feedback" });
  }
});

// GET /api/recommendations/dynamic-price/:carId?pickupDate=...&returnDate=...
router.get("/dynamic-price/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const { pickupDate, returnDate } = req.query;
    if (!pickupDate || !returnDate) {
      return res.status(400).json({ message: "pickupDate and returnDate are required" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const pricing = await calculateDynamicPricing({
      Booking,
      car,
      pickupDate,
      returnDate,
    });

    res.json({
      carId,
      location: car.location,
      ...pricing,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate dynamic pricing quote" });
  }
});

module.exports = router;