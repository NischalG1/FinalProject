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
  Users,
  Award,
  Share2,
  ExternalLink,
  Mail,
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company?.companyName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
            <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/find-jobs')}
              className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors"
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
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/find-jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Jobs</span>
        </button>

        {/* Main Job Card - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Company Logo */}
              {job.company?.companyLogo ? (
                <img
                  src={job.company.companyLogo}
                  alt={job.company.companyName || job.company.name}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center shrink-0">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  {job.matchScore && (
                    <MatchScoreBadge score={job.matchScore} size="md" showLabel={true} />
                  )}
                </div>

                <p className="text-lg font-medium text-gray-700 mb-3">
                  {job.company?.companyName || job.company?.name}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Posted {moment(job.createdAt).fromNow()}
                  </span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                      <DollarSign className="w-4 h-4" />
                      ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                    </span>
                  )}
                </div>

                {job.category && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#0a66c2] rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                    {job.matchDetails && (
                      <>
                        {job.matchDetails.skillMatch !== undefined && (
                          <span className="px-3 py-1 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
                            Skills: {job.matchDetails.skillMatch}%
                          </span>
                        )}
                        {job.matchDetails.experienceMatch !== undefined && (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                            Experience: {job.matchDetails.experienceMatch}%
                          </span>
                        )}
                        {job.matchDetails.locationMatch !== undefined && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                            Location: {job.matchDetails.locationMatch}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {user && user.role === 'jobseeker' && (
                  <button
                    onClick={handleSaveJob}
                    className={`p-3 rounded-xl border transition-colors ${
                      job.isSaved
                        ? 'bg-blue-50 border-blue-200 text-[#0a66c2]'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
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
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
                  title="Share job"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Application Status or Apply Button */}
            {user && user.role === 'jobseeker' && (
              <div className="mb-8">
                {job.applicationStatus ? (
                  <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-[#0a66c2] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#0a66c2]">Application Status</p>
                      <p className="text-sm text-gray-600">{job.applicationStatus}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-[#0a66c2] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#004182] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0a66c2]" />
                Job Description
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#0a66c2]" />
                Requirements
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {job.requirements}
                </p>
              </div>
            </div>

            {/* Skills Section */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0a66c2]" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-blue-50 text-[#0a66c2] rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Jobs Section - LinkedIn Style */}
        {similarJobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Similar Jobs You Might Like
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {similarJobs.length} similar jobs found based on skills and category
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="group p-5 border-2 border-gray-200 rounded-xl hover:border-[#0a66c2] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                      {job.similarityScore && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          job.similarityScore >= 70 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : job.similarityScore >= 40 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {job.similarityScore}% similar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>
                    {job.matchDetails && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.matchDetails.skillMatch !== undefined && (
                          <span className="text-xs bg-blue-50 text-[#0a66c2] px-2 py-0.5 rounded-full">
                            Skills: {job.matchDetails.skillMatch}%
                          </span>
                        )}
                        {job.matchDetails.experienceMatch !== undefined && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            Exp: {job.matchDetails.experienceMatch}%
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading similar jobs...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;