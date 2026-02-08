import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout"; // Ensure folder is named 'layouts' (plural)

// Pages
import Home from "./pages/Home/index.jsx";
import Cars from "./pages/Car/index.jsx";
import CarDetail from "./pages/Car/CarDetail.jsx";
import Booking from "./pages/Booking/index.jsx";
import Checkout from "./pages/Booking/Checkout.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Profile from "./pages/Profile/index.jsx";
import MyBookings from "./pages/MyBookings/index.jsx";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminCars from "./pages/Admin/Cars/index.jsx";
import AdminCarCreate from "./pages/Admin/Cars/CarCreate.jsx";
import AdminCarEdit from "./pages/Admin/Cars/CarEdit.jsx";

// Static Pages
import Help from "./pages/Help/index.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import NotFound from "./pages/NotFound.jsx";

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop /> {/* Scrolls window up on every navigation */}
      
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          
          {/* Booking Flow */}
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/checkout" element={<Checkout />} />
          
          {/* Authentication */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* User Dashboard */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<MyBookings />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/cars/new" element={<AdminCarCreate />} />
          <Route path="/admin/cars/:id/edit" element={<AdminCarEdit />} />

          {/* Information */}
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Errors */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </MainLayout>
    </>
  );
}