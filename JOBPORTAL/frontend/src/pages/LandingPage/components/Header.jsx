import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Menu, X, User, LogIn, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 bg-[#0a66c2] rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0a66c2] tracking-tight">
              JobPortal
            </span>
          </div>

          {/* Desktop Navigation - LinkedIn Style */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/find-jobs")}
              className="text-gray-600 hover:text-[#0a66c2] transition-colors font-medium text-sm cursor-pointer"
            >
              Find Jobs
            </button>
            <button
              onClick={() => {
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                );
              }}
              className="text-gray-600 hover:text-[#0a66c2] transition-colors font-medium text-sm cursor-pointer"
            >
              For Employers
            </button>
          </nav>

          {/* Auth Buttons - LinkedIn Style */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">
                  Welcome,{" "}
                  <span className="text-gray-900 font-semibold">{user?.name?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={() =>
                    navigate(
                      user?.role === "employer"
                        ? "/employer-dashboard"
                        : "/dashboard"
                    )
                  }
                  className="bg-[#0a66c2] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#004182] transition-all shadow-sm hover:shadow-md"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-600 hover:text-[#0a66c2] transition-colors font-medium text-sm px-4 py-2 rounded-full hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-[#0a66c2] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#004182] transition-all shadow-sm hover:shadow-md"
                >
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu - LinkedIn Style */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4 bg-white"
          >
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  navigate("/find-jobs");
                  setMobileMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#0a66c2] transition-colors font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                Find Jobs
              </button>
              <button
                onClick={() => {
                  navigate(
                    isAuthenticated && user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/login"
                  );
                  setMobileMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#0a66c2] transition-colors font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                For Employers
              </button>
              <div className="border-t border-gray-200 pt-3 mt-1">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      navigate(
                        user?.role === "employer"
                          ? "/employer-dashboard"
                          : "/dashboard"
                      );
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#0a66c2] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#004182] transition-all text-center"
                  >
                    Dashboard
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full border border-gray-300 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        navigate("/signup");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#0a66c2] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#004182] transition-all"
                    >
                      Join Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;