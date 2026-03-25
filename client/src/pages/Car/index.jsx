import React, { useEffect, useState } from "react";
import { fetchCars, getDynamicPriceQuote } from "../../services/api";
import CarCard from "../../components/CarCard.jsx";
import Filters from "../../components/Filters.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { CarFront, FilterX } from "lucide-react";
import { useSearchParams } from "react-router-dom";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [dynamicPrices, setDynamicPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  const [searchParams] = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  const initialPickup = searchParams.get("pickup") || "";
  const initialDropoff = searchParams.get("dropoff") || "";

  // Initialize filters - match default in Filters component
  const [filters, setFilters] = useState({ make: "", maxPrice: "10000", location: initialLocation, ownerName: "" });

  // location options for dropdown
  const [locOptions, setLocOptions] = useState([
    "Kasaragod",
    "Kannur",
    "Wayanad",
    "Kozhikode",
    "Malappuram"
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchCars(filters).then((data) => {
      console.log("Fetched cars:", data);
      setCars(data || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Error fetching cars:", err);
      setError(err.message || "Unable to fetch cars. Please check the backend is running.");
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    if (!cars.length || user?.role === "admin") {
      setDynamicPrices({});
      return;
    }

    const toISODate = (date) => date.toISOString().split("T")[0];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pickup = initialPickup || localStorage.getItem("searchPickup") || toISODate(today);
    let dropoff = initialDropoff || localStorage.getItem("searchDropoff") || toISODate(tomorrow);

    if (new Date(dropoff) <= new Date(pickup)) {
      const next = new Date(pickup);
      next.setDate(next.getDate() + 1);
      dropoff = toISODate(next);
    }

    let active = true;
    Promise.all(
      cars.map(async (car) => {
        const carId = car._id || car.id;
        try {
          const quote = await getDynamicPriceQuote(carId, pickup, dropoff);
          return [carId, Number(quote.dynamicPricePerDay) || Number(car.pricePerDay) || 0];
        } catch {
          return [carId, Number(car.pricePerDay) || 0];
        }
      })
    ).then((entries) => {
      if (!active) return;
      setDynamicPrices(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [cars, user?.role, initialPickup, initialDropoff]);

  // Filter Logic
  const filtered = cars.filter((c) => {
    // Search by Location (case insensitive)
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      if (!c.location.toLowerCase().includes(searchTerm)) return false;
    }

    // Search by Make OR Model (case insensitive)
    if (filters.make) {
      const searchTerm = filters.make.toLowerCase();
      const matchMake = c.make.toLowerCase().includes(searchTerm);
      const matchModel = c.model.toLowerCase().includes(searchTerm);
      if (!matchMake && !matchModel) return false;
    }
    
    // Filter by Price
    const currentPrice = user?.role === "admin"
      ? Number(c.pricePerDay)
      : Number(dynamicPrices[c._id || c.id] ?? c.pricePerDay);

    if (filters.maxPrice && currentPrice > Number(filters.maxPrice)) {
      console.log(`Filtering out ${c.make} ${c.model}: price ${currentPrice} > ${Number(filters.maxPrice)}`);
      return false;
    }

    return true;
  });

  // update location options when cars load/change
  useEffect(() => {
    const setL = new Set(locOptions);
    cars.forEach((c) => {
      if (c.location) setL.add(c.location);
    });
    setLocOptions(Array.from(setL));
  }, [cars]);
  
  console.log("Filters:", filters);
  console.log("Total cars:", cars.length);
  console.log("Filtered cars:", filtered.length);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* --- HEADER --- */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <span className="p-2 bg-sky-100 text-sky-600 rounded-xl">
            <CarFront size={28} />
          </span>
          Our Fleet
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Choose from our wide range of premium vehicles. Whether you need an economy car for city driving or an SUV for a family trip, we have it all.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 items-start">
        
        {/* --- LEFT SIDEBAR (FILTERS) --- */}
        <aside className="md:col-span-1 sticky top-24 z-10">
          <Filters 
            locations={locOptions} 
            onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))} 
          />
        </aside>

        {/* --- RIGHT CONTENT (CAR GRID) --- */}
        <section className="md:col-span-3 min-h-[500px]">
          {loading ? (
            /* Loading Skeleton State */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100 shadow-sm p-4">
                  <div className="h-40 bg-slate-100 rounded-xl mb-4"></div>
                  <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state when fetch fails */
            <div className="text-center py-24 bg-red-50 rounded-3xl border border-red-200 text-red-700">
              <h3 className="text-xl font-bold mb-2">{error}</h3>
              <p className="text-sm">Please ensure the backend server is running and reachable.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                /* Results Grid */
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map((car) => (
                    <motion.div key={car._id || car.id} variants={itemVariants} layout>
                      <CarCard
                        car={car}
                        userRole={user?.role}
                        displayPrice={user?.role === "admin" ? Number(car.pricePerDay) : Number(dynamicPrices[car._id || car.id] ?? car.pricePerDay)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FilterX size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No cars match your filters</h3>
                  <p className="text-slate-500 mt-1">Try adjusting the price or search term.</p>
                  <button 
                    onClick={() => window.location.reload()} // Simple reset or create a clear function
                    className="mt-6 px-6 py-2 bg-sky-50 text-sky-600 font-semibold rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </div>
    </div>
  );
}