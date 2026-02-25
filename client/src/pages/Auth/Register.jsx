import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, UserPlus, ArrowRight, ArrowLeft, User, Check, X, Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../services/api";

// Input Field Component defined outside to prevent re-creation
const InputField = ({ label, type, icon: Icon, value, onChange, disabled, error }) => (
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
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-700 font-medium placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
            : "border-slate-200 focus:ring-sky-500/20 focus:border-sky-500"
          }`}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
    {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
  </div>
);

// Password Input with visibility toggle
const PasswordField = ({ label, value, onChange, disabled, error, showStrength = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-600 ml-1">{label}</label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
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
                : "border-slate-200 focus:ring-sky-500/20 focus:border-sky-500"
              }`}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
      </div>
      {showStrength && value && <div className="mt-3"><PasswordStrengthChecker password={value} /></div>}
    </div>
  );
};

// Password Strength Checker
const PasswordStrengthChecker = ({ password }) => {
  const checks = useMemo(() => ({
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  }), [password]);

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthColor = strength === 0 ? "red" : strength <= 2 ? "orange" : strength === 3 ? "yellow" : "green";
  const strengthText = strength === 0 ? "Weak" : strength <= 2 ? "Fair" : strength === 3 ? "Good" : "Strong";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Password Strength</span>
        <span className={`text-xs font-bold px-2 py-1 rounded text-${strengthColor}-700 bg-${strengthColor}-100`}>
          {strengthText}
        </span>
      </div>
      <div className="space-y-1.5">
        <RequirementCheck met={checks.length} text="At least 6 characters" />
        <RequirementCheck met={checks.uppercase} text="Uppercase letter (A-Z)" />
        <RequirementCheck met={checks.lowercase} text="Lowercase letter (a-z)" />
        <RequirementCheck met={checks.number} text="Number (0-9)" />
      </div>
    </div>
  );
};

const RequirementCheck = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <Check size={14} className="text-green-600 flex-shrink-0" />
    ) : (
      <X size={14} className="text-slate-400 flex-shrink-0" />
    )}
    <span className={met ? "text-green-700 font-medium" : "text-slate-600"}>
      {text}
    </span>
  </div>
);

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();

  // Real-time validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Password must contain a number";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit(e) {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });

      // Store user info
      localStorage.setItem("user", JSON.stringify({
        email: result.user.email,
        role: result.user.role
      }));

      setIsLoading(false);
      navigate("/");
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err.message || "Registration failed";
      
      // Handle specific backend errors
      if (errorMsg.includes("already registered")) {
        setErrors({ email: "This email is already registered. Please log in." });
      } else {
        setGeneralError(errorMsg);
      }
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-slate-100"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 text-sky-600 rounded-xl mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 mt-1">Sign up to start renting cars</p>
        </div>

        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium"
          >
            {generalError}
          </motion.div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <InputField 
            label="Full Name" 
            type="text" 
            icon={User} 
            value={form.name} 
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            disabled={isLoading}
            error={errors.name}
          />

          <InputField 
            label="Email Address" 
            type="email" 
            icon={Mail} 
            value={form.email} 
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            disabled={isLoading}
            error={errors.email}
          />
          
          <div>
            <PasswordField 
              label="Password" 
              value={form.password} 
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              disabled={isLoading}
              error={errors.password}
              showStrength={true}
            />
          </div>

          <PasswordField 
            label="Confirm Password" 
            value={form.confirmPassword} 
            onChange={(e) => {
              setForm({ ...form, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
            }}
            disabled={isLoading}
            error={errors.confirmPassword}
            showStrength={false}
          />

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all ${
              isLoading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500"
            }`}
          >
            {isLoading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                Create Account
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-sky-600 hover:text-sky-700 font-semibold">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}