import React, { useEffect, useState } from "react";
import { fetchCars, adminDeleteCar } from "../../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars().then(setCars).catch(err => setError(err.message));
  }, []);

  const handleDelete = async (carId) => {
    setIsDeleting(true);
    setError("");
    try {
      await adminDeleteCar(carId);
      setCars(cars.filter(c => c._id !== carId));
      setDeleteConfirm(null);
      setIsDeleting(false);
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Fleet Management</h1>
            <p className="text-slate-500">Add, edit, or remove vehicles from your rental fleet</p>
          </div>
        </div>
        <Link
          to="/admin/cars/new"
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-200 active:scale-95"
        >
          <Plus size={20} />
          Add New Car
        </Link>
      </div>

      {/* Cars Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full bg-slate-50 p-12 rounded-xl text-center border-2 border-dashed border-slate-300"
          >
            <Car size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg font-medium">No cars in fleet</p>
            <p className="text-slate-500 text-sm">Add your first car to get started</p>
          </motion.div>
        ) : (
          cars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all"
            >
              {/* Car Image Placeholder */}
              <div className="w-full h-40 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                <Car size={48} className="text-sky-400" />
              </div>

              {/* Car Details */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{car.year}</p>
                <p className="text-lg font-semibold text-sky-600 mt-3">₹{car.pricePerDay}/day</p>
                {car.seats && (
                  <p className="text-sm text-slate-600 mt-2">👥 {car.seats} seats</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/admin/cars/${car.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors font-medium"
                >
                  <Edit2 size={16} />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteConfirm(car.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Car?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to permanently delete this car from your fleet? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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