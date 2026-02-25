import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout"; // Ensure folder is named 'layouts' (plural)

// Components
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Home from "./pages/Home/index.jsx";
import Cars from "./pages/Car/index.jsx";
import CarDetail from "./pages/Car/CarDetail.jsx";
import Booking from "./pages/Booking/index.jsx";
import Checkout from "./pages/Booking/Checkout.jsx";
import LoginSelector from "./pages/Auth/LoginSelector.jsx";
import Login from "./pages/Auth/Login.jsx";
import CustomerLogin from "./pages/Auth/CustomerLogin.jsx";
import AdminLogin from "./pages/Auth/AdminLogin.jsx";
import Register from "./pages/Auth/Register.jsx";
import Profile from "./pages/Profile/index.jsx";
import MyBookings from "./pages/MyBookings/index.jsx";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminCars from "./pages/Admin/Cars/index.jsx";
import AdminCarCreate from "./pages/Admin/Cars/CarCreate.jsx";
import AdminCarEdit from "./pages/Admin/Cars/CarEdit.jsx";
import AdminBookings from "./pages/Admin/Bookings.jsx";
import AdminReports from "./pages/Admin/Reports.jsx";

// Static Pages
import Help from "./pages/Help/index.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import NotFound from "./pages/NotFound.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

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
          <Route path="/auth/login" element={<LoginSelector />} />
          <Route path="/auth/login/customer" element={<CustomerLogin />} />
          <Route path="/auth/login/admin" element={<AdminLogin />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Customer Dashboard - Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute requiredRole="user">
                <MyBookings />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes - Protected */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/cars" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCars />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/cars/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCarCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/cars/:id/edit" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCarEdit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/bookings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReports />
              </ProtectedRoute>
            } 
          />

          {/* Information */}
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Error Pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </MainLayout>
    </>
  );
}