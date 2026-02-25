import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Calendar, BarChart3, Users, Plus, ArrowRight, Settings, FileText } from "lucide-react";

export default function AdminDashboard() {
  // Mock Stats Data (Replace with real data from API later)
  const stats = [
    { title: "Total Fleet", value: "12", icon: Car, color: "bg-blue-100 text-blue-600" },
    { title: "Active Bookings", value: "5", icon: Calendar, color: "bg-emerald-100 text-emerald-600" },
    { title: "Total Users", value: "34", icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Revenue (Mo)", value: "₹1,20000", icon: BarChart3, color: "bg-orange-100 text-orange-600" },
  ];

  // Menu Items Configuration
  const menuItems = [
    { 
      title: "Manage Fleet", 
      desc: "Add, edit, or remove vehicles from the listing.", 
      link: "/admin/cars", 
      icon: Car 
    },
    { 
      title: "Manage Bookings", 
      desc: "View and update customer reservation statuses.", 
      link: "/admin/bookings", 
      icon: Calendar 
    },
    { 
      title: "View Reports", 
      desc: "Analyze earnings and vehicle performance.", 
      link: "/admin/reports", 
      icon: FileText 
    },
  ];

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Overview of your rental business performance.</p>
        </div>
        <Link 
          to="/admin/cars/new" 
          className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-200 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Add New Car
        </Link>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* --- ACTION GRID --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Settings size={20} className="text-slate-400" /> Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group h-full cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                    <item.icon size={24} />
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}