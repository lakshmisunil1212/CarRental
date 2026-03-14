import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user role
    if (user.role === "user") {
      // Customer trying to access admin area - redirect to bookings
      return <Navigate to="/bookings" replace />;
    }
    // Admin trying to access customer area - redirect to admin dashboard
    return <Navigate to="/admin" replace />;
  }

  return children;
}
