import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  XCircle,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { validateEmail } from "../../utlis/helper";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utlis/axiosinstance";
import { API_PATHS } from "../../utlis/apiPaths";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: "" },
    }));
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      const { user, token } = response.data;

      if (token && user) {
        login(user, token);

        setFormState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          errors: {},
        }));

        setTimeout(() => {
          const redirectPath = user.role === "employer" ? "/employer-dashboard" : "/dashboard";
          window.location.href = redirectPath;
        }, 1500);
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            "Login failed. Please check your credentials.",
        },
      }));
    }
  };

  if (formState.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-2xl shadow-xl max-w-md w-full text-center border border-[#E9ECEF]"
        >
          <div className="w-20 h-20 bg-[#E7F3E8] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#0A6642]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1D2226] mb-2">Welcome Back! 👋</h2>
          <p className="text-[#5E6F8D] mb-6">You have been successfully logged in.</p>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0A6642] border-t-transparent"></div>
            <span className="text-sm text-[#5E6F8D]">Redirecting to your dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9] relative overflow-hidden px-4">
      {/* Decorative background glows - Green theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E7F3E8] rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B8D9BF] rounded-full blur-[120px] opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white rounded-2xl shadow-xl border border-[#E9ECEF] w-full max-w-md overflow-hidden"
      >
        {/* Header - Green LinkedIn Style */}
        <div className="bg-gradient-to-r from-[#0A6642] to-[#085433] p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg border border-white/20">
            <Briefcase className="text-white w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#B8D9BF] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Down2Work
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-[#B8D9BF] text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Submit Error */}
            <AnimatePresence>
              {formState.errors.submit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-[#FDE7E9] border border-[#F5C6CB] flex items-center gap-2 text-[#B2405A] text-sm font-medium"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  {formState.errors.submit}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field - Green Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5E6F8D] group-focus-within:text-[#0A6642] transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-[#F8FAFB] transition-all outline-none text-sm ${
                    formState.errors.email
                      ? "border-[#B2405A] focus:border-[#B2405A]"
                      : "border-[#E9ECEF] focus:border-[#0A6642] focus:bg-white"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {formState.errors.email && (
                <p className="text-[#B2405A] text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formState.errors.email}
                </p>
              )}
            </div>

            {/* Password field - Green Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5E6F8D] group-focus-within:text-[#0A6642] transition-colors" />
                <input
                  type={formState.showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-[#F8FAFB] transition-all outline-none text-sm ${
                    formState.errors.password
                      ? "border-[#B2405A] focus:border-[#B2405A]"
                      : "border-[#E9ECEF] focus:border-[#0A6642] focus:bg-white"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormState((p) => ({ ...p, showPassword: !p.showPassword }))
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E6F8D] hover:text-[#1D2226] transition-colors"
                >
                  {formState.showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formState.errors.password && (
                <p className="text-[#B2405A] text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formState.errors.password}
                </p>
              )}
            </div>

            {/* Remember Me - Green Theme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#5E6F8D] cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 text-[#0A6642] border-[#E9ECEF] rounded focus:ring-[#0A6642]"
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-[#0A6642] hover:text-[#085433] font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button - Green Theme */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-[#0A6642] text-white py-3.5 rounded-xl font-semibold hover:bg-[#085433] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm hover:shadow-md"
            >
              {formState.loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Sign Up Link - Green Theme */}
            <div className="text-center pt-2">
              <p className="text-[#5E6F8D] text-sm">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-[#0A6642] hover:text-[#085433] font-semibold transition-colors"
                >
                  Create one here
                </a>
              </p>
            </div>

            {/* Brand Footer */}
            <div className="text-center pt-4 border-t border-[#E9ECEF]">
              <p className="text-[10px] text-[#5E6F8D] tracking-widest uppercase font-semibold">
                Down2Work · Professional Network
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;