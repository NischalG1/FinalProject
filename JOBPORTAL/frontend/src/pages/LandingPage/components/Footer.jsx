import React from "react";
import { Briefcase, Heart, Github, Twitter, Linkedin, Youtube, Sparkles, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#1D2226] text-white border-t border-[#2D3338]">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content - LinkedIn Green Theme */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand - Down2Work */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#0A6642] rounded-lg flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Down2<span className="text-[#0A6642]">Work</span></h3>
                  <p className="text-[10px] text-[#5E6F8D] tracking-widest uppercase font-semibold mt-0.5">
                    Professional Network
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#8A9BB5] max-w-md leading-relaxed">
                Connecting professionals with innovative companies worldwide.
                Your career success is our mission.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <a href="#" className="text-[#5E6F8D] hover:text-[#0A6642] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#5E6F8D] hover:text-[#0A6642] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#5E6F8D] hover:text-[#0A6642] transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#5E6F8D] hover:text-[#0A6642] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links - Green Theme */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">For Job Seekers</h4>
              <ul className="space-y-3">
                <li><a href="/find-jobs" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">Find Jobs</a></li>
                <li><a href="/saved-jobs" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">Saved Jobs</a></li>
                <li><a href="/profile" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">My Profile</a></li>
              </ul>
            </div>

            {/* For Employers - Green Theme */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">For Employers</h4>
              <ul className="space-y-3">
                <li><a href="/post-job" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">Post a Job</a></li>
                <li><a href="/manage-jobs" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">Manage Jobs</a></li>
                <li><a href="/company-profile" className="text-sm text-[#8A9BB5] hover:text-[#0A6642] transition-colors">Company Profile</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright - LinkedIn Green Theme */}
          <div className="pt-6 border-t border-[#2D3338] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#5E6F8D]">
                © {new Date().getFullYear()} Down2Work. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#5E6F8D]">
              <a href="#" className="hover:text-[#0A6642] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#0A6642] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#0A6642] transition-colors">Contact</a>
            </div>
        
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;