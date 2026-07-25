// frontend/src/pages/Auth/Employer/ManageJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Eye,
  MapPin,
  Briefcase,
  Users,
  Power,
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  Filter,
  Clock,
  Building2,
  BarChart3,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JobDetailsModal from '../../../components/JobDetailsModal';
import toast from 'react-hot-toast';
import moment from 'moment';

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [closingJobId, setClosingJobId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async (jobId, currentStatus) => {
    const job = jobs.find(j => j._id === jobId);
    if (job && job.status !== 'approved') {
      toast.error('Only approved jobs can be closed or reopened');
      return;
    }

    try {
      setClosingJobId(jobId);
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      toast.success(
        currentStatus ? 'Job reopened successfully' : 'Job closed successfully'
      );
      await fetchJobs();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error(error.response?.data?.message || 'Failed to update job status');
    } finally {
      setClosingJobId(null);
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      toast.success('Job deleted successfully');
      setDeleteConfirm(null);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  // FIXED: Handle job click to open modal
  const handleJobClick = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  // FIXED: Handle modal close - don't refresh jobs immediately
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
    // Don't call fetchJobs here to avoid interrupting navigation
  };

  // FIXED: Handle modal action - refresh jobs only when needed (save/apply actions)
  const handleModalAction = () => {
    // Small delay to let any navigation complete first
    setTimeout(() => {
      fetchJobs();
    }, 300);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'open') return matchesSearch && !job.isClosed && job.status === 'approved';
    if (filterStatus === 'closed') return matchesSearch && job.isClosed && job.status === 'approved';
    if (filterStatus === 'pending') return matchesSearch && job.status === 'pending';
    if (filterStatus === 'rejected') return matchesSearch && job.status === 'rejected';
    return matchesSearch;
  });

  const statusCounts = {
    all: jobs.length,
    open: jobs.filter(j => !j.isClosed && j.status === 'approved').length,
    closed: jobs.filter(j => j.isClosed && j.status === 'approved').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="manage-jobs">
        <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#E2E8F0] border-t-[#047857] mx-auto mb-4"></div>
              <p className="text-[#475569] text-sm font-medium">Loading job listings...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Welcome Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Job Management Console
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Manage Jobs</h1>
              <p className="text-sm text-[#475569] mt-0.5">
                View and manage all your posted jobs ({jobs.length} total)
              </p>
            </div>
            
            <button
              onClick={() => navigate('/post-job')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#047857] text-white rounded-xl font-semibold text-sm hover:bg-[#065f46] transition-colors shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search jobs by title, location, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-1 bg-[#F8FAFC] rounded-xl p-1 border border-[#E2E8F0]">
                {[
                  { value: 'all', label: 'All', count: statusCounts.all },
                  { value: 'open', label: 'Open', count: statusCounts.open },
                  { value: 'closed', label: 'Closed', count: statusCounts.closed },
                  { value: 'pending', label: 'Pending', count: statusCounts.pending },
                  { value: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterStatus === tab.value
                        ? 'bg-[#047857] text-white shadow-sm'
                        : 'text-[#475569] hover:bg-white/50 hover:text-[#0F172A]'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      filterStatus === tab.value ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                {searchTerm ? 'No jobs match your search' : 'No jobs posted yet'}
              </h3>
              <p className="text-sm text-[#475569] mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Start posting jobs to find the perfect candidates for your company'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/post-job')}
                  className="px-6 py-2.5 bg-[#047857] text-white rounded-xl font-semibold text-sm hover:bg-[#065f46] transition-colors shadow-sm"
                >
                  Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:border-[#047857]/30 transition-all duration-200"
                >
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Job Icon */}
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-[#047857]" />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-[#0F172A]">
                          {job.title}
                        </h3>
                        {job.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {job.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {job.status === 'approved' && (
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                            job.isClosed
                              ? 'bg-slate-50 text-[#475569] border-slate-200'
                              : 'bg-emerald-50 text-[#047857] border-emerald-100'
                          }`}>
                            {job.isClosed ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                Closed
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Open
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Job Details Row */}
                      <div className="flex flex-wrap gap-3 text-sm text-[#475569] mb-3">
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#94A3B8]" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-[#94A3B8]" />
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-[#047857] rounded-lg text-xs font-semibold border border-emerald-100">
                            {job.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#94A3B8]" />
                          {moment(job.createdAt).fromNow()}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <Users className="w-4 h-4 text-[#94A3B8]" />
                          {job.applicationCount || 0} applications
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                            <DollarSign className="w-4 h-4 text-[#94A3B8]" />
                            ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#475569] line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => navigate(`/applicants?jobId=${job._id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-[#047857] rounded-xl hover:bg-emerald-100 transition-colors text-xs font-bold border border-emerald-100"
                    >
                      <Users className="w-4 h-4" />
                      Applications ({job.applicationCount || 0})
                    </button>
                    
                    <button
                      onClick={() => handleToggleClose(job._id, job.isClosed)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors text-xs font-bold ${
                        job.status === 'pending' || job.status === 'rejected'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : job.isClosed
                            ? 'bg-emerald-50 text-[#047857] border border-emerald-100 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                      disabled={job.status === 'pending' || job.status === 'rejected' || closingJobId === job._id}
                      title={job.status === 'pending' ? 'Cannot close pending jobs' : job.status === 'rejected' ? 'Cannot close rejected jobs' : ''}
                    >
                      {closingJobId === job._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      ) : (
                        <>
                          <Power className="w-4 h-4" />
                          {job.isClosed ? 'Reopen' : 'Close'}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleJobClick(job._id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#F8FAFC] text-[#475569] rounded-xl hover:bg-[#F1F5F9] transition-colors text-xs font-bold border border-[#E2E8F0]"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {/* Delete Button */}
                    {deleteConfirm === job._id ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-xl hover:bg-[#F1F5F9] transition-colors text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(job._id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors text-xs font-bold border border-rose-100 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Status Info for Pending Jobs */}
                  {job.status === 'pending' && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This job is pending admin approval. You cannot close it until approved.</span>
                    </div>
                  )}
                  {job.status === 'rejected' && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>This job was rejected. You cannot close it. Please delete and repost.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal - FIXED */}
      <JobDetailsModal
        jobId={selectedJobId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAction={handleModalAction}
      />
    </DashboardLayout>
  );
};

export default ManageJobs;