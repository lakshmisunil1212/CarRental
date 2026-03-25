import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, confirmPickup, confirmReturn } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Calendar, MapPin, Clock, DollarSign, ChevronRight, ArrowRight, Share2, AlertCircle, CheckCircle, XCircle, TrendingUp, FileText, Search, Filter, Calendar as CalendarIcon, Star, Edit3, Calculator, RefreshCw } from "lucide-react";

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b83ad38?w=800&h=450&fit=crop";

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [shareModal, setShareModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyBookings().then(setBookings);
  }, []);

  const getBookingStatusLabel = (status) => {
    if (!status) return "pending";
    return status.replace(/_/g, " ");
  };

  // Mock duration calculation
  const getBookingDuration = (pickupDate, returnDate) => {
    const pickup = new Date(pickupDate);
    const retDateObj = new Date(returnDate);
    const diffTime = Math.abs(retDateObj - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
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
      ) : (
        <div className="grid gap-8">
          {bookings.map((booking) => (
            <motion.div
              key={booking._id || booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Car Image */}
                {booking.car && (
                  <img
                    src={booking.car.img || booking.car.imageUrl || FALLBACK_CAR_IMAGE}
                    alt={booking.car.make + ' ' + booking.car.model}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_CAR_IMAGE;
                    }}
                    className="w-full md:w-48 h-32 object-cover rounded-xl border"
                  />
                )}
                <div className="flex-1">
                  {/* Car Info */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Car size={20} />
                      {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Car'}
                    </h2>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>
                  {/* Pickup & Dropoff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <MapPin size={20} className="text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-medium">Pickup</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(booking.pickupDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">{booking.pickupTime || '10:00'}</p>
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
                          {new Date(booking.returnDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-600">{booking.returnTime || '18:00'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bottom - Duration & Pricing & Actions */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  {/* Duration & Price */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={18} />
                      <span className="text-sm">
                        <span className="font-semibold text-slate-800">
                          {getBookingDuration(booking.pickupDate, booking.returnDate)}
                        </span>{" "}
                        days
                      </span>
                    </div>
                    {booking.totalPrice && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign size={18} />
                        <span className="text-sm">
                          Total: {" "}
                          <span className="font-semibold text-sky-600">
                            ₹{booking.totalPrice.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    )}
                    {booking.car && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp size={18} />
                        <span className="text-sm">
                          Daily: {" "}
                          <span className="font-semibold text-sky-600">
                            ₹{booking.dynamicPricePerDay || booking.car.pricePerDay}/day
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Download Receipt */}
                    {/* Share Booking */}
                    <button
                      onClick={() => setShareModal(booking._id || booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                    >
                      <Share2 size={16} /> Share
                    </button>
                    {/* Rebook Same Car */}
                    {booking.car && (
                      <button
                        onClick={() => navigate(`/cars/${booking.car._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-sm"
                      >
                        <RefreshCw size={16} /> Rebook
                      </button>
                    )}
                    {/* View Details */}
                    {booking.car && (
                      <button
                        onClick={() => navigate(`/bookings/${booking._id}`, { state: { booking } })}
                        className="flex items-center justify-center gap-2 ml-auto px-4 py-2 text-sky-600 hover:text-sky-700 font-semibold group"
                      >
                        View Details
                        <ChevronRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
            Browse More Cars
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      )}
      {/* Share Modal */}
      {shareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShareModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Share Booking Details</h3>
            {(() => {
              const booking = bookings.find(b => (b._id || b.id).toString() === shareModal.toString());
              const bookingText = booking ? `
Check out my booking!

Vehicle: ${booking.car ? `${booking.car.make} ${booking.car.model}` : 'N/A'}
Pickup: ${new Date(booking.pickupDate).toLocaleDateString()}
Return: ${new Date(booking.returnDate).toLocaleDateString()}
Total: ₹${booking.totalPrice}

Book with us at: ${window.location.origin}` : '';
              return (
                <>
                  <div className="space-y-3 mb-4">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(bookingText)}`}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">W</div>
                      <span className="font-semibold text-slate-700">WhatsApp</span>
                    </a>
                    {/* Email */}
                    <a
                      href={`mailto:?subject=My Booking Details&body=${encodeURIComponent(bookingText)}`}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">✉</div>
                      <span className="font-semibold text-slate-700">Email</span>
                    </a>
                    {/* Copy Link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingText);
                        alert("Booking details copied to clipboard!");
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">📋</div>
                      <span className="font-semibold text-slate-700">Copy Details</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShareModal(null)}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
