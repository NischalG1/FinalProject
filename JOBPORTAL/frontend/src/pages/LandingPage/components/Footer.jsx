import React from "react";
import { Briefcase, Heart, Github, Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-white text-gray-900 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content - LinkedIn Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#0a66c2] rounded-lg flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a66c2]">JobPortal</h3>
              </div>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Connecting professionals with innovative companies worldwide.
                Your career success is our mission.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#0a66c2] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">For Job Seekers</h4>
              <ul className="space-y-3">
                <li><a href="/find-jobs" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">Find Jobs</a></li>
                <li><a href="/saved-jobs" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">Saved Jobs</a></li>
                <li><a href="/profile" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">My Profile</a></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">For Employers</h4>
              <ul className="space-y-3">
                <li><a href="/post-job" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">Post a Job</a></li>
                <li><a href="/manage-jobs" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">Manage Jobs</a></li>
                <li><a href="/company-profile" className="text-sm text-gray-500 hover:text-[#0a66c2] transition-colors">Company Profile</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright - LinkedIn Style */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} JobPortal. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[#0a66c2] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#0a66c2] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#0a66c2] transition-colors">Contact</a>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Time To Program
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;