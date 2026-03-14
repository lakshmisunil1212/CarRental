import React, { useState } from "react";
import { Filter, Search, X } from "lucide-react";

export default function Filters({ onChange, locations = [] }) {
  const [filters, setFilters] = useState({ make: "", maxPrice: "10000", location: "", ownerName: "" }); 

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { make: "", maxPrice: "10000", location: "", ownerName: "" };
    setFilters(clearedFilters);
    onChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Filter size={20} className="text-sky-600" /> Filters
        </h4>
        {(filters.make || filters.maxPrice !== "10000" || filters.location || filters.ownerName) && (
          <button 
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Location */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Location</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all"
            >
              <option value="" disabled>Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

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

        {/* Search Owner */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Owner Name</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.ownerName}
              onChange={(e) => handleFilterChange("ownerName", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all"
              placeholder="e.g. John Doe..."
            />
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-slate-700">Max Price / Day</label>
             <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
               ₹{filters.maxPrice}
             </span>
          </div>
          
          <div className="relative">
             <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={filters.maxPrice}
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