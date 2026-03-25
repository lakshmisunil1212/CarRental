import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../services/api";
import { motion } from "framer-motion";
import { Calendar, Car, Hash, ArrowRight, Clock, AlertCircle, X, CheckCircle, MessageSquare } from "lucide-react";

// Animation settings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    // Simulate a small loading delay for better UX
    getMyBookings()
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId, bookingStatus) => {
    setCancelling(true);
    setCancelError("");
    try {
      const updated = await cancelBooking(bookingId, cancelReason);
      setBookings(bookings.map(b => b._id === bookingId ? updated : b));
      setCancelModal(null);
      setCancelReason("");
      setCancelling(false);
    } catch (err) {
      setCancelError(err.message);
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>
          <p className="text-slate-500 mt-1">Manage your upcoming and past trips.</p>
        </div>
        <div className="hidden md:block bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-semibold text-sm">
          {bookings.length} {bookings.length === 1 ? 'Trip' : 'Trips'} Total
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Car size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No bookings yet</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">
            You haven't made any reservations. Find your perfect ride today!
          </p>
          <Link 
            to="/cars" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-200"
          >
            Browse Cars <ArrowRight size={18} />
          </Link>
        </motion.div>

      ) : (
        
        /* Booking List */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {bookings.map((b) => {
            const statusColors = {
              pending: "bg-amber-100 text-amber-700",
              confirmed: "bg-emerald-100 text-emerald-700",
              active: "bg-teal-100 text-teal-700",
              awaiting_pickup_confirmation: "bg-orange-100 text-orange-700",
              awaiting_return_confirmation: "bg-indigo-100 text-indigo-700",
              completed: "bg-blue-100 text-blue-700",
              cancelled: "bg-red-100 text-red-700"
            };
            
            return (
              <motion.div 
                key={b._id} 
                variants={itemVariants}
                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Left Side: Car Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Car size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                        {b.car ? `${b.car.make} ${b.car.model}` : "Unknown Vehicle"}
                      </h3>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Hash size={14} className="text-slate-400"/>
                          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            #{b._id ? b._id.toString().slice(-8) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400"/>
                        <span>{b.pickupDate && b.returnDate ? Math.ceil((new Date(b.returnDate) - new Date(b.pickupDate)) / (1000 * 60 * 60 * 24)) : 0} days duration</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Dates & Status */}
                  <div className="flex flex-col md:items-end gap-3">
                    {/* Status Badge */}
                    <span className={`self-start md:self-end px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[b.status] || statusColors.pending}`}>
                      {b.status === "pending" && <AlertCircle size={12} />}
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      <Calendar size={16} className="text-sky-600" />
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">{b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="font-semibold text-slate-700">{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                </div>
                
                {/* Footer Actions */}
                {b.status === "cancelled" ? (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-red-600 font-semibold">❌ Booking Cancelled</p>
                    {b.cancellationApprovedAt && (
                      <p className="text-xs text-slate-500 mt-1">Cancelled on {new Date(b.cancellationApprovedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ) : b.status === "pending" ? (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-sm text-amber-600 font-medium flex items-center gap-2 mb-3">
                      <AlertCircle size={16} />
                      Your booking is pending approval from the admin.
                    </p>
                    <button
                      onClick={() => setCancelModal(b._id)}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                    >
                      Cancel Booking
                    </button>
                  </div>
                ) : b.status === "confirmed" && b.cancellationStatus !== "requested" ? (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => setCancelModal(b._id)}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                    >
                      Request Cancellation
                    </button>
                  </div>
                ) : b.cancellationStatus === "requested" ? (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
                        <MessageSquare size={16} />
                        Cancellation Requested
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Waiting for admin approval. Reason: {b.cancellationReason || "No reason provided"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      )}
      
      {/* Cancellation Modal */}
      {cancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Cancel Booking?</h3>
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                  setCancelError("");
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {cancelError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {cancelError}
              </div>
            )}

            <p className="text-slate-600 mb-4">
              {bookings.find(b => b._id === cancelModal)?.status === "pending"
                ? "Cancel this pending booking? This action cannot be undone."
                : "Request cancellation of this confirmed booking? The admin will review your request."}
            </p>

            {bookings.find(b => b._id === cancelModal)?.status === "confirmed" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  rows="3"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                  setCancelError("");
                }}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  const booking = bookings.find(b => b._id === cancelModal);
                  handleCancel(cancelModal, booking?.status);
                }}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}