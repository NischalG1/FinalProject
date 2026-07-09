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
  Zap
} from "lucide-react";

const Features = () => {
  const jobSeekerFeatures = [
    {
      icon: Search,
      title: "Smart Job Matching",
      description:
        "AI-powered algorithm matches you with relevant opportunities based on your skills and preferences.",
    },
    {
      icon: FileText,
      title: "Resume Builder",
      description:
        "Create professional resumes with our intuitive builder and templates designed by experts.",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description:
        "Connect directly with hiring managers and recruiters through our secure messaging platform.",
    },
    {
      icon: Award,
      title: "Skill Assessment",
      description:
        "Showcase your abilities with verified skill tests and earn badges that employers trust.",
    },
  ];

  const employerFeatures = [
    {
      icon: Users,
      title: "Talent Pool Access",
      description:
        "Access our vast database of pre-screened candidates and find the perfect fit for your team.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track your hiring performance with detailed analytics and insights on candidate engagement.",
    },
    {
      icon: Shield,
      title: "Verified Candidates",
      description:
        "All candidates undergo background verification to ensure you're hiring trustworthy professionals.",
    },
    {
      icon: Clock,
      title: "Quick Hiring",
      description:
        "Streamlined hiring process reduces time-to-hire by 60% with automated screening tools.",
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-4">
            <Sparkles className="w-4 h-4 text-[#0a66c2]" />
            <span className="text-sm font-medium text-[#0a66c2]">Platform Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Whether you're looking for your next opportunity or the perfect
            candidate, we have the tools and features to make it happen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Job Seekers Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Target className="w-6 h-6 text-[#0a66c2]" />
                For Job Seekers
              </h3>
              <div className="w-20 h-1 bg-[#0a66c2] mx-auto rounded-full" />
            </motion.div>

            <div className="space-y-6">
              {jobSeekerFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group flex items-start space-x-4 p-5 rounded-2xl hover:bg-blue-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200"
                >
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#0a66c2]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1.5">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Employers Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                For Employers
              </h3>
              <div className="w-20 h-1 bg-purple-600 mx-auto rounded-full" />
            </motion.div>

            <div className="space-y-6">
              {employerFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group flex items-start space-x-4 p-5 rounded-2xl hover:bg-purple-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-200"
                >
                  <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1.5">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;