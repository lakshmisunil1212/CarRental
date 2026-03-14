import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut, Shield, Settings, Car, TrendingUp, BookOpen, Wrench, Plus, ArrowRight } from "lucide-react";
import { fetchMyCars, getAdminStats } from "../../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [myCars, setMyCars] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("user");
    // Redirect to home or login
    navigate("/auth/login");
  };

  // Fetch admin data if user is admin
  useEffect(() => {
    if (user && user.role === "admin") {
      setLoadingAdmin(true);
      Promise.all([
        fetchMyCars().catch(err => {
          console.error("Error fetching cars:", err);
          return [];
        }),
        getAdminStats().catch(err => {
          console.error("Error fetching stats:", err);
          return null;
        })
      ]).then(([cars, stats]) => {
        setMyCars(cars || []);
        setAdminStats(stats);
        setLoadingAdmin(false);
      });
    }
  }, [user]);

  // 1. STATE: Not Logged In
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-slate-100 max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Guest User</h2>
          <p className="text-slate-500 mb-6">Please log in to view your profile and bookings.</p>
          <Link 
            to="/auth/login"
            className="block w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors"
          >
            Log In
          </Link>
        </motion.div>
      </div>
    );
  }

  // 2. STATE: Logged In
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-slate-100 overflow-hidden"
      >
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-sky-500 to-blue-600 relative">
          <div className="absolute top-4 right-4">
            <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Avatar (Overlapping Header) */}
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg inline-block">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-sky-600 overflow-hidden">
                <User size={64} />
                {/* If you have a real image: <img src={user.avatar} className="w-full h-full object-cover" /> */}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome Back!</h1>
              <p className="text-slate-500">Manage your account settings and bookings.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Email Card */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
              <div className="p-3 bg-white rounded-xl text-sky-600 shadow-sm">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                <p className="font-semibold text-slate-700">{user.email}</p>
              </div>
            </div>

            {/* Member Since Card */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
              <div className="p-3 bg-white rounded-xl text-sky-600 shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Member Since</p>
                <p className="font-semibold text-slate-700">Feb 2026</p>
              </div>
            </div>
            
             {/* Account Type Card */}
             <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100 md:col-span-2">
              <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Account Status</p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{user.role === "admin" ? "Verified Admin" : "Verified Customer"}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {user.role === "admin" ? "ADMIN" : "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ADMIN FLEET OVERVIEW SECTION */}
          {user && user.role === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 pt-12 border-t border-slate-200"
            >
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                      <Car size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">My Fleet Overview</h2>
                      <p className="text-slate-500 text-sm">Manage your rental vehicles and track performance</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/cars"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold text-sm"
                  >
                    <Settings size={16} /> Manage Fleet
                  </Link>
                </div>

                {/* Admin Stats Cards */}
                {!loadingAdmin && adminStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Fleet Size Card */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Fleet Size</p>
                        <Car size={20} className="text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-900">{adminStats.ownerCars || 0}</p>
                      <p className="text-xs text-blue-600 mt-2">vehicles available</p>
                    </motion.div>

                    {/* Pending Bookings Card */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Pending Bookings</p>
                        <BookOpen size={20} className="text-amber-600" />
                      </div>
                      <p className="text-3xl font-bold text-amber-900">{adminStats.pendingBookings || 0}</p>
                      <p className="text-xs text-amber-600 mt-2">awaiting confirmation</p>
                    </motion.div>

                    {/* Confirmed Bookings Card */}
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Confirmed Bookings</p>
                        <TrendingUp size={20} className="text-emerald-600" />
                      </div>
                      <p className="text-3xl font-bold text-emerald-900">{adminStats.confirmedBookings || 0}</p>
                      <p className="text-xs text-emerald-600 mt-2">active bookings</p>
                    </motion.div>
                  </div>
                )}

                {/* Fleet Cars Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wrench size={20} className="text-slate-600" />
                    Your Vehicles
                  </h3>
                  
                  {myCars.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl text-center border-2 border-dashed border-slate-300"
                    >
                      <Car size={40} className="mx-auto text-slate-400 mb-3" />
                      <p className="text-slate-600 font-semibold mb-2">No vehicles in your fleet yet</p>
                      <p className="text-slate-500 text-sm mb-4">Add your first car to start accepting bookings</p>
                      <Link
                        to="/admin/cars/new"
                        className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold text-sm"
                      >
                        <Plus size={16} /> Add First Car
                      </Link>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myCars.slice(0, 4).map((car, index) => (
                        <motion.div
                          key={car._id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all group"
                        >
                          {/* Car Image */}
                          <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {car.img ? (
                              <img src={car.img} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                            ) : (
                              <Car size={40} className="text-purple-400" />
                            )}
                          </div>

                          {/* Car Info */}
                          <div className="mb-3">
                            <h4 className="font-bold text-slate-800">
                              {car.make} {car.model}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">{car.year || "Year N/A"}</p>
                            <p className="text-sm font-semibold text-purple-600 mt-2">₹{car.pricePerDay}/day</p>
                            {car.seats && (
                              <p className="text-xs text-slate-600 mt-1">👥 {car.seats} seats • {car.location}</p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <Link
                              to={`/admin/cars/${car._id}/edit`}
                              className="flex-1 text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-center"
                            >
                              Edit
                            </Link>
                            <Link
                              to="/admin/bookings"
                              className="flex-1 text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-center"
                            >
                              Bookings
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {myCars.length > 4 && (
                    <Link
                      to="/admin/cars"
                      className="mt-6 flex items-center justify-center gap-2 py-3 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                    >
                      View All {myCars.length} Vehicles <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
        </div>
      </motion.div>
    </div>
  );
}