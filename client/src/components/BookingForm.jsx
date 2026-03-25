import React, { useState, useCallback, memo, useEffect } from "react";
import { Calendar, User, Phone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getDynamicPriceQuote } from "../services/api";

// Reusable Input Component - moved outside to prevent re-renders
const InputGroup = memo(({ label, name, type = "text", icon: Icon, value, onChange, inputMode, pattern }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-600 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        pattern={pattern}
        required
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm placeholder-slate-400"
        placeholder={type === "date" ? "" : `Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
));

InputGroup.displayName = "InputGroup";

export default function BookingForm({ car, onSubmit }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "18:00",
    name: "",
    phone: "",
  });
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    const carId = car?._id || car?.id;
    if (!carId || !form.pickupDate || !form.returnDate) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    let active = true;
    setQuoteLoading(true);
    setQuoteError("");

    getDynamicPriceQuote(carId, form.pickupDate, form.returnDate)
      .then((data) => {
        if (!active) return;
        setQuote(data);
      })
      .catch((err) => {
        if (!active) return;
        setQuote(null);
        setQuoteError(err.message || "Unable to compute live price");
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [car?._id, car?.id, form.pickupDate, form.returnDate]);

  function submit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      carId: car?.id,
      carTitle: car ? `${car.make} ${car.model}` : undefined,
      pricingQuote: quote || undefined,
    });
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-6 pb-4 border-b border-slate-50">
        <h3 className="text-xl font-bold text-slate-800">
          Book {car ? <span className="text-sky-600">{car.make} {car.model}</span> : "Your Ride"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">Complete the form below to reserve.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup 
            label="Pickup Date" 
            name="pickupDate" 
            type="date" 
            icon={Calendar} 
            value={form.pickupDate} 
            onChange={handleChange} 
          />
          <InputGroup 
            label="Return Date" 
            name="returnDate" 
            type="date" 
            icon={Calendar} 
            value={form.returnDate} 
            onChange={handleChange} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup 
            label="Pickup Time" 
            name="pickupTime" 
            type="time" 
            icon={Calendar} 
            value={form.pickupTime} 
            onChange={handleChange} 
          />
          <InputGroup 
            label="Return Time" 
            name="returnTime" 
            type="time" 
            icon={Calendar} 
            value={form.returnTime} 
            onChange={handleChange} 
          />
        </div>

        <InputGroup 
          label="Full Name" 
          name="name" 
          icon={User} 
          value={form.name} 
          onChange={handleChange} 
        />
        
        <InputGroup 
          label="Phone Number" 
          name="phone" 
          type="tel" 
          icon={Phone} 
          value={form.phone} 
          onChange={handleChange}
          inputMode="tel"
        />

        {(quoteLoading || quote || quoteError) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="font-semibold text-slate-700 mb-2">Live Dynamic Pricing</div>
            {quoteLoading && <div className="text-slate-500">Updating quote...</div>}
            {!quoteLoading && quote && (
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between"><span>Dynamic / day</span><span className="font-semibold text-sky-700">INR {quote.dynamicPricePerDay}</span></div>
                {isAdmin && <div className="flex justify-between"><span>Base / day</span><span>INR {quote.basePricePerDay}</span></div>}
                <div className="flex justify-between"><span>Days</span><span>{quote.days}</span></div>
                <div className="flex justify-between pt-1 border-t border-slate-200"><span className="font-semibold">Estimated total</span><span className="font-bold text-emerald-700">INR {quote.totalPrice}</span></div>
                {isAdmin && (
                  <div className="text-xs text-slate-500 pt-1">
                    Demand x {quote.factors?.carDemandFactor?.toFixed(2)} | Location x {quote.factors?.locationDemandFactor?.toFixed(2)} | Weather x {quote.factors?.weatherFactor?.toFixed(2)} | Time x {quote.factors?.timeOfDayFactor?.toFixed(2)}
                  </div>
                )}
              </div>
            )}
            {!quoteLoading && quoteError && <div className="text-rose-600">{quoteError}</div>}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          {quote?.totalPrice ? `Confirm Booking (INR ${quote.totalPrice})` : "Confirm Booking"}
        </motion.button>
      </form>
    </div>
  );
}