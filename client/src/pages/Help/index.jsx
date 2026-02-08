import React from "react";

export default function Help() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold">Help & FAQ</h2>
      <div className="mt-4 space-y-3">
        <div>
          <div className="font-semibold">How do I book a car?</div>
          <div className="text-sm text-gray-600">Browse cars, open a car page and fill the booking form.</div>
        </div>
        <div>
          <div className="font-semibold">Can I cancel?</div>
          <div className="text-sm text-gray-600">Cancellation policies vary. This demo uses local bookings.</div>
        </div>
      </div>
    </div>
  );
}