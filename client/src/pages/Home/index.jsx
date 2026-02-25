import React, { useEffect, useState } from "react";
import { fetchCars } from "../../services/api";
import CarCard from "../../components/CarCard.jsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Search } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [cars, setCars] = useState([]);
  
  const [search, setSearch] = useState({
    location: "",
    pickup: "",
    dropoff: ""
  });

  useEffect(() => {
    fetchCars().then((data) => setCars(data || []));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", search);
  };

  return (
    <div className="space-y-24 pb-12">
      {/* --- HERO SECTION --- */}
      <section className="relative">
        
        {/* 1. BACKGROUND (Blue Box) */}
        {/* Added 'pb-48' to create space at the bottom for the search box */}
        <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-3xl shadow-lg relative overflow-hidden z-0 pb-48">
           
           {/* Decorative Circles */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl"></div>

           {/* 2. TEXT CONTENT */}
           <div className="relative z-10 px-6 pt-16 md:pt-20 text-center text-white">
             <div className="max-w-3xl mx-auto space-y-6">
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-4xl md:text-6xl font-extrabold leading-tight"
               >
                 Drive your dream <br/>
                 <span className="text-sky-200">today.</span>
               </motion.h1>
               
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-lg text-blue-100 max-w-xl mx-auto"
               >
                 Premium cars, flexible bookings, and zero hidden fees. 
                 Start your journey with Rent My Ride.
               </motion.p>
             </div>
           </div>
        </div>

        {/* 3. SEARCH BOX (Floats Over the Bottom Edge) */}
        {/* Negative margin pulls it UP into the padding space we created */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.0, ease: "easeOut" }}
          className="container mx-auto px-4 -mt-16 relative z-20" 
        >
          <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center">
              
              {/* Location */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <MapPin size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Pickup Location"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-sky-200 rounded-xl outline-none transition-all text-slate-700 font-medium"
                  value={search.location}
                  onChange={(e) => setSearch({...search, location: e.target.value})}
                />
              </div>

              {/* Pickup Date */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <Calendar size={20} />
                </div>
                <input 
                  type="date" 
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-sky-200 rounded-xl outline-none transition-all text-slate-700 font-medium"
                  value={search.pickup}
                  onChange={(e) => setSearch({...search, pickup: e.target.value})}
                />
              </div>

              {/* Return Date */}
              <div className="relative group">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <Calendar size={20} />
                </div>
                <input 
                  type="date" 
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-sky-200 rounded-xl outline-none transition-all text-slate-700 font-medium"
                  value={search.dropoff}
                  onChange={(e) => setSearch({...search, dropoff: e.target.value})}
                />
              </div>

              {/* Search Button */}
              <button 
                type="submit"
                className="h-12 px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search
              </button>

            </form>
          </div>
        </motion.div>
      </section>

      {/* --- FEATURED SECTION --- */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Featured Vehicles</h2>
          <Link to="/cars" className="text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">
            View all <ArrowRight size={16}/>
          </Link>
        </div>

        {cars.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {cars.slice(0, 3).map((c) => (
              <motion.div key={c.id} variants={itemVariants}>
                <CarCard car={c} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400">Loading fleet...</p>
          </div>
        )}
      </section>
    </div>
  );
}