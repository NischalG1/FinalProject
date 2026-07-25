// frontend/src/pages/Auth/JobSeeker/SavedJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  BookmarkCheck,
  Trash2,
  BriefcaseIcon,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  Search,
  ChevronRight,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MatchScoreBadge, { MatchDetails } from '../../../components/ui/MatchScoreBadge';
import JobDetailsModal from '../../../components/JobDetailsModal';
import toast from 'react-hot-toast';
import moment from 'moment';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.SAVED_JOBS.GET_MY);
      // Handle both response formats
      const data = response.data?.data || response.data || [];
      setSavedJobs(data);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(API_PATHS.SAVED_JOBS.UNSAVE(jobId));
      toast.success('Job removed from saved list');
      fetchSavedJobs();
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  const handleJobClick = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const filteredJobs = savedJobs.filter(savedJob => {
    const job = savedJob.job;
    if (!job) return false;
    return job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.location?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout activeMenu="saved-jobs">
        <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
            <p className="text-[#5E6F8D] text-sm">Loading saved jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="saved-jobs">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6 text-[#0A6642]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1D2226]">Saved Jobs</h1>
                <p className="text-sm text-[#5E6F8D] mt-0.5">
                  {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5E6F8D]" />
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#E9ECEF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent w-full md:w-64 bg-white"
                />
              </div>
              {savedJobs.length > 0 && (
                <button
                  onClick={() => navigate('/find-jobs')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A6642] text-white rounded-xl font-medium hover:bg-[#085433] transition-colors text-sm shadow-sm"
                >
                  Browse More Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-16 text-center">
            <div className="w-20 h-20 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-10 h-10 text-[#5E6F8D]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D2226] mb-2">No saved jobs yet</h3>
            <p className="text-sm text-[#5E6F8D] mb-6 max-w-md mx-auto">
              Start saving jobs you're interested in to view them here. Click the bookmark icon on any job listing.
            </p>
            <button
              onClick={() => navigate('/find-jobs')}
              className="px-6 py-2.5 bg-[#0A6642] text-white rounded-xl font-medium hover:bg-[#085433] transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-16 text-center">
            <div className="w-20 h-20 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-[#5E6F8D]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D2226] mb-2">No matching jobs</h3>
            <p className="text-sm text-[#5E6F8D]">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((savedJob) => {
              const job = savedJob.job;
              if (!job) return null;

              return (
                <div
                  key={savedJob._id}
                  className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6 hover:shadow-md hover:border-[#0A6642]/30 transition-all cursor-pointer group"
                  onClick={() => handleJobClick(job._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Company Logo */}
                    {job.company?.companyLogo ? (
                      <img
                        src={job.company.companyLogo}
                        alt={job.company.companyName || job.company.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E9ECEF] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF] shrink-0">
                        <Building2 className="w-8 h-8 text-[#0A6642]" />
                      </div>
                    )}

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-[#1D2226] group-hover:text-[#0A6642] transition-colors">
                          {job.title}
                        </h3>
                        {job.matchScore && (
                          <MatchScoreBadge score={job.matchScore} size="sm" showLabel={true} />
                        )}
                      </div>

                      <p className="text-[#5E6F8D] font-medium mb-3">
                        {job.company?.companyName || job.company?.name}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-3">
                        {job.location && (
                          <span className="flex items-center gap-1.5 text-sm text-[#5E6F8D]">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-[#5E6F8D]">
                          <Briefcase className="w-4 h-4" />
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                        )}
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                            ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                          </span>
                        )}
                      </div>

                      {/* Match Details */}
                      {job.matchDetails && (
                        <MatchDetails details={job.matchDetails} size="sm" />
                      )}

                      <p className="text-[#5E6F8D] line-clamp-2 text-sm mt-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-[#E9ECEF]">
                        <div className="flex items-center gap-4 text-xs text-[#5E6F8D]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Saved {moment(savedJob.createdAt).fromNow()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Posted {moment(job.createdAt).fromNow()}
                          </span>
                          {job.applicationStatus && (
                            <span className="px-2.5 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                              {job.applicationStatus}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleUnsaveJob(job._id, e)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#B2405A] hover:bg-[#FDE7E9] rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          fetchSavedJobs();
        }}
      />
    </DashboardLayout>
  );
};

export default SavedJobs;