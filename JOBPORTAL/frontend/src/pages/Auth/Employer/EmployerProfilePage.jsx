// frontend/src/pages/Auth/Employer/EmployerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Upload, 
  FileText, 
  X, 
  Save, 
  Camera, 
  Globe, 
  MapPin, 
  Phone, 
  Users,
  Briefcase,
  Award,
  Edit3,
  Sparkles,
  Eye,
  AlertCircle,
  CheckCircle,
  Link,
  Calendar,
  Target,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import uploadImage from '../../../utlis/uploadImage';
import toast from 'react-hot-toast';

const EmployerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    companyName: '',
    companyDescription: '',
    companyLogo: '',
    companyWebsite: '',
    companyLocation: '',
    companyPhone: '',
    companySize: '',
    industry: '',
    foundedYear: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const companySizes = [
    { value: '', label: 'Select Company Size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const industries = [
    { value: '', label: 'Select Industry' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Media', label: 'Media' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Other', label: 'Other' },
  ];

  // Calculate profile completion for employer
  const calculateProfileCompletion = (data) => {
    const fields = {
      name: { weight: 10, check: (val) => val && val.trim().length > 0 },
      avatar: { weight: 10, check: (val) => val && val.trim().length > 0 },
      companyName: { weight: 15, check: (val) => val && val.trim().length > 0 },
      companyDescription: { weight: 15, check: (val) => val && val.trim().length > 0 },
      companyLogo: { weight: 10, check: (val) => val && val.trim().length > 0 },
      industry: { weight: 10, check: (val) => val && val.trim().length > 0 },
      companyWebsite: { weight: 10, check: (val) => val && val.trim().length > 0 },
      companyLocation: { weight: 10, check: (val) => val && val.trim().length > 0 },
      companyPhone: { weight: 5, check: (val) => val && val.trim().length > 0 },
      companySize: { weight: 5, check: (val) => val && val.trim().length > 0 },
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      totalWeight += field.weight;
      if (field.check(data[key])) {
        earnedWeight += field.weight;
      }
    });

    return Math.min(Math.round((earnedWeight / totalWeight) * 100), 100);
  };

  useEffect(() => {
    const percentage = calculateProfileCompletion(formData);
    setCompletionPercentage(percentage);
  }, [formData]);

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        companyLogo: user.companyLogo || '',
        companyWebsite: user.companyWebsite || '',
        companyLocation: user.companyLocation || '',
        companyPhone: user.companyPhone || '',
        companySize: user.companySize || '',
        industry: user.industry || '',
        foundedYear: user.foundedYear || '',
      };
      setFormData(userData);
      setAvatarPreview(user.avatar || '');
      setLogoPreview(user.companyLogo || '');
    }
  }, [user]);

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

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
      const imgUploadRes = await uploadImage(file);
      const logoUrl = imgUploadRes?.imageUrl || '';
      setFormData({ ...formData, companyLogo: logoUrl });
      toast.success('Company logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
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
      
      const updateData = {
        name: formData.name,
        avatar: formData.avatar,
        companyName: formData.companyName,
        companyDescription: formData.companyDescription,
        companyLogo: formData.companyLogo,
        companyWebsite: formData.companyWebsite,
        companyLocation: formData.companyLocation,
        companyPhone: formData.companyPhone,
        companySize: formData.companySize,
        industry: formData.industry,
        foundedYear: formData.foundedYear,
      };

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, updateData);
      
      updateUser(response.data);
      
      const updatedData = {
        name: response.data.name || '',
        email: response.data.email || '',
        avatar: response.data.avatar || '',
        companyName: response.data.companyName || '',
        companyDescription: response.data.companyDescription || '',
        companyLogo: response.data.companyLogo || '',
        companyWebsite: response.data.companyWebsite || '',
        companyLocation: response.data.companyLocation || '',
        companyPhone: response.data.companyPhone || '',
        companySize: response.data.companySize || '',
        industry: response.data.industry || '',
        foundedYear: response.data.foundedYear || '',
      };
      setFormData(updatedData);
      setAvatarPreview(response.data.avatar || '');
      setLogoPreview(response.data.companyLogo || '');
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Welcome Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Corporate Profile Management
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A]">Company Profile</h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Manage your company information and branding
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle cx="16" cy="16" r="12" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                    <circle cx="16" cy="16" r="12" stroke="#047857" strokeWidth="3" fill="none" strokeDasharray={`${completionPercentage * 0.754} 75.4`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#047857]">{completionPercentage}%</span>
                </div>
                <span className="text-xs font-medium text-[#475569]">Complete</span>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#047857] text-white rounded-xl font-semibold text-sm hover:bg-[#065f46] transition-colors shadow-sm"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      const userData = {
                        name: user.name || '',
                        email: user.email || '',
                        avatar: user.avatar || '',
                        companyName: user.companyName || '',
                        companyDescription: user.companyDescription || '',
                        companyLogo: user.companyLogo || '',
                        companyWebsite: user.companyWebsite || '',
                        companyLocation: user.companyLocation || '',
                        companyPhone: user.companyPhone || '',
                        companySize: user.companySize || '',
                        industry: user.industry || '',
                        foundedYear: user.foundedYear || '',
                      };
                      setFormData(userData);
                      setAvatarPreview(user.avatar || '');
                      setLogoPreview(user.companyLogo || '');
                    }
                  }} 
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] rounded-xl font-semibold text-sm hover:bg-[#F1F5F9] transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Profile Header - Shows BOTH Profile Avatar and Company Logo */}
              <div className="relative">
                <div className="h-32 bg-[#F8FAFC] border-b border-[#E2E8F0]"></div>
                <div className="px-6 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
                    {/* Profile Avatar (Circle) */}
                    <div className="relative">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile" 
                          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#047857] to-[#065f46] border-4 border-white shadow-md flex items-center justify-center">
                          <User className="w-14 h-14 text-white" />
                        </div>
                      )}
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#047857] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#065f46] transition-colors border-2 border-white shadow-md">
                          <Camera className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploading} />
                        </label>
                      )}
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#475569] bg-white px-2 py-0.5 rounded-full shadow-sm border border-[#E2E8F0] whitespace-nowrap">
                        Profile
                      </span>
                    </div>

                    {/* Company Logo (Square) */}
                    <div className="relative">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Company Logo" 
                          className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
                          <Building2 className="w-14 h-14 text-[#94A3B8]" />
                        </div>
                      )}
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#047857] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#065f46] transition-colors border-2 border-white shadow-md">
                          <Camera className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" disabled={uploading} />
                        </label>
                      )}
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#475569] bg-white px-2 py-0.5 rounded-full shadow-sm border border-[#E2E8F0] whitespace-nowrap">
                        Logo
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-[#0F172A]">{formData.companyName || formData.name || 'Company Name'}</h2>
                      <p className="text-[#475569] text-sm">{formData.email}</p>
                      {formData.industry && (
                        <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-[#047857] rounded-md text-xs font-medium border border-emerald-100">
                          {formData.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rest of the form remains the same */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Personal Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#047857]" />
                      Personal Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Email Address</label>
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
                    <p className="text-[11px] text-[#94A3B8] mt-1">Email cannot be changed</p>
                  </div>

                  {/* Company Information */}
                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#047857]" />
                      Company Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Company Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`} 
                      placeholder="Enter your company name" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Industry</label>
                    <select 
                      name="industry" 
                      value={formData.industry} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all appearance-none ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`}
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                    >
                      {industries.map((ind) => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Company Size</label>
                    <select 
                      name="companySize" 
                      value={formData.companySize} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all appearance-none ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`}
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                    >
                      {companySizes.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Founded Year</label>
                    <input 
                      type="number" 
                      name="foundedYear" 
                      value={formData.foundedYear} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`} 
                      placeholder="e.g., 2020" 
                      min="1900" 
                      max={new Date().getFullYear()} 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Company Description</label>
                    <textarea 
                      name="companyDescription" 
                      value={formData.companyDescription} 
                      onChange={handleChange} 
                      disabled={!isEditing} 
                      rows={4}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all resize-none ${
                        isEditing 
                          ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                          : 'cursor-not-allowed opacity-60'
                      }`} 
                      placeholder="Describe your company, its values, culture, and what makes it unique..." 
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="md:col-span-2 mt-2">
                    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#047857]" />
                      Contact Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                      <input 
                        type="url" 
                        name="companyWebsite" 
                        value={formData.companyWebsite} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                          isEditing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                            : 'cursor-not-allowed opacity-60'
                        }`} 
                        placeholder="https://yourcompany.com" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                      <input 
                        type="text" 
                        name="companyLocation" 
                        value={formData.companyLocation} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                          isEditing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                            : 'cursor-not-allowed opacity-60'
                        }`} 
                        placeholder="New York, NY" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                      <input 
                        type="tel" 
                        name="companyPhone" 
                        value={formData.companyPhone} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all ${
                          isEditing 
                            ? 'focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]' 
                            : 'cursor-not-allowed opacity-60'
                        }`} 
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-[#E2E8F0]">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          const userData = {
                            name: user.name || '',
                            email: user.email || '',
                            avatar: user.avatar || '',
                            companyName: user.companyName || '',
                            companyDescription: user.companyDescription || '',
                            companyLogo: user.companyLogo || '',
                            companyWebsite: user.companyWebsite || '',
                            companyLocation: user.companyLocation || '',
                            companyPhone: user.companyPhone || '',
                            companySize: user.companySize || '',
                            industry: user.industry || '',
                            foundedYear: user.foundedYear || '',
                          };
                          setFormData(userData);
                          setAvatarPreview(user.avatar || '');
                          setLogoPreview(user.companyLogo || '');
                        }
                      }} 
                      className="px-6 py-2.5 border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] rounded-xl font-semibold text-sm hover:bg-[#F1F5F9] transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || uploading} 
                      className="flex items-center gap-2 px-8 py-2.5 bg-[#047857] text-white rounded-xl font-semibold text-sm hover:bg-[#065f46] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfilePage;