import React from "react";
import { Link } from "react-router-dom";
import { Users, Fuel, Gauge, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CarCard({ car }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-100 border border-slate-100 flex flex-col h-full"
    >
      {/* Image Container with Zoom Effect */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.img}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
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
            <p className="text-sm text-slate-400 font-medium">Luxury Class</p>
          </div>
          <div className="text-right">
            {/* UPDATED: Rupee Symbol */}
            <div className="text-xl font-bold text-sky-600">₹{car.pricePerDay}</div>
            <div className="text-xs text-slate-400">/ day</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 pt-4 border-t border-slate-50">
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
            to={`/cars/${car.id}`}
            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-sky-50 text-sky-600 font-semibold hover:bg-sky-100 transition-colors text-sm"
          >
            Details
          </Link>
          <Link
            to="/booking"
            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-lg shadow-sky-200 transition-all text-sm flex items-center justify-center gap-2 group-hover:gap-3"
          >
            Book <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}