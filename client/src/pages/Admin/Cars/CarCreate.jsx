import React, { useState } from "react";
import { adminCreateCar } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, ImagePlus } from "lucide-react";

export default function CarCreate() {
  const [form, setForm] = useState({ make: "", model: "", year: "", pricePerDay: "", seats: 5, img: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await adminCreateCar(form);
      setIsLoading(false);
      nav("/admin/cars");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => nav("/admin/cars")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Add New Vehicle</h1>
          <p className="text-slate-500">Enter details for the new rental car</p>
        </div>
      </div>

      {/* Create Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Make */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Make
              </label>
              <input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., Toyota"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Model
              </label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., Camry"
                required
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Year
              </label>
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., 2021"
                type="number"
                required
              />
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price Per Day (₹)
              </label>
              <input
                value={form.pricePerDay}
                onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., 3500"
                type="number"
                required
              />
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Seats
              </label>
              <input
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., 5"
                type="number"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <ImagePlus size={16} className="text-sky-600" />
              Image URL
            </label>
            <input
              value={form.img}
              onChange={(e) => setForm({ ...form, img: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="https://images.unsplash.com/photo-..."
              type="url"
            />
            <p className="text-xs text-slate-500 mt-1">
              Paste a direct image URL (JPEG, PNG). You can use Unsplash URLs for test cars.
            </p>
            {form.img && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Image Preview:</p>
                <img 
                  src={form.img} 
                  alt="Preview" 
                  className="h-32 w-32 object-cover rounded-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                isLoading
                  ? "bg-sky-400 text-white cursor-not-allowed"
                  : "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-200"
              }`}
            >
              <Plus size={20} />
              {isLoading ? "Creating..." : "Create Vehicle"}
            </motion.button>

            <button
              type="button"
              onClick={() => nav("/admin/cars")}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}