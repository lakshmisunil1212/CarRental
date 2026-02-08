import React, { useState } from "react";
import { Filter, Search, X } from "lucide-react";

export default function Filters({ onChange }) {
  const [filters, setFilters] = useState({ make: "", maxPrice: "" });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({ make: "", maxPrice: "" });
    onChange({ make: "", maxPrice: "" });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Filter size={20} className="text-sky-600" /> Filters
        </h4>
        {(filters.make || filters.maxPrice) && (
          <button 
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Make */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Car Brand</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.make}
              onChange={(e) => handleFilterChange("make", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all"
              placeholder="e.g. Toyota, BMW..."
            />
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-slate-700">Max Price / Day</label>
             <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
               {/* Updated default to 5000 since it is Rupees */}
               ₹{filters.maxPrice || 5000}
             </span>
          </div>
          
          <div className="relative">
             <input
              type="range"
              min="0"
              max="10000" // Increased max range to 10k for Rupees
              step="500"  // Increased step size
              value={filters.maxPrice || 5000}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>₹0</span>
            <span>₹10,000+</span>
          </div>
        </div>
      </div>
    </div>
  );
}