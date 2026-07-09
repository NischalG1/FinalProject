import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Bookmark, 
  BookmarkCheck, 
  Filter, 
  Tag, 
  Clock, 
  Sparkles,
  Building2,
  DollarSign,
  SlidersHorizontal,
  X,
  ArrowUpDown
} from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchJobs();
  }, [filters, sortBy, user, authLoading]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        userId: user?._id,
        sort: sortBy,
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
      fetchJobs();
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
    setSortBy('recent');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (authLoading) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout activeMenu="find-jobs">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h2>
            <p className="text-gray-500 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors"
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
      <div className="space-y-6">
        {/* Header - LinkedIn Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Your Dream Job</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Discover {jobs.length > 0 ? `${jobs.length} ` : ''}opportunities that match your skills
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#0a66c2] rounded-full"></span>
              )}
            </button>
          </div>

          {/* Search Bar - LinkedIn Style */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[280px] relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or keyword..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent text-sm"
                />
              </div>
              <div className="relative w-64 min-w-[200px]">
                <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent text-sm"
                />
              </div>
              <button 
                onClick={fetchJobs}
                className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors shadow-sm"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel - LinkedIn Style */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-[#0a66c2] hover:text-[#004182] font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="match">Best Match</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Min Salary
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minSalary}
                  onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Salary
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.maxSalary}
                  onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Jobs List - LinkedIn Style */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0a66c2] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your search filters</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#0a66c2] transition-all cursor-pointer group"
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
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200 shrink-0">
                      <Building2 className="w-8 h-8 text-[#0a66c2]" />
                    </div>
                  )}

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors">
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
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {moment(job.createdAt).fromNow()}
                        </span>
                        {job.applicationStatus && (
                          <span className="px-2.5 py-1 bg-blue-50 text-[#0a66c2] rounded-full text-xs font-medium">
                            {job.applicationStatus}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveJob(job._id, job.isSaved);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          job.isSaved
                            ? 'text-[#0a66c2] bg-blue-50 hover:bg-blue-100'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {job.isSaved ? (
                          <>
                            <BookmarkCheck className="w-4 h-4" />
                            <span>Saved</span>
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