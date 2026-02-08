import React, { useState } from "react";
import { Calendar, User, Phone, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingForm({ car, onSubmit }) {
  const [form, setForm] = useState({
    pickupDate: "",
    returnDate: "",
    name: "",
    phone: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      carId: car?.id,
      carTitle: car ? `${car.make} ${car.model}` : undefined,
    });
  }

  // Reusable Input Component to keep code clean
  const InputGroup = ({ label, name, type = "text", icon: Icon, value, onChange }) => (
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
          required
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm placeholder-slate-400"
          placeholder={type === "date" ? "" : `Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );

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
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:shadow-sky-300 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Confirm Booking
        </motion.button>
      </form>
    </div>
  );
}