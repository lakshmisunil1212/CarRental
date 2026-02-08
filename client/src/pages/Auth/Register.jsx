import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* Mock register */
function registerMock({ email }) {
  localStorage.setItem("user", JSON.stringify({ email }));
  return Promise.resolve({ email });
}

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    registerMock({ email: form.email }).then(() => navigate("/"));
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full border rounded px-2 py-1" required />
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}