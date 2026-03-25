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

function getSinceDate(range) {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === "week") return new Date(now.getTime() - 7 * dayMs);
  if (range === "quarter") return new Date(now.getTime() - 90 * dayMs);
  if (range === "year") return new Date(now.getTime() - 365 * dayMs);
  return new Date(now.getTime() - 30 * dayMs);
}

function timeBucket(date) {
  const hour = new Date(date).getHours();
  if (hour >= 6 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 21) return "evening";
  return "night";
}

function weatherCategory(code) {
  if (typeof code !== "number") return "unknown";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([95, 96, 99].includes(code)) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([0, 1].includes(code)) return "clear";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  return "other";
}

function getRangeConfig(range) {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === "week") {
    return { range: "week", since: new Date(now.getTime() - 7 * dayMs), spanMs: 7 * dayMs, trendMode: "day" };
  }
  if (range === "quarter") {
    return { range: "quarter", since: new Date(now.getTime() - 90 * dayMs), spanMs: 90 * dayMs, trendMode: "week" };
  }
  if (range === "year") {
    return { range: "year", since: new Date(now.getTime() - 365 * dayMs), spanMs: 365 * dayMs, trendMode: "month" };
  }
  return { range: "month", since: new Date(now.getTime() - 30 * dayMs), spanMs: 30 * dayMs, trendMode: "day" };
}

function formatTrendLabel(row, trendMode) {
  if (trendMode === "week") {
    return `W${row._id.week}`;
  }
  if (trendMode === "month") {
    const year = row._id.year;
    const month = row._id.month;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  const date = new Date(`${row._id}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTrendGroupExpression(trendMode) {
  if (trendMode === "week") {
    return {
      year: { $isoWeekYear: "$createdAt" },
      week: { $isoWeek: "$createdAt" },
    };
  }
  if (trendMode === "month") {
    return {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
  }
  return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
}

// GET /api/admin/reports-insights?range=week|month|quarter|year
router.get("/reports-insights", async (req, res) => {
  try {
    const rangeQuery = req.query.range || "month";
    const config = getRangeConfig(rangeQuery);

    const revenueStatuses = [
      "confirmed",
      "awaiting_pickup_confirmation",
      "active",
      "awaiting_return_confirmation",
      "completed",
    ];
    const realizedStatuses = ["active", "awaiting_return_confirmation", "completed"];

    const currentMatch = { createdAt: { $gte: config.since } };
    const previousSince = new Date(config.since.getTime() - config.spanMs);
    const previousMatch = { createdAt: { $gte: previousSince, $lt: config.since } };

    const [summaryRows, previousRows, trendRows, carRows, customerRows] = await Promise.all([
      Booking.aggregate([
        { $match: currentMatch },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", revenueStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
            realizedRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", realizedStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      Booking.aggregate([
        { $match: previousMatch },
        {
          $group: {
            _id: null,
            previousRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", revenueStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      Booking.aggregate([
        { $match: currentMatch },
        {
          $group: {
            _id: getTrendGroupExpression(config.trendMode),
            revenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", revenueStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { ...currentMatch, status: { $ne: "cancelled" } } },
        {
          $lookup: {
            from: "cars",
            localField: "car",
            foreignField: "_id",
            as: "car",
          },
        },
        { $unwind: { path: "$car", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$car._id",
            carName: {
              $first: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$car.make", "Unknown"] },
                      " ",
                      { $ifNull: ["$car.model", "Vehicle"] },
                    ],
                  },
                },
              },
            },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", revenueStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 6 },
      ]),
      Booking.aggregate([
        { $match: { ...currentMatch, status: { $ne: "cancelled" } } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$user._id",
            name: { $first: { $ifNull: ["$user.name", "$name"] } },
            email: { $first: { $ifNull: ["$user.email", ""] } },
            bookings: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [
                  { $in: ["$status", revenueStatuses] },
                  { $ifNull: ["$totalPrice", 0] },
                  0,
                ],
              },
            },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const summary = summaryRows[0] || {
      totalBookings: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      totalRevenue: 0,
      realizedRevenue: 0,
    };
    const previousRevenue = previousRows[0]?.previousRevenue || 0;
    const growth = previousRevenue > 0
      ? ((summary.totalRevenue - previousRevenue) / previousRevenue) * 100
      : summary.totalRevenue > 0
        ? 100
        : 0;

    const trend = trendRows.map((row) => ({
      label: formatTrendLabel(row, config.trendMode),
      revenue: Math.round(row.revenue || 0),
      bookings: row.bookings || 0,
    }));

    const maxBookings = carRows.reduce((max, row) => Math.max(max, row.bookings || 0), 0);
    const carUtilization = carRows.map((row) => ({
      carName: row.carName,
      bookings: row.bookings || 0,
      revenue: Math.round(row.revenue || 0),
      utilization: maxBookings > 0 ? Math.round(((row.bookings || 0) / maxBookings) * 100) : 0,
    }));

    const topCustomers = customerRows
      .filter((row) => row.name)
      .map((row) => ({
        name: row.name,
        email: row.email,
        bookings: row.bookings || 0,
        totalSpent: Math.round(row.totalSpent || 0),
      }));

    res.json({
      range: config.range,
      totalRevenue: Math.round(summary.totalRevenue || 0),
      realizedRevenue: Math.round(summary.realizedRevenue || 0),
      growth: Number(growth.toFixed(1)),
      bookingStats: {
        total: summary.totalBookings || 0,
        completed: summary.completed || 0,
        pending: summary.pending || 0,
        cancelled: summary.cancelled || 0,
      },
      revenueTrend: trend,
      carUtilization,
      topCustomers,
    });
  } catch (error) {
    console.error("reports-insights error", error);
    res.status(500).json({ message: "Failed to fetch reports insights" });
  }
});

// GET /api/admin/pricing-insights?range=week|month|quarter|year
router.get("/pricing-insights", async (req, res) => {
  const range = req.query.range || "month";
  const since = getSinceDate(range);

  const bookings = await Booking.find({
    createdAt: { $gte: since },
    dynamicPricePerDay: { $ne: null },
  }).populate("car", "location pricePerDay");

  const locationMap = new Map();
  const timeMap = new Map();
  const weatherMap = new Map();

  let combinedSum = 0;
  let demandSum = 0;
  let locationDemandSum = 0;
  let weatherFactorSum = 0;
  let timeFactorSum = 0;
  let upliftSum = 0;

  for (const b of bookings) {
    const factors = b.pricingFactors || {};
    const loc = b.car?.location || "Unknown";
    const createdBucket = timeBucket(b.createdAt);
    const weather = weatherCategory(factors.weatherCode);

    const combined = Number(factors.combinedFactor || 1);
    const demand = Number(factors.carDemandFactor || 1);
    const locDemand = Number(factors.locationDemandFactor || 1);
    const weatherFactor = Number(factors.weatherFactor || 1);
    const todFactor = Number(factors.timeOfDayFactor || 1);

    combinedSum += combined;
    demandSum += demand;
    locationDemandSum += locDemand;
    weatherFactorSum += weatherFactor;
    timeFactorSum += todFactor;

    const base = Number(b.car?.pricePerDay || 0);
    const dynamic = Number(b.dynamicPricePerDay || 0);
    if (base > 0 && dynamic > 0) upliftSum += (dynamic - base) / base;

    if (!locationMap.has(loc)) locationMap.set(loc, { location: loc, count: 0, avgCombined: 0, avgDynamicPrice: 0, _combined: 0, _dynamic: 0 });
    const locAgg = locationMap.get(loc);
    locAgg.count += 1;
    locAgg._combined += combined;
    locAgg._dynamic += dynamic;

    if (!timeMap.has(createdBucket)) timeMap.set(createdBucket, { bucket: createdBucket, count: 0, avgFactor: 0, _sum: 0 });
    const tAgg = timeMap.get(createdBucket);
    tAgg.count += 1;
    tAgg._sum += todFactor;

    if (!weatherMap.has(weather)) weatherMap.set(weather, { weather, count: 0, avgFactor: 0, _sum: 0 });
    const wAgg = weatherMap.get(weather);
    wAgg.count += 1;
    wAgg._sum += weatherFactor;
  }

  const toLocation = [...locationMap.values()]
    .map((v) => ({
      location: v.location,
      count: v.count,
      avgCombined: v.count ? v._combined / v.count : 0,
      avgDynamicPrice: v.count ? v._dynamic / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const toTime = [...timeMap.values()]
    .map((v) => ({ bucket: v.bucket, count: v.count, avgFactor: v.count ? v._sum / v.count : 0 }))
    .sort((a, b) => b.count - a.count);

  const toWeather = [...weatherMap.values()]
    .map((v) => ({ weather: v.weather, count: v.count, avgFactor: v.count ? v._sum / v.count : 0 }))
    .sort((a, b) => b.count - a.count);

  const n = bookings.length || 1;
  res.json({
    range,
    totalDynamicBookings: bookings.length,
    averages: {
      combinedFactor: combinedSum / n,
      carDemandFactor: demandSum / n,
      locationDemandFactor: locationDemandSum / n,
      weatherFactor: weatherFactorSum / n,
      timeOfDayFactor: timeFactorSum / n,
      avgUpliftPercent: (upliftSum / n) * 100,
    },
    byLocation: toLocation,
    byTimeBucket: toTime,
    byWeather: toWeather,
  });
});

// you can add more admin-specific endpoints here (reports, export, etc.)

module.exports = router;