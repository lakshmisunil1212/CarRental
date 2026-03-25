import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Fuel, Gauge, ArrowRight, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function CarCard({ car, showRegNumber = false, userRole = null, displayPrice }) {
  const [imageError, setImageError] = useState(false);
  const defaultFallback = "https://images.unsplash.com/photo-1549399542-7e3f8b83ad38?w=800&h=450&fit=crop";
  const resolvedPrice = typeof displayPrice === "number" ? displayPrice : car.pricePerDay;

  // Get image URL or fallback
  const getImageSrc = () => {
    // If image failed to load or no image URL, use fallback
    if (imageError || !car.img || car.img.trim() === "") {
      return defaultFallback;
    }
    return car.img;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-100 border border-slate-100 flex flex-col h-full">
      {/* Image Container with Zoom Effect */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={getImageSrc()}
          alt={`${car.make} ${car.model}`}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <ImageIcon size={32} />
              <span className="text-xs text-center max-w-[80px]">{car.make} {car.model}</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-sky-600 shadow-sm">
          {car.year}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              {car.make} {car.model}
            </h3>
            <p className="text-xs text-slate-500">{car.location || "Unknown location"}</p>
            <p className="text-sm text-slate-400 font-medium">Luxury Class</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-sky-600">₹{resolvedPrice}</div>
            <div className="text-xs text-slate-400">/ day</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 pt-4 border-t border-slate-50">
          {/* registration number (only when allowed) */}
          {showRegNumber && car.regNumber && (
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg text-slate-500 text-xs gap-1 col-span-3">
              <span className="font-bold">{car.regNumber}</span>
            </div>
          )}
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg text-slate-500 text-xs gap-1">
            <Users size={16} className="text-sky-500" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg text-slate-500 text-xs gap-1">
            <Gauge size={16} className="text-sky-500" />
            <span>Auto</span> 
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg text-slate-500 text-xs gap-1">
            <Fuel size={16} className="text-sky-500" />
            <span>Petrol</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-3">
          <Link
            to={`/cars/${car._id || car.id}`}
            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-sky-50 text-sky-600 font-semibold hover:bg-sky-100 transition-colors text-sm"
          >
            Details
          </Link>
          {userRole === 'admin' ? (
            <Link
              to={`/admin/cars/${car._id || car.id}/edit`}
              className="flex-1 py-2.5 px-4 text-center rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-lg shadow-sky-200 transition-all text-sm flex items-center justify-center gap-2"
            >
              Manage
            </Link>
          ) : (
            <Link
              to={`/cars/${car._id || car.id}`}
              className="flex-1 py-2.5 px-4 text-center rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-lg shadow-sky-200 transition-all text-sm flex items-center justify-center gap-2 group-hover:gap-3"
            >
              Book <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}