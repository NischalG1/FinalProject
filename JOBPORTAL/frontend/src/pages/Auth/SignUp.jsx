import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle,
  Loader,
  Briefcase,
  XCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { validateEmail, validatePassword } from "../../utlis/helper";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utlis/axiosinstance";
import { API_PATHS } from "../../utlis/apiPaths";
import uploadImage from "../../utlis/uploadImage";

const SignUp = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    avatar: null,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormState((prev) => ({
          ...prev,
          errors: { ...prev.errors, avatar: "Max 5MB allowed" },
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) =>
        setFormState((prev) => ({ ...prev, avatarPreview: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName ? "Full name is required" : "",
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? "Please select a role" : "",
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
      let avatarUrl = "";

      if (formData.avatar) {
        const imgUploadRes = await uploadImage(formData.avatar);
        avatarUrl = imgUploadRes?.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: avatarUrl,
      });

      const { user, accessToken, refreshToken } = response.data;

      if (accessToken && user) {
        // Store both tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        login(user, accessToken);
      }

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      setTimeout(() => {
        const redirectPath = formData.role === "employer" ? "/employer-dashboard" : "/find-jobs";
        window.location.href = redirectPath;
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error?.response?.data?.message ||
            "Registration failed. Please try again.",
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
          <h2 className="text-2xl font-bold text-[#1D2226] mb-2">Account Created! 🎉</h2>
          <p className="text-[#5E6F8D] mb-6">Your account has been successfully created.</p>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0A6642] border-t-transparent"></div>
            <span className="text-sm text-[#5E6F8D]">Redirecting to your dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9] relative overflow-hidden py-10 px-4">
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
          <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-[#B8D9BF] text-sm mt-1">Join our professional community</p>
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

            {/* Full Name - Green Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5E6F8D] group-focus-within:text-[#0A6642] transition-colors" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-[#F8FAFB] transition-all outline-none text-sm ${
                    formState.errors.fullName
                      ? "border-[#B2405A] focus:border-[#B2405A]"
                      : "border-[#E9ECEF] focus:border-[#0A6642] focus:bg-white"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {formState.errors.fullName && (
                <p className="text-[#B2405A] text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {formState.errors.fullName}
                </p>
              )}
            </div>

            {/* Email - Green Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">Email Address</label>
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
                  <XCircle className="w-3.5 h-3.5" />
                  {formState.errors.email}
                </p>
              )}
            </div>

            {/* Password - Green Theme - FIXED: Added styles to hide browser's native toggle */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5E6F8D] group-focus-within:text-[#0A6642] transition-colors" />
                <input
                  type={formState.showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-[#F8FAFB] transition-all outline-none text-sm [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:invisible [&::-webkit-credentials-auto-fill-button]:pointer-events-none [&::-webkit-show-password-button]:hidden [&::-webkit-show-password-button]:invisible [&::-webkit-show-password-button]:pointer-events-none ${
                    formState.errors.password
                      ? "border-[#B2405A] focus:border-[#B2405A]"
                      : "border-[#E9ECEF] focus:border-[#0A6642] focus:bg-white"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormState((p) => ({ ...p, showPassword: !p.showPassword }))
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E6F8D] hover:text-[#1D2226] transition-colors z-10"
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
                  <XCircle className="w-3.5 h-3.5" />
                  {formState.errors.password}
                </p>
              )}
              <p className="text-xs text-[#5E6F8D] mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Avatar Section - Green Theme */}
            <div className="flex items-center gap-4 py-3 px-4 bg-[#F8FAFB] rounded-xl border-2 border-dashed border-[#E9ECEF]">
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-[#E9ECEF]">
                {formState.avatarPreview ? (
                  <img
                    src={formState.avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-[#5E6F8D] w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="signup-avatar"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarChange}
                />
                <label
                  htmlFor="signup-avatar"
                  className="text-sm font-medium text-[#0A6642] cursor-pointer flex items-center gap-2 hover:text-[#085433] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Profile Photo
                </label>
                <p className="text-xs text-[#5E6F8D] mt-0.5">JPG, PNG • Max 5MB</p>
              </div>
            </div>

            {/* Role Selection - Green Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1D2226]">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "jobseeker" })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === "jobseeker"
                      ? "border-[#0A6642] bg-[#E7F3E8] shadow-sm"
                      : "border-[#E9ECEF] bg-[#F8FAFB] hover:bg-[#F3F6F9]"
                  }`}
                >
                  <UserCheck
                    size={24}
                    className={
                      formData.role === "jobseeker"
                        ? "text-[#0A6642]"
                        : "text-[#5E6F8D]"
                    }
                  />
                  <span className={`text-sm font-semibold ${
                    formData.role === "jobseeker"
                      ? "text-[#0A6642]"
                      : "text-[#5E6F8D]"
                  }`}>
                    Job Seeker
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "employer" })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === "employer"
                      ? "border-[#0A6642] bg-[#E7F3E8] shadow-sm"
                      : "border-[#E9ECEF] bg-[#F8FAFB] hover:bg-[#F3F6F9]"
                  }`}
                >
                  <Building2
                    size={24}
                    className={
                      formData.role === "employer"
                        ? "text-[#0A6642]"
                        : "text-[#5E6F8D]"
                    }
                  />
                  <span className={`text-sm font-semibold ${
                    formData.role === "employer"
                      ? "text-[#0A6642]"
                      : "text-[#5E6F8D]"
                  }`}>
                    Employer
                  </span>
                </button>
              </div>
              {formState.errors.role && (
                <p className="text-[#B2405A] text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {formState.errors.role}
                </p>
              )}
            </div>

            {/* Submit Button - Green Theme */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-[#0A6642] text-white py-3.5 rounded-xl font-semibold hover:bg-[#085433] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm hover:shadow-md mt-2"
            >
              {formState.loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Login Link - Green Theme */}
            <div className="text-center pt-2">
              <p className="text-[#5E6F8D] text-sm">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#0A6642] hover:text-[#085433] font-semibold transition-colors"
                >
                  Sign In here
                </a>
              </p>
            </div>

            {/* Brand Footer - Green Theme */}
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

export default SignUp;