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
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error(`API Error at ${endpoint}:`, err);
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

// BOOKING ENDPOINTS
export async function createBooking(bookingData) {
  try {
    const booking = await apiCall("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData)
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

// ADMIN ENDPOINTS
export async function adminGetAllBookings() {
  try {
    const bookings = await apiCall("/bookings");
    return bookings;
  } catch (err) {
    throw new Error(err.message || "Failed to fetch bookings");
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