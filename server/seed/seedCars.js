// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Car = require("../models/Car");

const sampleCars = [
  { make: "Toyota", model: "Camry", year: 2021, pricePerDay: 45, seats: 5, img: "https://via.placeholder.com/800x450?text=Toyota+Camry" },
  { make: "Honda", model: "Civic", year: 2020, pricePerDay: 40, seats: 5, img: "https://via.placeholder.com/800x450?text=Honda+Civic" },
  { make: "Tesla", model: "Model 3", year: 2022, pricePerDay: 120, seats: 5, img: "https://via.placeholder.com/800x450?text=Tesla+Model+3" },
  { make: "Ford", model: "Escape", year: 2019, pricePerDay: 55, seats: 5, img: "https://via.placeholder.com/800x450?text=Ford+Escape" }
];

async function seed() {
  await connectDB();
  try {
    await Car.deleteMany({});
    await Car.insertMany(sampleCars);
    console.log("Seeded cars");
  } catch (err) {
    console.error("Seeding error", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();