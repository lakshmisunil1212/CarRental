import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Shield, ArrowRight } from "lucide-react";

export default function LoginSelector() {
  const navigate = useNavigate();

  const loginOptions = [
    {
      role: "customer",
      title: "Customer",
      description: "Sign in as a customer to browse and rent vehicles",
      icon: Users,
      path: "/auth/login/customer",
      color: "sky"
    },
    {
      role: "admin",
      title: "Admin / Rental Agent",
      description: "Sign in as an admin to manage vehicles and bookings",
      icon: Shield,
      path: "/auth/login/admin",
      color: "orange"
    }
  ];

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome to Car Rental</h1>
        <p className="text-slate-600 text-lg">Please select your login type to continue</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
        {loginOptions.map((option, index) => {
          const Icon = option.icon;
          const colorClass = option.color === "sky" ? "sky" : "orange";
          
          return (
            <motion.button
              key={option.role}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(option.path)}
              className={`group relative p-8 rounded-2xl border-2 border-${colorClass}-200 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${colorClass}-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${colorClass}-100 text-${colorClass}-600 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                
                <h3 className={`text-2xl font-bold text-${colorClass}-900 mb-2 text-left`}>{option.title}</h3>
                <p className="text-slate-600 text-sm text-left mb-6">{option.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-${colorClass}-600 font-semibold`}>Sign In</span>
                  <ArrowRight className={`text-${colorClass}-600 group-hover:translate-x-1 transition-transform`} size={20} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center text-slate-600"
      >
        <p className="text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/auth/register")}
            className="text-sky-600 hover:text-sky-700 font-semibold"
          >
            Register here
          </button>
        </p>
      </motion.div>
    </div>
  );
}
