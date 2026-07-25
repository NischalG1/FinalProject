// frontend/src/pages/Auth/JobSeeker/AcceptedJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle,
  Calendar,
  MapPin,
  Building2,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  Award,
  Users,
  ChevronRight,
  Search,
  XCircle,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import JobDetailsModal from '../../../components/JobDetailsModal';
import toast from 'react-hot-toast';
import moment from 'moment';

const AcceptedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  const fetchAcceptedJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_MY_APPLICATIONS);
      // Filter only accepted applications
      const accepted = response.data.filter(app => app.status === 'Accepted');
      setAcceptedJobs(accepted);
    } catch (error) {
      console.error('Error fetching accepted jobs:', error);
      toast.error('Failed to load accepted jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const filteredJobs = acceptedJobs.filter(app => {
    const job = app.job;
    if (!job) return false;
    const search = searchTerm.toLowerCase();
    return job.title?.toLowerCase().includes(search) ||
           job.company?.companyName?.toLowerCase().includes(search) ||
           job.company?.name?.toLowerCase().includes(search) ||
           job.location?.toLowerCase().includes(search) ||
           job.category?.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <DashboardLayout activeMenu="accepted-jobs">
        <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
            <p className="text-[#5E6F8D] text-sm">Loading accepted jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="accepted-jobs">
      <div className="space-y-6">
        {/* Header - LinkedIn Green Theme */}
        <div className="bg-gradient-to-r from-[#0A6642] to-[#085433] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Accepted Jobs</h1>
                <p className="text-[#B8D9BF] text-sm mt-0.5">
                  Congratulations! You have {acceptedJobs.length} accepted {acceptedJobs.length === 1 ? 'job' : 'jobs'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5E6F8D]" />
                <input
                  type="text"
                  placeholder="Search accepted jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder:text-[#B8D9BF] focus:outline-none focus:ring-2 focus:ring-white/30 w-full md:w-64"
                />
              </div>
              <button
                onClick={() => navigate('/find-jobs')}
                className="px-6 py-2.5 bg-white text-[#0A6642] rounded-xl font-semibold hover:bg-[#E7F3E8] transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Browse More Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E7F3E8] rounded-xl">
                <Award className="w-6 h-6 text-[#0A6642]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D2226]">{acceptedJobs.length}</p>
                <p className="text-sm text-[#5E6F8D] font-medium">Total Accepted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D2226]">
                  {new Set(acceptedJobs.map(app => app.job?.company?._id || app.job?.company)).size}
                </p>
                <p className="text-sm text-[#5E6F8D] font-medium">Companies</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Briefcase className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D2226]">
                  {acceptedJobs.filter(app => app.job?.type === 'Remote').length}
                </p>
                <p className="text-sm text-[#5E6F8D] font-medium">Remote Jobs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {acceptedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-16 text-center">
            <div className="w-20 h-20 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-[#5E6F8D]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D2226] mb-2">No Accepted Jobs Yet</h3>
            <p className="text-sm text-[#5E6F8D] mb-6 max-w-md mx-auto">
              Keep applying to jobs! Once your applications are accepted, they will appear here.
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
            {filteredJobs.map((application) => {
              const job = application.job;
              if (!job) return null;

              return (
                <div
                  key={application._id}
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
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#E7F3E8] text-[#0A6642] border border-[#B8D9BF] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Accepted 🎉
                        </span>
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

                      <p className="text-[#5E6F8D] line-clamp-2 text-sm mt-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-[#E9ECEF]">
                        <div className="flex items-center gap-4 text-xs text-[#5E6F8D]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Accepted {moment(application.updatedAt).fromNow()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Applied {moment(application.createdAt).fromNow()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.company?.email && (
                            <a
                              href={`mailto:${job.company.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0A6642] bg-[#E7F3E8] hover:bg-[#B8D9BF] rounded-xl transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Contact
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJobClick(job._id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5E6F8D] hover:text-[#0A6642] hover:bg-[#F3F6F9] rounded-xl transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Skills Section */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 text-xs bg-[#E7F3E8] text-[#0A6642] rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="px-2 py-0.5 text-xs bg-[#F3F6F9] text-[#5E6F8D] rounded-full font-medium">
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
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
          fetchAcceptedJobs();
        }}
      />
    </DashboardLayout>
  );
};

export default AcceptedJobs;