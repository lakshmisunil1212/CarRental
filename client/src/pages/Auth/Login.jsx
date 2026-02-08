import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

/* Simple localStorage mock auth for demo */
function loginMock({ email }) {
  localStorage.setItem("user", JSON.stringify({ email }));
  return Promise.resolve({ email });
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for better UX
    setTimeout(() => {
      loginMock({ email: form.email }).then(() => {
        setIsLoading(false);
        navigate("/");
      });
    }, 800);
  }

  // Input Field Component to keep code clean
  const InputField = ({ label, type, icon: Icon, value, onChange }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 font-medium placeholder-slate-400"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Animated Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 text-sky-600 rounded-xl mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-1">Please sign in to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <InputField 
            label="Email" 
            type="email" 
            icon={Mail} 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
          
          <div className="space-y-1">
            <InputField 
              label="Password" 
              type="password" 
              icon={Lock} 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
            <div className="text-right">
              <Link to="#" className="text-xs font-medium text-sky-600 hover:text-sky-700">
                Forgot password?
              </Link>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all ${
              isLoading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500"
            }`}
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                Sign In <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/auth/register" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}