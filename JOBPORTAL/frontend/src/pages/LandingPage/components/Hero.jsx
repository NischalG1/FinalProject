import { motion } from "framer-motion";
import React from "react";
import {
  Search,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  Target,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Active Users", value: "2.4M+" },
    { icon: Building2, label: "Companies", value: "50k+" },
    { icon: TrendingUp, label: "Jobs Posted", value: "150k+" },
  ];

  return (
    <section className="pt-24 pb-20 bg-[#F3F6F9] min-h-screen flex items-center relative overflow-hidden">
      {/* Decorative Background - Green Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#E7F3E8] rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#B8D9BF] rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#E7F3E8] to-[#B8D9BF] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E7F3E8] rounded-full border border-[#B8D9BF] mb-6">
              <Sparkles className="w-4 h-4 text-[#0A6642]" />
              <span className="text-sm font-medium text-[#0A6642]">
                AI-Powered Job Matching
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0A6642] uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Down2Work
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D2226] mb-6 leading-tight">
              Find Your Dream Job or{" "}
              <span className="block bg-gradient-to-r from-[#0A6642] to-[#085433] bg-clip-text text-transparent mt-2">
                Perfect Hire
              </span>
            </h1>
            <p className="text-base md:text-xl text-[#5E6F8D] mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect talented professionals with innovative companies. Your next
              career move or perfect candidate is just one click away.
            </p>
          </motion.div>

          {/* CTA Buttons - Green Theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-[#0A6642] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#085433] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="w-5 h-5" />
              <span>Find Jobs</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-[#E9ECEF] text-[#5E6F8D] px-8 py-4 rounded-full font-semibold text-lg hover:border-[#0A6642] hover:text-[#0A6642] transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-3"
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                )
              }
            >
              <Building2 className="w-5 h-5" />
              <span>Post a Job</span>
            </motion.button>
          </motion.div>

          {/* Stats - LinkedIn Green Theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="flex flex-col items-center space-y-2 p-6 bg-white rounded-2xl shadow-sm border border-[#E9ECEF] hover:shadow-md hover:border-[#0A6642]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#E7F3E8] rounded-xl flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-[#0A6642]" />
                </div>
                <div className="text-2xl font-bold text-[#1D2226]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#5E6F8D] font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;