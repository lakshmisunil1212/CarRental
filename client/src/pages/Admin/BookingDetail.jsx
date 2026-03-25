import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { confirmPickup, confirmReturn, getBookingById } from "../../services/api";

export default function AdminBookingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  useEffect(() => {
    if (!id) return;
    getBookingById(id)
      .then((data) => setBooking(data))
      .finally(() => setLoading(false));
  }, [id]);

  const isDateArrived = (dateValue) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateValue);
    target.setHours(0, 0, 0, 0);
    return target <= today;
  };

  const timelineSteps = ["pending", "confirmed", "active", "completed"];
  const getTimelineStage = (status) => {
    if (["confirmed", "awaiting_pickup_confirmation"].includes(status)) return "confirmed";
    if (["active", "awaiting_return_confirmation"].includes(status)) return "active";
    if (status === "completed") return "completed";
    return "pending";
  };
  const currentTimelineIndex = timelineSteps.indexOf(getTimelineStage(booking?.status || "pending"));

  // Fallback: If booking is not passed via state, fetch by id (not implemented here)
  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center text-red-600">Booking details not found.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-4">Booking Details (Admin)</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Booking ID</p>
          <p className="font-semibold text-slate-800">{booking.bookingCode || booking._id}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Status</p>
          <p className="font-semibold text-slate-800">{booking.status}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Customer</p>
          <p className="font-semibold text-slate-800">{booking.user?.name} ({booking.user?.email})</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Car</p>
          <p className="font-semibold text-slate-800">{booking.car?.make} {booking.car?.model}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Pickup Date & Time</p>
          <p className="font-semibold text-slate-800">{new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime || '10:00'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Return Date & Time</p>
          <p className="font-semibold text-slate-800">{new Date(booking.returnDate).toLocaleDateString()} at {booking.returnTime || '18:00'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Total Price</p>
          <p className="font-semibold text-slate-800">₹{booking.totalPrice?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Phone</p>
          <p className="font-semibold text-slate-800">{booking.phone}</p>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {timelineSteps.map((step, index) => {
            const isCompleted = index < currentTimelineIndex;
            const isCurrent = index === currentTimelineIndex;
            const baseClass = "px-3 py-1 rounded-full text-xs font-semibold border";
            const stateClass = isCurrent
              ? "bg-sky-100 text-sky-700 border-sky-200"
              : isCompleted
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200";

            return (
              <span key={step} className={`${baseClass} ${stateClass}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["confirmed", "awaiting_pickup_confirmation"].includes(booking.status)) && isDateArrived(booking.pickupDate) && !booking.pickupConfirmedByAdmin && (
          <button
            onClick={async () => {
              try {
                const updated = await confirmPickup(booking._id);
                setBooking(updated);
                alert(updated.status === "active" ? "Pickup confirmed by both parties. Trip is now active." : "Pickup confirmed. Waiting for customer confirmation.");
              } catch (err) {
                alert(err.message || "Failed to confirm pickup");
              }
            }}
            className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-semibold text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} /> Confirm Pickup (Admin)
          </button>
        )}

        {(["active", "awaiting_return_confirmation"].includes(booking.status)) && isDateArrived(booking.returnDate) && !booking.returnConfirmedByAdmin && (
          <button
            onClick={async () => {
              try {
                const updated = await confirmReturn(booking._id);
                setBooking(updated);
                alert(updated.status === "completed" ? "Return confirmed by both parties. Trip completed." : "Return confirmed. Waiting for customer confirmation.");
              } catch (err) {
                alert(err.message || "Failed to confirm return");
              }
            }}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-semibold text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} /> Confirm Return (Admin)
          </button>
        )}
      </div>
    </motion.div>
  );
}
