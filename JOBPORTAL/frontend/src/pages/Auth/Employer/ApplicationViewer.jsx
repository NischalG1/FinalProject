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
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
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
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showScoring, setShowScoring] = useState(false);
  const [scoredApplicants, setScoredApplicants] = useState([]);
  const [scoringStats, setScoringStats] = useState(null);
  const [loadingScoring, setLoadingScoring] = useState(false);

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
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Average':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-blue-600';
    if (score >= 30) return 'text-amber-600';
    return 'text-gray-600';
  };

  const filteredApplications = (showScoring ? scoredApplicants : applications).filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  return (
    <DashboardLayout activeMenu="applicants">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/employer-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
              <p className="text-gray-600">Review and manage job applications</p>
            </div>
            {/* Scoring Toggle - NEW */}
            {selectedJob !== 'all' && (
              <button
                onClick={() => setShowScoring(!showScoring)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showScoring
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Award className="w-4 h-4" />
                {showScoring ? 'Hide Scoring' : 'Show Scoring'}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.applicationCount || 0} applications)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={selectedJob === 'all'}
              >
                <option value="all">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="In Review">In Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Scoring Statistics - NEW */}
          {showScoring && scoringStats && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold uppercase">Total</p>
                  <p className="text-2xl font-bold text-purple-900">{scoringStats.totalApplicants}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-semibold uppercase">Excellent</p>
                  <p className="text-2xl font-bold text-emerald-900">{scoringStats.excellentApplicants || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Good</p>
                  <p className="text-2xl font-bold text-blue-900">{scoringStats.applicationDistribution?.good || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-600 font-semibold uppercase">Average</p>
                  <p className="text-2xl font-bold text-amber-900">{scoringStats.applicationDistribution?.average || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{scoringStats.averageScore || 0}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedJob === 'all' ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a job to view applications
            </h3>
            <p className="text-gray-600">
              Choose a job from the dropdown above to see its applications
            </p>
          </div>
        ) : loading || loadingScoring ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600">
              {applications.length === 0
                ? 'No applications for this job yet'
                : 'No applications match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {application.applicant?.avatar ? (
                      <img
                        src={application.applicant.avatar}
                        alt={application.applicant.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xl">
                          {application.applicant?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.applicant?.name}
                        </h3>
                        {/* Score Badge - NEW */}
                        {showScoring && application.totalScore !== undefined && (
                          <span className={`text-sm font-bold ${getScoreColor(application.totalScore)}`}>
                            Score: {application.totalScore}%
                          </span>
                        )}
                        {/* Strength Badge - NEW */}
                        {showScoring && application.strength && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStrengthColor(application.strength)}`}>
                            {application.strength}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {application.applicant?.email}
                      </p>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          Applied for:{' '}
                          <span className="font-medium text-gray-900">
                            {application.job?.title}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {moment(application.createdAt).fromNow()}
                        </p>
                      </div>

                      {/* Score Details - NEW */}
                      {showScoring && application.scoreDetails && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Match Breakdown
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {application.scoreDetails.skillMatch !== undefined && (
                              <div className="text-xs">
                                <span className="text-gray-500">Skills:</span>
                                <span className="font-semibold text-blue-600 ml-1">
                                  {application.scoreDetails.skillMatch}%
                                </span>
                              </div>
                            )}
                            {application.scoreDetails.experienceMatch !== undefined && (
                              <div className="text-xs">
                                <span className="text-gray-500">Experience:</span>
                                <span className="font-semibold text-purple-600 ml-1">
                                  {application.scoreDetails.experienceMatch}%
                                </span>
                              </div>
                            )}
                            {application.scoreDetails.locationMatch !== undefined && (
                              <div className="text-xs">
                                <span className="text-gray-500">Location:</span>
                                <span className="font-semibold text-green-600 ml-1">
                                  {application.scoreDetails.locationMatch}%
                                </span>
                              </div>
                            )}
                            {application.scoreDetails.timelinessScore !== undefined && (
                              <div className="text-xs">
                                <span className="text-gray-500">Timeliness:</span>
                                <span className="font-semibold text-orange-600 ml-1">
                                  {application.scoreDetails.timelinessScore}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {application.applicant?.resume && (
                        <a
                          href={application.applicant.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium mt-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>View Resume</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                      {getStatusIcon(application.status)}
                      <span className="font-medium text-gray-900">
                        {application.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {application.status !== 'Accepted' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(application._id, 'Accepted')
                          }
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          Accept
                        </button>
                      )}
                      {application.status !== 'Rejected' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(application._id, 'Rejected')
                          }
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      )}
                      {application.status === 'Applied' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(application._id, 'In Review')
                          }
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationViewer;