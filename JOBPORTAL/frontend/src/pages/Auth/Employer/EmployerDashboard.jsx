import React, { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Layers,
  Activity,
  UserCheck,
  ChevronRight,
  ShieldCheck
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
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="flex items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.counts || {};
  const trends = stats.trends || {};
  const recentJobs = dashboardData?.data?.recentJobs || [];
  const recentApplications = dashboardData?.data?.recentApplications || [];

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Welcome Panel - Identical to Admin Console Styling */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Workspace Control Room
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Employer Dashboard</h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Manage live organizational openings, screen incoming candidates, and monitor deployment workflows.
              </p>
            </div>
            
            <button
              onClick={() => navigate("/post-job")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Post New Listing
            </button>
          </div>

          {/* Metrics Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Active Listings Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Active Listings</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <Briefcase className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{stats.totalActiveJobs || 0}</h3>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-medium text-[#475569]">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">Live items online</span>
                <span className={`flex items-center gap-0.5 font-semibold ${trends.activeJobs >= 0 ? "text-[#047857]" : "text-rose-600"}`}>
                  {trends.activeJobs >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trends.activeJobs >= 0 ? "+" : ""}{trends.activeJobs}%
                </span>
              </div>
            </div>

            {/* Total Applications Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Applications Received</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <Users className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{stats.totalApplications || 0}</h3>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-medium text-[#475569]">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">Processed submissions</span>
                <span className={`flex items-center gap-0.5 font-semibold ${trends.totalApplicants >= 0 ? "text-[#047857]" : "text-rose-600"}`}>
                  {trends.totalApplicants >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trends.totalApplicants >= 0 ? "+" : ""}{trends.totalApplicants}%
                </span>
              </div>
            </div>

            {/* Filled Placements Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#047857]/30 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Filled Placements</span>
                  <div className="p-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#475569]" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{stats.totalHired || 0}</h3>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-medium text-[#475569]">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">Completed hires</span>
                <span className={`flex items-center gap-0.5 font-semibold ${trends.totalHired >= 0 ? "text-[#047857]" : "text-rose-600"}`}>
                  {trends.totalHired >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trends.totalHired >= 0 ? "+" : ""}{trends.totalHired}%
                </span>
              </div>
            </div>

          </div>

          {/* Split Feed Layout Systems */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content Column: Postings & Inbound Feeds */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Recent Postings Block */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5 mb-4">
                  <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#047857]" /> Recent Postings
                  </h2>
                  <button 
                    onClick={() => navigate("/manage-jobs")} 
                    className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-2.5 py-1 bg-slate-50 border border-[#E2E8F0] rounded-lg transition-colors"
                  >
                    Manage listings
                  </button>
                </div>

                <div className="divide-y divide-[#F1F5F9]">
                  {recentJobs.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-[#475569] font-medium">No live assignments found</p>
                    </div>
                  ) : (
                    recentJobs.slice(0, 5).map((job) => (
                      <div key={job._id} onClick={() => navigate(`/manage-jobs`)} className="flex items-center justify-between py-3.5 text-sm group hover:bg-[#F8FAFC]/50 px-2 -mx-2 rounded-xl transition-colors cursor-pointer">
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-semibold text-[#0F172A] group-hover:text-[#047857] transition-colors truncate">{job.title}</p>
                          <div className="flex items-center gap-3 text-xs text-[#475569] font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{moment(job.createdAt).fromNow()}</span>
                            {job.location && <span className="flex items-center gap-1 truncate max-w-[150px]"><Building2 className="w-3.5 h-3.5 text-slate-400" />{job.location}</span>}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase border shrink-0 ${job.isClosed ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-emerald-50 text-[#047857] border-[#047857]/20"}`}>
                          {job.isClosed ? "Closed" : "Active"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Applications Block */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5 mb-4">
                  <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#047857]" /> Incoming Candidates
                  </h2>
                  <button 
                    onClick={() => navigate("/applicants")} 
                    className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-2.5 py-1 bg-slate-50 border border-[#E2E8F0] rounded-lg transition-colors"
                  >
                    Review workflow
                  </button>
                </div>

                <div className="divide-y divide-[#F1F5F9]">
                  {recentApplications.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-[#475569] font-medium">No applicant records found</p>
                    </div>
                  ) : (
                    recentApplications.slice(0, 5).map((app) => (
                      <div key={app._id} onClick={() => navigate(`/applicants`)} className="flex items-center justify-between py-3.5 text-sm group hover:bg-[#F8FAFC]/50 px-2 -mx-2 rounded-xl transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          {app.applicant?.avatar ? (
                            <img src={app.applicant.avatar} alt={app.applicant.name} className="w-8 h-8 rounded-lg object-cover border border-[#E2E8F0] shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-[#E2E8F0] flex items-center justify-center shrink-0">
                              <span className="text-[#475569] font-bold text-xs uppercase">{app.applicant?.name?.charAt(0)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0F172A] group-hover:text-[#047857] transition-colors truncate">{app.applicant?.name}</p>
                            <p className="text-xs text-[#475569] truncate font-medium">{app.job?.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-[#475569] font-medium hidden sm:inline-block">{moment(app.createdAt).fromNow()}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            app.status === "Accepted" ? "bg-emerald-50 text-[#047857] border-[#047857]/20" :
                            app.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            app.status === "In Review" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Action Matrix Column */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-fit">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-3.5 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#047857]" /> Workspace Shortcuts
                </h2>
                
                <div className="space-y-2.5">
                  <button 
                    onClick={() => navigate("/post-job")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#047857] text-white text-sm font-semibold rounded-xl hover:bg-[#065f46] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Listing</span>
                  </button>

                  <button 
                    onClick={() => navigate("/manage-jobs")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-[#94A3B8]" />
                    <span>Inspect Open Positions</span>
                  </button>

                  <button 
                    onClick={() => navigate("/applicants")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#94A3B8]" />
                    <span>Manage Applications</span>
                  </button>

                  <button 
                    onClick={() => navigate("/company-profile")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-sm font-semibold rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#94A3B8]" />
                    <span>Corporate Settings</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] mt-6 text-center">
                <span className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase block">
                  Employer Core Engine v2.4
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;