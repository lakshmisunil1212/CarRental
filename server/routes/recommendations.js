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

function clampAffinity(value, min = -3, max = 3) {
  return Math.max(min, Math.min(max, value));
}

function readAffinity(mapLike, key) {
  if (!mapLike || key === undefined || key === null) return 0;
  const raw = typeof mapLike.get === "function" ? mapLike.get(String(key)) : mapLike[String(key)];
  return Number(raw || 0);
}

function updateAffinity(mapLike, key, delta) {
  if (key === undefined || key === null || key === "") return;
  const current = readAffinity(mapLike, key);
  mapLike.set(String(key), clampAffinity(current + delta));
}

function deriveFeedbackState(car, signals) {
  const explicitCarScore = readAffinity(signals?.carAffinity, car._id);
  if (explicitCarScore > 0) return "liked";
  if (explicitCarScore < 0) return "disliked";
  return null;
}

function scoreFeedbackAffinity(car, signals) {
  if (!signals) return { score: 0, reasons: [] };

  const breakdown = [
    { value: readAffinity(signals.makeAffinity, car.make), factor: 7, label: "brand" },
    { value: readAffinity(signals.locationAffinity, car.location), factor: 5, label: "location" },
    { value: readAffinity(signals.transmissionAffinity, (car.transmission || "").toLowerCase()), factor: 4, label: "transmission" },
    { value: readAffinity(signals.fuelAffinity, (car.fuelType || "").toLowerCase()), factor: 4, label: "fuel type" },
    { value: readAffinity(signals.seatsAffinity, car.seats), factor: 3, label: "capacity" },
    { value: readAffinity(signals.carAffinity, car._id), factor: 10, label: "vehicle" },
  ];

  const score = breakdown.reduce((sum, item) => sum + (item.value * item.factor), 0);
  const positiveTraits = breakdown.filter((item) => item.value > 0).map((item) => item.label);
  const negativeTraits = breakdown.filter((item) => item.value < 0).map((item) => item.label);
  const reasons = [];

  if (positiveTraits.length) {
    reasons.push(`Aligned with your feedback on ${positiveTraits.slice(0, 2).join(" and ")}`);
  }
  if (negativeTraits.length && score < 0) {
    reasons.push(`Deprioritized from your past dislikes on ${negativeTraits.slice(0, 2).join(" and ")}`);
  }

  return { score, reasons };
}

function scoreCar(car, profile, preferences, weights, signals) {
  let score = 0;
  const reasons = [];
  const scoreBreakdown = {
    history: 0,
    preferences: 0,
    priceFit: 0,
    locationFit: 0,
    tripIntent: 0,
    feedbackLearning: 0,
  };

  if (profile.topMake && car.make === profile.topMake) {
    score += weights.makeWeight;
    scoreBreakdown.history += weights.makeWeight;
    reasons.push("Matches your most-rented brand");
  }

  if (profile.topLocation && car.location === profile.topLocation) {
    score += weights.locationWeight;
    scoreBreakdown.history += weights.locationWeight;
    reasons.push("Popular in your preferred location");
  }

  if (typeof profile.avgPrice === "number" && typeof car.pricePerDay === "number") {
    const diffPct = Math.abs(car.pricePerDay - profile.avgPrice) / Math.max(1, profile.avgPrice);
    const priceScore = Math.max(0, weights.priceWeight - Math.round(diffPct * (weights.priceWeight * 2)));
    score += priceScore;
    scoreBreakdown.priceFit += priceScore;
    if (priceScore >= Math.round(weights.priceWeight * 0.65)) reasons.push("Fits your typical budget");
  }

  if (typeof car.pricePerDay === "number" && car.pricePerDay < 2500) {
    score += weights.valueWeight;
    scoreBreakdown.priceFit += weights.valueWeight;
    reasons.push("Good value option");
  }

  if (preferences?.preferredTransmission && preferences.preferredTransmission !== "any") {
    const carTransmission = (car.transmission || "").toLowerCase();
    if (carTransmission && carTransmission === preferences.preferredTransmission) {
      score += weights.transmissionWeight;
      scoreBreakdown.preferences += weights.transmissionWeight;
      reasons.push("Matches your transmission preference");
    }
  }

  if (preferences?.preferredFuelType && preferences.preferredFuelType !== "any") {
    const carFuel = (car.fuelType || "").toLowerCase();
    if (carFuel && carFuel === preferences.preferredFuelType) {
      score += weights.fuelWeight;
      scoreBreakdown.preferences += weights.fuelWeight;
      reasons.push("Matches your fuel type preference");
    }
  }

  if (preferences?.preferredSeats && typeof car.seats === "number") {
    if (car.seats >= preferences.preferredSeats) {
      score += weights.seatsWeight;
      scoreBreakdown.preferences += weights.seatsWeight;
      reasons.push("Meets your seating preference");
    }
  }

  if (preferences?.preferredLocation && preferences.preferredLocation !== "any" && car.location === preferences.preferredLocation) {
    const locationBoost = Math.round(weights.locationWeight * 0.8);
    score += locationBoost;
    scoreBreakdown.locationFit += locationBoost;
    reasons.push("Matches your preferred location");
  }

  if (preferences?.budgetBand && preferences.budgetBand !== "any") {
    const price = Number(car.pricePerDay || 0);
    if (preferences.budgetBand === "budget") {
      if (price <= 2500) {
        const budgetBoost = Math.round(weights.priceWeight * 0.7);
        score += budgetBoost;
        scoreBreakdown.priceFit += budgetBoost;
        reasons.push("Fits your budget-first preference");
      } else {
        const budgetPenalty = Math.round(weights.priceWeight * 0.4);
        score -= budgetPenalty;
        scoreBreakdown.priceFit -= budgetPenalty;
      }
    }
    if (preferences.budgetBand === "balanced") {
      if (price >= 2000 && price <= 5000) {
        const balancedBoost = Math.round(weights.priceWeight * 0.55);
        score += balancedBoost;
        scoreBreakdown.priceFit += balancedBoost;
        reasons.push("Matches your balanced budget range");
      }
    }
    if (preferences.budgetBand === "premium") {
      if (price >= 4500) {
        const premiumBoost = Math.round(weights.priceWeight * 0.6);
        score += premiumBoost;
        scoreBreakdown.priceFit += premiumBoost;
        reasons.push("Aligns with your premium preference");
      }
    }
  }

  if (preferences?.tripType && preferences.tripType !== "any") {
    const transmission = (car.transmission || "").toLowerCase();
    const seats = Number(car.seats || 0);
    const price = Number(car.pricePerDay || 0);
    if (preferences.tripType === "family" && seats >= 6) {
      const familyBoost = Math.round(weights.seatsWeight * 0.8);
      score += familyBoost;
      scoreBreakdown.tripIntent += familyBoost;
      reasons.push("Family-friendly seating");
    }
    if (preferences.tripType === "business" && transmission === "automatic") {
      const businessBoost = Math.round(weights.transmissionWeight * 0.8);
      score += businessBoost;
      scoreBreakdown.tripIntent += businessBoost;
      reasons.push("Business-friendly drive comfort");
    }
    if (preferences.tripType === "city" && price <= 3000) {
      const cityBoost = Math.round(weights.valueWeight * 1.3);
      score += cityBoost;
      scoreBreakdown.tripIntent += cityBoost;
      reasons.push("City-trip value fit");
    }
    if (preferences.tripType === "highway" && seats >= 5) {
      const highwayBoost = Math.round(weights.seatsWeight * 0.6);
      score += highwayBoost;
      scoreBreakdown.tripIntent += highwayBoost;
      reasons.push("Comfortable for long drives");
    }
  }

  const feedbackAffinity = scoreFeedbackAffinity(car, signals);
  score += feedbackAffinity.score;
  scoreBreakdown.feedbackLearning += feedbackAffinity.score;
  reasons.push(...feedbackAffinity.reasons);

  return { score, reasons, scoreBreakdown };
}

function getConfidenceInfo({ historyCount, preferences, feedback }) {
  const preferenceSignals = [
    preferences?.preferredTransmission !== "any",
    preferences?.preferredFuelType !== "any",
    Number(preferences?.preferredSeats || 5) !== 5,
    preferences?.preferredLocation && preferences.preferredLocation !== "any",
    preferences?.budgetBand && preferences.budgetBand !== "any",
    preferences?.tripType && preferences.tripType !== "any",
  ].filter(Boolean).length;

  const feedbackCount = Number(feedback?.usefulCount || 0) + Number(feedback?.notUsefulCount || 0);
  const confidenceScore = Math.min(100, historyCount * 14 + preferenceSignals * 9 + feedbackCount * 4);

  if (confidenceScore >= 70) return { level: "high", score: confidenceScore };
  if (confidenceScore >= 35) return { level: "medium", score: confidenceScore };
  return { level: "low", score: confidenceScore };
}

function buildAlternativeSuggestions(ranked) {
  if (!ranked?.length) {
    return { cheaperOptions: [], premiumOptions: [] };
  }

  const top = ranked[0];
  const topPrice = Number(top.pricePerDay || 0);

  const cheaperOptions = ranked
    .filter((car) => car._id !== top._id && Number(car.pricePerDay || 0) < topPrice)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 2);

  const premiumOptions = ranked
    .filter((car) => car._id !== top._id && Number(car.pricePerDay || 0) > topPrice)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 2);

  return { cheaperOptions, premiumOptions };
}

function normalizedLocation(value) {
  return String(value || "").trim().toLowerCase();
}

function priceDifference(left, right) {
  return Math.abs(Number(left || 0) - Number(right || 0));
}

function pickRecommendation(candidates, usedIds, mapper) {
  const next = candidates.find((car) => !usedIds.has(String(car._id)));
  if (!next) return null;

  usedIds.add(String(next._id));
  return mapper(next);
}

function buildRelatedCarsPayload(baseCar, cars) {
  const basePrice = Number(baseCar.pricePerDay || 0);
  const baseSeats = Number(baseCar.seats || 0);
  const baseLocation = normalizedLocation(baseCar.location);
  const usedIds = new Set([String(baseCar._id)]);
  const pool = cars.filter((car) => String(car._id) !== String(baseCar._id));

  const similarPriceCandidates = [...pool].sort((left, right) => {
    const priceGap = priceDifference(left.pricePerDay, basePrice) - priceDifference(right.pricePerDay, basePrice);
    if (priceGap !== 0) return priceGap;
    return priceDifference(left.seats, baseSeats) - priceDifference(right.seats, baseSeats);
  });

  const largerCapacityCandidates = pool
    .filter((car) => Number(car.seats || 0) > baseSeats)
    .sort((left, right) => {
      const seatGap = Number(left.seats || 0) - Number(right.seats || 0);
      if (seatGap !== 0) return seatGap;
      return priceDifference(left.pricePerDay, basePrice) - priceDifference(right.pricePerDay, basePrice);
    });

  const sameCityCandidates = pool
    .filter((car) => normalizedLocation(car.location) === baseLocation)
    .sort((left, right) => {
      const priceGap = priceDifference(left.pricePerDay, basePrice) - priceDifference(right.pricePerDay, basePrice);
      if (priceGap !== 0) return priceGap;
      return priceDifference(left.seats, baseSeats) - priceDifference(right.seats, baseSeats);
    });

  const fallbackCandidates = [...pool].sort((left, right) => {
    const leftScore =
      (normalizedLocation(left.location) === baseLocation ? 40 : 0) +
      Math.max(0, 30 - priceDifference(left.pricePerDay, basePrice) / 100) +
      Math.max(0, 20 - Math.abs(Number(left.seats || 0) - baseSeats) * 4) +
      ((left.make || "") === (baseCar.make || "") ? 10 : 0);
    const rightScore =
      (normalizedLocation(right.location) === baseLocation ? 40 : 0) +
      Math.max(0, 30 - priceDifference(right.pricePerDay, basePrice) / 100) +
      Math.max(0, 20 - Math.abs(Number(right.seats || 0) - baseSeats) * 4) +
      ((right.make || "") === (baseCar.make || "") ? 10 : 0);

    return rightScore - leftScore;
  });

  const recommendations = [];

  const similarPriceMatch = pickRecommendation(similarPriceCandidates, usedIds, (car) => ({
    ...car.toObject(),
    recommendationType: "similar-price",
    recommendationTitle: "Similar price range",
    recommendationReason: `Close to your current budget at INR ${Number(car.pricePerDay || 0).toLocaleString()} per day.`,
  }));
  if (similarPriceMatch) recommendations.push(similarPriceMatch);

  const largerCapacityMatch = pickRecommendation(largerCapacityCandidates, usedIds, (car) => ({
    ...car.toObject(),
    recommendationType: "larger-capacity",
    recommendationTitle: "More seating room",
    recommendationReason: `${Number(car.seats || 0)} seats with a price close to this ${baseSeats || "current"}-seat option.`,
  }));
  if (largerCapacityMatch) recommendations.push(largerCapacityMatch);

  const sameCityMatch = pickRecommendation(sameCityCandidates, usedIds, (car) => ({
    ...car.toObject(),
    recommendationType: "same-city",
    recommendationTitle: "Available in the same city",
    recommendationReason: `Another option in ${car.location || "the same city"} if you want nearby pickup convenience.`,
  }));
  if (sameCityMatch) recommendations.push(sameCityMatch);

  while (recommendations.length < 3) {
    const fallbackMatch = pickRecommendation(fallbackCandidates, usedIds, (car) => ({
      ...car.toObject(),
      recommendationType: "good-match",
      recommendationTitle: "Another close match",
      recommendationReason: "A strong alternative based on price, seating, and location similarity.",
    }));

    if (!fallbackMatch) break;
    recommendations.push(fallbackMatch);
  }

  return {
    baseCar: baseCar.toObject(),
    recommendations: recommendations.slice(0, 3),
  };
}

async function buildRecommendationsPayload(userDoc, userId) {
  const preferences = userDoc?.preferences || {
    preferredTransmission: "any",
    preferredFuelType: "any",
    preferredSeats: 5,
    preferredLocation: "any",
    budgetBand: "any",
    tripType: "any",
  };
  const weights = normalizedWeights(userDoc?.recommendationWeights);
  const signals = userDoc?.recommendationSignals;

  const history = await Booking.find({ user: userId, status: { $in: ["completed", "active", "confirmed"] } })
    .populate("car")
    .sort({ createdAt: -1 })
    .limit(50);

  const profile = buildUserProfile(history);
  
  // Get all cars with average ratings
  const allCarsWithRatings = await Car.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "car",
        as: "reviews"
      }
    },
    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $avg: "$reviews.rating" },
            else: 0
          }
        }
      }
    }
  ]);
  
  const seenCarIds = new Set(
    history
      .map((b) => (b.car?._id ? String(b.car._id) : null))
      .filter(Boolean)
  );

  const ranked = allCarsWithRatings
    .filter((car) => !seenCarIds.has(String(car._id)))
    .map((car) => {
      const scored = scoreCar(car, profile, preferences, weights, signals);
      return {
        ...car,
        matchScore: scored.score,
        matchReasons: scored.reasons,
        scoreBreakdown: scored.scoreBreakdown,
        feedbackState: deriveFeedbackState(car, signals),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);

  const uniqueLocations = [...new Set(allCarsWithRatings.map((car) => car.location).filter(Boolean))];
  const hasQuizSignals =
    preferences.preferredTransmission !== "any" ||
    preferences.preferredFuelType !== "any" ||
    preferences.preferredLocation !== "any" ||
    preferences.budgetBand !== "any" ||
    preferences.tripType !== "any" ||
    Number(preferences.preferredSeats || 5) !== 5;
  const feedback = userDoc?.recommendationFeedback || { usefulCount: 0, notUsefulCount: 0 };
  const confidence = getConfidenceInfo({ historyCount: history.length, preferences, feedback });
  const alternatives = buildAlternativeSuggestions(ranked);

  return {
    profile: { ...profile, preferences },
    feedback,
    recommendations: ranked,
    confidence,
    alternatives,
    historyCount: history.length,
    isColdStart: history.length === 0 && !hasQuizSignals,
    quizOptions: {
      locations: uniqueLocations,
    },
  };
}

router.get("/cars", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("preferences recommendationWeights recommendationFeedback recommendationSignals");
    if (!user) return res.status(404).json({ message: "User not found" });
    const payload = await buildRecommendationsPayload(user, req.user.id);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

router.post("/cold-start-quiz", authMiddleware, async (req, res) => {
  try {
    const {
      preferredTransmission,
      preferredFuelType,
      preferredSeats,
      preferredLocation,
      budgetBand,
      tripType,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.preferences = {
      ...user.preferences,
      preferredTransmission: preferredTransmission || user.preferences?.preferredTransmission || "any",
      preferredFuelType: preferredFuelType || user.preferences?.preferredFuelType || "any",
      preferredSeats: preferredSeats !== undefined ? Number(preferredSeats) : user.preferences?.preferredSeats || 5,
      preferredLocation: preferredLocation || "any",
      budgetBand: budgetBand || "any",
      tripType: tripType || "any",
    };

    const weights = normalizedWeights(user.recommendationWeights);
    if (preferredTransmission && preferredTransmission !== "any") weights.transmissionWeight += 2;
    if (preferredFuelType && preferredFuelType !== "any") weights.fuelWeight += 2;
    if (preferredSeats !== undefined) weights.seatsWeight += 1;
    if (preferredLocation && preferredLocation !== "any") weights.locationWeight += 2;
    if (budgetBand && budgetBand !== "any") {
      weights.priceWeight += 2;
      if (budgetBand === "budget") weights.valueWeight += 2;
    }

    user.recommendationWeights = normalizedWeights(weights);
    await user.save();

    const refreshedUser = await User.findById(req.user.id).select("preferences recommendationWeights recommendationFeedback recommendationSignals");
    const payload = await buildRecommendationsPayload(refreshedUser, req.user.id);
    res.json({
      message: "Cold-start quiz applied successfully",
      ...payload,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to apply cold-start quiz" });
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

router.post("/feedback/item", authMiddleware, async (req, res) => {
  try {
    const { carId, sentiment } = req.body;
    if (!carId) return res.status(400).json({ message: "carId is required" });
    if (!["like", "dislike"].includes(sentiment)) {
      return res.status(400).json({ message: "sentiment must be 'like' or 'dislike'" });
    }

    const [user, car] = await Promise.all([
      User.findById(req.user.id),
      Car.findById(carId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (!user.recommendationSignals) {
      user.recommendationSignals = {
        makeAffinity: new Map(),
        locationAffinity: new Map(),
        transmissionAffinity: new Map(),
        fuelAffinity: new Map(),
        seatsAffinity: new Map(),
        carAffinity: new Map(),
      };
    }

    const delta = sentiment === "like" ? 1 : -1;

    updateAffinity(user.recommendationSignals.carAffinity, car._id, delta * 2);
    updateAffinity(user.recommendationSignals.makeAffinity, car.make, delta);
    updateAffinity(user.recommendationSignals.locationAffinity, car.location, delta);
    updateAffinity(user.recommendationSignals.transmissionAffinity, (car.transmission || "").toLowerCase(), delta);
    updateAffinity(user.recommendationSignals.fuelAffinity, (car.fuelType || "").toLowerCase(), delta);
    updateAffinity(user.recommendationSignals.seatsAffinity, car.seats, delta);

    if (sentiment === "like") {
      user.recommendationFeedback.usefulCount += 1;
    } else {
      user.recommendationFeedback.notUsefulCount += 1;
    }

    const weights = normalizedWeights(user.recommendationWeights);
    weights.makeWeight += delta;
    weights.locationWeight += delta;
    weights.transmissionWeight += delta;
    weights.fuelWeight += delta;
    weights.seatsWeight += delta;
    weights.valueWeight += sentiment === "dislike" ? 1 : 0;
    weights.priceWeight += sentiment === "dislike" ? 1 : 0;

    user.recommendationWeights = normalizedWeights(weights);

    await user.save();

    const refreshedUser = await User.findById(req.user.id).select("preferences recommendationWeights recommendationFeedback recommendationSignals");
    const payload = await buildRecommendationsPayload(refreshedUser, req.user.id);

    res.json({
      message: sentiment === "like" ? "We will recommend more cars like this." : "We will avoid cars like this in future matches.",
      recommendationFeedback: payload.feedback,
      recommendations: payload.recommendations,
      profile: payload.profile,
      confidence: payload.confidence,
      alternatives: payload.alternatives,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save item feedback" });
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

router.get("/related/:carId", async (req, res) => {
  try {
    const baseCar = await Car.findById(req.params.carId);
    if (!baseCar) return res.status(404).json({ message: "Car not found" });

    const cars = await Car.find({ _id: { $ne: baseCar._id } }).limit(100);
    const payload = buildRelatedCarsPayload(baseCar, cars);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch related cars" });
  }
});

module.exports = router;