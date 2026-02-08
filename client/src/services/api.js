// Tiny mock API for development/demo.
// Replace with real API calls (axios/fetch) when backend exists.

const fakeCars = [
  {
    id: "1",
    make: "Toyota",
    model: "Camry",
    year: 2021,
    pricePerDay: 3500,
    seats: 5,
    img: "/images/toyato camery.avif"
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2020,
    pricePerDay: 3000,
    seats: 5,
    img: "/images/2020_honda_civic_si_sedan_angularfront.jpg"
  },
  {
    id: "3",
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    pricePerDay: 5000,
    seats: 5,
    img: "/images/tesla-model-3.jpg"
  }
];

export function fetchCars() {
  return new Promise((res) => {
    setTimeout(() => res([...fakeCars]), 300);
  });
}

export function fetchCarById(id) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      const car = fakeCars.find((c) => c.id === id);
      if (!car) return rej(new Error("Not found"));
      res({ ...car });
    }, 250);
  });
}

export function createBooking(booking) {
  return new Promise((res) => {
    const saved = { id: Date.now().toString(), ...booking };
    // store in localStorage for demo
    const all = JSON.parse(localStorage.getItem("bookings") || "[]");
    all.push(saved);
    localStorage.setItem("bookings", JSON.stringify(all));
    setTimeout(() => res(saved), 300);
  });
}

export function getMyBookings() {
  return new Promise((res) => {
    const all = JSON.parse(localStorage.getItem("bookings") || "[]");
    setTimeout(() => res(all), 150);
  });
}

export function adminCreateCar(car) {
  return new Promise((res) => {
    fakeCars.push({ id: Date.now().toString(), ...car });
    setTimeout(() => res({ success: true }), 200);
  });
}

export function adminUpdateCar(id, updates) {
  return new Promise((res, rej) => {
    const idx = fakeCars.findIndex((c) => c.id === id);
    if (idx === -1) return rej(new Error("Not found"));
    fakeCars[idx] = { ...fakeCars[idx], ...updates };
    setTimeout(() => res({ success: true }), 200);
  });
}