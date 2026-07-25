// frontend/src/components/EmployerProfileView.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Calendar,
  Award,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  User,
} from 'lucide-react';
import axiosInstance from '../utlis/axiosinstance';
import { API_PATHS } from '../utlis/apiPaths';
import toast from 'react-hot-toast';

const EmployerProfileView = ({ employerId, isOpen, onClose }) => {
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && employerId) {
      fetchEmployerDetails();
      fetchEmployerJobs();
    } else {
      setEmployer(null);
      setActiveJobs([]);
      setLoading(true);
      setError(null);
    }
  }, [isOpen, employerId]);

  const fetchEmployerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(API_PATHS.USER.GET_PUBLIC_PROFILE(employerId));
      setEmployer(response.data);
    } catch (error) {
      console.error('Error fetching employer details:', error);
      setError('Failed to load employer details');
      toast.error('Failed to load employer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await axiosInstance.get(`/api/jobs/company/${employerId}`);
      setActiveJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
      setActiveJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E9ECEF] border-t-[#0A6642] mx-auto mb-4"></div>
                <p className="text-[#5E6F8D] text-sm">Loading employer details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-[#B2405A] mx-auto mb-4" />
                <p className="text-[#1D2226] font-semibold">Error loading profile</p>
                <p className="text-[#5E6F8D] text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchEmployerDetails();
                  }}
                  className="mt-4 px-4 py-2 bg-[#0A6642] text-white rounded-xl text-sm font-medium hover:bg-[#085433] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : !employer ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-[#B2405A] mx-auto mb-4" />
                <p className="text-[#1D2226] font-semibold">Employer not found</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#0A6642] text-white rounded-xl text-sm font-medium hover:bg-[#085433] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header - Shows BOTH Profile Avatar and Company Logo */}
              <div className="sticky top-0 z-10 bg-white border-b border-[#E9ECEF] rounded-t-2xl">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar (Circle) */}
                    {employer.avatar ? (
                      <img
                        src={employer.avatar}
                        alt={employer.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E7F3E8] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#0A6642]" />
                      </div>
                    )}
                    
                    {/* Company Logo (Square) */}
                    {employer.companyLogo ? (
                      <img
                        src={employer.companyLogo}
                        alt={employer.companyName}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#E7F3E8] rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#0A6642]" />
                      </div>
                    )}
                    
                    <div>
                      <h2 className="text-lg font-bold text-[#1D2226]">
                        {employer.companyName || employer.name}
                      </h2>
                      <p className="text-sm text-[#5E6F8D] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0A6642]" />
                        Verified Employer
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[#F3F6F9] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-[#5E6F8D]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Company Info - Shows BOTH Profile Avatar and Company Logo */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Profile Avatar (Circle) */}
                    {employer.avatar ? (
                      <img
                        src={employer.avatar}
                        alt={employer.name}
                        className="w-16 h-16 rounded-full object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#E7F3E8] flex items-center justify-center border border-[#E9ECEF]">
                        <User className="w-8 h-8 text-[#0A6642]" />
                      </div>
                    )}
                    
                    {/* Company Logo (Square) */}
                    {employer.companyLogo ? (
                      <img
                        src={employer.companyLogo}
                        alt={employer.companyName}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E9ECEF]"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#E7F3E8] rounded-xl flex items-center justify-center border border-[#E9ECEF]">
                        <Building2 className="w-8 h-8 text-[#0A6642]" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1D2226]">
                        {employer.companyName || employer.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {employer.industry && (
                          <span className="inline-block px-3 py-1 bg-[#E7F3E8] text-[#0A6642] rounded-full text-xs font-medium">
                            {employer.industry}
                          </span>
                        )}
                        {employer.companySize && (
                          <span className="inline-block px-3 py-1 bg-[#F3F6F9] text-[#5E6F8D] rounded-full text-xs font-medium">
                            {employer.companySize} employees
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company Description */}
                  {employer.companyDescription && (
                    <div className="p-4 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                      <p className="text-sm text-[#1D2226] leading-relaxed whitespace-pre-wrap">
                        {employer.companyDescription}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="border-t border-[#E9ECEF] pt-4">
                  <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-[#0A6642]" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employer.companyWebsite && (
                      <a
                        href={employer.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF] hover:border-[#0A6642] hover:bg-white transition-all group"
                      >
                        <Globe className="w-4 h-4 text-[#5E6F8D] group-hover:text-[#0A6642]" />
                        <span className="text-sm text-[#5E6F8D] group-hover:text-[#1D2226] truncate">
                          {employer.companyWebsite.replace(/^https?:\/\//, '')}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-[#0A6642] ml-auto" />
                      </a>
                    )}
                    {employer.companyLocation && (
                      <div className="flex items-center gap-2 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                        <MapPin className="w-4 h-4 text-[#5E6F8D]" />
                        <span className="text-sm text-[#5E6F8D]">{employer.companyLocation}</span>
                      </div>
                    )}
                    {employer.companyPhone && (
                      <a
                        href={`tel:${employer.companyPhone}`}
                        className="flex items-center gap-2 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF] hover:border-[#0A6642] hover:bg-white transition-all group"
                      >
                        <Phone className="w-4 h-4 text-[#5E6F8D] group-hover:text-[#0A6642]" />
                        <span className="text-sm text-[#5E6F8D] group-hover:text-[#1D2226]">
                          {employer.companyPhone}
                        </span>
                      </a>
                    )}
                    <a
                      href={`mailto:${employer.email}`}
                      className="flex items-center gap-2 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF] hover:border-[#0A6642] hover:bg-white transition-all group"
                    >
                      <Mail className="w-4 h-4 text-[#5E6F8D] group-hover:text-[#0A6642]" />
                      <span className="text-sm text-[#5E6F8D] group-hover:text-[#1D2226] truncate">
                        {employer.email}
                      </span>
                    </a>
                    {employer.foundedYear && (
                      <div className="flex items-center gap-2 p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                        <Calendar className="w-4 h-4 text-[#5E6F8D]" />
                        <span className="text-sm text-[#5E6F8D]">Founded {employer.foundedYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Jobs */}
                <div className="border-t border-[#E9ECEF] pt-4">
                  <h4 className="text-sm font-bold text-[#1D2226] flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-[#0A6642]" />
                    Active Jobs
                    {loadingJobs && (
                      <span className="ml-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E9ECEF] border-t-[#0A6642] inline-block"></div>
                      </span>
                    )}
                  </h4>
                  {activeJobs.length === 0 && !loadingJobs ? (
                    <p className="text-sm text-[#5E6F8D] text-center py-4">
                      No active jobs at the moment
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeJobs.slice(0, 5).map((job) => (
                        <div
                          key={job._id}
                          className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF] hover:border-[#0A6642] transition-all cursor-pointer"
                          onClick={() => {
                            onClose();
                            window.location.href = `/job/${job._id}`;
                          }}
                        >
                          <div>
                            <p className="font-medium text-[#1D2226] text-sm">{job.title}</p>
                            <p className="text-xs text-[#5E6F8D]">{job.location || 'Remote'} • {job.type}</p>
                          </div>
                          <span className="text-xs text-[#0A6642] font-medium bg-[#E7F3E8] px-2 py-0.5 rounded-full">
                            {job.isClosed ? 'Closed' : 'Open'}
                          </span>
                        </div>
                      ))}
                      {activeJobs.length > 5 && (
                        <p className="text-xs text-[#5E6F8D] text-center">
                          And {activeJobs.length - 5} more jobs...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployerProfileView;