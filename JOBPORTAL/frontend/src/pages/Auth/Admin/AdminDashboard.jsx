import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    rejectedJobs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching admin dashboard data...");
      
      const [usersRes, jobsRes, pendingJobsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.GET_ALL_USERS),
        axiosInstance.get(API_PATHS.ADMIN.GET_ALL_JOBS),
        axiosInstance.get(API_PATHS.ADMIN.GET_PENDING_JOBS),
      ]);

      const users = usersRes?.data || [];
      const jobs = jobsRes?.data || [];
      const pendingJobs = pendingJobsRes?.data || [];

      console.log("Dashboard data:", {
        users: users.length,
        jobs: jobs.length,
        pendingJobs: pendingJobs.length,
      });

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        pendingJobs: pendingJobs.length,
        approvedJobs: jobs.filter((j) => j?.status === "approved").length,
        rejectedJobs: jobs.filter((j) => j?.status === "rejected").length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load dashboard data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-dashboard">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, approve jobs, and monitor platform activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalUsers}
            </h3>
            <p className="text-gray-600 text-sm">Total Users</p>
            <button
              onClick={() => navigate("/admin-users")}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {/* Total Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalJobs}
            </h3>
            <p className="text-gray-600 text-sm">Total Jobs</p>
            <button
              onClick={() => navigate("/admin-jobs")}
              className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {/* Pending Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.pendingJobs}
            </h3>
            <p className="text-gray-600 text-sm">Pending Approval</p>
            <button
              onClick={() => navigate("/admin-jobs")}
              className="mt-4 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              Review Now →
            </button>
          </div>

          {/* Approved Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.approvedJobs}
            </h3>
            <p className="text-gray-600 text-sm">Approved Jobs</p>
          </div>

          {/* Rejected Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.rejectedJobs}
            </h3>
            <p className="text-gray-600 text-sm">Rejected Jobs</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/admin-jobs")}
              className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Review Pending Jobs
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stats.pendingJobs} jobs waiting for approval
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin-users")}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Manage Users
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage all platform users
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
