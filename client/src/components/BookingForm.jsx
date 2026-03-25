import React, { useState, useCallback, memo, useEffect } from "react";
import { Calendar, User, Phone, CheckCircle, MapPin, IdCard, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { getDynamicPriceQuote } from "../services/api";

// Reusable Input Component - moved outside to prevent re-renders
const InputGroup = memo(({ label, name, type = "text", icon: Icon, value, onChange, inputMode, pattern, required = true, disabled = false }) => (
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
        required={required}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
        placeholder={type === "date" ? "" : `Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
));

InputGroup.displayName = "InputGroup";

const TextAreaGroup = memo(({ label, name, value, onChange, placeholder, rows = 3, required = true, disabled = false }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-600 ml-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      disabled={disabled}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm placeholder-slate-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
      placeholder={placeholder}
    />
  </div>
));

TextAreaGroup.displayName = "TextAreaGroup";

export default function BookingForm({ car, onSubmit, variant = "card" }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const cityName = car?.location || "Selected city";
  const [form, setForm] = useState({
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "18:00",
    name: "",
    phone: "",
    drivingLicenseId: "",
    pickupLocation: {
      city: cityName,
      area: "",
      addressLine: "",
      landmark: "",
      notes: "",
    },
    returnLocation: {
      city: cityName,
      area: "",
      addressLine: "",
      landmark: "",
      notes: "",
    },
  });
  const [sameReturnAsPickup, setSameReturnAsPickup] = useState(false);
  const [licenseImage, setLicenseImage] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLocationChange = useCallback((segment, field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [segment]: {
          ...prev[segment],
          city: cityName,
          [field]: value,
        },
      };

      if (sameReturnAsPickup && segment === "pickupLocation") {
        next.returnLocation = {
          ...next.pickupLocation,
          city: cityName,
        };
      }

      return next;
    });
  }, [cityName, sameReturnAsPickup]);

  const handleLicenseImageChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setLicenseImage(file);
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      pickupLocation: {
        ...prev.pickupLocation,
        city: cityName,
      },
      returnLocation: sameReturnAsPickup
        ? {
            ...prev.pickupLocation,
            city: cityName,
          }
        : {
            ...prev.returnLocation,
            city: cityName,
          },
    }));
  }, [cityName, sameReturnAsPickup]);

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
      drivingLicenseImage: licenseImage,
      carId: car?._id || car?.id,
      carTitle: car ? `${car.make} ${car.model}` : undefined,
      pricingQuote: quote || undefined,
    });
  }

  const containerClassName = variant === "modal"
    ? ""
    : "bg-white p-6 rounded-2xl shadow-sm border border-slate-100";

  return (
    <div className={containerClassName}>
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

        <InputGroup
          label="Driving License ID"
          name="drivingLicenseId"
          icon={IdCard}
          value={form.drivingLicenseId}
          onChange={handleChange}
        />
        <p className="-mt-3 text-xs text-slate-500">
          This is required for verification and will be visible to admin.
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-600 ml-1">Driving License Image</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors">
              <ImagePlus size={18} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLicenseImageChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sky-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-200"
            />
          </div>
          <p className="text-xs text-slate-500">Upload clear image (jpg/png/webp, max 5MB).</p>
          {licenseImage?.name && (
            <p className="text-xs text-emerald-600">Selected: {licenseImage.name}</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin size={18} className="text-sky-600" />
            <div>
              <div className="font-semibold">Pickup Details</div>
              <div className="text-xs text-slate-500">Vehicle city: {cityName}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Pickup Area / Neighborhood"
              name="pickupArea"
              icon={MapPin}
              value={form.pickupLocation.area}
              onChange={(e) => handleLocationChange("pickupLocation", "area", e.target.value)}
            />
            <InputGroup
              label="Pickup Landmark"
              name="pickupLandmark"
              icon={MapPin}
              value={form.pickupLocation.landmark}
              onChange={(e) => handleLocationChange("pickupLocation", "landmark", e.target.value)}
              required={false}
            />
          </div>
          <TextAreaGroup
            label="Pickup Address"
            name="pickupAddressLine"
            value={form.pickupLocation.addressLine}
            onChange={(e) => handleLocationChange("pickupLocation", "addressLine", e.target.value)}
            placeholder={`Flat, street, building name, or nearby landmark in ${cityName}`}
          />
          <TextAreaGroup
            label="Pickup Notes"
            name="pickupNotes"
            value={form.pickupLocation.notes}
            onChange={(e) => handleLocationChange("pickupLocation", "notes", e.target.value)}
            placeholder="Optional instructions for delivery, gate access, or contact preference"
            rows={2}
            required={false}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-800">
              <MapPin size={18} className="text-emerald-600" />
              <div>
                <div className="font-semibold">Return Details</div>
                <div className="text-xs text-slate-500">Vehicle return city: {cityName}</div>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={sameReturnAsPickup}
                onChange={(e) => setSameReturnAsPickup(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Same as pickup
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Return Area / Neighborhood"
              name="returnArea"
              icon={MapPin}
              value={form.returnLocation.area}
              onChange={(e) => handleLocationChange("returnLocation", "area", e.target.value)}
              disabled={sameReturnAsPickup}
            />
            <InputGroup
              label="Return Landmark"
              name="returnLandmark"
              icon={MapPin}
              value={form.returnLocation.landmark}
              onChange={(e) => handleLocationChange("returnLocation", "landmark", e.target.value)}
              required={false}
              disabled={sameReturnAsPickup}
            />
          </div>
          <TextAreaGroup
            label="Return Address"
            name="returnAddressLine"
            value={form.returnLocation.addressLine}
            onChange={(e) => handleLocationChange("returnLocation", "addressLine", e.target.value)}
            placeholder={`Exact drop-off address in ${cityName}`}
            disabled={sameReturnAsPickup}
          />
          <TextAreaGroup
            label="Return Notes"
            name="returnNotes"
            value={form.returnLocation.notes}
            onChange={(e) => handleLocationChange("returnLocation", "notes", e.target.value)}
            placeholder="Optional instructions for the return handover"
            rows={2}
            required={false}
            disabled={sameReturnAsPickup}
          />
        </div>

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