import { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverView = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
      if (response.status === 200) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverView();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="employer-dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.counts || {};
  const trends = stats.trends || {};
  const recentJobs = dashboardData?.data?.recentJobs || [];
  const recentApplications = dashboardData?.data?.recentApplications || [];

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Track your hiring performance and manage jobs
            </p>
          </div>
          <button
            onClick={() => navigate("/post-job")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    trends.activeJobs >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    trends.activeJobs >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trends.activeJobs >= 0 ? "+" : ""}
                  {trends.activeJobs}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalActiveJobs || 0}
            </h3>
            <p className="text-gray-600 text-sm">Active Job Posts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    trends.totalApplicants >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    trends.totalApplicants >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trends.totalApplicants >= 0 ? "+" : ""}
                  {trends.totalApplicants}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalApplications || 0}
            </h3>
            <p className="text-gray-600 text-sm">Total Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    trends.totalHired >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    trends.totalHired >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trends.totalHired >= 0 ? "+" : ""}
                  {trends.totalHired}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalHired || 0}
            </h3>
            <p className="text-gray-600 text-sm">Hired Candidates</p>
          </div>
        </div>

        {/* Recent Jobs and Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
              <button
                onClick={() => navigate("/manage-jobs")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No jobs posted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/manage-jobs`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          job.isClosed
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {job.isClosed ? "Closed" : "Open"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {moment(job.createdAt).fromNow()}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Applications
              </h2>
              <button
                onClick={() => navigate("/applicants")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/applicants`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {app.applicant?.avatar ? (
                        <img
                          src={app.applicant.avatar}
                          alt={app.applicant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {app.applicant?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {app.applicant?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {app.job?.title}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === "Accepted"
                            ? "bg-green-100 text-green-600"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {moment(app.createdAt).fromNow()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
