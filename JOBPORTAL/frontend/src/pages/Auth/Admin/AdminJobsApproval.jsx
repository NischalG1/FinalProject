import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Trash2,
  Search,
  User,
} from "lucide-react";
import moment from "moment";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";

const AdminJobsApproval = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const endpoint =
        filter === "pending"
          ? API_PATHS.ADMIN.GET_PENDING_JOBS
          : API_PATHS.ADMIN.GET_ALL_JOBS;
      
      const response = await axiosInstance.get(endpoint);
      let jobsData = response.data || [];

      if (filter !== "all" && filter !== "pending") {
        jobsData = jobsData.filter((job) => job.status === filter);
      }

      jobsData = jobsData.map((job) => ({
        ...job,
        title: job.title || "Untitled Job",
        description: job.description || "No description provided",
        requirements: job.requirements || "No requirements specified",
        status: job.status || "pending",
        company: job.company || { 
          name: "Unknown", 
          companyName: "Unknown Company",
          companyLogo: "",
          email: ""
        },
        location: job.location || "Not specified",
        type: job.type || "Full-Time",
        category: job.category || "Other",
        salaryMin: job.salaryMin || 0,
        salaryMax: job.salaryMax || 0,
        createdAt: job.createdAt || new Date(),
      }));

      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error(error.response?.data?.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await axiosInstance.put(API_PATHS.ADMIN.APPROVE_JOB(jobId));
      toast.success("Job approved successfully");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to approve job");
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm("Are you sure you want to reject this job?")) return;
    try {
      await axiosInstance.put(API_PATHS.ADMIN.REJECT_JOB(jobId));
      toast.success("Job rejected successfully");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to reject job");
    }
  };

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_JOB(jobId));
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Review
        </span>
      ),
      approved: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#047857]/5 text-[#047857] border border-[#047857]/15 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
          Approved
        </span>
      ),
      rejected: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      ),
    };
    return badges[status] || badges.pending;
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-jobs">
        <div className="flex items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-jobs">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Panel Control Section */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Job Approvals</h1>
                <p className="text-sm text-[#475569] mt-0.5">
                  Audit, approve, or decline newly incoming listings submitted across the partner network.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search titles, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] w-full md:w-72 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Premium Filter Segments Component */}
            <div className="flex flex-wrap gap-1.5 mt-6 bg-slate-50 border border-[#E2E8F0] rounded-xl p-1.5 max-w-xl">
              {[
                { value: "all", label: "All Submissions" },
                { value: "pending", label: "Pending Queue" },
                { value: "approved", label: "Approved Live" },
                { value: "rejected", label: "Archived/Rejected" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    filter === tab.value
                      ? "bg-[#047857] text-white shadow-sm"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-white"
                  }`}
                >
                  {tab.label}
                  {tab.value !== "all" && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                      filter === tab.value ? "bg-white/20 text-white" : "bg-slate-200 text-[#475569]"
                    }`}>
                      {jobs.filter(j => tab.value === "all" ? true : j.status === tab.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Core Postings Ledger Container */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No listings located</h3>
              <p className="text-[#475569] text-sm">
                {filter === "pending" ? "The operational validation queue is empty." : `No matches matching state "${filter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:border-[#047857]/20 transition-all duration-200 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-3.5">
                      {/* Badge Header Row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight group-hover:text-[#047857] transition-colors">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status)}
                      </div>

                      {/* Detailed Metadata Pill Grouping */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-[#475569]">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 border border-[#E2E8F0] rounded-lg">
                          <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span className="font-semibold text-[#0F172A]">{job.company?.companyName || job.company?.name || "Unknown Company"}</span>
                        </span>
                        
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {job.location}
                          </span>
                        )}
                        
                        {job.type && (
                          <span className="bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            {job.type}
                          </span>
                        )}
                        
                        {job.category && (
                          <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            {job.category}
                          </span>
                        )}
                        
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1 text-sm font-bold text-[#0F172A]">
                            <DollarSign className="w-3.5 h-3.5 text-[#047857]" />
                            {job.salaryMin?.toLocaleString() || 0} - {job.salaryMax?.toLocaleString() || "N/A"}
                          </span>
                        )}
                      </div>

                      {/* Snippet Description Block */}
                      <p className="text-sm text-[#475569] leading-relaxed line-clamp-2 max-w-4xl">
                        {job.description}
                      </p>

                      {/* Sub-Footer Timestamps */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#94A3B8] pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Logged {moment(job.createdAt).fromNow()}
                        </span>
                        {job.company?.email && (
                          <>
                            <span className="w-1 h-1 bg-[#E2E8F0] rounded-full hidden sm:inline"></span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              {job.company.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Controls Action Context Strip */}
                    <div className="flex sm:flex-row flex-wrap items-center gap-2 lg:self-start lg:pt-1">
                      {job.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(job._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#047857] text-white rounded-xl hover:bg-[#065f46] transition-colors font-semibold text-sm shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(job._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E2E8F0] text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-colors font-semibold text-sm rounded-xl cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(job._id, job.title)}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all duration-150 font-medium text-sm border border-transparent hover:border-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only sm:not-sr-only">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobsApproval;