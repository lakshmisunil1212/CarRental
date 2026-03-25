import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Car, MapPin, Clock, DollarSign, TrendingUp, Download, Share2, CheckCircle, RefreshCw, ChevronRight } from "lucide-react";
import { confirmPickup, confirmReturn, getBookingById } from "../../services/api";

const FALLBACK_CAR_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b83ad38?w=800&h=450&fit=crop";

export default function BookingDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(location.state?.booking);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking && id) {
      // Fetch booking if not passed via state
      getBookingById(id)
        .then(setBooking)
        .catch(err => {
          setError(err.message || "Failed to load booking");
        })
        .finally(() => setLoading(false));
    }
  }, [booking, id]);

  const isReturnDateArrived = (returnDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const ret = new Date(returnDate);
    ret.setHours(0,0,0,0);
    return ret <= today;
  };

  const isPickupDateArrived = (pickupDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const pick = new Date(pickupDate);
    pick.setHours(0,0,0,0);
    return pick <= today;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{error || "Booking not found"}</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const pickupConfirmed = booking.pickupConfirmedByCustomer;
  const ownerConfirmed = booking.pickupConfirmedByAdmin;
  const bothConfirmed = pickupConfirmed && ownerConfirmed;
  const returnConfirmedByCustomer = booking.returnConfirmedByCustomer;
  const returnConfirmedByAdmin = booking.returnConfirmedByAdmin;
  const bothReturnConfirmed = returnConfirmedByCustomer && returnConfirmedByAdmin;

  const timelineSteps = ["pending", "confirmed", "active", "completed"];
  const getTimelineStage = (status) => {
    if (["confirmed", "awaiting_pickup_confirmation"].includes(status)) return "confirmed";
    if (["active", "awaiting_return_confirmation"].includes(status)) return "active";
    if (status === "completed") return "completed";
    return "pending";
  };
  const currentTimelineIndex = timelineSteps.indexOf(getTimelineStage(booking.status));

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sky-600 hover:underline flex items-center gap-2">
        <ChevronRight className="rotate-180" size={18} /> Back
      </button>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {booking.car && (
          <img
            src={booking.car.img || booking.car.imageUrl || FALLBACK_CAR_IMAGE}
            alt={booking.car.make + ' ' + booking.car.model}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_CAR_IMAGE;
            }}
            className="w-full md:w-48 h-32 object-cover rounded-xl border"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Car size={20} />
            {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Car'}
          </h2>
          <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">
            {bothConfirmed ? "Trip Active" : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {timelineSteps.map((step, index) => {
            const isCompleted = index < currentTimelineIndex;
            const isCurrent = index === currentTimelineIndex;
            const baseClass = "px-3 py-1 rounded-full text-xs font-semibold border";
            const stateClass = isCurrent
              ? "bg-sky-100 text-sky-700 border-sky-200"
              : isCompleted
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200";

            return (
              <span key={step} className={`${baseClass} ${stateClass}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <MapPin size={20} className="text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Pickup</p>
            <p className="font-semibold text-slate-800">{new Date(booking.pickupDate).toLocaleDateString()}</p>
            <p className="text-sm text-slate-600">{booking.pickupTime || '10:00'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <MapPin size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Dropoff</p>
            <p className="font-semibold text-slate-800">{new Date(booking.returnDate).toLocaleDateString()}</p>
            <p className="text-sm text-slate-600">{booking.returnTime || '18:00'}</p>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock size={18} />
          <span className="text-sm">
            <span className="font-semibold text-slate-800">
              {Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24))}
            </span>{" "}days
          </span>
        </div>
        {booking.totalPrice && (
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign size={18} />
            <span className="text-sm">
              Total: {" "}
              <span className="font-semibold text-sky-600">
                ₹{booking.totalPrice.toLocaleString()}
              </span>
            </span>
          </div>
        )}
        {booking.car && (
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingUp size={18} />
            <span className="text-sm">
              Daily: {" "}
              <span className="font-semibold text-sky-600">
                ₹{booking.car.pricePerDay}/day
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {booking.status === "completed" ? (
          <button
            onClick={() => {
              const dayCount = Math.max(
                1,
                Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24))
              );
              const totalAmount = Number(booking.totalPrice || booking.totalAmount || 0);
              const dailyRate = booking?.car?.pricePerDay
                ? Number(booking.car.pricePerDay)
                : dayCount
                  ? Number((totalAmount / dayCount).toFixed(2))
                  : 0;
              const formatINR = (amount) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                }).format(Number(amount || 0));

              const receiptHtml = `
                <!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Booking Receipt - ${booking.bookingCode || booking._id}</title>
                    <style>
                      :root {
                        --ink: #0f172a;
                        --muted: #64748b;
                        --line: #e2e8f0;
                        --surface: #f8fafc;
                        --brand: #0369a1;
                        --accent: #059669;
                      }
                      * { box-sizing: border-box; }
                      body {
                        margin: 0;
                        padding: 28px;
                        font-family: "Segoe UI", Tahoma, sans-serif;
                        color: var(--ink);
                        background: #eef2f7;
                      }
                      .receipt {
                        max-width: 860px;
                        margin: 0 auto;
                        background: #ffffff;
                        border: 1px solid var(--line);
                        border-radius: 14px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                      }
                      .header {
                        display: flex;
                        justify-content: space-between;
                        gap: 16px;
                        padding: 22px 24px;
                        border-bottom: 1px solid var(--line);
                        background: linear-gradient(135deg, #e0f2fe, #f0fdf4);
                      }
                      .brand h1 {
                        margin: 0;
                        font-size: 24px;
                        letter-spacing: 0.4px;
                      }
                      .brand p {
                        margin: 4px 0 0;
                        color: var(--muted);
                        font-size: 13px;
                      }
                      .meta {
                        text-align: right;
                        font-size: 13px;
                        color: var(--muted);
                        line-height: 1.65;
                      }
                      .meta strong {
                        color: var(--ink);
                      }
                      .section {
                        padding: 20px 24px;
                        border-bottom: 1px solid var(--line);
                      }
                      .grid {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 16px;
                      }
                      .card {
                        background: var(--surface);
                        border: 1px solid var(--line);
                        border-radius: 12px;
                        padding: 14px;
                      }
                      .label {
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        color: var(--muted);
                        margin-bottom: 8px;
                        font-weight: 700;
                      }
                      .value {
                        font-size: 14px;
                        line-height: 1.5;
                        color: var(--ink);
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid var(--line);
                        border-radius: 10px;
                        overflow: hidden;
                      }
                      th, td {
                        padding: 12px 14px;
                        border-bottom: 1px solid var(--line);
                        font-size: 14px;
                        text-align: left;
                      }
                      th {
                        background: #f1f5f9;
                        color: #334155;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                      }
                      td.num, th.num { text-align: right; }
                      tr:last-child td { border-bottom: 0; }
                      .totals {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 16px;
                      }
                      .total-box {
                        width: 320px;
                        border: 1px solid var(--line);
                        border-radius: 10px;
                        overflow: hidden;
                      }
                      .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 14px;
                        font-size: 14px;
                        border-bottom: 1px solid var(--line);
                      }
                      .row:last-child { border-bottom: 0; }
                      .row.final {
                        background: #ecfeff;
                        font-size: 16px;
                        font-weight: 700;
                        color: var(--brand);
                      }
                      .footnote {
                        padding: 16px 24px 22px;
                        font-size: 12px;
                        color: var(--muted);
                        line-height: 1.6;
                      }
                      .status {
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 999px;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        color: #065f46;
                        background: #d1fae5;
                      }
                      @media print {
                        body {
                          background: #ffffff;
                          padding: 0;
                        }
                        .receipt {
                          box-shadow: none;
                          border-radius: 0;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="receipt">
                      <div class="header">
                        <div class="brand">
                          <h1>RentalApp Receipt</h1>
                          <p>Official booking payment confirmation</p>
                        </div>
                        <div class="meta">
                          <div><strong>Receipt #:</strong> ${booking.bookingCode || booking._id}</div>
                          <div><strong>Issued:</strong> ${new Date().toLocaleString("en-IN")}</div>
                          <div><span class="status">PAID</span></div>
                        </div>
                      </div>

                      <div class="section">
                        <div class="grid">
                          <div class="card">
                            <div class="label">Customer</div>
                            <div class="value">
                              ${booking.name || booking.user?.name || "N/A"}<br/>
                              ${booking.user?.email || "N/A"}<br/>
                              ${booking.phone || "N/A"}
                            </div>
                          </div>
                          <div class="card">
                            <div class="label">Booking Summary</div>
                            <div class="value">
                              Vehicle: ${booking.car ? `${booking.car.make} ${booking.car.model}` : "N/A"}<br/>
                              Pickup: ${new Date(booking.pickupDate).toLocaleString("en-IN")}<br/>
                              Return: ${new Date(booking.returnDate).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="section">
                        <table>
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th class="num">Rate</th>
                              <th class="num">Days</th>
                              <th class="num">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Car rental charge</td>
                              <td class="num">${formatINR(dailyRate)}</td>
                              <td class="num">${dayCount}</td>
                              <td class="num">${formatINR(totalAmount)}</td>
                            </tr>
                          </tbody>
                        </table>

                        <div class="totals">
                          <div class="total-box">
                            <div class="row"><span>Subtotal</span><strong>${formatINR(totalAmount)}</strong></div>
                            <div class="row"><span>Taxes & Fees</span><strong>${formatINR(0)}</strong></div>
                            <div class="row final"><span>Total Paid</span><span>${formatINR(totalAmount)}</span></div>
                          </div>
                        </div>
                      </div>

                      <div class="footnote">
                        This document is generated electronically and is valid without a signature.
                        For support, contact RentalApp support with your Receipt ID.
                      </div>
                    </div>
                  </body>
                </html>`;
              const blob = new Blob([receiptHtml], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `receipt_${booking.bookingCode || booking._id}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm"
          >
            <Download size={16} /> Receipt
          </button>
        ) : (
          <button
            disabled
            title="Receipt is available only after trip completion"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-semibold text-sm cursor-not-allowed"
          >
            <Download size={16} /> Receipt (after completion)
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm" disabled>
          <Share2 size={16} /> Share
        </button>
        {booking.car && (
          <button
            onClick={() => navigate(`/cars/${booking.car._id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-sm"
          >
            <RefreshCw size={16} /> Rebook
          </button>
        )}
        {(["confirmed", "awaiting_pickup_confirmation"].includes(booking.status)) && isPickupDateArrived(booking.pickupDate) && !booking.pickupConfirmedByCustomer && user && (
          <button
            onClick={async () => {
              try {
                const updated = await confirmPickup(booking._id);
                setBooking(updated);
                alert(updated.status === "active" ? "Pickup confirmed by both parties. Trip is now active." : "Pickup confirmed. Waiting for admin confirmation.");
              } catch (err) {
                alert(err.message || 'Failed to confirm pickup');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-semibold text-sm"
          >
            <CheckCircle size={16} /> Confirm Pickup
          </button>
        )}
        {/* Confirm Return button for customer if return date arrived and not yet confirmed */}
        {(["active", "awaiting_return_confirmation"].includes(booking.status)) && isReturnDateArrived(booking.returnDate) && !booking.returnConfirmedByCustomer && user && (
          <button
            onClick={async () => {
              try {
                const updated = await confirmReturn(booking._id);
                setBooking(updated);
                alert(updated.status === "completed" ? 'Return confirmed by both parties. Trip completed.' : 'Return confirmed. Waiting for admin confirmation.');
              } catch (err) {
                alert(err.message || 'Failed to confirm return');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-sm"
          >
            <CheckCircle size={16} /> Confirm Return
          </button>
        )}
      </div>
      {/* Status indicators */}
      {booking.status === "active" && (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-sm mb-2">
          <CheckCircle size={16} /> Trip Active
        </span>
      )}
      {booking.status === "completed" && (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm mb-2">
          <CheckCircle size={16} /> Trip Completed
        </span>
      )}
      {/* Add more booking details as needed */}
    </div>
  );
}
