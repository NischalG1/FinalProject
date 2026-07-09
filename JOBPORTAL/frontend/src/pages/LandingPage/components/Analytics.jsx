import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, Target, BarChart3, Rocket, Award, Zap } from "lucide-react";

const Analytics = () => {
  const stats = [
    {
      icon: Users,
      title: "Active Users",
      value: "2.4M",
      growth: "+15%",
      color: "blue",
      bgClass: "bg-blue-50",
      textClass: "text-[#0a66c2]",
      borderClass: "border-blue-200",
    },
    {
      icon: Briefcase,
      title: "Jobs Posted",
      value: "150K",
      growth: "+22%",
      color: "purple",
      bgClass: "bg-purple-50",
      textClass: "text-purple-600",
      borderClass: "border-purple-200",
    },
    {
      icon: Target,
      title: "Successful Hires",
      value: "89K",
      growth: "+18%",
      color: "emerald",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-200",
    },
    {
      icon: TrendingUp,
      title: "Match Rate",
      value: "94%",
      growth: "+8%",
      color: "orange",
      bgClass: "bg-orange-50",
      textClass: "text-orange-600",
      borderClass: "border-orange-200",
    },
  ];

  return (
    <section className="py-20 bg-[#f3f2ef] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-4">
            <BarChart3 className="w-4 h-4 text-[#0a66c2]" />
            <span className="text-sm font-medium text-[#0a66c2]">Platform Analytics</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Platform{" "}
            <span className="bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent">
              Analytics
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Real-time insights and data-driven results showcasing the power
            of our platform in connecting talent with opportunities.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Top Row: Icon & Growth */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgClass} rounded-xl flex items-center justify-center ring-4 ring-white transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.textClass}`} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.growth}
                  </span>
                </div>
              </div>

              {/* Data Row */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                  {stat.title}
                </p>
              </div>

              {/* Decorative hover line */}
              <div className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-${stat.color}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Analytics;