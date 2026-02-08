# Rent My Ride — Backend (Express + MongoDB)

Minimal backend for Rent My Ride (MERN demo).

Prereqs:
- Node 16+
- MongoDB (local or Atlas)

Setup:
1. Copy `.env.example` to `.env` and set values.
2. Install:
   npm install
3. Seed demo cars (optional):
   npm run seed
4. Start server:
   npm run dev   (requires nodemon)
   or
   npm start

API base: http://localhost:5000/api

Important endpoints:
- POST /api/auth/register   { name, email, password }
- POST /api/auth/login      { email, password } -> { token, user }
- GET  /api/cars
- GET  /api/cars/:id
- POST /api/cars            (admin only)
- PUT  /api/cars/:id        (admin only)
- POST /api/bookings        (protected)
- GET  /api/bookings/mine   (protected)
- GET  /api/bookings        (admin only)

Notes:
- JWT_SECRET in .env must be strong in production.
- Replace with real payment flow, validations, rate limiting for production.