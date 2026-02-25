import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import { loginUser, registerAdmin } from "../../services/api";

// Input Field Component defined outside to prevent re-creation on each render
const InputField = ({ label, type, icon: Icon, value, onChange, disabled, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-700 font-medium placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
            : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
          }`}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
    {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
  </div>
);

// Password Input with visibility toggle
const PasswordField = ({ label, value, onChange, disabled, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">
          <Lock size={18} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
          className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-700 font-medium placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
              : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
            }`}
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
    </div>
  );
};

export default function AdminLogin() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (!form.email || !form.password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const result = await loginUser(form.email, form.password);
      
      // Verify user is admin
      if (result.user.role !== "admin") {
        setError("Only admin accounts can login here. Use Customer Login.");
        setIsLoading(false);
        return;
      }
      
      // Store user info along with token (token already stored by loginUser)
      localStorage.setItem("user", JSON.stringify({ 
        email: result.user.email, 
        role: result.user.role 
      }));
      
      setIsLoading(false);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const result = await registerAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      
      // Store user info
      localStorage.setItem("user", JSON.stringify({ 
        email: result.user.email, 
        role: result.user.role 
      }));
      
      setIsLoading(false);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Registration failed");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Animated Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-orange-100 border border-slate-100"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Selection
        </button>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
            mode === "login" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
          }`}>
            {mode === "login" ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Admin Login" : "Create Admin Account"}
          </h2>
          <p className="text-slate-500 mt-1">
            {mode === "login" ? "Sign in to access admin panel" : "Set up your admin account"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-6">
          {mode === "register" && (
            <InputField 
              label="Full Name" 
              type="text" 
              icon={Mail}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isLoading}
              error=""
            />
          )}
          
          <InputField 
            label="Email" 
            type="email" 
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isLoading}
            error={error && error.includes("Email") ? error : ""}
          />
          
          <PasswordField 
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isLoading}
            error={error && error.includes("Password") ? error : ""}
          />

          {mode === "register" && (
            <PasswordField 
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              disabled={isLoading}
              error={error && error.includes("match") ? error : ""}
            />
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-white ${
              mode === "login" 
                ? "bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400" 
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400"
            }`}
          >
            {isLoading ? "Processing..." : <>
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </>}
          </motion.button>
        </form>

        <div className="mt-6 text-center border-t border-slate-200 pt-6">
          {mode === "login" ? (
            <p className="text-slate-600 text-sm">
              Don't have an admin account?{" "}
              <button 
                onClick={() => {
                  setMode("register");
                  setError("");
                  setForm({ email: "", password: "", name: "", confirmPassword: "" });
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p className="text-slate-600 text-sm">
              Already have an admin account?{" "}
              <button 
                onClick={() => {
                  setMode("login");
                  setError("");
                  setForm({ email: "", password: "", name: "", confirmPassword: "" });
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
