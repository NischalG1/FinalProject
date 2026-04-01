// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   User,
//   Mail,
//   Lock,
//   Upload,
//   Eye,
//   EyeOff,
//   UserCheck,
//   Building2,
//   CheckCircle,
//   Loader,
//   Briefcase,
//   XCircle,
//   ArrowRight,
// } from "lucide-react";
// import { validateEmail, validatePassword } from "../../utlis/helper";
// import { useAuth } from "../../context/AuthContext";

// const SignUp = () => {
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     role: "",
//     avatar: null,
//   });

//   const [formState, setFormState] = useState({
//     loading: false,
//     errors: {},
//     showPassword: false,
//     avatarPreview: null,
//     success: false,
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (formState.errors[name]) {
//       setFormState((prev) => ({
//         ...prev,
//         errors: { ...prev.errors, [name]: "" },
//       }));
//     }
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         setFormState((prev) => ({
//           ...prev,
//           errors: { ...prev.errors, avatar: "Max 5MB allowed" },
//         }));
//         return;
//       }
//       setFormData((prev) => ({ ...prev, avatar: file }));
//       const reader = new FileReader();
//       reader.onload = (e) =>
//         setFormState((prev) => ({ ...prev, avatarPreview: e.target.result }));
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateForm = () => {
//     const errors = {
//       fullName: !formData.fullName ? "Full name is required" : "",
//       email: validateEmail(formData.email),
//       password: validatePassword(formData.password),
//       role: !formData.role ? "Please select a role" : "",
//     };
//     Object.keys(errors).forEach((key) => {
//       if (!errors[key]) delete errors[key];
//     });
//     setFormState((prev) => ({ ...prev, errors }));
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setFormState((prev) => ({ ...prev, loading: true }));
//     try {
//       let avatarUrl = "";

//       // Upload image if present
//       if (formData.avatar) {
//         const imgUploadRes = await uploadImage(formData.avatar);
//         avatarUrl = imgUploadRes.imageUrl || "";
//       }

//       const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
//         name: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//         avatar: avatarUrl || "",
//       });

//       // Handle successful registration
//       setFormState((prev) => ({
//         ...prev,
//         loading: false,
//         success: true,
//         errors: {},
//       }));

//       const { token } = response.data;

//       if (token) {
//         login(response.data, token);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       setFormState((prev) => ({ ...prev, loading: false, success: true }));
//     } catch (error) {
//       setFormState((prev) => ({
//         ...prev,
//         loading: false,
//         errors: { submit: "Registration failed." },
//       }));
//       const { token } = response.data;

//       if (token) {
//         login(response.data, token);

//         // Redirect based on role
//         setTimeout(() => {
//           window.location.href =
//             formData.role === "employer" ? "/employer-dashboard" : "/find-jobs";
//         }, 2000);
//       }
//     }
//   };

//   if (formState.success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-white"
//         >
//           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <CheckCircle className="w-12 h-12 text-green-500" />
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
//             Success!
//           </h2>
//           <p className="text-gray-500 font-medium mb-6">
//             Your account has been created. Redirecting...
//           </p>
//           <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent mx-auto rounded-full" />
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden py-10 px-4">
//       {/* Background glows */}
//       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60" />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="relative z-10 bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white w-full max-w-md"
//       >
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
//             <Briefcase className="text-white w-7 h-7" />
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//             Create Account
//           </h2>
//           <p className="text-gray-500 mt-2 font-medium">
//             Join our professional community
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <AnimatePresence>
//             {formState.errors.submit && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm font-medium"
//               >
//                 <XCircle className="w-4 h-4 shrink-0" />
//                 {formState.errors.submit}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Full Name - Next Line */}
//           <div className="space-y-1">
//             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
//               Full Name
//             </label>
//             <div className="relative group">
//               <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleInputChange}
//                 className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
//                   formState.errors.fullName
//                     ? "border-red-200"
//                     : "border-transparent focus:border-blue-500 focus:bg-white"
//                 }`}
//                 placeholder="Enter your full name"
//               />
//             </div>
//           </div>

//           {/* Email - Next Line */}
//           <div className="space-y-1">
//             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
//               Email Address
//             </label>
//             <div className="relative group">
//               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
//                   formState.errors.email
//                     ? "border-red-200"
//                     : "border-transparent focus:border-blue-500 focus:bg-white"
//                 }`}
//                 placeholder="Enter your email"
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div className="space-y-1">
//             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
//               Password
//             </label>
//             <div className="relative group">
//               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//               <input
//                 type={formState.showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
//                   formState.errors.password
//                     ? "border-red-200"
//                     : "border-transparent focus:border-blue-500 focus:bg-white"
//                 }`}
//                 placeholder="Create a password"
//               />
//               <button
//                 type="button"
//                 onClick={() =>
//                   setFormState((p) => ({ ...p, showPassword: !p.showPassword }))
//                 }
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
//               >
//                 {formState.showPassword ? (
//                   <EyeOff size={20} />
//                 ) : (
//                   <Eye size={20} />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Avatar Section */}
//           <div className="flex items-center gap-4 py-3 px-4 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200">
//             <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border">
//               {formState.avatarPreview ? (
//                 <img
//                   src={formState.avatarPreview}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <User className="text-gray-200" />
//               )}
//             </div>
//             <div className="flex-1">
//               <input
//                 type="file"
//                 id="signup-avatar"
//                 className="hidden"
//                 onChange={handleAvatarChange}
//               />
//               <label
//                 htmlFor="signup-avatar"
//                 className="text-xs font-bold text-blue-600 cursor-pointer flex items-center gap-1 hover:text-blue-700"
//               >
//                 <Upload size={14} /> Upload Photo
//               </label>
//               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
//                 Max 5MB (JPG/PNG)
//               </p>
//             </div>
//           </div>

//           {/* Role Selection */}
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
//               I am a
//             </label>
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 type="button"
//                 onClick={() => setFormData({ ...formData, role: "jobseeker" })}
//                 className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${
//                   formData.role === "jobseeker"
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-transparent bg-gray-50/50 hover:bg-white"
//                 }`}
//               >
//                 <UserCheck
//                   size={24}
//                   className={
//                     formData.role === "jobseeker"
//                       ? "text-blue-600"
//                       : "text-gray-300"
//                   }
//                 />
//                 <span className="text-xs font-bold text-gray-700">
//                   Job Seeker
//                 </span>
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({ ...formData, role: "employer" })}
//                 className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${
//                   formData.role === "employer"
//                     ? "border-indigo-500 bg-indigo-50"
//                     : "border-transparent bg-gray-50/50 hover:bg-white"
//                 }`}
//               >
//                 <Building2
//                   size={24}
//                   className={
//                     formData.role === "employer"
//                       ? "text-indigo-600"
//                       : "text-gray-300"
//                   }
//                 />
//                 <span className="text-xs font-bold text-gray-700">
//                   Employer
//                 </span>
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={formState.loading}
//             className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
//           >
//             {formState.loading ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 <span>Processing...</span>
//               </>
//             ) : (
//               <>
//                 <span>Create Account</span>
//                 <ArrowRight size={18} />
//               </>
//             )}
//           </button>

//           {/* Login Link */}
//           <div className="text-center mt-6">
//             <p className="text-gray-500 text-sm font-medium">
//               Already have an account?{" "}
//               <a
//                 href="/login"
//                 className="text-blue-600 font-bold hover:text-blue-700 underline-offset-4 hover:underline transition-all"
//               >
//                 Sign In here
//               </a>
//             </p>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default SignUp;

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

      // Upload image if present
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

      const { token } = response.data;

      if (token) {
        login(response.data, token);
      }

      // Handle successful registration
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));

      // Redirect based on role - jobseeker goes to /find-jobs, employer goes to /employer-dashboard
      setTimeout(() => {
        const redirectPath = formData.role === "employer" ? "/employer-dashboard" : "/find-jobs";
        window.location.href = redirectPath;
      }, 2000);
    } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-white"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Success!
          </h2>
          <p className="text-gray-500 font-medium mb-6">
            Your account has been created. Redirecting...
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent mx-auto rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden py-10 px-4">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="text-white w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Join our professional community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence>
            {formState.errors.submit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm font-medium"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                {formState.errors.submit}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
                  formState.errors.fullName
                    ? "border-red-200"
                    : "border-transparent focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
                  formState.errors.email
                    ? "border-red-200"
                    : "border-transparent focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-gray-50/50 transition-all outline-none ${
                  formState.errors.password
                    ? "border-red-200"
                    : "border-transparent focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((p) => ({ ...p, showPassword: !p.showPassword }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {formState.showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex items-center gap-4 py-3 px-4 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border">
              {formState.avatarPreview ? (
                <img
                  src={formState.avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-gray-200" />
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
                className="text-xs font-bold text-blue-600 cursor-pointer flex items-center gap-1 hover:text-blue-700"
              >
                <Upload size={14} /> Upload Photo
              </label>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                Max 5MB (JPG/PNG)
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "jobseeker" })}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.role === "jobseeker"
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent bg-gray-50/50 hover:bg-white"
                }`}
              >
                <UserCheck
                  size={24}
                  className={
                    formData.role === "jobseeker"
                      ? "text-blue-600"
                      : "text-gray-300"
                  }
                />
                <span className="text-xs font-bold text-gray-700">
                  Job Seeker
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "employer" })}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.role === "employer"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-transparent bg-gray-50/50 hover:bg-white"
                }`}
              >
                <Building2
                  size={24}
                  className={
                    formData.role === "employer"
                      ? "text-indigo-600"
                      : "text-gray-300"
                  }
                />
                <span className="text-xs font-bold text-gray-700">
                  Employer
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formState.loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 font-bold hover:text-blue-700 underline-offset-4 hover:underline transition-all"
              >
                Sign In here
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignUp;
