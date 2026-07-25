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
  Sparkles,
  Users,
  Award,
  Share2,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  User,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MatchScoreBadge from '../../../components/ui/MatchScoreBadge';
import EmployerProfileView from '../../../components/EmployerProfileView';
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
  const [showEmployerProfile, setShowEmployerProfile] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
            <p className="text-[#5E6F8D] text-sm">Loading job details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-[#E9ECEF]">
            <h2 className="text-2xl font-bold text-[#1D2226] mb-2">Job not found</h2>
            <p className="text-[#5E6F8D] mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/find-jobs')}
              className="px-6 py-2.5 bg-[#0A6642] text-white rounded-xl font-medium hover:bg-[#085433] transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get company data safely
  const company = job.company || {};
  const companyAvatar = company.avatar || '';
  const companyLogo = company.companyLogo || '';
  const companyName = company.companyName || company.name || '';

  return (
    <DashboardLayout activeMenu="find-jobs">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/find-jobs')}
          className="flex items-center gap-2 text-[#5E6F8D] hover:text-[#1D2226] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Jobs</span>
        </button>

        {/* Main Job Card - LinkedIn Green Theme */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-[#E9ECEF]">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Avatar and Company Logo */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Profile Avatar (Circle) */}
                {companyAvatar ? (
                  <img
                    src={companyAvatar}
                    alt={companyName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#E9ECEF]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#E7F3E8] flex items-center justify-center border-2 border-[#E9ECEF]">
                    <User className="w-6 h-6 text-[#0A6642]" />
                  </div>
                )}
                
                {/* Company Logo (Square) */}
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="w-20 h-20 rounded-xl object-cover border border-[#E9ECEF] shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF] shrink-0">
                    <Building2 className="w-10 h-10 text-[#0A6642]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#1D2226]">
                    {job.title}
                  </h1>
                  {job.matchScore && (
                    <MatchScoreBadge score={job.matchScore} size="md" showLabel={true} />
                  )}
                </div>

                {/* Company Name with View Profile Button */}
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-lg font-medium text-[#5E6F8D]">
                    {companyName}
                  </p>
                  <button
                    onClick={() => setShowEmployerProfile(true)}
                    className="text-xs text-[#0A6642] hover:text-[#085433] flex items-center gap-1 font-medium hover:underline transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Company Profile
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-[#5E6F8D]">
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
                    <span className="flex items-center gap-1.5 font-medium text-[#0A6642]">
                      <DollarSign className="w-4 h-4" />
                      ${job.salaryMin?.toLocaleString() || '0'} - ${job.salaryMax?.toLocaleString() || '0'}
                    </span>
                  )}
                </div>

                {job.category && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-sm font-medium">
                      {job.category}
                    </span>
                    {job.matchDetails && (
                      <>
                        {job.matchDetails.skillMatch !== undefined && (
                          <span className="px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                            Skills: {job.matchDetails.skillMatch}%
                          </span>
                        )}
                        {job.matchDetails.experienceMatch !== undefined && (
                          <span className="px-3 py-1 bg-[#E7F3FF] text-[#0A66C2] rounded-full text-xs font-medium">
                            Experience: {job.matchDetails.experienceMatch}%
                          </span>
                        )}
                        {job.matchDetails.locationMatch !== undefined && (
                          <span className="px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                            Location: {job.matchDetails.locationMatch}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Quick Employer Info */}
                <div className="flex flex-wrap items-center gap-3 mt-3 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                  {company.companyLocation && (
                    <span className="flex items-center gap-1.5 text-xs text-[#5E6F8D]">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {company.companyLocation}
                    </span>
                  )}
                  {company.industry && (
                    <span className="flex items-center gap-1.5 text-xs text-[#5E6F8D]">
                      <Award className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {company.industry}
                    </span>
                  )}
                  {company.companySize && (
                    <span className="flex items-center gap-1.5 text-xs text-[#5E6F8D]">
                      <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {company.companySize} employees
                    </span>
                  )}
                  {company.companyWebsite && (
                    <a
                      href={company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#0A6642] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {company.companyPhone && (
                    <a
                      href={`tel:${company.companyPhone}`}
                      className="flex items-center gap-1.5 text-xs text-[#0A6642] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Contact
                    </a>
                  )}
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-1.5 text-xs text-[#0A6642] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl border border-[#E9ECEF] text-[#5E6F8D] hover:border-[#B8D9BF] hover:text-[#0A6642] transition-colors"
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
                  <div className="flex items-center gap-3 px-6 py-4 bg-[#E7F3E8] border border-[#B8D9BF] rounded-xl">
                    <CheckCircle className="w-6 h-6 text-[#0A6642] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#0A6642]">Application Status</p>
                      <p className="text-sm text-[#5E6F8D]">{job.applicationStatus}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-[#0A6642] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#085433] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
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
              <h2 className="text-xl font-bold text-[#1D2226] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A6642]" />
                Job Description
              </h2>
              <div className="bg-[#F8FAFB] rounded-xl p-6 border border-[#E9ECEF]">
                <p className="text-[#1D2226] whitespace-pre-wrap leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-bold text-[#1D2226] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#0A6642]" />
                Requirements
              </h2>
              <div className="bg-[#F8FAFB] rounded-xl p-6 border border-[#E9ECEF]">
                <p className="text-[#1D2226] whitespace-pre-wrap leading-relaxed text-sm">
                  {job.requirements}
                </p>
              </div>
            </div>

            {/* Skills Section */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-[#1D2226] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0A6642]" />
                  Required Skills
                </h3>
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
          </div>
        </div>

        {/* Similar Jobs Section */}
        {similarJobs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] overflow-hidden">
            <div className="p-6 border-b border-[#E9ECEF]">
              <h2 className="text-xl font-bold text-[#1D2226] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0A6642]" />
                Similar Jobs You Might Like
              </h2>
              <p className="text-sm text-[#5E6F8D] mt-0.5">
                {similarJobs.length} similar jobs found based on skills and category
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="group p-5 border-2 border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1D2226] group-hover:text-[#0A6642] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-[#5E6F8D] font-medium">
                          {job.company?.companyName || job.company?.name}
                        </p>
                      </div>
                      {job.similarityScore && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          job.similarityScore >= 70 
                            ? 'bg-[#E7F3E8] text-[#0A6642] border-[#B8D9BF]' 
                            : job.similarityScore >= 40 
                            ? 'bg-[#FFF4E7] text-[#B26E0A] border-[#F5E6D0]' 
                            : 'bg-[#F3F6F9] text-[#5E6F8D] border-[#E9ECEF]'
                        }`}>
                          {job.similarityScore}% similar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#5E6F8D]">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="px-2 py-0.5 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {job.category && (
                        <span className="px-2 py-0.5 bg-[#F3F6F9] text-[#5E6F8D] rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                      )}
                    </div>
                    {job.matchDetails && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.matchDetails.skillMatch !== undefined && (
                          <span className="text-xs bg-[#E7F3E8] text-[#0A6642] px-2 py-0.5 rounded-full">
                            Skills: {job.matchDetails.skillMatch}%
                          </span>
                        )}
                        {job.matchDetails.experienceMatch !== undefined && (
                          <span className="text-xs bg-[#E7F3FF] text-[#0A66C2] px-2 py-0.5 rounded-full">
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
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-3"></div>
            <p className="text-sm text-[#5E6F8D]">Loading similar jobs...</p>
          </div>
        )}
      </div>

      {/* Employer Profile View Modal */}
      <EmployerProfileView
        employerId={company._id}
        isOpen={showEmployerProfile}
        onClose={() => setShowEmployerProfile(false)}
      />
    </DashboardLayout>
  );
};

export default JobDetails;