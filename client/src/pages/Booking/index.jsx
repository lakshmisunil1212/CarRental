import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/api";
import { Link } from "react-router-dom";

export default function Booking() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    getMyBookings().then(setBookings);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My bookings</h2>
      {bookings.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">You have no bookings. <Link to="/cars" className="text-indigo-600">Browse cars</Link></div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{b.carTitle || b.carId}</div>
                <div className="text-sm text-gray-600">{b.pickupDate} → {b.returnDate}</div>
                <div className="text-sm text-gray-500">Booked by: {b.name}</div>
              </div>
              <div className="text-sm text-gray-600">Booking ID: {b.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}