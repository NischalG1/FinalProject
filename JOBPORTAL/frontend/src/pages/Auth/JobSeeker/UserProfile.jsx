import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Upload,
  X,
  FileText,
  Trash2,
  Save,
  Camera,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Award,
  Sparkles,
  Building2,
  Clock,
  Target,
  Edit3,
  Eye,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { CATEGORIES, JOB_TYPES } from '../../../utlis/data';
import uploadImage from '../../../utlis/uploadImage';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    resume: '',
    skills: [],
    preferredCategory: '',
    preferredJobType: '',
    preferredLocation: '',
    experienceLevel: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    bio: '',
    title: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const EXPERIENCE_LEVELS = [
    { value: '', label: 'Select Experience Level' },
    { value: 'Entry', label: 'Entry Level (0-2 years)' },
    { value: 'Mid', label: 'Mid Level (3-5 years)' },
    { value: 'Senior', label: 'Senior Level (6-8 years)' },
    { value: 'Lead', label: 'Lead / Principal (9+ years)' },
  ];

  const TITLES = [
    { value: '', label: 'Select Your Title' },
    { value: 'Software Engineer', label: 'Software Engineer' },
    { value: 'Frontend Developer', label: 'Frontend Developer' },
    { value: 'Backend Developer', label: 'Backend Developer' },
    { value: 'Full Stack Developer', label: 'Full Stack Developer' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'Product Manager', label: 'Product Manager' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'Marketing Specialist', label: 'Marketing Specialist' },
    { value: 'Sales Representative', label: 'Sales Representative' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Business Analyst', label: 'Business Analyst' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        resume: user.resume || '',
        skills: user.skills || [],
        preferredCategory: user.preferredCategory || '',
        preferredJobType: user.preferredJobType || '',
        preferredLocation: user.preferredLocation || '',
        experienceLevel: user.experienceLevel || '',
        expectedSalaryMin: user.expectedSalaryMin || '',
        expectedSalaryMax: user.expectedSalaryMax || '',
        bio: user.bio || '',
        title: user.title || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);

      const imgUploadRes = await uploadImage(file);
      const avatarUrl = imgUploadRes?.imageUrl || '';

      setFormData({ ...formData, avatar: avatarUrl });
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axiosInstance.post('/api/user/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resumeUrl = response.data.resumeUrl || '';
      setFormData((prev) => ({ ...prev, resume: resumeUrl }));
      updateUser({ ...user, resume: resumeUrl });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!formData.resume) return;

    try {
      await axiosInstance.post(API_PATHS.AUTH.DELETE_RESUME, {
        resumeUrl: formData.resume,
      });
      setFormData({ ...formData, resume: '' });
      updateUser({ ...user, resume: '' });
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resume');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const fields = [
      'name', 'email', 'avatar', 'bio', 'title',
      'skills', 'preferredCategory', 'preferredJobType',
      'preferredLocation', 'experienceLevel'
    ];
    const total = fields.length;
    fields.forEach(field => {
      if (field === 'skills') {
        if (formData.skills.length > 0) completed++;
      } else if (formData[field] && formData[field] !== '') {
        completed++;
      }
    });
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateProfileCompletion();

  return (
    <DashboardLayout activeMenu="profile">
      <div className="space-y-6">
        {/* Header - LinkedIn Green Theme */}
        <div className="bg-gradient-to-r from-[#0A6642] to-[#085433] rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#B8D9BF] uppercase tracking-wider mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Profile Management
                </div>
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-[#B8D9BF] text-sm mt-0.5">
                  Manage your professional information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Completion */}
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      stroke="#fff"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${completionPercentage * 0.754} 75.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    {completionPercentage}%
                  </span>
                </div>
                <span className="text-sm font-medium text-[#B8D9BF]">
                  Profile Complete
                </span>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0A6642] rounded-xl font-semibold hover:bg-[#E7F3E8] transition-all shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile Picture Card - LinkedIn Green Theme */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-8">
              <h2 className="text-lg font-bold text-[#1D2226] mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0A6642]" />
                Profile Picture
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-[#E9ECEF] shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-[#E7F3E8] flex items-center justify-center border-4 border-[#E9ECEF] shadow-lg">
                      <User className="w-16 h-16 text-[#0A6642]" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#0A6642] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#085433] transition-colors shadow-lg border-2 border-white">
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-[#1D2226] font-medium">Upload a professional photo</p>
                  <p className="text-sm text-[#5E6F8D]">JPG, PNG or GIF. Max 5MB</p>
                  {!isEditing && (
                    <p className="text-xs text-[#5E6F8D] mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Click "Edit Profile" to change your photo
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information Card - LinkedIn Green Theme */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-8">
              <h2 className="text-lg font-bold text-[#1D2226] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0A6642]" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                    Full Name <span className="text-[#B2405A]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6F8D] w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                    Professional Title
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                      isEditing 
                        ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                        : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                    }`}
                  >
                    {TITLES.map((title) => (
                      <option key={title.value} value={title.value}>
                        {title.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E6F8D] w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E9ECEF] rounded-xl bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="text-xs text-[#5E6F8D] mt-1">Email cannot be changed</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm resize-none ${
                      isEditing 
                        ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                        : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                    }`}
                    placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                  />
                </div>
              </div>
            </div>

            {/* Resume Card - LinkedIn Green Theme */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-8">
              <h2 className="text-lg font-bold text-[#1D2226] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A6642]" />
                Resume
              </h2>
              {formData.resume ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-xl border border-[#E9ECEF]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#E7F3E8] rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#0A6642]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1D2226] text-sm">Resume Uploaded</p>
                        <a
                          href={formData.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0A6642] hover:underline flex items-center gap-1"
                        >
                          View Resume <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleDeleteResume}
                        className="flex items-center gap-1.5 px-4 py-2 text-[#B2405A] hover:bg-[#FDE7E9] rounded-xl transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:bg-[#E7F3E8] cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-[#5E6F8D]" />
                        <span className="text-[#5E6F8D] font-medium text-sm">Upload New Resume</span>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  {isEditing ? (
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-[#E9ECEF] rounded-xl hover:border-[#0A6642] hover:bg-[#E7F3E8] cursor-pointer transition-colors">
                        <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-[#5E6F8D]" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-[#1D2226] mb-1">Upload Your Resume</p>
                          <p className="text-sm text-[#5E6F8D]">PDF, DOC, or DOCX. Max 10MB</p>
                        </div>
                        <button
                          type="button"
                          className="px-6 py-2 bg-[#0A6642] text-white rounded-xl font-medium hover:bg-[#085433] transition-colors text-sm"
                        >
                          Choose File
                        </button>
                      </div>
                    </label>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-[#5E6F8D]" />
                      </div>
                      <p className="text-[#5E6F8D] text-sm">No resume uploaded</p>
                      <p className="text-xs text-[#5E6F8D] mt-1">Click "Edit Profile" to upload your resume</p>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-[#5E6F8D] mt-4">
                Having an up-to-date resume increases your chances of getting hired
              </p>
            </div>

            {/* Skills & Preferences Card - LinkedIn Green Theme */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1D2226] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0A6642]" />
                  Skills & Preferences
                </h2>
                <p className="text-sm text-[#5E6F8D] mt-0.5">
                  {isEditing 
                    ? 'Update your skills and preferences for better job matches'
                    : 'Your skills and preferences for job matching'}
                </p>
              </div>

              <div className="space-y-6">
                {/* Skills Input */}
                <div>
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                    Skills
                  </label>
                  {isEditing ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                          placeholder="Type a skill and press Enter (e.g., React, Node.js)"
                          className="flex-1 px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2.5 bg-[#0A6642] text-white rounded-xl hover:bg-[#085433] transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7F3E8] text-[#0A6642] rounded-full text-sm font-medium border border-[#B8D9BF]"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-[#085433] transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      {formData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 bg-[#E7F3E8] text-[#0A6642] rounded-full text-sm font-medium border border-[#B8D9BF]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#5E6F8D]">No skills added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Category & Job Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1D2226] mb-1.5 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#0A6642]" />
                      Preferred Category
                    </label>
                    <select
                      name="preferredCategory"
                      value={formData.preferredCategory}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1D2226] mb-1.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0A6642]" />
                      Preferred Job Type
                    </label>
                    <select
                      name="preferredJobType"
                      value={formData.preferredJobType}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    >
                      <option value="">Select Job Type</option>
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1D2226] mb-1.5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0A6642]" />
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., New York, Remote, San Francisco"
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1D2226] mb-1.5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#0A6642]" />
                      Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    >
                      {EXPERIENCE_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expected Salary */}
                <div>
                  <label className="block text-sm font-medium text-[#1D2226] mb-1.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#0A6642]" />
                    Expected Salary Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="expectedSalaryMin"
                      value={formData.expectedSalaryMin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Minimum (e.g., 50000)"
                      min="0"
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    />
                    <input
                      type="number"
                      name="expectedSalaryMax"
                      value={formData.expectedSalaryMax}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Maximum (e.g., 80000)"
                      min="0"
                      className={`w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl text-sm ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent' 
                          : 'bg-[#F3F6F9] text-[#5E6F8D] cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button - LinkedIn Green Theme */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        avatar: user.avatar || '',
                        resume: user.resume || '',
                        skills: user.skills || [],
                        preferredCategory: user.preferredCategory || '',
                        preferredJobType: user.preferredJobType || '',
                        preferredLocation: user.preferredLocation || '',
                        experienceLevel: user.experienceLevel || '',
                        expectedSalaryMin: user.expectedSalaryMin || '',
                        expectedSalaryMax: user.expectedSalaryMax || '',
                        bio: user.bio || '',
                        title: user.title || '',
                      });
                      setAvatarPreview(user.avatar || '');
                    }
                  }}
                  className="px-8 py-3 border border-[#E9ECEF] text-[#1D2226] rounded-xl font-semibold hover:bg-[#F3F6F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2 px-8 py-3 bg-[#0A6642] text-white rounded-xl font-semibold hover:bg-[#085433] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;