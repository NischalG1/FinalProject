import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, Target } from "lucide-react";

const Analytics = () => {
  const stats = [
    {
      icon: Users,
      title: "Active Users",
      value: "2.4M",
      growth: "+15%",
      color: "blue",
      classes: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      icon: Briefcase,
      title: "Jobs Posted",
      value: "150K",
      growth: "+22%",
      color: "purple",
      classes: "bg-purple-50 text-purple-600 ring-purple-100",
    },
    {
      icon: Target,
      title: "Successful Hires",
      value: "89K",
      growth: "+18%",
      color: "green",
      classes: "bg-green-50 text-green-600 ring-green-100",
    },
    {
      icon: TrendingUp,
      title: "Match Rate",
      value: "94%",
      growth: "+8%",
      color: "orange",
      classes: "bg-orange-50 text-orange-600 ring-orange-100",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Platform{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analytics
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real-time insights and data-driven results showcasing the power
            of our platform in connecting talent with opportunities.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              {/* Top Row: Icon & Growth */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 ${stat.classes} rounded-2xl flex items-center justify-center ring-4 transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="w-7 h-7" />
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
                <h3 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">
                  {stat.title}
                </p>
              </div>

              {/* Decorative hover line */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Analytics;