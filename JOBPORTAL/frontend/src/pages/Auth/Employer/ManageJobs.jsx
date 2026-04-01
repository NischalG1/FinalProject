import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Eye,
  MapPin,
  Briefcase,
  Users,
  Power,
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import moment from 'moment';

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async (jobId, currentStatus) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      toast.success(
        currentStatus ? 'Job marked as open' : 'Job marked as closed'
      );
      fetchJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      toast.success('Job deleted successfully');
      setDeleteConfirm(null);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="manage-jobs">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
            <p className="text-gray-600">
              View and manage all your posted jobs ({jobs.length} total)
            </p>
          </div>
          <button
            onClick={() => navigate('/post-job')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start posting jobs to find the perfect candidates for your company
            </p>
            <button
              onClick={() => navigate('/post-job')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      {job.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3" />
                          Pending Approval
                        </span>
                      )}
                      {job.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                      {job.status === 'approved' && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                            job.isClosed
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {job.isClosed ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              Closed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Open
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      {job.category && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                          {job.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{moment(job.createdAt).fromNow()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{job.applicationCount || 0} applications</span>
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">
                            ${job.salaryMin || '0'} - ${job.salaryMax || '0'}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 line-clamp-2 mb-4 text-sm leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/applicants?jobId=${job._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Users className="w-4 h-4" />
                    <span>Applications ({job.applicationCount || 0})</span>
                  </button>
                  <button
                    onClick={() => handleToggleClose(job._id, job.isClosed)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      job.isClosed
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{job.isClosed ? 'Open Job' : 'Close Job'}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  {deleteConfirm === job._id ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(job._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;
