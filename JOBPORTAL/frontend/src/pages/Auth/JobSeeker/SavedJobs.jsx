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
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import moment from 'moment';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <DashboardLayout activeMenu="saved-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading saved jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="saved-jobs">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
                <p className="text-gray-600 mt-1">
                  {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                </p>
              </div>
            </div>
            {savedJobs.length > 0 && (
              <button
                onClick={() => navigate('/find-jobs')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Browse More Jobs
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BriefcaseIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start saving jobs you're interested in to view them here. Click the bookmark icon on any job listing.
            </p>
            <button
              onClick={() => navigate('/find-jobs')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedJobs.map((savedJob) => {
              const job = savedJob.job;
              if (!job) return null;

              return (
                <div
                  key={savedJob._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
                  onClick={() => navigate(`/job/${job._id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {job.company?.companyLogo ? (
                          <img
                            src={job.company.companyLogo}
                            alt={job.company.companyName || job.company.name}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                            <Briefcase className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium mb-2">
                            {job.company?.companyName || job.company?.name}
                          </p>
                          <div className="flex flex-wrap gap-3 mb-3">
                            {job.location && (
                              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                            {job.category && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                {job.category}
                              </span>
                            )}
                            {(job.salaryMin || job.salaryMax) && (
                              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                                ${job.salaryMin || '0'}-${job.salaryMax || '0'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-2 mb-4 text-sm leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>Saved {moment(savedJob.createdAt).fromNow()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>Posted {moment(job.createdAt).fromNow()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleUnsaveJob(job._id, e)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
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
