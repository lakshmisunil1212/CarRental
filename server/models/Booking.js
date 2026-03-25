const mongoose = require("mongoose");

function generateBookingCodeFromId(idValue) {
  const idText = String(idValue || "");
  const suffix = idText.slice(-8).toUpperCase();
  return `BK-${suffix}`;
}

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
  pickupDate: { type: Date, required: true },
  pickupTime: { type: String, default: "10:00" }, // HH:mm format
  returnDate: { type: Date, required: true },
  returnTime: { type: String, default: "18:00" }, // HH:mm format
  name: String,
  phone: String,
  totalPrice: Number,
  dynamicPricePerDay: Number,
  pricingFactors: {
    carDemandFactor: Number,
    locationDemandFactor: Number,
    weatherFactor: Number,
    timeOfDayFactor: Number,
    combinedFactor: Number,
    overlappingCount: Number,
    locationDemandCount: Number,
    weatherCode: Number,
  },
  status: { type: String, enum: [
    "pending",
    "confirmed",
    "awaiting_pickup_confirmation",
    "active",
    "awaiting_return_confirmation",
    "completed",
    "cancelled"
  ], default: "pending" },

  // Mutual confirmation fields
  pickupConfirmedByCustomer: { type: Boolean, default: false },
  pickupConfirmedByAdmin: { type: Boolean, default: false },
  returnConfirmedByCustomer: { type: Boolean, default: false },
  returnConfirmedByAdmin: { type: Boolean, default: false },
  
  // Cancellation fields
  cancellationStatus: { 
    type: String, 
    enum: ["none", "requested", "approved", "rejected"],
    default: "none"
  },
  cancellationReason: { type: String, default: "" },
  cancellationRequestedAt: { type: Date, default: null },
  cancellationApprovedAt: { type: Date, default: null },
  cancellationApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Admin who approved
  
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.pre("validate", function assignBookingCode() {
  if (!this.bookingCode && this._id) {
    this.bookingCode = generateBookingCodeFromId(this._id);
  }
});

module.exports = mongoose.model("Booking", bookingSchema);