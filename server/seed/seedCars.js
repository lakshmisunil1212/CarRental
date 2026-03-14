// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Car = require("../models/Car");

// Local car images stored in client/public/images/
const sampleCars = [
  { make: "Maruti Suzuki", model: "Swift VXi (Petrol)", year: 2022, pricePerDay: 1750, seats: 5, regNumber: "KA01AB1234", location: "Delhi", ownerName: "Admin Lohith", ownerEmail: "lohith@gmail.com", ownerPhone: "+91-9876543210", img: "http://localhost:5173/images/Maruti Suzuki Swift.png" },
  { make: "Toyota", model: "Innova Crysta 2.4 GX (Diesel)", year: 2021, pricePerDay: 4250, seats: 7, regNumber: "MH02CD5678", location: "Mumbai", ownerName: "Admin Lohith", ownerEmail: "lohith@gmail.com", ownerPhone: "+91-9876543210", img: "http://localhost:5173/images/Toyota Innova Crysta.png" },
  { make: "Hyundai", model: "Creta SX (Petrol)", year: 2023, pricePerDay: 3000, seats: 5, regNumber: "KA03EF9012", location: "Bangalore", ownerName: "Admin Lohith", ownerEmail: "lohith@gmail.com", ownerPhone: "+91-9876543210", img: "http://localhost:5173/images/Hyundai Creta.png" },
  { make: "Honda", model: "City V (Petrol)", year: 2022, pricePerDay: 2600, seats: 5, regNumber: "TN04GH3456", location: "Chennai", ownerName: "Admin Lohith", ownerEmail: "lohith@gmail.com", ownerPhone: "+91-9876543210", img: "http://localhost:5173/images/Honda City.png" },
  { make: "Mahindra", model: "Thar LX Hard Top (Diesel)", year: 2022, pricePerDay: 4750, seats: 4, regNumber: "KL05IJ7890", location: "Pune", ownerName: "Admin Lohith", ownerEmail: "lohith@gmail.com", ownerPhone: "+91-9876543210", img: "http://localhost:5173/images/Mahindra Thar.jpg" }
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