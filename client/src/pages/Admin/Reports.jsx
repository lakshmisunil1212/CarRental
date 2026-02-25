import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Car, Users, Calendar, ArrowLeft, BarChart3, PieChart } from "lucide-react";

export default function AdminReports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("month");

  // Mock data - Replace with API calls later
  const revenueData = {
    total: 450000,
    growth: 12.5,
    byMonth: [
      { month: "Jan", revenue: 75000 },
      { month: "Feb", revenue: 82000 },
      { month: "Mar", revenue: 95000 },
      { month: "Apr", revenue: 88000 },
      { month: "May", revenue: 110000 },
    ]
  };

  const bookingStats = {
    total: 156,
    completed: 98,
    pending: 42,
    cancelled: 16,
  };

  const carUtilization = [
    { carName: "Toyota Camry", bookings: 24, utilization: 85 },
    { carName: "Honda Civic", bookings: 18, utilization: 72 },
    { carName: "Tesla Model 3", bookings: 32, utilization: 95 },
    { carName: "Ford Focus", bookings: 15, utilization: 60 },
  ];

  const topCustomers = [
    { name: "John Doe", bookings: 5, totalSpent: 35000 },
    { name: "Jane Smith", bookings: 4, totalSpent: 28000 },
    { name: "Bob Wilson", bookings: 3, totalSpent: 21000 },
    { name: "Alice Johnson", bookings: 3, totalSpent: 18000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-slate-500">Business performance insights and metrics</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-2 bg-white p-4 rounded-xl border border-slate-200">
        {["week", "month", "quarter", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              dateRange === range
                ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-slate-600 text-sm font-medium uppercase">Total Revenue</p>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">₹{revenueData.total.toLocaleString()}</h2>
            <div className="flex items-center gap-2 mt-2 text-emerald-600">
              <TrendingUp size={18} />
              <span className="font-semibold">{revenueData.growth}% increase</span>
            </div>
          </div>
          <BarChart3 size={40} className="text-sky-400 opacity-50" />
        </div>

        {/* Mini Revenue Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">Revenue by Month</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {revenueData.byMonth.map((data, index) => {
              const maxRevenue = Math.max(...revenueData.byMonth.map(d => d.revenue));
              const heightPercent = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg transition-all hover:shadow-lg"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <p className="text-xs font-medium text-slate-600 mt-2">{data.month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{bookingStats.total}</p>
            </div>
            <Calendar className="text-blue-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{bookingStats.completed}</p>
            </div>
            <TrendingUp className="text-emerald-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{bookingStats.pending}</p>
            </div>
            <PieChart className="text-amber-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{bookingStats.cancelled}</p>
            </div>
            <TrendingDown className="text-red-400 opacity-50" size={32} />
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Car Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Car size={20} className="text-sky-600" /> Vehicle Utilization
          </h3>
          <div className="space-y-4">
            {carUtilization.map((car, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-700">{car.carName}</p>
                  <p className="text-sm text-slate-600">{car.utilization}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-sky-400 h-2 rounded-full transition-all"
                    style={{ width: `${car.utilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{car.bookings} bookings</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-sky-600" /> Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{customer.name}</p>
                  <p className="text-xs text-slate-500">{customer.bookings} bookings</p>
                </div>
                <p className="font-bold text-sky-600">₹{customer.totalSpent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
