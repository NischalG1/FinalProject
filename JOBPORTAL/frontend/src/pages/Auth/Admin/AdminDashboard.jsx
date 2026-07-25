import React, { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  UserCheck,
  Activity,
  ShieldCheck,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";
import moment from "moment";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    rejectedJobs: 0,
    jobSeekers: 0,
    employers: 0,
    admins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [usersRes, jobsRes, activityRes] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.GET_ALL_USERS),
        axiosInstance.get(API_PATHS.ADMIN.GET_ALL_JOBS),
        axiosInstance.get(API_PATHS.ADMIN.GET_RECENT_ACTIVITY).catch(() => ({ data: [] })), // Fallback if endpoint fails
      ]);

      const users = usersRes?.data || [];
      const jobs = jobsRes?.data || [];
      const activities = activityRes?.data || [];

      setStats({
        totalUsers: users.length,
        jobSeekers: users.filter(u => u?.role === "jobseeker").length,
        employers: users.filter(u => u?.role === "employer").length,
        admins: users.filter(u => u?.role === "admin").length,
        totalJobs: jobs.length,
        pendingJobs: jobs.filter(j => j?.status === "pending").length,
        approvedJobs: jobs.filter(j => j?.status === "approved").length,
        rejectedJobs: jobs.filter(j => j?.status === "rejected").length,
      });

      // Format activities for display
      const formattedActivities = activities.map(activity => {
        let timeAgo = moment(activity.timestamp).fromNow();
        let displayName = activity.user || "Unknown";
        let actionText = activity.action || "Activity";
        
        // Add extra context based on type
        if (activity.type === "job" && activity.jobTitle) {
          actionText = `${activity.action}: "${activity.jobTitle}"`;
        }
        if (activity.type === "application" && activity.status) {
          actionText = `${activity.action} (${activity.status})`;
        }
        
        return {
          id: activity.id,
          type: activity.type || "activity",
          action: actionText,
          user: displayName,
          time: timeAgo,
          rawTime: activity.timestamp,
          role: activity.role || "",
          status: activity.status || "",
          email: activity.email || "",
          avatar: activity.avatar || "",
        };
      });

      // If no activities from API, use fallback with real data
      if (formattedActivities.length === 0) {
        // Create fallback activities from real data
        const fallbackActivities = [];
        
        // Add recent users as activities
        users.slice(0, 5).forEach(user => {
          fallbackActivities.push({
            id: `user_${user._id}`,
            type: "user",
            action: `New ${user.role || 'user'} registered`,
            user: user.name || "Unknown",
            time: moment(user.createdAt).fromNow(),
            rawTime: user.createdAt,
            role: user.role,
            email: user.email,
            avatar: user.avatar,
          });
        });

        // Add recent jobs as activities
        jobs.slice(0, 5).forEach(job => {
          const companyName = job.company?.companyName || job.company?.name || "Unknown Company";
          fallbackActivities.push({
            id: `job_${job._id}`,
            type: "job",
            action: `${job.status === 'pending' ? 'New job pending' : job.status === 'approved' ? 'Job approved' : 'Job posted'}`,
            user: companyName,
            time: moment(job.createdAt).fromNow(),
            rawTime: job.createdAt,
            status: job.status,
            jobTitle: job.title,
          });
        });

        // Sort by time and take top 10
        fallbackActivities.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));
        setRecentActivity(fallbackActivities.slice(0, 10));
      } else {
        setRecentActivity(formattedActivities);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard metrics");
      // Set empty activities on error
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-dashboard">
        <div className="flex items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const approvalRate = stats.totalJobs > 0 
    ? Math.round((stats.approvedJobs / stats.totalJobs) * 100) 
    : 0;

  // Helper function to get icon based on activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'user': return <UserCheck className="w-4 h-4 text-[#047857]" />;
      case 'job': return <Briefcase className="w-4 h-4 text-[#047857]" />;
      case 'application': return <Activity className="w-4 h-4 text-[#047857]" />;
      default: return <Activity className="w-4 h-4 text-[#047857]" />;
    }
  };

  // Helper function to get badge color based on status
  const getStatusBadge = (type, status) => {
    if (type === 'job') {
      if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
      if (status === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (status === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (type === 'user') {
      if (status === 'employer') return 'bg-blue-50 text-blue-700 border-blue-200';
      if (status === 'admin') return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <DashboardLayout activeMenu="admin-dashboard">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Welcome Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Core Security Console
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Manage network members, evaluate incoming positions, and track activity streams.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#047857]/10 rounded-xl self-start sm:self-auto text-xs font-semibold text-[#047857] border border-[#047857]/20">
              <span className="w-2 h-2 bg-[#047857] rounded-full animate-pulse"></span>
              Systems Operational
            </div>
          </div>

          {/* Metrics Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Membership Metrics */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Total Membership</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <Users className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{stats.totalUsers}</h3>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex gap-3 text-xs text-[#475569] font-medium">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">{stats.jobSeekers} Seekers</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">{stats.employers} Firms</span>
              </div>
            </div>

            {/* Total Listings Metrics */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Total Listings</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <Briefcase className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{stats.totalJobs}</h3>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex gap-2 text-xs font-semibold">
                <span className="bg-emerald-50 text-[#047857] border border-[#047857]/15 px-2 py-0.5 rounded-md">{stats.approvedJobs} Live</span>
                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md">{stats.pendingJobs} Review</span>
              </div>
            </div>

            {/* Pending Verification Action Metric */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-amber-300/40 transition-all duration-200 bg-gradient-to-b from-white to-amber-50/20">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Verification</span>
                  <div className="p-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-amber-700 mt-2">{stats.pendingJobs}</h3>
              </div>
              <button 
                onClick={() => navigate("/admin-jobs")}
                className="mt-5 text-xs font-bold text-[#047857] hover:text-[#065f46] flex items-center gap-1 text-left group pt-2 border-t border-dashed border-[#E2E8F0]"
              >
                Launch review queue 
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Approval Rating Calculation */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Approval Rating</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{approvalRate}%</h3>
              </div>
              <div className="mt-5 pt-2">
                <div className="bg-[#F1F5F9] rounded-full h-2 w-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#047857] h-full rounded-full transition-all duration-500" style={{ width: `${approvalRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Split Panel System Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Audit Action Changes Log - Now with Real Data */}
            <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5 mb-3">
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#047857]" /> Recent Account Activities
                </h2>
                <button 
                  onClick={() => fetchDashboardData()}
                  className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-2.5 py-1 bg-slate-50 border border-[#E2E8F0] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Activity className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <p className="text-sm text-[#475569] font-medium">No recent activity</p>
                  <p className="text-xs text-[#94A3B8] mt-1">New activities will appear here as they happen</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3.5 text-sm group hover:bg-[#F8FAFC]/50 px-2 -mx-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Activity Icon */}
                        <div className="w-8 h-8 rounded-lg bg-[#047857]/10 border border-[#047857]/20 flex items-center justify-center shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0F172A] group-hover:text-[#047857] transition-colors text-sm truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-[#475569] mt-0.5 flex items-center gap-2">
                            <span className="font-medium">Actor:</span>
                            <span className="text-[#047857] font-medium truncate">{activity.user}</span>
                            {activity.role && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activity.type, activity.role)}`}>
                                {activity.role}
                              </span>
                            )}
                            {activity.status && activity.type === 'job' && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activity.type, activity.status)}`}>
                                {activity.status}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#475569] font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-[#E2E8F0] shrink-0 ml-2">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Fast-Action Platform Navigation Shortcuts */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-3.5 mb-4">
                  Admin Shortcut Actions
                </h2>
                
                <div className="space-y-2.5">
                  <button 
                    onClick={() => navigate("/admin-jobs")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#047857] text-white text-sm font-semibold rounded-xl hover:bg-[#065f46] transition-colors shadow-sm cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Verify Positions ({stats.pendingJobs})</span>
                  </button>

                  <button 
                    onClick={() => navigate("/admin-users")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#94A3B8]" />
                    <span>Inspect Member Profiles</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] mt-6 text-center">
                <span className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase block">
                  Console Engine v2.4
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;