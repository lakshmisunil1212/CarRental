import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, MapPin, DollarSign, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";

export default function AdminBookings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  // Mock booking data - Replace with API call later
  const mockBookings = [
    {
      id: "BK001",
      carName: "Toyota Camry",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      pickupDate: "2024-03-01",
      dropoffDate: "2024-03-05",
      pickupLocation: "New York",
      dropoffLocation: "Boston",
      totalAmount: 14000,
      status: "confirmed",
      createdAt: "2024-02-25"
    },
    {
      id: "BK002",
      carName: "Honda Civic",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      pickupDate: "2024-03-02",
      dropoffDate: "2024-03-08",
      pickupLocation: "Los Angeles",
      dropoffLocation: "San Francisco",
      totalAmount: 18000,
      status: "pending",
      createdAt: "2024-02-24"
    },
    {
      id: "BK003",
      carName: "Tesla Model 3",
      customerName: "Bob Wilson",
      customerEmail: "bob@example.com",
      pickupDate: "2024-02-28",
      dropoffDate: "2024-03-02",
      pickupLocation: "Chicago",
      dropoffLocation: "Chicago",
      totalAmount: 12000,
      status: "completed",
      createdAt: "2024-02-20"
    },
    {
      id: "BK004",
      carName: "Toyota Camry",
      customerName: "Alice Johnson",
      customerEmail: "alice@example.com",
      pickupDate: "2024-03-10",
      dropoffDate: "2024-03-12",
      pickupLocation: "Seattle",
      dropoffLocation: "Portland",
      totalAmount: 7000,
      status: "cancelled",
      createdAt: "2024-02-22"
    },
  ];

  const filteredBookings = filter === "all" 
    ? mockBookings 
    : mockBookings.filter(b => b.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{mockBookings.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <p className="text-slate-600 text-sm font-medium">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {mockBookings.filter(b => b.status === "confirmed").length}
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
            {mockBookings.filter(b => b.status === "pending").length}
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
            ₹{mockBookings.filter(b => b.status === "confirmed" || b.status === "completed")
              .reduce((sum, b) => sum + b.totalAmount, 0)
              .toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl border border-slate-200">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === status
                ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings Table/List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-slate-50 p-12 rounded-xl text-center border border-dashed border-slate-300">
            <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg font-medium">No bookings found</p>
            <p className="text-slate-500 text-sm">Try changing the filter</p>
          </div>
        ) : (
          filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
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
                      <p className="text-lg font-bold text-slate-800">{booking.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Vehicle</p>
                    <p className="text-slate-800 font-semibold">{booking.carName}</p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Pickup</p>
                      <p className="flex items-center gap-1 text-slate-800">
                        <MapPin size={14} />
                        {booking.pickupLocation} - {booking.pickupDate}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Dropoff</p>
                      <p className="flex items-center gap-1 text-slate-800">
                        <MapPin size={14} />
                        {booking.dropoffLocation} - {booking.dropoffDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">Total Amount</p>
                      <p className="text-2xl font-bold text-sky-600">₹{booking.totalAmount.toLocaleString()}</p>
                    </div>
                    <button className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
