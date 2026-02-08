import React, { useEffect, useState } from "react";
import { fetchCars } from "../../../services/api";
import { Link } from "react-router-dom";

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  useEffect(() => {
    fetchCars().then(setCars);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Cars</h2>
        <Link to="/admin/cars/new" className="px-3 py-2 bg-indigo-600 text-white rounded">New car</Link>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {cars.map((c) => (
          <div key={c.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.make} {c.model}</div>
              <div className="text-sm text-gray-600">{c.year} • ₹{c.pricePerDay}/day</div>
            </div>
            <div className="space-x-2">
              <Link to={`/admin/cars/${c.id}/edit`} className="px-2 py-1 border rounded">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}