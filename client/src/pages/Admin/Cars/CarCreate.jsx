import React, { useState } from "react";
import { adminCreateCar } from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function CarCreate() {
  const [form, setForm] = useState({ make: "", model: "", year: "", pricePerDay: "" });
  const nav = useNavigate();

  function submit(e) {
    e.preventDefault();
    adminCreateCar(form).then(() => nav("/admin/cars"));
  }

  return (
    <div className="max-w-lg bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create car</h2>
      <form onSubmit={submit} className="space-y-3">
        <input placeholder="Make" value={form.make} onChange={(e)=>setForm({...form, make:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input placeholder="Model" value={form.model} onChange={(e)=>setForm({...form, model:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input placeholder="Year" value={form.year} onChange={(e)=>setForm({...form, year:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input placeholder="Price per day" value={form.pricePerDay} onChange={(e)=>setForm({...form, pricePerDay:e.target.value})} className="w-full border rounded px-2 py-1" />
        <button className="px-3 py-2 bg-indigo-600 text-white rounded">Create</button>
      </form>
    </div>
  );
}