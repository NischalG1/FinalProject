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
} from "lucide-react";
import moment from "moment";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";

const AdminJobsApproval = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [isLoading, setIsLoading] = useState(true);

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
      
      console.log("Fetching jobs from:", endpoint, "with filter:", filter);
      
      const response = await axiosInstance.get(endpoint);
      let jobsData = response.data || [];

      console.log("Fetched jobs:", jobsData.length, "jobs");
      console.log("Jobs data sample:", jobsData[0]);

      // Filter by status if not "all" or "pending"
      if (filter !== "all" && filter !== "pending") {
        jobsData = jobsData.filter((job) => job.status === filter);
      }

      // Ensure all required fields are present and company data is populated
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

      console.log("Processed jobs:", jobsData.length);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load jobs";
      toast.error(errorMessage);
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
      console.error("Error approving job:", error);
      toast.error("Failed to approve job");
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm("Are you sure you want to reject this job?")) {
      return;
    }
    try {
      await axiosInstance.put(API_PATHS.ADMIN.REJECT_JOB(jobId));
      toast.success("Job rejected successfully");
      fetchJobs();
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast.error("Failed to reject job");
    }
  };

  const handleDelete = async (jobId, jobTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${jobTitle}"? This action cannot be undone and will delete all associated applications.`
      )
    ) {
      return;
    }
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_JOB(jobId));
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      ),
      approved: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      ),
      rejected: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      ),
    };
    return badges[status] || badges.pending;
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-jobs">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-jobs">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Approvals
            </h1>
            <p className="text-gray-600">
              Review and approve job postings from employers
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex gap-2">
          {[
            { value: "all", label: "All Jobs" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              {filter === "pending"
                ? "No pending jobs to review"
                : `No ${filter} jobs found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company?.companyName || job.company?.name || "Unknown Company"}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                          {job.category}
                        </span>
                      )}
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${job.salaryMin || 0} - ${job.salaryMax || "N/A"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Posted {moment(job.createdAt).fromNow()}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                {job.requirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Requirements:
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  {job.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(job._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(job._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(job._id, job.title)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium ml-auto"
                    title="Delete job permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminJobsApproval;
