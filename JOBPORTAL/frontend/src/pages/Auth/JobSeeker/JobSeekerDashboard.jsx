import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Bookmark,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Search,
  Calendar,
  MapPin,
  Building2,
  User,
  Award,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import { useAuth } from "../../../context/AuthContext";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import moment from "moment";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState({
    hasProfile: true,
    message: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data function - wrapped in useCallback to prevent infinite loops
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch dashboard overview and recommendations in parallel
      const [overviewRes, recsRes] = await Promise.allSettled([
        axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW),
        axiosInstance.get(API_PATHS.JOBS.GET_RECOMMENDATIONS),
      ]);

      if (overviewRes.status === "fulfilled") {
        setDashboardData(overviewRes.value.data);
      }

      if (recsRes.status === "fulfilled") {
        setRecommendedJobs(recsRes.value.data.recommendations || []);
        setRecommendationMeta({
          hasProfile: recsRes.value.data.hasProfile,
          message: recsRes.value.data.message || "",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data",
      );
      // Set empty data structure to prevent crashes
      setDashboardData({
        counts: {
          totalApplications: 0,
          applicationsByStatus: {
            Applied: 0,
            "In Review": 0,
            Accepted: 0,
            Rejected: 0,
          },
          totalSavedJobs: 0,
          trends: { applications: 0, savedJobs: 0 },
        },
        data: { recentApplications: [], recentSavedJobs: [] },
      });
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it only uses setState functions

  // If role is undefined, default to jobseeker and update context
  // This must be called BEFORE any conditional returns
  useEffect(() => {
    if (user && !user.role) {
      console.warn(
        "[JobSeekerDashboard] User role is undefined, defaulting to jobseeker and updating context",
      );
      updateUser({ ...user, role: "jobseeker" });
    }
  }, [user, updateUser]);

  // Fetch dashboard data when user is ready
  useEffect(() => {
    console.log("[JobSeekerDashboard] Effect triggered:", {
      authLoading,
      hasUser: !!user,
      userRole: user?.role,
      userId: user?._id,
    });

    if (!authLoading) {
      if (user && (user.role === "jobseeker" || !user.role)) {
        // Allow if role is jobseeker or undefined (will be fixed by previous useEffect)
        fetchDashboardData();
      } else if (!user) {
        console.log("[JobSeekerDashboard] No user, stopping loading");
        setLoading(false);
      } else {
        console.log("[JobSeekerDashboard] User role mismatch:", user?.role);
        setLoading(false);
      }
    }
  }, [authLoading, user, fetchDashboardData]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user exists
  if (!user) {
    console.log("[JobSeekerDashboard] No user found");
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Not Authenticated
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access this page.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user role is valid for jobseeker dashboard
  // Allow through if role is undefined (will be fixed by useEffect above)
  if (user.role && user.role !== "jobseeker") {
    console.log("[JobSeekerDashboard] Role mismatch - user role:", user.role);
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              This page is only for job seekers. Your role: {user.role}
            </p>
            <button
              onClick={() => navigate("/find-jobs")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Go to Find Jobs
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.counts || {
    totalApplications: 0,
    applicationsByStatus: {
      Applied: 0,
      "In Review": 0,
      Accepted: 0,
      Rejected: 0,
    },
    totalSavedJobs: 0,
    trends: { applications: 0, savedJobs: 0 },
  };

  const recentApplications = dashboardData?.data?.recentApplications || [];
  const recentSavedJobs = dashboardData?.data?.recentSavedJobs || [];

  const statusColors = {
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    "In Review": "bg-amber-50 text-amber-700 border-amber-200",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statusIcons = {
    Applied: Clock,
    "In Review": Clock,
    Accepted: CheckCircle,
    Rejected: XCircle,
  };

  const renderTrend = (value) => {
    if (value === 0 || value === null || value === undefined) return null;
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-emerald-600" : "text-red-600";

    return (
      <div
        className={`flex items-center gap-1 ${colorClass} bg-white/60 px-2 py-1 rounded-full`}
      >
        <Icon className="w-3 h-3" />
        <span className="text-xs font-semibold">{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                      Welcome back, {user.name?.split(" ")[0] || "Job Seeker"}!
                      👋
                    </h1>
                    <p className="text-gray-600 font-medium">
                      Here's your job search overview
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/find-jobs")}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Search className="w-5 h-5" />
                    Browse Jobs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Applications */}
            <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  {renderTrend(stats.trends?.applications)}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalApplications || 0}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Activity className="w-3 h-3" />
                    <span>Active job search</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Bookmark className="w-7 h-7 text-white" />
                  </div>
                  {renderTrend(stats.trends?.savedJobs)}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalSavedJobs || 0}
                </h3>
                <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Target className="w-3 h-3" />
                    <span>Jobs you're interested in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* In Review */}
            <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.applicationsByStatus?.["In Review"] || 0}
                </h3>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Activity className="w-3 h-3" />
                    <span>Being reviewed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accepted */}
            <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.applicationsByStatus?.Accepted || 0}
                </h3>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <Sparkles className="w-3 h-3" />
                    <span>Congratulations!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Jobs Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Recommended for You
                </h2>
                <p className="text-gray-600">
                  Jobs matched to your skills and preferences
                </p>
              </div>
              {recommendedJobs.length > 0 && (
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Browse All
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {!recommendationMeta.hasProfile ? (
              /* CTA when profile is incomplete */
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your skills and preferences to get personalized job
                  recommendations powered by our content-based filtering
                  algorithm.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Update Profile
                </button>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Matches Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No jobs currently match your profile. Try broadening your
                  preferences or check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 6).map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="group relative p-5 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50/30"
                  >
                    {/* Match Score Badge */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          job.matchScore >= 70
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : job.matchScore >= 40
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {job.matchScore}% match
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-start gap-3 mb-3 pr-20">
                      {job.company?.companyLogo ? (
                        <img
                          src={job.company.companyLogo}
                          alt={job.company.companyName || job.company.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-300 transition-colors shrink-0">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-0.5 group-hover:text-purple-600 transition-colors truncate text-sm">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                    </div>

                    {/* Job Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>

                    {/* Skills Tags */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full font-medium">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Salary */}
                    {(job.salaryMin || job.salaryMax) && (
                      <p className="text-xs text-gray-500 font-medium">
                        💰{" "}
                        {job.salaryMin
                          ? `$${job.salaryMin.toLocaleString()}`
                          : ""}{" "}
                        {job.salaryMin && job.salaryMax ? "–" : ""}{" "}
                        {job.salaryMax
                          ? `$${job.salaryMax.toLocaleString()}`
                          : ""}
                      </p>
                    )}

                    {/* Application Status */}
                    {job.applicationStatus && (
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            statusColors[job.applicationStatus] ||
                            "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {job.applicationStatus}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Application Status Breakdown
                </h2>
                <p className="text-gray-600">Track your application progress</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.applicationsByStatus || {}).map(
                ([status, count]) => {
                  const Icon = statusIcons[status] || FileText;
                  return (
                    <div
                      key={status}
                      className={`p-5 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${statusColors[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${statusColors[status]?.includes("blue") ? "bg-blue-100" : statusColors[status]?.includes("amber") ? "bg-amber-100" : statusColors[status]?.includes("emerald") ? "bg-emerald-100" : statusColors[status]?.includes("red") ? "bg-red-100" : "bg-gray-100"}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">{status}</span>
                      </div>
                      <p className="text-3xl font-extrabold">{count || 0}</p>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Recent Applications
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {recentApplications.length} applications
                  </p>
                </div>
                {recentApplications.length > 0 && (
                  <button
                    onClick={() => navigate("/find-jobs")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {recentApplications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Start applying to jobs that match your skills and interests
                  </p>
                  <button
                    onClick={() => navigate("/find-jobs")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentApplications.map((application) => {
                    const StatusIcon =
                      statusIcons[application.status] || FileText;
                    return (
                      <div
                        key={application._id}
                        className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-r from-white to-gray-50/50"
                        onClick={() =>
                          application.job &&
                          navigate(`/job/${application.job._id}`)
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                              {application.job?.title || "Job Title"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {application.job?.company?.companyName ||
                                application.job?.company?.name ||
                                "Company"}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border ml-2 shrink-0 ${statusColors[application.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <StatusIcon className="w-3.5 h-3.5" />
                              {application.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          {application.job?.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {application.job.location}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {moment(application.createdAt).fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Saved Jobs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-purple-600" />
                    Recent Saved Jobs
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {recentSavedJobs.length} saved jobs
                  </p>
                </div>
                {recentSavedJobs.length > 0 && (
                  <button
                    onClick={() => navigate("/saved-jobs")}
                    className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {recentSavedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No saved jobs yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Save jobs you're interested in to view them here later
                  </p>
                  <button
                    onClick={() => navigate("/find-jobs")}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentSavedJobs.map((savedJob) => {
                    const job = savedJob.job;
                    if (!job) return null;

                    return (
                      <div
                        key={savedJob._id}
                        className="p-4 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-r from-white to-purple-50/30"
                        onClick={() => navigate(`/job/${job._id}`)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {job.company?.companyLogo ? (
                            <img
                              src={job.company.companyLogo}
                              alt={job.company.companyName || job.company.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-300 transition-colors shrink-0">
                              <Building2 className="w-7 h-7 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors truncate">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate font-medium">
                              {job.company?.companyName || job.company?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          {job.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {job.location}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              Saved {moment(savedJob.createdAt).fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">
                  Ready to take the next step?
                </h2>
              </div>
              <p className="text-blue-100 mb-8 text-lg max-w-2xl">
                Discover new opportunities and grow your career. Find jobs that
                match your skills and interests.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Search className="w-5 h-5" />
                  Browse Jobs
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <User className="w-5 h-5" />
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobSeekerDashboard;
