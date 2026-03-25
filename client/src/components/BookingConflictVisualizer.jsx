import React, { useEffect, useState } from "react";
import { fetchBookingsByCar } from "../services/api";

function formatDateShort(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function intersects(a, b) {
  return a.start < b.end && b.start < a.end;
}

export default function BookingConflictVisualizer({ carId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carId) return;
    setLoading(true);
    fetchBookingsByCar(carId)
      .then((list) => {
        const mapped = (list || []).map((b) => ({
          id: b._id || b.id,
          start: new Date(b.pickupDate),
          end: new Date(b.returnDate),
          status: b.status || "",
          raw: b
        }));
        setBookings(mapped);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [carId]);

  if (!carId) return null;

  if (loading) return (
    <div className="bg-white p-4 rounded-xl border border-slate-100">Loading availability…</div>
  );

  if (!bookings || bookings.length === 0) return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm text-slate-500">No existing bookings yet.</div>
  );

  // compute timeline bounds
  let min = bookings.reduce((acc, b) => b.start < acc ? b.start : acc, bookings[0].start);
  let max = bookings.reduce((acc, b) => b.end > acc ? b.end : acc, bookings[0].end);
  // add small padding (one day)
  const msDay = 24 * 60 * 60 * 1000;
  min = new Date(min.getTime() - msDay);
  max = new Date(max.getTime() + msDay);
  const total = Math.max(1, max - min);

  // stacking lanes
  const lanes = [];
  const items = bookings.slice().sort((a, b) => a.start - b.start);
  const assigned = items.map((it) => {
    let lane = 0;
    while (true) {
      if (!lanes[lane]) {
        lanes[lane] = it;
        break;
      }
      if (!intersects(lanes[lane], it)) {
        lanes[lane] = it;
        break;
      }
      lane += 1;
    }
    return { ...it, lane };
  });

  const laneCount = assigned.reduce((m, a) => Math.max(m, a.lane + 1), 0);

  // detect overlaps count for highlighting
  const overlapCounts = assigned.map((a, i) => assigned.reduce((c, b) => c + (intersects(a, b) ? 1 : 0), 0));

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100">
      <h4 className="font-semibold text-sm text-slate-700 mb-2">Booking Timeline</h4>
      <div className="text-xs text-slate-400 mb-3">{formatDateShort(min)} — {formatDateShort(max)}</div>

      <div className="relative w-full" style={{ height: laneCount * 44 }}>
        {assigned.map((b, idx) => {
          const left = ((b.start - min) / total) * 100;
          const width = Math.max(0.5, ((b.end - b.start) / total) * 100);
          const isConflict = overlapCounts[idx] > 1;
          const top = b.lane * 44;
          return (
            <div key={b.id} className="absolute" style={{ left: `${left}%`, width: `${width}%`, top }}>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium truncate shadow ${isConflict ? 'bg-rose-500 text-white border-2 border-rose-700' : 'bg-sky-600 text-white'}`} title={`${formatDateShort(b.start)} → ${formatDateShort(b.end)}`}>
                {formatDateShort(b.start)} — {formatDateShort(b.end)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block"></span>
          <span>Booked slot</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
          <span>Overlapping bookings (conflict)</span>
        </div>
      </div>
    </div>
  );
}
