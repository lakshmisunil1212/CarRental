import React from "react";

/* Placeholder checkout page — integrate Stripe or other provider later */
export default function Checkout() {
  return (
    <div className="bg-white p-8 rounded shadow">
      <h2 className="text-xl font-semibold">Checkout</h2>
      <p className="mt-2 text-gray-600">This is a placeholder. Integrate Stripe or your payment provider here.</p>
      <div className="mt-4">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Proceed to payment</button>
      </div>
    </div>
  );
}