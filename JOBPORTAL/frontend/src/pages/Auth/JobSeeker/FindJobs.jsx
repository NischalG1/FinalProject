// frontend/src/pages/Auth/JobSeeker/FindJobs.jsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Bookmark, BookmarkCheck, Filter, Tag, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import { useAuth } from '../../../context/AuthContext';
import { JOB_TYPES, CATEGORIES } from '../../../utlis/data';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import MatchScoreBadge, { MatchDetails } from '../../../components/ui/MatchScoreBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const FindJobs = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    category: '',
    type: '',
    minSalary: '',
    maxSalary: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    fetchJobs();
  }, [filters, user, authLoading]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        userId: user?._id,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const response = await axiosInstance.get(API_PATHS.JOBS.GET_ALL_JOBS, {
        params,
      });

      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(error.response?.data?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId, isSaved) => {
    if (!user) return;
    
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        toast.success('Job removed from saved list');
      } else {
        await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        toast.success('Job saved successfully');
      }
      // Refetch jobs to update saved status
      const params = {
        userId: user._id,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_ALL_JOBS, { params });
      setJobs(response.data || []);
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      category: '',
      type: '',
      minSalary: '',
      maxSalary: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (authLoading) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="find-jobs">
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Dream Job
              </h1>
              <p className="text-gray-600">
                Discover {jobs.length > 0 ? `${jobs.length} ` : ''}opportunities that match your skills
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Main Search Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[280px] relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or keyword..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base"
                />
              </div>
              <div className="relative w-64 min-w-[200px]">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base"
                />
              </div>
              <button 
                onClick={fetchJobs}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filters - Category and Job Type inline below search */}
            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-base">Job Category</span>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full pl-5 pr-14 py-4.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base font-semibold appearance-none cursor-pointer hover:border-blue-300 transition-all shadow-sm hover:shadow-md active:border-blue-500"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%236366F1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '3.5rem'
                      }}
                    >
                      <option value="" className="text-gray-500 font-semibold py-3 text-base">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="py-3 text-base font-medium">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {filters.category && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters({ ...filters, category: '' });
                        }}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-red-200 hover:text-red-600 flex items-center justify-center text-gray-600 text-sm font-bold transition-all shadow-sm"
                        title="Clear category"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {filters.category && (
                    <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-700">
                        Selected: {CATEGORIES.find(c => c.value === filters.category)?.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Job Type Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-base">Job Type</span>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full pl-5 pr-14 py-4.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 text-base font-semibold appearance-none cursor-pointer hover:border-purple-300 transition-all shadow-sm hover:shadow-md active:border-purple-500"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%238B5CF6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '3.5rem'
                      }}
                    >
                      <option value="" className="text-gray-500 font-semibold py-3 text-base">All Types</option>
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value} className="py-3 text-base font-medium">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {filters.type && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters({ ...filters, type: '' });
                        }}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-red-200 hover:text-red-600 flex items-center justify-center text-gray-600 text-sm font-bold transition-all shadow-sm"
                        title="Clear job type"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {filters.type && (
                    <div className="mt-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg inline-flex items-center gap-2">
                      <span className="text-xs font-semibold text-purple-700">
                        Selected: {JOB_TYPES.find(t => t.value === filters.type)?.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters - Salary Range */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Salary Range</h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Min Salary</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.minSalary}
                    onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">Max Salary</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={filters.maxSalary}
                    onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search filters</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
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
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200 shrink-0">
                          <Briefcase className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          {/* Match Score Badge - NEW */}
                          {job.matchScore && (
                            <MatchScoreBadge 
                              score={job.matchScore} 
                              size="sm"
                              showLabel={true}
                            />
                          )}
                        </div>
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
                        {/* Match Details - NEW */}
                        {job.matchDetails && (
                          <MatchDetails details={job.matchDetails} size="sm" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-2 mb-4 text-sm leading-relaxed">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{moment(job.createdAt).fromNow()}</span>
                        {job.applicationStatus && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                            {job.applicationStatus}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveJob(job._id, job.isSaved);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {job.isSaved ? (
                          <>
                            <BookmarkCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
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

export default FindJobs;