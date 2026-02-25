import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Calendar, MapPin, Clock, DollarSign, ChevronRight, ArrowRight } from "lucide-react";

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    getMyBookings().then(setBookings);
  }, []);

  // Mock status calculation based on booking dates
  const getBookingStatus = (pickupDate) => {
    const pickup = new Date(pickupDate);
    const today = new Date();
    if (pickup > today) return "upcoming";
    return "completed";
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => getBookingStatus(b.pickupDate) === filter);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg"
      >
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-sky-100 text-lg">
            Manage and track all your rental reservations in one place
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {bookings.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
          >
            <p className="text-slate-600 text-sm font-medium mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-800">{bookings.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
          >
            <p className="text-slate-600 text-sm font-medium mb-2">Upcoming</p>
            <p className="text-3xl font-bold text-sky-600">
              {bookings.filter((b) => getBookingStatus(b.pickupDate) === "upcoming")
                .length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
          >
            <p className="text-slate-600 text-sm font-medium mb-2">Completed</p>
            <p className="text-3xl font-bold text-emerald-600">
              {bookings.filter((b) => getBookingStatus(b.pickupDate) === "completed")
                .length}
            </p>
          </motion.div>
        </div>
      )}

      {/* Filter Tabs */}
      {bookings.length > 0 && (
        <div className="flex flex-wrap gap-2 bg-white p-4 rounded-xl border border-slate-200">
          {["all", "upcoming", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === status
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 text-slate-400 rounded-full mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No bookings yet</h3>
          <p className="text-slate-600 mb-6">
            Start exploring our fleet and book your first vehicle today!
          </p>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-200"
          >
            Browse Cars
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      ) : filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center"
        >
          <p className="text-slate-600 text-lg">No {filter} bookings found</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const status = getBookingStatus(booking.pickupDate);
            const isUpcoming = status === "upcoming";

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-lg overflow-hidden ${
                  isUpcoming
                    ? "border-sky-200 hover:border-sky-400"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Car & Booking Info */}
                    <div className="space-y-4">
                      {/* Car Details */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800">
                              {booking.carTitle || booking.carId}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Booking ID: <span className="font-mono font-bold">{booking.id}</span>
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isUpcoming
                                ? "bg-sky-100 text-sky-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                          Booked by
                        </p>
                        <p className="font-semibold text-slate-800">{booking.name}</p>
                      </div>
                    </div>

                    {/* Right Column - Dates & Location */}
                    <div className="space-y-4">
                      {/* Pickup */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                          <MapPin size={20} className="text-sky-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-medium">Pickup</p>
                          <p className="font-semibold text-slate-800">
                            {booking.pickupDate}
                          </p>
                        </div>
                      </div>

                      {/* Dropoff */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <MapPin size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-medium">Dropoff</p>
                          <p className="font-semibold text-slate-800">
                            {booking.returnDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom - Duration & Pricing */}
                  <div className="mt-6 pt-6 border-t border-slate-200 grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={18} />
                      <span className="text-sm">
                        <span className="font-semibold text-slate-800">
                          {Math.ceil(
                            (new Date(booking.returnDate) -
                              new Date(booking.pickupDate)) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </span>{" "}
                        days
                      </span>
                    </div>

                    {booking.totalPrice && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign size={18} />
                        <span className="text-sm">
                          Total:{" "}
                          <span className="font-semibold text-sky-600">
                            ₹{booking.totalPrice}
                          </span>
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/cars/${booking.carId}`)}
                      className="flex items-center justify-end gap-2 text-sky-600 hover:text-sky-700 font-semibold group"
                    >
                      View Details
                      <ChevronRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CTA Section */}
      {bookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Looking for more vehicles?</h3>
          <p className="text-sky-100 mb-4">Explore our full fleet and book your next adventure</p>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sky-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
          >
            <Car size={20} />
            Browse All Cars
          </Link>
        </motion.div>
      )}
    </div>
  );
}