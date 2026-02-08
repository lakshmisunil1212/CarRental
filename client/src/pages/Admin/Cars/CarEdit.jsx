import React, { useEffect, useState } from "react";
import { fetchCarById, adminUpdateCar } from "../../../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function CarEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchCarById(id).then((c) => setForm({ ...c }));
  }, [id]);

  if (!form) return <div>Loading...</div>;

  function submit(e) {
    e.preventDefault();
    adminUpdateCar(id, form).then(() => nav("/admin/cars"));
  }

  return (
    <div className="max-w-lg bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Edit car</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={form.make} onChange={(e)=>setForm({...form, make:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input value={form.model} onChange={(e)=>setForm({...form, model:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input value={form.year} onChange={(e)=>setForm({...form, year:e.target.value})} className="w-full border rounded px-2 py-1" />
        <input value={form.pricePerDay} onChange={(e)=>setForm({...form, pricePerDay:e.target.value})} className="w-full border rounded px-2 py-1" />
        <button className="px-3 py-2 bg-indigo-600 text-white rounded">Save</button>
      </form>
    </div>
  );
}