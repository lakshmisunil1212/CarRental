const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  name: String,
  phone: String,
  totalPrice: Number,
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

module.exports = mongoose.model("Booking", bookingSchema);