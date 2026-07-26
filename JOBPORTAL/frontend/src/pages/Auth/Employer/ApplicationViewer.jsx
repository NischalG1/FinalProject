// frontend/src/pages/Auth/Employer/ApplicationViewer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ArrowLeft,
  Filter,
  Sparkles,
  Award,
  TrendingUp,
  Search,
  Building2,
  Calendar,
  Star,
  Users,
  Target,
  Zap,
  ShieldCheck,
  Layers,
  Activity,
  ChevronRight,
  Phone,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JobDetailsModal from '../../../components/JobDetailsModal';
// ✅ Import MatchScoreBadge
import MatchScoreBadge, { MatchDetails } from '../../../components/ui/MatchScoreBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const ApplicationViewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || 'all');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScoring, setShowScoring] = useState(false);
  const [scoredApplicants, setScoredApplicants] = useState([]);
  const [scoringStats, setScoringStats] = useState(null);
  const [loadingScoring, setLoadingScoring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob && selectedJob !== 'all') {
      fetchApplications(selectedJob);
      if (showScoring) {
        fetchScoring(selectedJob);
      }
    } else {
      setApplications([]);
      setScoredApplicants([]);
      setScoringStats(null);
    }
  }, [selectedJob, showScoring]);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
      );
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchScoring = async (jobId) => {
    try {
      setLoadingScoring(true);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_APPLICANTS_SCORING(jobId)
      );
      const data = response.data;
      setScoredApplicants(data.applicants || []);
      setScoringStats(data.statistics || null);
    } catch (error) {
      console.error('Error fetching scoring:', error);
      toast.error('Failed to load applicant scoring');
    } finally {
      setLoadingScoring(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(applicationId), {
        status: newStatus,
      });
      toast.success('Application status updated');
      if (selectedJob && selectedJob !== 'all') {
        fetchApplications(selectedJob);
        if (showScoring) {
          fetchScoring(selectedJob);
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleJobClick = (jobId) => {
    if (jobId) {
      setSelectedJobId(jobId);
      setIsModalOpen(true);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200/60',
      'In Review': 'bg-blue-50 text-blue-700 border-blue-200/60',
      Applied: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return badges[status] || badges.Applied;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Excellent': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Good': return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Average': return 'bg-amber-50 text-amber-700 border-amber-200/60';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
    if (score >= 50) return 'text-blue-700 bg-blue-50 border-blue-200/60';
    if (score >= 30) return 'text-amber-700 bg-amber-50 border-amber-200/60';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const filteredApplications = (showScoring ? scoredApplicants : applications).filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout activeMenu="applicants">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Control Header */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => navigate('/employer-dashboard')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#475569]" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Candidate Review Console
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Applications Ledger</h1>
                <p className="text-sm text-[#475569] mt-0.5">
                  Filter incoming credentials, track fitness profiles, and modify hiring stages.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {selectedJob !== 'all' && (
                <button
                  onClick={() => setShowScoring(!showScoring)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer border ${
                    showScoring
                      ? 'bg-[#047857] text-white border-transparent shadow-sm'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50 hover:text-[#0F172A]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {showScoring ? 'Hide AI Assessment' : 'Show AI Assessment'}
                </button>
              )}
            </div>
          </div>

          {/* Configuration & Filter Blocks */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Target Opening</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all"
                >
                  <option value="all">All Postings</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} ({job.applicationCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Workflow Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={selectedJob === 'all'}
                >
                  <option value="all">All Stages</option>
                  <option value="Applied">Applied</option>
                  <option value="In Review">In Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Search Contenders</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] w-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={selectedJob === 'all'}
                  />
                </div>
              </div>
            </div>

            {/* AI Breakdown Dynamic Stats Panel */}
            {showScoring && scoringStats && (
              <div className="pt-5 border-t border-[#F1F5F9]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-[#047857] p-4 rounded-xl shadow-sm text-white">
                    <p className="text-[11px] font-bold opacity-80 uppercase tracking-wider">Total Pool</p>
                    <p className="text-2xl font-bold tracking-tight mt-0.5">{scoringStats.totalApplicants}</p>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Excellent Fit</p>
                    <p className="text-2xl font-bold text-emerald-800 tracking-tight mt-0.5">{scoringStats.excellentApplicants || 0}</p>
                  </div>
                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Good Fit</p>
                    <p className="text-2xl font-bold text-blue-800 tracking-tight mt-0.5">{scoringStats.applicationDistribution?.good || 0}</p>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Average Fit</p>
                    <p className="text-2xl font-bold text-amber-800 tracking-tight mt-0.5">{scoringStats.applicationDistribution?.average || 0}</p>
                  </div>
                  <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl">
                    <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Mean Score</p>
                    <p className="text-2xl font-bold text-[#0F172A] tracking-tight mt-0.5">{scoringStats.averageScore || 0}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Directory Core Conditional Content Router */}
          {selectedJob === 'all' ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">Select an active position profile</h3>
              <p className="text-[#475569] text-sm">Choose a target opening from the directory configuration selector above.</p>
            </div>
          ) : loading || loadingScoring ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-[#047857] mx-auto mb-4"></div>
              <p className="text-[#475569] text-sm font-medium">Assembling directory ledger records...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No applications located</h3>
              <p className="text-[#475569] text-sm">
                {applications.length === 0 ? 'No submissions listed for this role yet.' : 'No candidates match your chosen structural parameters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((application) => {
                // Extract match score from application
                const matchScore = application.totalScore || application.matchScore || null;
                const matchDetails = application.scoreDetails || application.matchDetails || null;
                
                return (
                  <div 
                    key={application._id} 
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-[#047857]/30 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Card Identity Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {application.applicant?.avatar ? (
                            <img 
                              src={application.applicant.avatar} 
                              alt={application.applicant.name} 
                              className="w-11 h-11 rounded-xl object-cover border border-[#E2E8F0] shrink-0" 
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#047857] to-[#065f46] flex items-center justify-center shadow-sm shrink-0">
                              <span className="text-white font-bold text-sm">
                                {application.applicant?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 
                                className="text-sm font-bold text-[#0F172A] group-hover:text-[#047857] transition-colors truncate cursor-pointer"
                                onClick={() => handleJobClick(application.job?._id)}
                              >
                                {application.applicant?.name}
                              </h3>
                              {/* ✅ Show Match Score Badge for Employer */}
                              {matchScore !== null && (
                                <MatchScoreBadge score={matchScore} size="sm" showLabel={true} />
                              )}
                            </div>
                            <p 
                              className="text-xs text-[#475569] mt-0.5 flex items-center gap-1 font-medium truncate cursor-pointer hover:text-[#047857]"
                              onClick={() => handleJobClick(application.job?._id)}
                            >
                              <Building2 className="w-3 h-3 text-[#94A3B8] shrink-0" />
                              {application.job?.title}
                            </p>
                          </div>
                        </div>

                        {/* Status pill element */}
                        <div className="shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1.5 ${getStatusBadge(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status}
                          </span>
                        </div>
                      </div>

                      {/* Meta Profile Badging Blocks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#475569] font-medium bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1.5 rounded-xl truncate">
                          <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                          <span className="truncate">{application.applicant?.email}</span>
                        </div>

                        {/* Contact Information for Employer */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <a
                            href={`mailto:${application.applicant?.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#047857] bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            {application.applicant?.email}
                          </a>
                          {application.applicant?.phone && (
                            <a
                              href={`tel:${application.applicant?.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#047857] bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              {application.applicant?.phone}
                            </a>
                          )}
                          {application.applicant?.resume && (
                            <a
                              href={application.applicant.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#047857] bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Resume
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A] pt-0.5">
                          <span className="flex items-center gap-1 text-[#94A3B8] font-normal">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            Applied {moment(application.createdAt).fromNow()}
                          </span>

                          <div className="flex gap-1.5">
                            {showScoring && application.totalScore !== undefined && (
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getScoreColor(application.totalScore)}`}>
                                Score: {application.totalScore}%
                              </span>
                            )}
                            {showScoring && application.strength && (
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStrengthColor(application.strength)}`}>
                                {application.strength}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ✅ Match Details Breakdown */}
                      {matchDetails && (
                        <MatchDetails details={matchDetails} size="sm" />
                      )}

                      {/* AI Scoring Analysis Breakdown */}
                      {showScoring && application.scoreDetails && (
                        <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
                          <p className="text-[10px] font-extrabold text-[#475569] uppercase tracking-wider">AI Target Breakdown</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                            {application.scoreDetails.skillMatch !== undefined && (
                              <div className="flex justify-between p-1.5 bg-white border border-[#F1F5F9] rounded-md">
                                <span className="text-[#475569] font-normal">Skills Matched</span>
                                <span className="text-emerald-700">{application.scoreDetails.skillMatch}%</span>
                              </div>
                            )}
                            {application.scoreDetails.experienceMatch !== undefined && (
                              <div className="flex justify-between p-1.5 bg-white border border-[#F1F5F9] rounded-md">
                                <span className="text-[#475569] font-normal">Experience</span>
                                <span className="text-blue-700">{application.scoreDetails.experienceMatch}%</span>
                              </div>
                            )}
                            {application.scoreDetails.locationMatch !== undefined && (
                              <div className="flex justify-between p-1.5 bg-white border border-[#F1F5F9] rounded-md">
                                <span className="text-[#475569] font-normal">Location Factor</span>
                                <span className="text-purple-700">{application.scoreDetails.locationMatch}%</span>
                              </div>
                            )}
                            {application.scoreDetails.timelinessScore !== undefined && (
                              <div className="flex justify-between p-1.5 bg-white border border-[#F1F5F9] rounded-md">
                                <span className="text-[#475569] font-normal">Timeliness</span>
                                <span className="text-amber-700">{application.scoreDetails.timelinessScore}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions & Core Control Footer strip */}
                    <div className="mt-5 pt-3.5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {application.applicant?.resume && (
                          <a 
                            href={application.applicant.resume} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition-all text-xs font-bold"
                          >
                            <Download className="w-3.5 h-3.5" /> Resume
                          </a>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 ml-auto">
                        {application.status === 'Applied' && (
                          <button 
                            onClick={() => handleStatusUpdate(application._id, 'In Review')} 
                            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-all cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                        {application.status !== 'Accepted' && (
                          <button 
                            onClick={() => handleStatusUpdate(application._id, 'Accepted')} 
                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                        {application.status !== 'Rejected' && (
                          <button 
                            onClick={() => handleStatusUpdate(application._id, 'Rejected')} 
                            className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          if (selectedJob && selectedJob !== 'all') {
            fetchApplications(selectedJob);
            if (showScoring) {
              fetchScoring(selectedJob);
            }
          }
        }}
      />
    </DashboardLayout>
  );
};

export default ApplicationViewer;