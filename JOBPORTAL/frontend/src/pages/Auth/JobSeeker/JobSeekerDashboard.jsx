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
  Users,
  Star,
  BarChart3,
} from "lucide-react";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import { useAuth } from "../../../context/AuthContext";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import MatchScoreBadge, { MatchDetails } from "../../../components/ui/MatchScoreBadge";
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
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
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
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
  }, []);

  useEffect(() => {
    if (user && !user.role) {
      updateUser({ ...user, role: "jobseeker" });
    }
  }, [user, updateUser]);

  useEffect(() => {
    if (!authLoading) {
      if (user && (user.role === "jobseeker" || !user.role)) {
        fetchDashboardData();
      } else if (!user) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, user, fetchDashboardData]);

  if (authLoading || loading) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
            <p className="text-gray-500 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-[#0a66c2] text-white rounded-xl font-semibold hover:bg-[#004182] transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role && user.role !== "jobseeker") {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-500 mb-6">This page is only for job seekers. Your role: {user.role}</p>
            <button
              onClick={() => navigate("/find-jobs")}
              className="px-8 py-3 bg-[#0a66c2] text-white rounded-xl font-semibold hover:bg-[#004182] transition-all"
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
    Applied: "bg-gray-50 text-gray-700 border-gray-200",
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
      <div className={`flex items-center gap-1 ${colorClass} bg-white/60 px-2 py-1 rounded-full`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-semibold">{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="space-y-6">
        {/* Welcome Header - LinkedIn Style */}
        <div className="bg-gradient-to-r from-[#0a66c2] to-[#004182] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back, {user.name?.split(" ")[0] || "Job Seeker"}! 👋
                  </h1>
                  <p className="text-blue-100 text-sm mt-0.5">
                    Here's your job search overview
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/find-jobs")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a66c2] rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Stats Cards - LinkedIn Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#0a66c2]" />
              </div>
              {renderTrend(stats.trends?.applications)}
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalApplications || 0}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Total Applications</p>
          </div>

          {/* Saved Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-purple-600" />
              </div>
              {renderTrend(stats.trends?.savedJobs)}
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalSavedJobs || 0}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Saved Jobs</p>
          </div>

          {/* In Review */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.applicationsByStatus?.["In Review"] || 0}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">In Review</p>
          </div>

          {/* Accepted */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.applicationsByStatus?.Accepted || 0}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Accepted</p>
          </div>
        </div>

        {/* Recommended Jobs Section - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recommended for You
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Jobs matched to your skills and preferences
                </p>
                {recommendationMeta.message && (
                  <p className="text-xs text-gray-400 mt-1 italic">{recommendationMeta.message}</p>
                )}
              </div>
              {recommendedJobs.length > 0 && (
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="text-[#0a66c2] hover:text-[#004182] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!recommendationMeta.hasProfile ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Add your skills and preferences to get personalized job recommendations.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors"
                >
                  Update Profile
                </button>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  No jobs currently match your profile. Try broadening your preferences.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 6).map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="group relative p-5 border-2 border-gray-200 rounded-xl hover:border-[#0a66c2] hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Match Score Badge */}
                    <div className="absolute top-4 right-4">
                      <MatchScoreBadge score={job.matchScore} size="sm" showLabel={true} />
                    </div>

                    {/* Company Info */}
                    <div className="flex items-start gap-3 mb-3 pr-20">
                      {job.company?.companyLogo ? (
                        <img
                          src={job.company.companyLogo}
                          alt={job.company.companyName || job.company.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 group-hover:border-[#0a66c2] transition-colors shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200 group-hover:border-[#0a66c2] transition-colors shrink-0">
                          <Building2 className="w-6 h-6 text-[#0a66c2]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors truncate text-sm">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                    </div>

                    {/* Job Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap mb-3">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
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
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs bg-blue-50 text-[#0a66c2] rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full font-medium">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Match Details */}
                    {job.matchDetails && (
                      <MatchDetails details={job.matchDetails} size="sm" />
                    )}

                    {/* Application Status */}
                    {job.applicationStatus && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[job.applicationStatus] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {job.applicationStatus}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Application Status Breakdown - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0a66c2]" />
            Application Status Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.applicationsByStatus || {}).map(([status, count]) => {
              const Icon = statusIcons[status] || FileText;
              return (
                <div
                  key={status}
                  className={`p-5 rounded-xl border-2 ${statusColors[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${statusColors[status]?.includes("emerald") ? "bg-emerald-100" : statusColors[status]?.includes("amber") ? "bg-amber-100" : statusColors[status]?.includes("red") ? "bg-red-100" : "bg-gray-100"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{status}</span>
                  </div>
                  <p className="text-3xl font-extrabold">{count || 0}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - LinkedIn Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0a66c2]" />
                Recent Applications
              </h2>
              {recentApplications.length > 0 && (
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="text-[#0a66c2] hover:text-[#004182] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {recentApplications.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No applications yet</p>
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="mt-4 text-[#0a66c2] font-medium text-sm hover:underline"
                >
                  Browse Jobs →
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentApplications.map((application) => {
                  const StatusIcon = statusIcons[application.status] || FileText;
                  return (
                    <div
                      key={application._id}
                      className="p-4 border-2 border-gray-100 rounded-xl hover:border-[#0a66c2] hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => application.job && navigate(`/job/${application.job._id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors truncate text-sm">
                            {application.job?.title || "Job Title"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {application.job?.company?.companyName || application.job?.company?.name || "Company"}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusColors[application.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          <StatusIcon className="w-3 h-3" />
                          {application.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {application.job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {application.job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {moment(application.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Saved Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                Recent Saved Jobs
              </h2>
              {recentSavedJobs.length > 0 && (
                <button
                  onClick={() => navigate("/saved-jobs")}
                  className="text-[#0a66c2] hover:text-[#004182] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {recentSavedJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No saved jobs yet</p>
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="mt-4 text-[#0a66c2] font-medium text-sm hover:underline"
                >
                  Browse Jobs →
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentSavedJobs.map((savedJob) => {
                  const job = savedJob.job;
                  if (!job) return null;
                  return (
                    <div
                      key={savedJob._id}
                      className="p-4 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => navigate(`/job/${job._id}`)}
                    >
                      <div className="flex items-start gap-3">
                        {job.company?.companyLogo ? (
                          <img
                            src={job.company.companyLogo}
                            alt={job.company.companyName || job.company.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 group-hover:border-purple-300 transition-colors shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-gray-200 group-hover:border-purple-300 transition-colors shrink-0">
                            <Building2 className="w-6 h-6 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors truncate text-sm">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate font-medium">
                            {job.company?.companyName || job.company?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Saved {moment(savedJob.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - LinkedIn Style */}
        <div className="bg-gradient-to-r from-[#0a66c2] to-[#004182] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Ready to take the next step?
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Discover new opportunities and grow your career
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/find-jobs")}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#0a66c2] rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Browse Jobs
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                <User className="w-5 h-5" />
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobSeekerDashboard;