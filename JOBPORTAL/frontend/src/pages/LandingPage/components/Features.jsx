import React from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Clock, 
  Award,
  Sparkles,
  Target,
  Zap,
  ShieldCheck,
} from "lucide-react";

const Features = () => {
  const jobSeekerFeatures = [
    {
      icon: Search,
      title: "Smart Job Matching",
      description:
        "AI-powered algorithm matches you with relevant opportunities based on your skills and preferences.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: FileText,
      title: "Resume Builder",
      description:
        "Create professional resumes with our intuitive builder and templates designed by experts.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description:
        "Connect directly with hiring managers and recruiters through our secure messaging platform.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: Award,
      title: "Skill Assessment",
      description:
        "Showcase your abilities with verified skill tests and earn badges that employers trust.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
  ];

  const employerFeatures = [
    {
      icon: Users,
      title: "Talent Pool Access",
      description:
        "Access our vast database of pre-screened candidates and find the perfect fit for your team.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track your hiring performance with detailed analytics and insights on candidate engagement.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: Shield,
      title: "Verified Candidates",
      description:
        "All candidates undergo background verification to ensure you're hiring trustworthy professionals.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
    {
      icon: Clock,
      title: "Quick Hiring",
      description:
        "Streamlined hiring process reduces time-to-hire by 60% with automated screening tools.",
      bgColor: "bg-[#E7F3E8]",
      iconColor: "text-[#0A6642]",
      hoverBg: "hover:bg-[#E7F3E8]",
      hoverBorder: "hover:border-[#B8D9BF]",
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Background - Green Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#E7F3E8] rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#B8D9BF] rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E7F3E8] rounded-full border border-[#B8D9BF] mb-4">
            <Sparkles className="w-4 h-4 text-[#0A6642]" />
            <span className="text-sm font-medium text-[#0A6642]">Platform Features</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0A6642] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Down2Work
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1D2226] mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#0A6642] to-[#085433] bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-[#5E6F8D] max-w-3xl mx-auto leading-relaxed">
            Whether you're looking for your next opportunity or the perfect
            candidate, we have the tools and features to make it happen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Job Seekers Section - Green Theme */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h3 className="text-2xl font-bold text-[#1D2226] mb-3 flex items-center justify-center gap-2">
                <Target className="w-6 h-6 text-[#0A6642]" />
                For Job Seekers
              </h3>
              <div className="w-20 h-1 bg-[#0A6642] mx-auto rounded-full" />
            </motion.div>

            <div className="space-y-6">
              {jobSeekerFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`group flex items-start space-x-4 p-5 rounded-2xl ${feature.hoverBg} transition-all duration-300 cursor-pointer border border-transparent ${feature.hoverBorder}`}
                >
                  <div className={`shrink-0 w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:bg-[#B8D9BF] transition-colors`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1D2226] mb-1.5">
                      {feature.title}
                    </h4>
                    <p className="text-[#5E6F8D] leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Employers Section - Green Theme */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h3 className="text-2xl font-bold text-[#1D2226] mb-3 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-[#0A6642]" />
                For Employers
              </h3>
              <div className="w-20 h-1 bg-[#0A6642] mx-auto rounded-full" />
            </motion.div>

            <div className="space-y-6">
              {employerFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`group flex items-start space-x-4 p-5 rounded-2xl ${feature.hoverBg} transition-all duration-300 cursor-pointer border border-transparent ${feature.hoverBorder}`}
                >
                  <div className={`shrink-0 w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:bg-[#B8D9BF] transition-colors`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1D2226] mb-1.5">
                      {feature.title}
                    </h4>
                    <p className="text-[#5E6F8D] leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-10 border-t border-[#E9ECEF]"
        >
          <p className="text-[#5E6F8D] text-sm mb-4">
            Ready to take the next step in your career?
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-[#0A6642] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#085433] transition-all shadow-sm hover:shadow-md"
          >
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;