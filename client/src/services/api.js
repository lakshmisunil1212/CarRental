// Confirm pickup (customer or admin)
export async function confirmPickup(id) {
  try {
    const booking = await apiCall(`/bookings/${id}/confirm-pickup`, {
      method: "PATCH"
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to confirm pickup");
  }
}

// Confirm return (customer or admin)
export async function confirmReturn(id) {
  try {
    const booking = await apiCall(`/bookings/${id}/confirm-return`, {
      method: "PATCH"
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to confirm return");
  }
}
// API Service - connects to backend at http://localhost:5000
const API_BASE = "http://localhost:5000/api";

// Helper to get JWT token from localStorage
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper for API calls with error handling
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const mergedHeaders = {
    ...getAuthHeader(),
    ...options.headers,
  };

  if (!isFormData) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      headers: mergedHeaders,
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error(`API Error at ${endpoint}:`, err);
    // Common network failure message produced by fetch can be confusing; translate it.
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Unable to reach server. Is the backend running?");
    }
    throw err;
  }
}

// AUTH ENDPOINTS
export async function registerUser(userData) {
  try {
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
    return data;
  } catch (err) {
    throw new Error(err.message || "Registration failed");
  }
}

export async function registerAdmin(adminData) {
  try {
    const data = await apiCall("/auth/register-admin", {
      method: "POST",
      body: JSON.stringify(adminData)
    });
    
    // Store token for future requests
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    return data;
  } catch (err) {
    throw new Error(err.message || "Admin registration failed");
  }
}

export async function loginUser(email, password) {
  try {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    
    // Store token for future requests
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    // Store user info including name
    if (data.user) {
      localStorage.setItem("user", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        preferences: data.user.preferences || undefined
      }));
    }
    
    return data;
  } catch (err) {
    throw new Error(err.message || "Login failed");
  }
}

export async function verifyToken() {
  try {
    const data = await apiCall("/auth/verify");
    return data;
  } catch (err) {
    localStorage.removeItem("token");
    throw err;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// CAR ENDPOINTS
export async function fetchCars(filters = {}) {
  try {
    const query = new URLSearchParams();
    if (filters.make) query.append("make", filters.make);
    if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
    if (filters.location) query.append("location", filters.location);
    if (filters.ownerName) query.append("ownerName", filters.ownerName);
    if (filters.sortBy) query.append("sortBy", filters.sortBy);
    
    const endpoint = query.toString() ? `/cars?${query}` : "/cars";
    const cars = await apiCall(endpoint);
    return cars;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch cars");
  }
}

export async function fetchCarById(id) {
  try {
    const car = await apiCall(`/cars/${id}`);
    return car;
  } catch (err) {
    throw new Error(err.message || "Car not found");
  }
}

export async function adminCreateCar(carData) {
  try {
    const car = await apiCall("/cars", {
      method: "POST",
      body: JSON.stringify(carData)
    });
    return car;
  } catch (err) {
    throw new Error(err.message || "Failed to create car");
  }
}

export async function adminUpdateCar(id, updates) {
  try {
    const car = await apiCall(`/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    return car;
  } catch (err) {
    throw new Error(err.message || "Failed to update car");
  }
}

export async function adminDeleteCar(id) {
  try {
    const result = await apiCall(`/cars/${id}`, {
      method: "DELETE"
    });
    return result;
  } catch (err) {
    throw new Error(err.message || "Failed to delete car");
  }
}

export async function fetchMyCars() {
  try {
    const cars = await apiCall("/cars/mine");
    return cars;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch your cars");
  }
}

// REVIEW ENDPOINTS
export async function fetchReviews(carId) {
  try {
    const reviews = await apiCall(`/reviews/${carId}`);
    return reviews;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch reviews");
  }
}

export async function submitReview(reviewData) {
  try {
    const review = await apiCall("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData)
    });
    return review;
  } catch (err) {
    throw new Error(err.message || "Failed to submit review");
  }
}

// BOOKING ENDPOINTS
export async function createBooking(bookingData) {
  try {
    const payload = new FormData();
    payload.append("carId", bookingData.carId);
    payload.append("pickupDate", bookingData.pickupDate);
    payload.append("pickupTime", bookingData.pickupTime || "10:00");
    payload.append("returnDate", bookingData.returnDate);
    payload.append("returnTime", bookingData.returnTime || "18:00");
    payload.append("name", bookingData.name || "");
    payload.append("phone", bookingData.phone || "");
    payload.append("drivingLicenseId", bookingData.drivingLicenseId || "");
    payload.append("pickupLocation", JSON.stringify(bookingData.pickupLocation || {}));
    payload.append("returnLocation", JSON.stringify(bookingData.returnLocation || {}));

    if (bookingData.drivingLicenseImage instanceof File) {
      payload.append("drivingLicenseImage", bookingData.drivingLicenseImage);
    }

    const booking = await apiCall("/bookings", {
      method: "POST",
      body: payload
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to create booking");
  }
}

export async function getMyBookings() {
  try {
    const bookings = await apiCall("/bookings/mine");
    return bookings;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch bookings");
  }
}

export async function updateBookingStatus(id, status) {
  try {
    const booking = await apiCall(`/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to update booking status");
  }
}
export async function adminGetAllBookings() {
  try {
    const bookings = await apiCall("/bookings");
    return bookings;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch bookings");
  }
}

// Fetch bookings for a specific car (used by booking conflict visualizer)
export async function fetchBookingsByCar(carId) {
  try {
    const bookings = await apiCall(`/bookings/car/${carId}`);
    return bookings;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch bookings for car");
  }
}

export async function getAdminStats() {
  try {
    const stats = await apiCall("/admin/stats");
    return stats;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch statistics");
  }
}

export async function getAdminPricingInsights(range = "month") {
  try {
    const data = await apiCall(`/admin/pricing-insights?range=${encodeURIComponent(range)}`);
    return data;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch pricing insights");
  }
}

export async function getAdminReportsInsights(range = "month") {
  try {
    const data = await apiCall(`/admin/reports-insights?range=${encodeURIComponent(range)}`);
    return data;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch reports insights");
  }
}

// Fetch a single booking by id (protected)
export async function getBookingById(id) {
  try {
    const booking = await apiCall(`/bookings/${id}`);
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch booking");
  }
}

// CANCELLATION ENDPOINTS
export async function cancelBooking(id, reason = "") {
  try {
    const booking = await apiCall(`/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason })
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to cancel booking");
  }
}

export async function approveCancellation(id) {
  try {
    const booking = await apiCall(`/bookings/${id}/cancel-approve`, {
      method: "PUT",
      body: JSON.stringify({})
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to approve cancellation");
  }
}

export async function rejectCancellation(id) {
  try {
    const booking = await apiCall(`/bookings/${id}/cancel-reject`, {
      method: "PUT",
      body: JSON.stringify({})
    });
    return booking;
  } catch (err) {
    throw new Error(err.message || "Failed to reject cancellation");
  }
}

// SMART MATCHING ENDPOINTS
export async function getSmartCarRecommendations() {
  try {
    const data = await apiCall("/recommendations/cars");
    return data;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch smart recommendations");
  }
}

export async function getCarDetailRecommendations(carId) {
  try {
    return await apiCall(`/recommendations/related/${carId}`);
  } catch (err) {
    throw new Error(err.message || "Failed to fetch car detail recommendations");
  }
}

export async function getMyProfile() {
  try {
    return await apiCall("/auth/profile");
  } catch (err) {
    throw new Error(err.message || "Failed to fetch profile");
  }
}

export async function updateMyPreferences(preferences) {
  try {
    const data = await apiCall("/auth/profile/preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences)
    });

    const existing = JSON.parse(localStorage.getItem("user") || "null");
    if (existing && data?.user) {
      localStorage.setItem("user", JSON.stringify({
        ...existing,
        preferences: data.user.preferences,
      }));
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Failed to update preferences");
  }
}

export async function submitRecommendationFeedback(useful) {
  try {
    return await apiCall("/recommendations/feedback", {
      method: "POST",
      body: JSON.stringify({ useful })
    });
  } catch (err) {
    throw new Error(err.message || "Failed to submit recommendation feedback");
  }
}

export async function submitRecommendationItemFeedback(carId, sentiment) {
  try {
    return await apiCall("/recommendations/feedback/item", {
      method: "POST",
      body: JSON.stringify({ carId, sentiment })
    });
  } catch (err) {
    throw new Error(err.message || "Failed to submit recommendation item feedback");
  }
}

export async function submitColdStartQuiz(quizData) {
  try {
    return await apiCall("/recommendations/cold-start-quiz", {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  } catch (err) {
    throw new Error(err.message || "Failed to submit cold start quiz");
  }
}

export async function getDynamicPriceQuote(carId, pickupDate, returnDate) {
  try {
    const query = new URLSearchParams({ pickupDate, returnDate });
    return await apiCall(`/recommendations/dynamic-price/${carId}?${query.toString()}`);
  } catch (err) {
    throw new Error(err.message || "Failed to fetch dynamic price quote");
  }
}