const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Car = require("../models/Car");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// GET /api/cars  (list, supports query filters)
router.get("/", async (req, res) => {
  // optional filters: make, maxPrice, location, ownerName, sortBy
  const q = {};
  if (req.query.make) q.make = new RegExp(req.query.make, "i");
  if (req.query.maxPrice) q.pricePerDay = { $lte: Number(req.query.maxPrice) };
  if (req.query.location) q.location = new RegExp(req.query.location, "i");
  if (req.query.ownerName) q.ownerName = new RegExp(`^${req.query.ownerName}$`, "i");

  let sortOption = { createdAt: -1 }; // default sort
  if (req.query.sortBy === "rating") {
    // For rating sort, we need aggregation
    const carsWithRating = await Car.aggregate([
      { $match: q },
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
      },
      { $sort: { averageRating: -1, createdAt: -1 } }
    ]);
    return res.json(carsWithRating);
  }

  // For all other cases, still include averageRating for display purposes
  const carsWithRating = await Car.aggregate([
    { $match: q },
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
    },
    { $sort: sortOption }
  ]);
  res.json(carsWithRating);
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
  try {
    const id = req.params.id;
    console.log("Fetching car with ID:", id);

    // First get the car - try both ObjectId and string
    let car;
    try {
      car = await Car.findById(id);
    } catch (error) {
      console.log("Error with findById, trying findOne with _id as string");
      car = await Car.findOne({ _id: id });
    }

    console.log("Car found:", !!car);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Then get the average rating
    let ratingResult = [];
    try {
      ratingResult = await Car.aggregate([
        { $match: { _id: car._id } },
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
        },
        {
          $project: {
            averageRating: 1
          }
        }
      ]);
    } catch (aggError) {
      console.log("Aggregation error:", aggError.message);
    }

    const averageRating = ratingResult.length > 0 ? ratingResult[0].averageRating : 0;
    console.log("Average rating:", averageRating);

    // Return car with rating
    const carWithRating = {
      ...car.toObject(),
      averageRating
    };

    res.json(carWithRating);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/cars (admin)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { make, model, year, pricePerDay, seats, transmission, fuelType, regNumber, location, ownerPhone, img } = req.body;
  if (!regNumber) return res.status(400).json({ message: "Registration number is required" });
  // owner details from authenticated user
  const ownerName = req.user?.name || "";
  const ownerEmail = req.user?.email || "";
  const car = new Car({ make, model, year, pricePerDay, seats, transmission, fuelType, regNumber, location, ownerName, ownerPhone, img, ownerEmail });
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