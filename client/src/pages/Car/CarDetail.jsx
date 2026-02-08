import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCarById, createBooking } from "../../services/api";
import BookingForm from "../../components/BookingForm.jsx";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Users, Fuel, Gauge, ShieldCheck, CheckCircle, MapPin, Star 
} from "lucide-react";

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchCarById(id)
      .then((c) => setCar(c))
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  }, [id]);

  function handleBooking(data) {
    createBooking({ ...data, carId: id })
      .then((saved) => {
        setBookingSuccess(saved);
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => alert("Booking failed: " + err.message));
  }

  // --- LOADING STATE ---
  if (loading) return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="h-8 bg-slate-200 w-32 rounded-lg"></div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-8 bg-slate-200 w-1/2 rounded-lg"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );

  // --- ERROR STATE ---
  if (!car) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Car Not Found</h2>
      <Link to="/cars" className="text-sky-600 hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Listings
      </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Navigation */}
      <Link to="/cars" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} />
        Back to Fleet
      </Link>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN: CAR DETAILS --- */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Main Image */}
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={car.img} 
              alt={`${car.make} ${car.model}`} 
              className="w-full h-[400px] object-cover rounded-2xl" 
            />
          </div>

          {/* Title & Price (Mobile Only View) */}
          <div className="md:hidden">
             <h1 className="text-3xl font-bold text-slate-800">{car.make} {car.model}</h1>
             <p className="text-xl font-bold text-sky-600 mt-1">₹{car.pricePerDay} ... <span className="text-sm text-slate-400 font-normal">/ day</span></p>
          </div>

          {/* Specs Grid */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Users size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">{car.seats} Passengers</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Gauge size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">Automatic</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Fuel size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">Petrol / Hybrid</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <ShieldCheck size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">Full Insurance</span>
              </div>

            </div>

            <div className="mt-8 prose prose-slate text-slate-500">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
              <p>
                Experience the perfect blend of comfort and performance with this {car.make} {car.model}. 
                Ideal for both city driving and long highway trips, this vehicle comes equipped with modern 
                safety features, a spacious interior, and excellent fuel economy.
              </p>
              <ul className="mt-4 space-y-2 list-none pl-0">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> GPS Navigation System</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Bluetooth & Apple CarPlay</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> 24/7 Roadside Assistance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: BOOKING SIDEBAR --- */}
        <aside className="relative md:sticky md:top-24">
          
          {bookingSuccess ? (
            /* SUCCESS STATE CARD */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-100 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
              <p className="text-slate-500 mb-6">Your ride is reserved. We sent a confirmation email to you.</p>
              
              <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booking ID</span>
                  <span className="font-mono font-bold text-slate-700">#{bookingSuccess.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Car</span>
                  <span className="font-semibold text-slate-700">{car.make} {car.model}</span>
                </div>
              </div>

              <Link 
                to="/bookings" 
                className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
              >
                View My Bookings
              </Link>
            </motion.div>
          ) : (
            /* BOOKING FORM WRAPPER */
            <div className="space-y-6">
              {/* Price Header */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hidden md:block">
                <h1 className="text-2xl font-bold text-slate-800">{car.make} {car.model}</h1>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-sky-600">₹{car.pricePerDay}</span>
                  <span className="text-slate-400 font-medium">/ day</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-amber-500 text-sm font-medium">
                  <Star size={16} fill="currentColor" /> <span>4.8 (120 reviews)</span>
                </div>
              </div>

              {/* The Form Component */}
              <BookingForm car={car} onSubmit={handleBooking} />
              
              <p className="text-center text-xs text-slate-400">
                You won't be charged until pickup. Free cancellation up to 24h before.
              </p>
            </div>
          )}
        </aside>

      </div>
    </motion.div>
  );
}