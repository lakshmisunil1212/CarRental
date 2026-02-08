import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings } from "../../services/api";
import { motion } from "framer-motion";
import { Calendar, Car, Hash, ArrowRight, Clock, AlertCircle } from "lucide-react";

// Animation settings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small loading delay for better UX
    getMyBookings()
      .then((data) => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>
          <p className="text-slate-500 mt-1">Manage your upcoming and past trips.</p>
        </div>
        <div className="hidden md:block bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-semibold text-sm">
          {bookings.length} {bookings.length === 1 ? 'Trip' : 'Trips'} Total
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Car size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No bookings yet</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">
            You haven't made any reservations. Find your perfect ride today!
          </p>
          <Link 
            to="/cars" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-200"
          >
            Browse Cars <ArrowRight size={18} />
          </Link>
        </motion.div>

      ) : (
        
        /* Booking List */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {bookings.map((b) => (
            <motion.div 
              key={b.id} 
              variants={itemVariants}
              className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left Side: Car Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {b.carTitle || "Unknown Vehicle"}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Hash size={14} className="text-slate-400"/>
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                          #{b.id.toString().slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400"/>
                        <span>2 days duration</span> {/* Mock duration */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Dates & Status */}
                <div className="flex flex-col md:items-end gap-3">
                  {/* Status Badge (Mock logic based on date) */}
                  <span className="self-start md:self-end px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    Confirmed
                  </span>

                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <Calendar size={16} className="text-sky-600" />
                    <div className="text-sm">
                      <span className="font-semibold text-slate-700">{b.pickupDate}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="font-semibold text-slate-700">{b.returnDate}</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Optional: Footer Actions */}
              {/* <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                 <button className="text-sm text-slate-500 hover:text-red-500 font-medium">Cancel Booking</button>
              </div> */}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}