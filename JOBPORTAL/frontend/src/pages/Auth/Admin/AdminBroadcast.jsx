// frontend/src/pages/Auth/Admin/AdminBroadcast.jsx (Optional admin page)
import React, { useState } from 'react';
import { Send, Users, Mail, AlertCircle } from 'lucide-react';
import axiosInstance from '../../../utlis/axiosinstance';
import { API_PATHS } from '../../../utlis/apiPaths';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const AdminBroadcast = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link: '',
    role: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.NOTIFICATIONS.BROADCAST, formData);
      toast.success('Notification sent successfully!');
      setFormData({ title: '', message: '', link: '', role: '', priority: 'medium' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="admin-dashboard">
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#E7F3E8] rounded-xl">
              <Send className="w-6 h-6 text-[#0A6642]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1D2226]">Broadcast Notification</h1>
              <p className="text-sm text-[#5E6F8D]">Send a notification to all users or specific roles</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                Notification Title <span className="text-[#B2405A]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Important Update: New Features Available"
                className="w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                Message <span className="text-[#B2405A]">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Write your notification message here..."
                className="w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                Target Audience
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent"
              >
                <option value="">All Users</option>
                <option value="jobseeker">Job Seekers</option>
                <option value="employer">Employers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1D2226] mb-1.5">
                Link (Optional)
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="e.g., /find-jobs"
                className="w-full px-4 py-2.5 border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6642] focus:border-transparent"
              />
              <p className="text-xs text-[#5E6F8D] mt-1">Users will be redirected to this page when clicking the notification</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A6642] text-white rounded-xl font-semibold hover:bg-[#085433] transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Broadcast</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBroadcast;