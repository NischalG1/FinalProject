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
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MatchScoreBadge, { MatchDetails } from '../../../components/ui/MatchScoreBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS);
      setSavedJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success('Job removed from saved list');
      fetchSavedJobs();
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  const filteredJobs = savedJobs.filter(savedJob => {
    const job = savedJob.job;
    if (!job) return false;
    return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.location?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout activeMenu="saved-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading saved jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="saved-jobs">
      <div className="space-y-6">
        {/* Header - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent w-full md:w-64"
                />
              </div>
              {savedJobs.length > 0 && (
                <button
                  onClick={() => navigate('/find-jobs')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors text-sm"
                >
                  Browse More Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List - LinkedIn Style */}
        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Start saving jobs you're interested in to view them here. Click the bookmark icon on any job listing.
            </p>
            <button
              onClick={() => navigate('/find-jobs')}
              className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching jobs</h3>
            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((savedJob) => {
              const job = savedJob.job;
              if (!job) return null;

              return (
                <div
                  key={savedJob._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
                  onClick={() => navigate(`/job/${job._id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Company Logo */}
                    {job.company?.companyLogo ? (
                      <img
                        src={job.company.companyLogo}
                        alt={job.company.companyName || job.company.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-gray-200 shrink-0">
                        <Building2 className="w-8 h-8 text-purple-600" />
                      </div>
                    )}

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h3>
                        {job.matchScore && (
                          <MatchScoreBadge score={job.matchScore} size="sm" showLabel={true} />
                        )}
                      </div>

                      <p className="text-gray-600 font-medium mb-3">
                        {job.company?.companyName || job.company?.name}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-3">
                        {job.location && (
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Briefcase className="w-4 h-4" />
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="px-3 py-1 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
                            {job.category}
                          </span>
                        )}
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                            ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                          </span>
                        )}
                      </div>

                      {/* Match Details */}
                      {job.matchDetails && (
                        <MatchDetails details={job.matchDetails} size="sm" />
                      )}

                      <p className="text-gray-600 line-clamp-2 text-sm mt-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Saved {moment(savedJob.createdAt).fromNow()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Posted {moment(job.createdAt).fromNow()}
                          </span>
                          {job.applicationStatus && (
                            <span className="px-2.5 py-1 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
                              {job.applicationStatus}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleUnsaveJob(job._id, e)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </DashboardLayout>
  );
};

export default SavedJobs;