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
  Sparkles,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import { useAuth } from "../../../context/AuthContext";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import MatchScoreBadge, { MatchDetails } from "../../../components/ui/MatchScoreBadge";
import JobDetailsModal from "../../../components/JobDetailsModal";
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
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleJobClick = (jobId) => {
    if (jobId) {
      setSelectedJobId(jobId);
      setIsModalOpen(true);
    }
  };

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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
            <p className="text-[#5E6F8D] text-sm font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-[#E9ECEF] max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#FDE7E9] rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-[#B2405A]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1D2226] mb-4">Not Authenticated</h2>
            <p className="text-[#5E6F8D] mb-6">Please log in to access this page.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-[#0A6642] text-white rounded-xl font-semibold hover:bg-[#085433] transition-all"
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-[#E9ECEF] max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#FFF4E7] rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-[#B26E0A]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1D2226] mb-4">Access Denied</h2>
            <p className="text-[#5E6F8D] mb-6">This page is only for job seekers. Your role: {user.role}</p>
            <button
              onClick={() => navigate("/find-jobs")}
              className="px-8 py-3 bg-[#0A6642] text-white rounded-xl font-semibold hover:bg-[#085433] transition-all"
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
    Applied: "bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]",
    "In Review": "bg-[#FFF4E7] text-[#B26E0A] border-[#F5E6D0]",
    Accepted: "bg-[#E7F3E8] text-[#0A6642] border-[#B8D9BF]",
    Rejected: "bg-[#FDE7E9] text-[#B2405A] border-[#F5C6CB]",
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
    const colorClass = isPositive ? "text-[#0A6642]" : "text-[#B2405A]";

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
        {/* Welcome Header - LinkedIn Green Theme */}
        <div className="bg-gradient-to-r from-[#0A6642] to-[#085433] rounded-2xl shadow-lg p-8 text-white">
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
                  <p className="text-[#B8D9BF] text-sm mt-0.5">
                    Here's your job search overview
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/find-jobs")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#0A6642] rounded-xl font-semibold hover:bg-[#E7F3E8] transition-all shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Stats Cards - LinkedIn Green Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#0A6642]" />
              </div>
              {renderTrend(stats.trends?.applications)}
            </div>
            <h3 className="text-3xl font-bold text-[#1D2226]">{stats.totalApplications || 0}</h3>
            <p className="text-sm text-[#5E6F8D] font-medium mt-1">Total Applications</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-[#0A6642]" />
              </div>
              {renderTrend(stats.trends?.savedJobs)}
            </div>
            <h3 className="text-3xl font-bold text-[#1D2226]">{stats.totalSavedJobs || 0}</h3>
            <p className="text-sm text-[#5E6F8D] font-medium mt-1">Saved Jobs</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FFF4E7] rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#B26E0A]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1D2226]">
              {stats.applicationsByStatus?.["In Review"] || 0}
            </h3>
            <p className="text-sm text-[#5E6F8D] font-medium mt-1">In Review</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-[#0A6642]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#1D2226]">
              {stats.applicationsByStatus?.Accepted || 0}
            </h3>
            <p className="text-sm text-[#5E6F8D] font-medium mt-1">Accepted</p>
          </div>
        </div>

        {/* Recommended Jobs Section - LinkedIn Green Theme */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] overflow-hidden">
          <div className="p-6 border-b border-[#E9ECEF]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1D2226] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0A6642]" />
                  Recommended for You
                </h2>
                <p className="text-sm text-[#5E6F8D] mt-0.5">
                  Jobs matched to your skills and preferences
                </p>
                {recommendationMeta.message && (
                  <p className="text-xs text-[#5E6F8D] mt-1 italic">{recommendationMeta.message}</p>
                )}
              </div>
              {recommendedJobs.length > 0 && (
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="text-[#0A6642] hover:text-[#085433] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!recommendationMeta.hasProfile ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#E7F3E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-[#0A6642]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1D2226] mb-2">Complete Your Profile</h3>
                <p className="text-sm text-[#5E6F8D] mb-6 max-w-md mx-auto">
                  Add your skills and preferences to get personalized job recommendations.
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-6 py-2.5 bg-[#0A6642] text-white rounded-xl font-medium hover:bg-[#085433] transition-colors"
                >
                  Update Profile
                </button>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#F3F6F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-[#5E6F8D]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1D2226] mb-2">No Matches Yet</h3>
                <p className="text-sm text-[#5E6F8D] max-w-md mx-auto">
                  No jobs currently match your profile. Try broadening your preferences.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 6).map((job) => (
                  <div
                    key={job._id}
                    onClick={() => handleJobClick(job._id)}
                    className="group relative p-5 border-2 border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="absolute top-4 right-4">
                      <MatchScoreBadge score={job.matchScore} size="sm" showLabel={true} />
                    </div>

                    <div className="flex items-start gap-3 mb-3 pr-20">
                      {job.company?.companyLogo ? (
                        <img
                          src={job.company.companyLogo}
                          alt={job.company.companyName || job.company.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E9ECEF] group-hover:border-[#0A6642] transition-colors shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF] group-hover:border-[#0A6642] transition-colors shrink-0">
                          <Building2 className="w-6 h-6 text-[#0A6642]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1D2226] group-hover:text-[#0A6642] transition-colors truncate text-sm">
                          {job.title}
                        </h3>
                        <p className="text-xs text-[#5E6F8D] truncate font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#5E6F8D] flex-wrap mb-3">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-0.5 bg-[#F3F6F9] text-[#5E6F8D] rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs bg-[#E7F3E8] text-[#0A6642] rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-[#F3F6F9] text-[#5E6F8D] rounded-full font-medium">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {job.matchDetails && (
                      <MatchDetails details={job.matchDetails} size="sm" />
                    )}

                    {job.applicationStatus && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[job.applicationStatus] || "bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]"}`}>
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

        {/* Application Status Breakdown - LinkedIn Green Theme */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
          <h2 className="text-xl font-bold text-[#1D2226] mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0A6642]" />
            Application Status Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.applicationsByStatus || {}).map(([status, count]) => {
              const Icon = statusIcons[status] || FileText;
              return (
                <div
                  key={status}
                  className={`p-5 rounded-xl border-2 ${statusColors[status] || "bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${statusColors[status]?.includes("Accepted") ? "bg-[#B8D9BF]" : statusColors[status]?.includes("Review") ? "bg-[#F5E6D0]" : statusColors[status]?.includes("Rejected") ? "bg-[#F5C6CB]" : "bg-[#E9ECEF]"}`}>
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

        {/* Recent Activity - LinkedIn Green Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1D2226] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0A6642]" />
                Recent Applications
              </h2>
              {recentApplications.length > 0 && (
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="text-[#0A6642] hover:text-[#085433] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {recentApplications.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-[#5E6F8D]" />
                </div>
                <p className="text-sm text-[#5E6F8D]">No applications yet</p>
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="mt-4 text-[#0A6642] font-medium text-sm hover:underline"
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
                      className="p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => application.job && handleJobClick(application.job._id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#1D2226] group-hover:text-[#0A6642] transition-colors truncate text-sm">
                            {application.job?.title || "Job Title"}
                          </h3>
                          <p className="text-xs text-[#5E6F8D] truncate">
                            {application.job?.company?.companyName || application.job?.company?.name || "Company"}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusColors[application.status] || "bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]"}`}>
                          <StatusIcon className="w-3 h-3" />
                          {application.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#5E6F8D]">
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

          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1D2226] flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#0A6642]" />
                Recent Saved Jobs
              </h2>
              {recentSavedJobs.length > 0 && (
                <button
                  onClick={() => navigate("/saved-jobs")}
                  className="text-[#0A6642] hover:text-[#085433] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {recentSavedJobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-[#5E6F8D]" />
                </div>
                <p className="text-sm text-[#5E6F8D]">No saved jobs yet</p>
                <button
                  onClick={() => navigate("/find-jobs")}
                  className="mt-4 text-[#0A6642] font-medium text-sm hover:underline"
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
                      className="p-4 border-2 border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleJobClick(job._id)}
                    >
                      <div className="flex items-start gap-3">
                        {job.company?.companyLogo ? (
                          <img
                            src={job.company.companyLogo}
                            alt={job.company.companyName || job.company.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E9ECEF] group-hover:border-[#0A6642] transition-colors shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF] group-hover:border-[#0A6642] transition-colors shrink-0">
                            <Building2 className="w-6 h-6 text-[#0A6642]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#1D2226] group-hover:text-[#0A6642] transition-colors truncate text-sm">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#5E6F8D] truncate font-medium">
                            {job.company?.companyName || job.company?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#5E6F8D] mt-2">
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

        {/* Quick Actions - LinkedIn Green Theme */}
        <div className="bg-gradient-to-r from-[#0A6642] to-[#085433] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Ready to take the next step?
              </h2>
              <p className="text-[#B8D9BF] text-sm mt-1">
                Discover new opportunities and grow your career
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/find-jobs")}
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#0A6642] rounded-xl font-semibold hover:bg-[#E7F3E8] transition-all shadow-lg hover:shadow-xl"
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

      {/* Job Details Modal */}
      <JobDetailsModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJobId(null);
        }}
        onAction={() => {
          fetchDashboardData();
        }}
      />
    </DashboardLayout>
  );
};

export default JobSeekerDashboard;