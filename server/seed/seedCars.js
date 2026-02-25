// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Car = require("../models/Car");

const sampleCars = [
  { make: "Toyota", model: "Camry", year: 2021, pricePerDay: 4500, seats: 5, img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=450&fit=crop" },
  { make: "Honda", model: "Civic", year: 2020, pricePerDay: 3500, seats: 5, img: "https://images.unsplash.com/photo-1605559424843-9e4c3ff86b08?w=800&h=450&fit=crop" },
  { make: "Tesla", model: "Model 3", year: 2022, pricePerDay: 8000, seats: 5, img: "https://images.unsplash.com/photo-1560958089-b8a63c50ce20?w=800&h=450&fit=crop" },
  { make: "Ford", model: "Escape", year: 2019, pricePerDay: 5000, seats: 5, img: "https://images.unsplash.com/photo-1533473359331-35a96e3caa4d?w=800&h=450&fit=crop" }
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