// frontend/src/pages/Auth/JobSeeker/JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  FileText,
  CheckCircle,
  Building2,
  Clock,
  Globe,
  Sparkles,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MatchScoreBadge from '../../../components/ui/MatchScoreBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchSimilarJobs();
    }
  }, [jobId, user?._id]);

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
      navigate('/find-jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      setLoadingSimilar(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SIMILAR_JOBS(jobId), {
        params: { limit: 5 },
      });
      setSimilarJobs(response.data.similarJobs || []);
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      // Don't show toast for similar jobs - it's not critical
    } finally {
      setLoadingSimilar(false);
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
            <button
              onClick={() => navigate('/find-jobs')}
              className="text-blue-600 hover:underline font-medium"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="find-jobs">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/find-jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Jobs</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                {job.company?.companyLogo ? (
                  <img
                    src={job.company.companyLogo}
                    alt={job.company.companyName || job.company.name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {job.title}
                    </h1>
                    {/* Match Score Badge - NEW */}
                    {job.matchScore && (
                      <MatchScoreBadge 
                        score={job.matchScore} 
                        size="md"
                        showLabel={true}
                      />
                    )}
                  </div>
                  <p className="text-xl text-gray-700 font-medium mb-3">
                    {job.company?.companyName || job.company?.name}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>Posted {moment(job.createdAt).fromNow()}</span>
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-semibold">
                          ${job.salaryMin || '0'} - ${job.salaryMax || '0'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {user && user.role === 'jobseeker' && (
                <button
                  onClick={handleSaveJob}
                  className="p-3 hover:bg-white/80 rounded-lg transition-colors shadow-sm"
                  title={job.isSaved ? 'Remove from saved' : 'Save job'}
                >
                  {job.isSaved ? (
                    <BookmarkCheck className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Bookmark className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              )}
            </div>

            {job.category && (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                  {job.category}
                </span>
                {/* Match Details - NEW */}
                {job.matchDetails && (
                  <div className="flex flex-wrap gap-2 ml-4">
                    {job.matchDetails.skillMatch !== undefined && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Skills: {job.matchDetails.skillMatch}%
                      </span>
                    )}
                    {job.matchDetails.experienceMatch !== undefined && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Experience: {job.matchDetails.experienceMatch}%
                      </span>
                    )}
                    {job.matchDetails.locationMatch !== undefined && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Location: {job.matchDetails.locationMatch}%
                      </span>
                    )}
                    {job.matchDetails.salaryMatch !== undefined && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Salary: {job.matchDetails.salaryMatch}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Application Status or Apply Button */}
            {user && user.role === 'jobseeker' && (
              <div className="mb-8">
                {job.applicationStatus ? (
                  <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900">Application Status</p>
                      <p className="text-blue-700">{job.applicationStatus}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-6 h-6" />
                        <span>Apply Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Job Description
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-200">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                Requirements
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-200">
                  {job.requirements}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs Section - NEW */}
        {similarJobs.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Similar Jobs You Might Like
              </h2>
              <p className="text-gray-600 mt-1">
                {similarJobs.length} similar jobs found based on skills and category
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => {
                      // Navigate to the same page with new job ID
                      window.location.href = `/job/${job._id}`;
                    }}
                    className="group p-5 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                      {/* Similarity Score */}
                      {job.similarityScore && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          job.similarityScore >= 70 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          job.similarityScore >= 40 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {job.similarityScore}% similar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>
                    {/* Match details for similar job */}
                    {job.matchDetails && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.matchDetails.skillMatch !== undefined && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            Skills: {job.matchDetails.skillMatch}%
                          </span>
                        )}
                        {job.matchDetails.experienceMatch !== undefined && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            Exp: {job.matchDetails.experienceMatch}%
                          </span>
                        )}
                        {job.matchDetails.locationMatch !== undefined && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            Loc: {job.matchDetails.locationMatch}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loadingSimilar && (
          <div className="mt-8 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading similar jobs...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;