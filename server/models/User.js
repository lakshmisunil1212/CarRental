const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: [true, "Email already registered"],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // Don't return password by default
  },
  role: { 
    type: String, 
    enum: {
      values: ["user", "admin"],
      message: "Role must be either 'user' or 'admin'"
    }, 
    default: "user" 
  },
  preferences: {
    preferredTransmission: {
      type: String,
      enum: ["automatic", "manual", "any"],
      default: "any"
    },
    preferredFuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric", "hybrid", "any"],
      default: "any"
    },
    preferredSeats: {
      type: Number,
      min: 2,
      max: 9,
      default: 5
    },
    preferredLocation: {
      type: String,
      default: "any",
      trim: true,
    },
    budgetBand: {
      type: String,
      enum: ["budget", "balanced", "premium", "any"],
      default: "any",
    },
    tripType: {
      type: String,
      enum: ["family", "business", "city", "highway", "any"],
      default: "any",
    }
  },
  recommendationWeights: {
    makeWeight: { type: Number, default: 35 },
    locationWeight: { type: Number, default: 20 },
    priceWeight: { type: Number, default: 30 },
    valueWeight: { type: Number, default: 8 },
    transmissionWeight: { type: Number, default: 15 },
    fuelWeight: { type: Number, default: 12 },
    seatsWeight: { type: Number, default: 14 }
  },
  recommendationFeedback: {
    usefulCount: { type: Number, default: 0 },
    notUsefulCount: { type: Number, default: 0 }
  },
  recommendationSignals: {
    makeAffinity: { type: Map, of: Number, default: {} },
    locationAffinity: { type: Map, of: Number, default: {} },
    transmissionAffinity: { type: Map, of: Number, default: {} },
    fuelAffinity: { type: Map, of: Number, default: {} },
    seatsAffinity: { type: Map, of: Number, default: {} },
    carAffinity: { type: Map, of: Number, default: {} }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("User", userSchema);