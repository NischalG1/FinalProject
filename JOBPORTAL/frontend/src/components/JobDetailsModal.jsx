// frontend/src/components/JobDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  Users,
  Award,
  FileText,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utlis/axiosinstance';
import { API_PATHS } from '../utlis/apiPaths';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from './ui/MatchScoreBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const JobDetailsModal = ({ jobId, isOpen, onClose, onAction }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
      fetchSimilarJobs();
    }
  }, [isOpen, jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId), {
        params: { userId: user?._id },
      });
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SIMILAR_JOBS(jobId), {
        params: { limit: 3 },
      });
      setSimilarJobs(response.data.similarJobs || []);
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    try {
      if (job.isSaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        toast.success('Job removed from saved list');
      } else {
        await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        toast.success('Job saved successfully');
      }
      fetchJobDetails();
      if (onAction) onAction();
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (user.role !== 'jobseeker') {
      toast.error('Only job seekers can apply');
      return;
    }

    if (!user.resume) {
      toast.error('Please upload your resume in profile first');
      navigate('/profile');
      return;
    }

    if (job.applicationStatus) {
      toast.error('You have already applied for this job');
      return;
    }

    try {
      setApplying(true);
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
      toast.success('Application submitted successfully!');
      fetchJobDetails();
      if (onAction) onAction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company?.companyName}`,
        url: `${window.location.origin}/job/${jobId}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/job/${jobId}`);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle view full page navigation - ONLY for job seekers
  const handleViewFullPage = () => {
    onClose();
    setTimeout(() => {
      navigate(`/job/${jobId}`);
    }, 200);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      'In Review': 'bg-blue-50 text-blue-700 border-blue-200',
      Applied: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return badges[status] || badges.Applied;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
                <p className="text-[#5E6F8D] text-sm">Loading job details...</p>
              </div>
            </div>
          ) : !job ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-[#B2405A] mx-auto mb-4" />
                <p className="text-[#1D2226] font-semibold">Job not found</p>
                <p className="text-[#5E6F8D] text-sm">The job you're looking for doesn't exist</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-[#E9ECEF] rounded-t-2xl">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar (Circle) */}
                    {job.company?.avatar ? (
                      <img
                        src={job.company.avatar}
                        alt={job.company.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E7F3E8] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#0A6642]" />
                      </div>
                    )}
                    
                    {/* Company Logo (Square) */}
                    {job.company?.companyLogo ? (
                      <img
                        src={job.company.companyLogo}
                        alt={job.company.companyName}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#0A6642]" />
                      </div>
                    )}
                    
                    <div>
                      <h2 className="text-lg font-bold text-[#1D2226] line-clamp-1">
                        {job.title}
                      </h2>
                      <p className="text-sm text-[#5E6F8D]">
                        {job.company?.companyName || job.company?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[#F3F6F9] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-[#5E6F8D]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Company & Match Score - Shows BOTH Profile Avatar and Company Logo */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Profile Avatar (Circle) */}
                    {job.company?.avatar ? (
                      <img
                        src={job.company.avatar}
                        alt={job.company.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF]">
                        <User className="w-6 h-6 text-[#0A6642]" />
                      </div>
                    )}
                    
                    {/* Company Logo (Square) */}
                    {job.company?.companyLogo ? (
                      <img
                        src={job.company.companyLogo}
                        alt={job.company.companyName}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF]">
                        <Building2 className="w-8 h-8 text-[#0A6642]" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xl font-bold text-[#1D2226]">
                        {job.title}
                      </h3>
                      <p className="text-[#5E6F8D] font-medium">
                        {job.company?.companyName || job.company?.name}
                      </p>
                    </div>
                  </div>
                  {job.matchScore && (
                    <MatchScoreBadge score={job.matchScore} size="lg" showLabel={true} />
                  )}
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-[#5E6F8D]">
                      <MapPin className="w-4 h-4 text-[#0A6642]" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#5E6F8D]">
                    <Briefcase className="w-4 h-4 text-[#0A6642]" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#5E6F8D]">
                    <Calendar className="w-4 h-4 text-[#0A6642]" />
                    <span>Posted {moment(job.createdAt).fromNow()}</span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0A6642]">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                      </span>
                    </div>
                  )}
                  {job.category && (
                    <div className="flex items-center gap-2 text-sm text-[#5E6F8D]">
                      <Award className="w-4 h-4 text-[#0A6642]" />
                      <span>{job.category}</span>
                    </div>
                  )}
                  {job.applicationStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadge(job.applicationStatus)}`}>
                        {job.applicationStatus}
                      </span>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#0A6642]" />
                    Description
                  </h4>
                  <div className="bg-[#F8FAFB] rounded-xl p-4 border border-[#E9ECEF]">
                    <p className="text-[#1D2226] whitespace-pre-wrap leading-relaxed text-sm">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-[#0A6642]" />
                    Requirements
                  </h4>
                  <div className="bg-[#F8FAFB] rounded-xl p-4 border border-[#E9ECEF]">
                    <p className="text-[#1D2226] whitespace-pre-wrap leading-relaxed text-sm">
                      {job.requirements}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-[#0A6642]" />
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 bg-[#E7F3E8] text-[#0A6642] rounded-full text-sm font-medium border border-[#B8D9BF]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Details */}
                {job.matchDetails && (
                  <div>
                    <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#0A6642]" />
                      Match Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {job.matchDetails.skillMatch !== undefined && (
                        <div className="p-3 bg-[#E7F3E8] rounded-xl border border-[#B8D9BF] text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Skills</p>
                          <p className="text-xl font-bold text-[#0A6642]">{job.matchDetails.skillMatch}%</p>
                        </div>
                      )}
                      {job.matchDetails.experienceMatch !== undefined && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Experience</p>
                          <p className="text-xl font-bold text-blue-700">{job.matchDetails.experienceMatch}%</p>
                        </div>
                      )}
                      {job.matchDetails.locationMatch !== undefined && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Location</p>
                          <p className="text-xl font-bold text-purple-700">{job.matchDetails.locationMatch}%</p>
                        </div>
                      )}
                      {job.matchDetails.salaryMatch !== undefined && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Salary</p>
                          <p className="text-xl font-bold text-amber-700">{job.matchDetails.salaryMatch}%</p>
                        </div>
                      )}
                      {job.matchDetails.categoryMatch !== undefined && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Category</p>
                          <p className="text-xl font-bold text-emerald-700">{job.matchDetails.categoryMatch}%</p>
                        </div>
                      )}
                      {job.matchDetails.jobTypeMatch !== undefined && (
                        <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-center">
                          <p className="text-xs text-[#5E6F8D] font-medium">Job Type</p>
                          <p className="text-xl font-bold text-teal-700">{job.matchDetails.jobTypeMatch}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Similar Jobs */}
                {similarJobs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#0A6642]" />
                      Similar Jobs
                    </h4>
                    <div className="space-y-2">
                      {similarJobs.map((similarJob) => (
                        <div
                          key={similarJob._id}
                          onClick={() => {
                            // Update the current job to the similar job
                            setJobId(similarJob._id);
                            fetchJobDetails();
                            fetchSimilarJobs();
                            // Scroll to top of modal
                            const modalContent = document.querySelector('.max-h-[90vh]');
                            if (modalContent) modalContent.scrollTop = 0;
                          }}
                          className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF] hover:border-[#0A6642] hover:bg-white transition-all cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1D2226] group-hover:text-[#0A6642] transition-colors text-sm truncate">
                              {similarJob.title}
                            </p>
                            <p className="text-xs text-[#5E6F8D] truncate">
                              {similarJob.company?.companyName || similarJob.company?.name}
                            </p>
                          </div>
                          {similarJob.similarityScore && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ml-2 shrink-0 ${
                              similarJob.similarityScore >= 70 
                                ? 'bg-[#E7F3E8] text-[#0A6642] border-[#B8D9BF]' 
                                : similarJob.similarityScore >= 40 
                                ? 'bg-[#FFF4E7] text-[#B26E0A] border-[#F5E6D0]' 
                                : 'bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]'
                            }`}>
                              {similarJob.similarityScore}% match
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E9ECEF]">
                  {/* Apply Button - Only for Job Seekers */}
                  {user && user.role === 'jobseeker' && (
                    <button
                      onClick={handleApply}
                      disabled={applying || job.applicationStatus}
                      className="flex-1 bg-[#0A6642] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#085433] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                    >
                      {applying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Applying...</span>
                        </>
                      ) : job.applicationStatus ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          <span>Apply Now</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* View Full Job Page Button - ONLY for Job Seekers */}
                  {user && user.role === 'jobseeker' && (
                    <button
                      onClick={handleViewFullPage}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E9ECEF] text-[#5E6F8D] hover:text-[#0A6642] hover:border-[#0A6642] rounded-xl font-semibold transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>View Full Page</span>
                    </button>
                  )}

                  {/* For employers: Show a "Close" button instead of "View Full Page" */}
                  {user && user.role === 'employer' && (
                    <button
                      onClick={onClose}
                      className="flex-1 bg-[#047857] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#065f46] transition-all shadow-sm"
                    >
                      Close
                    </button>
                  )}

                  {/* Save/Unsave Button - Only for Job Seekers */}
                  {user && user.role === 'jobseeker' && (
                    <button
                      onClick={handleSaveJob}
                      className={`p-3 rounded-xl border transition-colors ${
                        job.isSaved
                          ? 'bg-[#E7F3E8] border-[#B8D9BF] text-[#0A6642]'
                          : 'border-[#E9ECEF] text-[#5E6F8D] hover:border-[#B8D9BF] hover:text-[#0A6642]'
                      }`}
                      title={job.isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      {job.isSaved ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {/* Share Button - visible to everyone */}
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl border border-[#E9ECEF] text-[#5E6F8D] hover:border-[#B8D9BF] hover:text-[#0A6642] transition-colors"
                    title="Share job"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetailsModal;