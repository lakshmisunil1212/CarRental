import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Home, LogOut, ArrowLeft, AlertTriangle } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const getRoleMessage = () => {
    if (!user) return "Please log in to access this resource.";
    if (user.role === "admin") 
      return "This page is reserved for customer accounts. Switch to your customer account or log in as a customer.";
    if (user.role === "user") 
      return "This page is reserved for administrators. Your current account does not have the required permissions.";
    return "Your account doesn't have permission to access this resource.";
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-slate-200"
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-2xl"
          >
            <Shield size={40} />
          </motion.div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
          403 - Insufficient Permissions
        </h1>
        <p className="text-center text-slate-600 mb-6 leading-relaxed">
          {getRoleMessage()}
        </p>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Current Status</p>
              <p className="text-sm text-amber-800">
                {user ? (
                  <>
                    Logged in as <span className="font-semibold">{user.email}</span> 
                    <br />
                    Role: <span className="font-semibold capitalize">{user.role}</span>
                  </>
                ) : (
                  "Not logged in"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (user?.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/");
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-sky-600 transition-all shadow-lg shadow-sky-200"
          >
            <Home size={18} />
            {user?.role === "admin" ? "Admin Dashboard" : "Home"}
          </motion.button>

          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200"
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          )}
        </div>

        {/* Help Text */}
        <div className="border-t border-slate-200 pt-4 text-center">
          <p className="text-xs text-slate-500 mb-2">Need help?</p>
          <p className="text-xs text-slate-600">
            This is a protected resource. If you believe this is an error, 
            please <a href="/help" className="text-sky-600 hover:text-sky-700 font-semibold">contact support</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
