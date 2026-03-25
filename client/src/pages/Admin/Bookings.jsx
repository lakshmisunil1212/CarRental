import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, MapPin, DollarSign, CheckCircle, Clock, XCircle, ArrowLeft, Check, X, AlertTriangle } from "lucide-react";
import { adminGetAllBookings, updateBookingStatus, approveCancellation, rejectCancellation } from "../../services/api";

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  console.log("AdminBookings mounted, initial state", { bookings, loading, filter, error });

  useEffect(() => {
    adminGetAllBookings()
      .then(data => {
        // sanitize bookings to avoid undefined props
        const clean = data.map(b => ({
          ...b,
          totalAmount: b.totalAmount || 0,
          car: b.car || {},
          user: b.user || {}
        }));
        setBookings(clean);
      })
      .catch(err => {
        console.error("AdminFetchError:", err);
        setError(err.message);
        // do NOT automatically redirect - keep message visible
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleApproveCancellation = async (id) => {
    try {
      const updated = await approveCancellation(id);
      setBookings(bookings.map(b => b._id === id ? updated : b));
    } catch (err) {
      alert("Failed to approve cancellation: " + err.message);
    }
  };

  const handleRejectCancellation = async (id) => {
    try {
      const updated = await rejectCancellation(id);
      setBookings(bookings.map(b => b._id === id ? updated : b));
    } catch (err) {
      alert("Failed to reject cancellation: " + err.message);
    }
  };

  // log any bookings missing expected fields
  useEffect(() => {
    bookings.forEach(b => {
      if (typeof b.totalAmount === 'undefined') {
        console.warn('booking without totalAmount', b);
      }
      if (!b.car || !b.car.make) {
        console.warn('booking without car info', b);
      }
      if (!b.user || !b.user.name) {
        console.warn('booking without user info', b);
      }
    });
  }, [bookings]);

  const filteredBookings = filter === "all" 
    ? bookings 
    : filter === "cancellation_requests"
    ? bookings.filter(b => b.cancellationStatus === "requested")
    : bookings.filter(b => b.status === filter);
  console.log("AdminBookings render with filtered", { filter, filteredBookings });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
      case "active":
        return "bg-teal-100 text-teal-700";
      case "awaiting_pickup_confirmation":
        return "bg-orange-100 text-orange-700";
      case "awaiting_return_confirmation":
        return "bg-indigo-100 text-indigo-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={16} />;
      case "active":
        return <CheckCircle size={16} />;
      case "awaiting_pickup_confirmation":
      case "awaiting_return_confirmation":
        return <Clock size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Booking Management</h1>
          </div>
          <p className="text-slate-500">View and manage all customer bookings</p>
        </div>
        <button
          onClick={() => navigate("/admin/scheduler")}
          className="px-4 py-2.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-500 shadow-lg shadow-sky-200"
        >
          Open Scheduler
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{bookings.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {bookings.filter(b => b.status === "confirmed").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {bookings.filter(b => b.status === "pending").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-sky-600 mt-2">
            ₹{bookings.filter(b => b.status === "active" || b.status === "completed")
              .reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0)
              .toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl border border-slate-200">
        {["all", "pending", "confirmed", "active", "completed", "cancelled", "cancellation_requests"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === status
                ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status === "cancellation_requests" ? "🚨 Cancellation Requests" : status}
            {status === "cancellation_requests" && bookings.filter(b => b.cancellationStatus === "requested").length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {bookings.filter(b => b.cancellationStatus === "requested").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Table/List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}
        {loading ? (
          <div className="bg-slate-50 p-12 rounded-xl text-center border border-dashed border-slate-300">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg font-medium">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-slate-50 p-12 rounded-xl text-center border border-dashed border-slate-300">
            <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg font-medium">No bookings found</p>
            <p className="text-slate-500 text-sm">Try changing the filter</p>
          </div>
        ) : (
          filteredBookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">Booking ID</p>
                      <p className="text-lg font-bold text-slate-800">{booking.bookingCode || booking._id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Vehicle</p>
                    <p className="text-slate-800 font-semibold">{booking.car ? `${booking.car.make} ${booking.car.model}` : 'Unknown Car'}</p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-medium">{booking.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-500">{booking.user?.email || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Pickup Date & Time</p>
                      <p className="flex items-center gap-1 text-slate-800">
                        <MapPin size={14} />
                        {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime || '10:00'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Return Date & Time</p>
                      <p className="flex items-center gap-1 text-slate-800">
                        <MapPin size={14} />
                        {new Date(booking.returnDate).toLocaleDateString()} at {booking.returnTime || '18:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">Total Amount</p>
                      <p className="text-2xl font-bold text-sky-600">₹{(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === "pending" ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                            className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking._id}`, { state: { booking } })}
                          className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors font-medium"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Request Section */}
                  {booking.cancellationStatus === "requested" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 text-sm">Cancellation Request Pending</p>
                          <p className="text-xs text-blue-700 mt-1">
                            <strong>Requested on:</strong> {new Date(booking.cancellationRequestedAt).toLocaleString()}
                          </p>
                          {booking.cancellationReason && (
                            <p className="text-xs text-blue-700 mt-1">
                              <strong>Reason:</strong> {booking.cancellationReason}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleApproveCancellation(booking._id)}
                              className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectCancellation(booking._id)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
