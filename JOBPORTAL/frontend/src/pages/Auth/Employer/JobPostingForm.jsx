import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Plus, 
  X,
  Building2,
  Users,
  Tag,
  Clock,
  AlertCircle,
  Save,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
} from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { JOB_TYPES, CATEGORIES } from '../../../utlis/data';
import toast from 'react-hot-toast';

const JobPostingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    category: '',
    type: 'Full-Time',
    salaryMin: '',
    salaryMax: '',
    skills: [],
    benefits: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

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

  const handleAddBenefit = (e) => {
    e.preventDefault();
    const benefit = benefitInput.trim();
    if (benefit && !formData.benefits.includes(benefit)) {
      setFormData({ ...formData, benefits: [...formData.benefits, benefit] });
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (benefitToRemove) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((b) => b !== benefitToRemove),
    });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  const handleBenefitKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBenefit(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements is required';
    if (!formData.type) newErrors.type = 'Job type is required';
    if (formData.salaryMin && formData.salaryMax) {
      if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
        newErrors.salaryMax = 'Max salary must be greater than min salary';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.JOBS.POST_JOB, formData);
      toast.success('Job posted successfully! It is now pending admin approval.');
      navigate('/manage-jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Top Welcome Panel - Matching EmployerDashboard Styling */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => navigate('/employer-dashboard')} 
                className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#475569]" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Job Posting Console
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Post a New Job</h1>
                <p className="text-sm text-[#475569] mt-0.5">
                  Fill in the details below to post your job opening
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl self-start sm:self-auto">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Requires admin approval</span>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                
                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#047857]" />
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white ${
                      errors.title ? 'border-rose-500/50 bg-rose-50/50' : 'border-[#E2E8F0]'
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                  {errors.title && (
                    <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Job Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#047857]" />
                      Job Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#0F172A] transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] ${
                        errors.type ? 'border-rose-500/50 bg-rose-50/50' : 'border-[#E2E8F0]'
                      }`}
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                      required
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.type && <p className="text-rose-600 text-xs mt-1.5">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#047857]" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857]"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '1.25rem', backgroundPosition: 'calc(100% - 0.75rem) center', backgroundRepeat: 'no-repeat' }}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#047857]" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white"
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#047857]" />
                    Salary Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white"
                      placeholder="Minimum (e.g., 50000)"
                      min="0"
                    />
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white ${
                        errors.salaryMax ? 'border-rose-500/50 bg-rose-50/50' : 'border-[#E2E8F0]'
                      }`}
                      placeholder="Maximum (e.g., 80000)"
                      min="0"
                    />
                  </div>
                  {errors.salaryMax && <p className="text-rose-600 text-xs mt-1.5">{errors.salaryMax}</p>}
                </div>

                {/* Skills Tags */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#047857]" />
                    Required Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill and press Enter (e.g., React, Python)"
                      className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 bg-[#047857] text-white rounded-xl hover:bg-[#065f46] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#047857] rounded-lg text-sm font-medium border border-emerald-100"
                        >
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)} 
                            className="hover:text-[#065f46] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#94A3B8] mt-2">Adding skills helps match your job with the right candidates</p>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#047857]" />
                    Benefits & Perks
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={handleBenefitKeyDown}
                      placeholder="Type a benefit and press Enter (e.g., Health Insurance)"
                      className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 py-2.5 bg-[#047857] text-white rounded-xl hover:bg-[#065f46] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.benefits.map((benefit) => (
                        <span 
                          key={benefit} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                        >
                          {benefit}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveBenefit(benefit)} 
                            className="hover:text-blue-800 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#94A3B8] mt-2">Highlight what makes your company stand out to candidates</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#047857]" />
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white resize-none ${
                      errors.description ? 'border-rose-500/50 bg-rose-50/50' : 'border-[#E2E8F0]'
                    }`}
                    placeholder="Describe the job role, responsibilities, company culture, and what you're looking for..."
                    required
                  />
                  {errors.description && <p className="text-rose-600 text-xs mt-1.5">{errors.description}</p>}
                  <p className="text-xs text-[#94A3B8] mt-2">Be specific and highlight what makes this opportunity unique</p>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#047857]" />
                    Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] focus:bg-white resize-none ${
                      errors.requirements ? 'border-rose-500/50 bg-rose-50/50' : 'border-[#E2E8F0]'
                    }`}
                    placeholder="List the required skills, experience, qualifications, education level, certifications, etc..."
                    required
                  />
                  {errors.requirements && <p className="text-rose-600 text-xs mt-1.5">{errors.requirements}</p>}
                  <p className="text-xs text-[#94A3B8] mt-2">List each requirement on a new line for better readability</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/employer-dashboard')}
                  className="px-6 py-2.5 border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] rounded-xl font-semibold text-sm hover:bg-[#F1F5F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#047857] text-white rounded-xl font-semibold text-sm hover:bg-[#065f46] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Post Job</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;