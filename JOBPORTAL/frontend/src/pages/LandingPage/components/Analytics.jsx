import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  BarChart3, 
  Rocket, 
  Award, 
  Zap,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const Analytics = () => {
  const stats = [
    {
      icon: Users,
      title: "Active Users",
      value: "2.4M",
      growth: "+15%",
      bgClass: "bg-[#E7F3E8]",
      textClass: "text-[#0A6642]",
      borderClass: "border-[#B8D9BF]",
    },
    {
      icon: Briefcase,
      title: "Jobs Posted",
      value: "150K",
      growth: "+22%",
      bgClass: "bg-[#E7F3E8]",
      textClass: "text-[#0A6642]",
      borderClass: "border-[#B8D9BF]",
    },
    {
      icon: Target,
      title: "Successful Hires",
      value: "89K",
      growth: "+18%",
      bgClass: "bg-[#E7F3E8]",
      textClass: "text-[#0A6642]",
      borderClass: "border-[#B8D9BF]",
    },
    {
      icon: TrendingUp,
      title: "Match Rate",
      value: "94%",
      growth: "+8%",
      bgClass: "bg-[#E7F3E8]",
      textClass: "text-[#0A6642]",
      borderClass: "border-[#B8D9BF]",
    },
  ];

  return (
    <section className="py-20 bg-[#F3F6F9] relative overflow-hidden">
      {/* Decorative Background - Green Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E7F3E8] rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B8D9BF] rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#B8D9BF] mb-4">
            <BarChart3 className="w-4 h-4 text-[#0A6642]" />
            <span className="text-sm font-medium text-[#0A6642]">Platform Analytics</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0A6642] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Down2Work
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1D2226] mb-6">
            Platform{" "}
            <span className="bg-gradient-to-r from-[#0A6642] to-[#085433] bg-clip-text text-transparent">
              Analytics
            </span>
          </h2>
          <p className="text-lg text-[#5E6F8D] max-w-2xl mx-auto leading-relaxed">
            Real-time insights and data-driven results showcasing the power
            of our platform in connecting talent with opportunities.
          </p>
        </motion.div>

        {/* Stats Cards - Green Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="group relative bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm hover:shadow-xl hover:border-[#0A6642]/30 transition-all duration-300"
            >
              {/* Top Row: Icon & Growth */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgClass} rounded-xl flex items-center justify-center ring-4 ring-white transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.textClass}`} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#0A6642] text-xs font-bold bg-[#E7F3E8] px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.growth}
                  </span>
                </div>
              </div>

              {/* Data Row */}
              <div>
                <h3 className="text-3xl font-bold text-[#1D2226] mb-1 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-[#5E6F8D] font-medium text-xs uppercase tracking-wider">
                  {stat.title}
                </p>
              </div>

              {/* Decorative hover line - Green Theme */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#0A6642] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Trust Badge - Green Theme */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-[#E9ECEF] shadow-sm">
            <Sparkles className="w-5 h-5 text-[#0A6642]" />
            <span className="text-sm text-[#5E6F8D] font-medium">
              Trusted by <strong className="text-[#1D2226]">5,000+</strong> companies worldwide
            </span>
            <div className="flex -space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#E7F3E8] border-2 border-white flex items-center justify-center text-[#0A6642] text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Analytics;