import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Car, User, ArrowLeft, CheckCircle2, TimerReset, Flag } from "lucide-react";
import { adminGetAllBookings } from "../../services/api";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const DAY_FORMATTER = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" });

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function isSameDay(left, right) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function isSameMonth(left, right) {
  return left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();
}

function parseTimeToMinutes(timeText, fallbackHour) {
  if (!timeText || typeof timeText !== "string" || !timeText.includes(":")) {
    return fallbackHour * 60;
  }
  const [hours, minutes] = timeText.split(":").map(Number);
  return (Number.isFinite(hours) ? hours : fallbackHour) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function formatLocation(point) {
  if (!point) return "Location not provided";
  return [point.area, point.addressLine, point.landmark, point.city].filter(Boolean).join(", ") || "Location not provided";
}

function statusClass(status) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "awaiting_pickup_confirmation":
    case "awaiting_return_confirmation":
      return "bg-orange-100 text-orange-700";
    case "active":
      return "bg-sky-100 text-sky-700";
    case "completed":
      return "bg-indigo-100 text-indigo-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminScheduler() {
  const navigate = useNavigate();
  const [today, setToday] = useState(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");

  useEffect(() => {
    adminGetAllBookings()
      .then((data) => {
        const normalized = (data || []).map((booking) => ({
          ...booking,
          car: booking.car || {},
          user: booking.user || {},
        }));
        setBookings(normalized);
      })
      .catch((err) => setError(err.message || "Failed to load scheduler"))
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => {
    const baseEvents = bookings.flatMap((booking) => {
      const pickupDate = new Date(booking.pickupDate);
      const returnDate = new Date(booking.returnDate);
      return [
        {
          id: `${booking._id}-pickup`,
          bookingId: booking._id,
          type: "pickup",
          title: `${booking.car?.make || "Car"} ${booking.car?.model || ""}`.trim(),
          customerName: booking.user?.name || booking.name || "Customer",
          when: pickupDate,
          timeLabel: booking.pickupTime || "10:00",
          minutes: parseTimeToMinutes(booking.pickupTime, 10),
          locationLabel: formatLocation(booking.pickupLocation),
          status: booking.status,
          booking,
        },
        {
          id: `${booking._id}-return`,
          bookingId: booking._id,
          type: "return",
          title: `${booking.car?.make || "Car"} ${booking.car?.model || ""}`.trim(),
          customerName: booking.user?.name || booking.name || "Customer",
          when: returnDate,
          timeLabel: booking.returnTime || "18:00",
          minutes: parseTimeToMinutes(booking.returnTime, 18),
          locationLabel: formatLocation(booking.returnLocation),
          status: booking.status,
          booking,
        },
      ];
    });

    return baseEvents
      .filter((event) => {
        if (eventFilter !== "all" && event.type !== eventFilter) return false;
        if (statusFilter === "open") return !["completed", "cancelled"].includes(event.status);
        if (statusFilter === "completed") return event.status === "completed";
        if (statusFilter === "cancelled") return event.status === "cancelled";
        return true;
      })
      .sort((left, right) => left.when - right.when || left.minutes - right.minutes);
  }, [bookings, eventFilter, statusFilter]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const gridStart = addDays(monthStart, -monthStart.getDay());
    const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());
    const days = [];
    for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
      const dayEvents = events.filter((event) => isSameDay(event.when, cursor));
      days.push({
        date: new Date(cursor),
        events: dayEvents,
      });
    }
    return days;
  }, [currentMonth, events]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(event.when, selectedDate));
  }, [events, selectedDate]);

  const summary = useMemo(() => {
    const todayPickups = events.filter((event) => event.type === "pickup" && isSameDay(event.when, today)).length;
    const todayReturns = events.filter((event) => event.type === "return" && isSameDay(event.when, today)).length;
    const activeTrips = bookings.filter((booking) => booking.status === "active").length;
    const pendingActions = bookings.filter((booking) => ["pending", "awaiting_pickup_confirmation", "awaiting_return_confirmation"].includes(booking.status)).length;

    return { todayPickups, todayReturns, activeTrips, pendingActions };
  }, [events, bookings, today]);

  const jumpToToday = () => {
    const now = startOfDay(new Date());
    setToday(now);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Pickup & Return Scheduler</h1>
          </div>
          <p className="text-slate-500">Calendar view for admin scheduling, daily pickups, and returns across all cars.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/bookings"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
          >
            Booking List
          </Link>
          <button
            onClick={jumpToToday}
            className="px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-lg shadow-sky-200"
          >
            Jump To Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Pickups", value: summary.todayPickups, icon: TimerReset, color: "bg-emerald-100 text-emerald-700" },
          { label: "Today's Returns", value: summary.todayReturns, icon: Flag, color: "bg-indigo-100 text-indigo-700" },
          { label: "Active Trips", value: summary.activeTrips, icon: CheckCircle2, color: "bg-sky-100 text-sky-700" },
          { label: "Pending Actions", value: summary.pendingActions, icon: Clock3, color: "bg-amber-100 text-amber-700" },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-800">{item.value}</div>
            <div className="text-sm text-slate-500">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-xl font-bold text-slate-800 min-w-[180px] text-center">{MONTH_FORMATTER.format(currentMonth)}</div>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All Events" },
                  { key: "pickup", label: "Pickups" },
                  { key: "return", label: "Returns" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setEventFilter(item.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${eventFilter === item.key ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {item.label}
                  </button>
                ))}
                {[
                  { key: "open", label: "Open" },
                  { key: "all", label: "All Status" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === item.key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="px-2 py-1">{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayPickups = day.events.filter((event) => event.type === "pickup").length;
                const dayReturns = day.events.filter((event) => event.type === "return").length;
                const isToday = isSameDay(day.date, today);
                const isSelected = isSameDay(day.date, selectedDate);
                const inMonth = isSameMonth(day.date, currentMonth);

                return (
                  <button
                    key={day.date.toISOString()}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-h-[130px] rounded-2xl border p-2 text-left transition-all ${isSelected ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40"} ${!inMonth ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isToday ? "bg-sky-600 text-white" : "text-slate-700"}`}>
                        {day.date.getDate()}
                      </span>
                      {day.events.length > 0 && (
                        <span className="text-[11px] font-semibold text-slate-500">{day.events.length} events</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {dayPickups > 0 && (
                        <div className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          {dayPickups} pickup{dayPickups > 1 ? "s" : ""}
                        </div>
                      )}
                      {dayReturns > 0 && (
                        <div className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                          {dayReturns} return{dayReturns > 1 ? "s" : ""}
                        </div>
                      )}
                      {day.events.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`px-2 py-1 rounded-lg text-[11px] truncate ${event.type === "pickup" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-800"}`}
                        >
                          {event.timeLabel} {event.title}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[390px] bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <CalendarDays size={22} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{DAY_FORMATTER.format(selectedDate)}</div>
              <div className="text-sm text-slate-500">{selectedDayEvents.length} scheduled item{selectedDayEvents.length === 1 ? "" : "s"}</div>
            </div>
          </div>

          {loading && <div className="text-slate-500">Loading scheduler...</div>}
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

          {!loading && !error && selectedDayEvents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              No pickup or return events on this day for the current filters.
            </div>
          )}

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {selectedDayEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${event.type === "pickup" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {event.type}
                    </div>
                    <div className="mt-2 font-bold text-slate-800">{event.title}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusClass(event.status)}`}>
                    {event.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Clock3 size={14} className="text-slate-400" /> {event.timeLabel}</div>
                  <div className="flex items-start gap-2"><User size={14} className="text-slate-400 mt-0.5" /> <span>{event.customerName}</span></div>
                  <div className="flex items-start gap-2"><Car size={14} className="text-slate-400 mt-0.5" /> <span>{event.booking.bookingCode || event.bookingId}</span></div>
                  <div className="flex items-start gap-2"><MapPin size={14} className="text-slate-400 mt-0.5" /> <span>{event.locationLabel}</span></div>
                </div>

                <button
                  onClick={() => navigate(`/admin/bookings/${event.bookingId}`, { state: { booking: event.booking } })}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500"
                >
                  Open Booking
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}