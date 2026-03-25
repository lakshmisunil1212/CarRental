import React, { useEffect, useState } from "react";
import { fetchBookingsByCar } from "../services/api";
import { Calendar, CheckCircle2, XCircle, Info } from "lucide-react";

const MS_DAY = 24 * 60 * 60 * 1000;

function formatDateShort(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateInput(d) {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function stripTime(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function isRangeConflict(bookings, pickupDate, returnDate) {
  if (!pickupDate || !returnDate) return null;
  const start = stripTime(pickupDate);
  const end = stripTime(returnDate);
  for (const b of bookings) {
    if (b.start < end && b.end > start) {
      return b;
    }
  }
  return null;
}

export default function CarAvailabilityVisualizer({ carId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkPickup, setCheckPickup] = useState("");
  const [checkReturn, setCheckReturn] = useState("");

  useEffect(() => {
    if (!carId) return;
    setLoading(true);
    fetchBookingsByCar(carId)
      .then((list) => {
        const today = stripTime(new Date());
        const active = (list || [])
          .filter((b) => !["cancelled", "completed"].includes(b.status))
          .map((b) => ({
            id: b._id || b.id,
            start: stripTime(b.pickupDate),
            end: stripTime(b.returnDate),
            status: b.status || "pending",
          }))
          .filter((b) => b.end >= today)
          .sort((a, b) => a.start - b.start);
        setBookings(active);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [carId]);

  if (!carId) return null;

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // --- build timeline spanning from today to max(today+90days, last booking end+2days) ---
  const today = stripTime(new Date());
  const horizonDefault = new Date(today.getTime() + 90 * MS_DAY);
  const lastEnd = bookings.length
    ? bookings.reduce((m, b) => (b.end > m ? b.end : m), bookings[0].end)
    : horizonDefault;
  const timelineEnd = lastEnd > horizonDefault ? new Date(lastEnd.getTime() + 2 * MS_DAY) : horizonDefault;
  const timelineStart = today;
  const totalMs = Math.max(1, timelineEnd - timelineStart);

  // Check the user-selected date range
  const parsedPickup = checkPickup ? stripTime(checkPickup) : null;
  const parsedReturn = checkReturn ? stripTime(checkReturn) : null;
  const rangeValid = parsedPickup && parsedReturn && parsedReturn > parsedPickup;
  const conflict = rangeValid ? isRangeConflict(bookings, parsedPickup, parsedReturn) : null;
  const isAvailable = rangeValid && conflict === null;

  // Clamp a booking bar within the visible timeline
  function clampedBar(b) {
    const s = b.start < timelineStart ? timelineStart : b.start;
    const e = b.end > timelineEnd ? timelineEnd : b.end;
    const left = ((s - timelineStart) / totalMs) * 100;
    const width = Math.max(0.5, ((e - s) / totalMs) * 100);
    return { left, width };
  }

  // Build a bar for the user's selected range (if valid and within window)
  function selectedBar() {
    if (!rangeValid) return null;
    const s = parsedPickup < timelineStart ? timelineStart : parsedPickup;
    const e = parsedReturn > timelineEnd ? timelineEnd : parsedReturn;
    if (e <= timelineStart || s >= timelineEnd) return null;
    const left = ((s - timelineStart) / totalMs) * 100;
    const width = Math.max(0.5, ((e - s) / totalMs) * 100);
    return { left, width };
  }
  const selBar = selectedBar();

  // Today marker
  const todayLeft = 0; // always starts at today

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <Calendar size={18} className="text-sky-600" />
        <h4 className="font-bold text-sm text-slate-800">Availability Timeline</h4>
      </div>

      <div className="px-5 pb-2 text-xs text-slate-400">
        {formatDateShort(timelineStart)} — {formatDateShort(timelineEnd)}
        <span className="ml-2 text-sky-500">(next ~{Math.round((timelineEnd - timelineStart) / (30 * MS_DAY))} months)</span>
      </div>

      {/* Timeline bar */}
      <div className="px-5 pb-4">
        <div className="relative w-full bg-emerald-50 rounded-xl overflow-hidden" style={{ height: 48 }}>
          {/* Available background */}
          <div className="absolute inset-0 rounded-xl bg-emerald-50" />

          {/* Booked blocks */}
          {bookings.map((b) => {
            const { left, width } = clampedBar(b);
            return (
              <div
                key={b.id}
                title={`Reserved: ${formatDateShort(b.start)} → ${formatDateShort(b.end)}`}
                className="absolute top-1 bottom-1 rounded-lg cursor-default group"
                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: "#f87171", minWidth: 4 }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 hidden group-hover:block whitespace-nowrap bg-slate-800 text-white text-xs rounded-lg px-2 py-1 pointer-events-none shadow-lg">
                  Reserved: {formatDateShort(b.start)} → {formatDateShort(b.end)}
                </div>
              </div>
            );
          })}

          {/* User selected range */}
          {selBar && (
            <div
              className={`absolute top-0 bottom-0 rounded-xl opacity-80 border-2 ${isAvailable ? "bg-sky-300 border-sky-500" : "bg-rose-400 border-rose-600"}`}
              style={{ left: `${selBar.left}%`, width: `${selBar.width}%`, minWidth: 4 }}
            />
          )}

          {/* Today tick */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400 opacity-50" style={{ left: "0%" }} />

          {/* Labels */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1 text-xs text-emerald-700 font-semibold pointer-events-none">Today</div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-400 inline-block" />
            Available
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
            Reserved
          </div>
          {rangeValid && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isAvailable ? "text-sky-600" : "text-rose-600"}`}>
              <span className={`w-3 h-3 rounded-sm inline-block ${isAvailable ? "bg-sky-300 border border-sky-500" : "bg-rose-400 border border-rose-600"}`} />
              Your dates
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mx-5" />

      {/* Date Checker */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Check your dates</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Pickup date</label>
            <input
              type="date"
              value={checkPickup}
              min={formatDateInput(today)}
              onChange={(e) => setCheckPickup(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Return date</label>
            <input
              type="date"
              value={checkReturn}
              min={checkPickup || formatDateInput(today)}
              onChange={(e) => setCheckReturn(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50"
            />
          </div>
        </div>

        {/* Result */}
        {!checkPickup && !checkReturn && (
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5">
            <Info size={14} className="shrink-0 mt-0.5" />
            Pick dates above to check if this car is available for your trip.
          </div>
        )}

        {checkPickup && checkReturn && !rangeValid && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2.5">
            <Info size={14} className="shrink-0 mt-0.5" />
            Return date must be after pickup date.
          </div>
        )}

        {rangeValid && isAvailable && (
          <div className="mt-3 flex items-start gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
            <span>
              Car is available from{" "}
              <strong>{formatDateShort(parsedPickup)}</strong> to{" "}
              <strong>{formatDateShort(parsedReturn)}</strong>!
            </span>
          </div>
        )}

        {rangeValid && !isAvailable && conflict && (
          <div className="mt-3 flex items-start gap-2 text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl px-3 py-2.5">
            <XCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
            <span>
              Not available — already reserved from{" "}
              <strong>{formatDateShort(conflict.start)}</strong> to{" "}
              <strong>{formatDateShort(conflict.end)}</strong>. Please choose different dates.
            </span>
          </div>
        )}
      </div>

      {bookings.length === 0 && (
        <div className="px-5 pb-5 text-xs text-slate-400 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-500" />
          No upcoming reservations — this car is fully available.
        </div>
      )}
    </div>
  );
}
