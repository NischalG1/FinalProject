import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Save,
  ArrowLeft,
  Camera,
  Briefcase,
  MapPin,
  DollarSign,
  Award,
  Sparkles,
  Clock,
  Target,
  X,
  Plus,
  ChevronRight,
  ShieldCheck,
  Building2,
  TrendingUp,
  Users,
  CheckCircle2,
  Layers,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { CATEGORIES, JOB_TYPES } from '../../../utlis/data';
import uploadImage from '../../../utlis/uploadImage';
import toast from 'react-hot-toast';

const EditProfileDetails = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    title: '',
    skills: [],
    preferredCategory: '',
    preferredJobType: '',
    preferredLocation: '',
    experienceLevel: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

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
        bio: user.bio || '',
        title: user.title || '',
        skills: user.skills || [],
        preferredCategory: user.preferredCategory || '',
        preferredJobType: user.preferredJobType || '',
        preferredLocation: user.preferredLocation || '',
        experienceLevel: user.experienceLevel || '',
        expectedSalaryMin: user.expectedSalaryMin || '',
        expectedSalaryMax: user.expectedSalaryMax || '',
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
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="profile">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Welcome Panel - Matching EmployerDashboard Styling */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Profile Management Console
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Account Details</h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Manage your public profile presence, work preferences, and core skills.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] font-semibold text-sm rounded-xl hover:bg-[#F1F5F9] transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
          </div>

          {/* Dynamic Tip Widget banner - Updated to match theme */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0">
                  <Sparkles className="w-5 h-5 text-[#047857]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#0F172A]">Profile strength matters</h3>
                  <p className="text-[#475569] text-xs sm:text-sm mt-0.5 leading-relaxed max-w-xl">
                    Candidates with completely filled preferred location, title, and at least 5 target skills receive up to 4x more inbound invitations from engineering teams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Sticky Avatar & Profile Summary Preview Card */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-md transition-transform group-hover:scale-[1.02] border border-[#E2E8F0]"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center ring-4 ring-white shadow-md">
                        <User className="w-12 h-12 text-[#94A3B8]" />
                      </div>
                    )}
                    <label className="absolute -bottom-1.5 -right-1.5 w-9 h-9 bg-[#047857] hover:bg-[#065f46] text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-md border-2 border-white group-hover:scale-105 active:scale-95">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <h3 className="font-bold text-lg text-[#0F172A]">{formData.name || 'Your Name'}</h3>
                  <p className="text-xs font-semibold text-[#047857] bg-emerald-50 px-2.5 py-1 rounded-md mt-1.5 border border-emerald-100/30">
                    {formData.title || 'Professional Title Not Set'}
                  </p>
                  <p className="text-xs text-[#475569] font-medium mt-2 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#94A3B8]" /> {formData.email}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#F1F5F9] space-y-3.5">
                  <div>
                    <span className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider">Availability</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {formData.preferredJobType ? JOB_TYPES.find(j => j.value === formData.preferredJobType)?.label : 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider">Target Region</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" /> {formData.preferredLocation || 'Remote / Anywhere'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider">Experience Level</span>
                    <span className="text-xs font-medium text-[#0F172A] mt-0.5 block">
                      {formData.experienceLevel ? EXPERIENCE_LEVELS.find(l => l.value === formData.experienceLevel)?.label : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#475569] font-medium">Skills Count</span>
                  <span className="text-sm font-bold text-[#047857] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {formData.skills.length}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-xs text-[#475569] font-medium">Profile Completeness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#047857] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (formData.skills.length * 10) + (formData.title ? 20 : 0) + (formData.preferredLocation ? 15 : 0) + (formData.bio ? 15 : 0))}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#047857]">
                      {Math.min(100, (formData.skills.length * 10) + (formData.title ? 20 : 0) + (formData.preferredLocation ? 15 : 0) + (formData.bio ? 15 : 0))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <p className="text-xs text-[#475569] font-medium text-center">Unsaved modifications will be lost if you leave</p>
              </div>
            </div>

            {/* Right Column - Main Form Fields Configuration */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Identity Card Details */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 space-y-6">
                <div className="border-b border-[#F1F5F9] pb-4">
                  <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#047857]" />
                    Primary Info
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Legal Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Professional Role
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                    >
                      {TITLES.map((title) => (
                        <option key={title.value} value={title.value}>
                          {title.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Account Registered Email Address
                    </label>
                    <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <div className="bg-[#F1F5F9] border-r border-[#E2E8F0] px-3.5 flex items-center justify-center text-[#94A3B8]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2.5 bg-transparent text-[#94A3B8] font-normal cursor-not-allowed text-sm focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1.5 font-medium">Unique credentials cannot be dynamically altered here.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Professional Biography
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white resize-none leading-relaxed"
                      placeholder="Tell employers about yourself, key milestones, and notable stack choices..."
                    />
                  </div>
                </div>
              </div>

              {/* Placement Preferences & Capabilities Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 space-y-6">
                <div className="border-b border-[#F1F5F9] pb-4">
                  <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#047857]" />
                    Target Matrix & Preferences
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Modern Stackable Skills Input Layout */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Core Competencies & Frameworks
                    </label>
                    <div className="flex gap-2 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus-within:ring-2 focus-within:ring-[#047857]/20 focus-within:border-[#047857] transition-all">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="Type keyword and press add or Enter (e.g., GraphQL)"
                        className="flex-1 px-3 py-2 bg-transparent text-sm text-[#0F172A] focus:outline-none placeholder-[#94A3B8]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="p-2 bg-[#047857] text-white rounded-lg hover:bg-[#065f46] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-[#047857] text-white rounded-lg text-xs font-medium border border-[#047857]/20 animate-in fade-in zoom-in-95 duration-150"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="p-0.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#94A3B8] mt-2 font-medium">No skills listed yet. Add tags to map target matching filters.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Sector Category
                      </label>
                      <select
                        name="preferredCategory"
                        value={formData.preferredCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
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
                      <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Commitment Type
                      </label>
                      <select
                        name="preferredJobType"
                        value={formData.preferredJobType}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                      >
                        <option value="">Select Job Type</option>
                        {JOB_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Target Hub / Location
                      </label>
                      <input
                        type="text"
                        name="preferredLocation"
                        value={formData.preferredLocation}
                        onChange={handleChange}
                        placeholder="e.g., Remote, Austin, Berlin"
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Experience Seniority
                      </label>
                      <select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                      >
                        {EXPERIENCE_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#94A3B8]" />
                        Annual Expected Compensation Bounds (USD)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg px-3">
                          <span className="text-[#94A3B8] text-xs font-medium mr-1.5">$</span>
                          <input
                            type="number"
                            name="expectedSalaryMin"
                            value={formData.expectedSalaryMin}
                            onChange={handleChange}
                            placeholder="Min base bounds"
                            min="0"
                            className="w-full py-2 text-sm text-[#0F172A] bg-transparent focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg px-3">
                          <span className="text-[#94A3B8] text-xs font-medium mr-1.5">$</span>
                          <input
                            type="number"
                            name="expectedSalaryMax"
                            value={formData.expectedSalaryMax}
                            onChange={handleChange}
                            placeholder="Max base bounds"
                            min="0"
                            className="w-full py-2 text-sm text-[#0F172A] bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unified Submit and Return Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 text-sm font-semibold text-[#475569] bg-transparent rounded-xl hover:bg-[#F1F5F9] active:scale-95 transition-all"
                >
                  Cancel Changes
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#047857] text-white rounded-xl font-semibold hover:bg-[#065f46] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving edits...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfileDetails;