import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Calendar, LogOut, Shield, Settings } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("user");
    // Redirect to home or login
    navigate("/auth/login");
  };

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
                  <span className="font-semibold text-slate-700">Verified Customer</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}