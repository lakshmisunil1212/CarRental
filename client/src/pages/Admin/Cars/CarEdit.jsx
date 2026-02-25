import React, { useEffect, useState } from "react";
import { fetchCarById, adminUpdateCar, adminDeleteCar } from "../../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Trash2, ArrowLeft, AlertCircle, ImagePlus } from "lucide-react";

export default function CarEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCarById(id).then((c) => setForm({ ...c })).catch(err => {
      setError(err.message);
    });
  }, [id]);

  if (!form)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );

  function submit(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    adminUpdateCar(id, form).then(() => {
      setIsSaving(false);
      navigate("/admin/cars");
    }).catch(err => {
      setError(err.message);
      setIsSaving(false);
    });
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await adminDeleteCar(id);
      setIsDeleting(false);
      setDeleteConfirm(false);
      navigate("/admin/cars");
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/cars")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Edit Vehicle</h1>
          <p className="text-slate-500">Update details for {form.make} {form.model}</p>
        </div>
      </div>

      {/* Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
      >
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
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price Per Day (₹)
              </label>
              <input
                value={form.pricePerDay}
                onChange={(e) =>
                  setForm({ ...form, pricePerDay: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., 3500"
                required
              />
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Seats
              </label>
              <input
                value={form.seats || 5}
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
              value={form.img || ""}
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
              disabled={isSaving}
              type="submit"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                isSaving
                  ? "bg-sky-400 text-white cursor-not-allowed"
                  : "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-200"
              }`}
            >
              <Save size={20} />
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate("/admin/cars")}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              <Trash2 size={20} />
              Delete
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Delete Vehicle?</h3>
            </div>

            <p className="text-slate-600 mb-6">
              Are you sure you want to permanently delete the <strong>{form.make} {form.model}</strong> from your fleet? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}