import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, User, HelpCircle, LogIn, Menu, LogOut, LayoutDashboard, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 1. Check for logged-in user whenever the route changes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const navLinks = [
    { name: "Cars", path: "/cars", icon: <Car size={18} /> },
    { name: "Booking", path: "/booking", icon: <Calendar size={18} /> }, // Switched to Calendar icon
    { name: "Help", path: "/help", icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-sky-600 p-2 rounded-lg text-white group-hover:bg-sky-500 transition-colors">
              <Car size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
              RentMyRide
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-blue-50 text-sky-600"
                    : "text-slate-600 hover:text-sky-600 hover:bg-blue-50/50"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            {/* --- NEW: CONDITIONAL AUTH SECTION --- */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Admin Link */}
                <Link 
                  to="/admin" 
                  className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={20} />
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                      {user.email?.split('@')[0] || "User"}
                    </span>
                  </Link>
                  
                  {/* Hover Menu */}
                  <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/bookings" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600">
                        <Calendar size={16} /> My Bookings
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Original Login Button (Only shows if NOT logged in) */
              <Link
                to="/auth/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-full text-sm font-medium shadow-lg shadow-sky-200 transition-all hover:scale-105"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </nav>
          
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="bg-white border-t border-blue-100 mt-auto">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Rent My Ride. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="hover:text-sky-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-sky-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}