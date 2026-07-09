import { useEffect, useState } from "react";
import {
  Users,
  Trash2,
  Briefcase,
  UserCheck,
  Mail,
  Calendar,
  Shield,
  Search,
  Building2,
  Award,
} from "lucide-react";
import moment from "moment";
import axiosInstance from "../../../utlis/axiosinstance";
import { API_PATHS } from "../../../utlis/apiPaths";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import LoadingSpinner from "../../../components/layout/LoadingSpinner";
import toast from "react-hot-toast";

const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.ADMIN.GET_ALL_USERS);
      let usersData = response.data || [];

      usersData = usersData.map((user) => ({
        ...user,
        name: user.name || "Unknown",
        email: user.email || "No email",
        role: user.role || "jobseeker",
        jobCount: user.jobCount || 0,
        applicationCount: user.applicationCount || 0,
        createdAt: user.createdAt || new Date(),
        companyName: user.companyName || "",
      }));

      if (filter !== "all") {
        usersData = usersData.filter((user) => user.role === filter);
      }

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Remove "${userName}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));
      toast.success("User removed successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove user");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          Admin
        </span>
      ),
      employer: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          Employer
        </span>
      ),
      jobseeker: (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#047857]/5 text-[#047857] border border-[#047857]/15 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#047857]" />
          Job Seeker
        </span>
      ),
    };
    return badges[role] || badges.jobseeker;
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: users.length,
    jobseekers: users.filter((u) => u.role === "jobseeker").length,
    employers: users.filter((u) => u.role === "employer").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-users">
        <div className="flex items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-users">
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 lg:px-8 font-sans text-[#0F172A]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Main Top Control Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">User Management</h1>
                <p className="text-sm text-[#475569] mt-0.5">
                  Monitor operations, investigate user profiles, and manage active directory records.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search users, emails, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] w-full md:w-72 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Metrics Analytics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#0F172A] tracking-tight">{stats.total}</p>
                <p className="text-xs text-[#475569] font-semibold mt-0.5">Total Accounts</p>
              </div>
              <div className="bg-[#047857]/5 rounded-xl p-4 border border-[#047857]/15">
                <p className="text-2xl font-bold text-[#047857] tracking-tight">{stats.jobseekers}</p>
                <p className="text-xs text-[#047857] font-bold mt-0.5">Job Seekers</p>
              </div>
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                <p className="text-2xl font-bold text-blue-700 tracking-tight">{stats.employers}</p>
                <p className="text-xs text-blue-600 font-bold mt-0.5">Employers</p>
              </div>
              <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100">
                <p className="text-2xl font-bold text-purple-700 tracking-tight">{stats.admins}</p>
                <p className="text-xs text-purple-600 font-bold mt-0.5">System Admins</p>
              </div>
            </div>

            {/* Filter segments component */}
            <div className="flex flex-wrap gap-1.5 mt-6 bg-slate-50 border border-[#E2E8F0] rounded-xl p-1.5 max-w-xl">
              {[
                { value: "all", label: "All Users" },
                { value: "jobseeker", label: "Job Seekers" },
                { value: "employer", label: "Employers" },
                { value: "admin", label: "Admins" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    filter === tab.value
                      ? "bg-[#047857] text-white shadow-sm"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-white"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    filter === tab.value ? "bg-white/20 text-white" : "bg-slate-200 text-[#475569]"
                  }`}>
                    {tab.value === "all" ? stats.total : stats[tab.value + "s"] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Directory Responsive Cards Layout */}
          {filteredUsers.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No profiles matched</h3>
              <p className="text-[#475569] text-sm">
                No verified accounts matching filter parameters were located.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:border-[#047857]/20 transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Top: Identity Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-11 h-11 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#047857] to-[#065f46] flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-white font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#047857] transition-colors truncate">
                            {user.name}
                          </h3>
                          {user.companyName ? (
                            <p className="text-xs text-[#475569] mt-0.5 flex items-center gap-1 font-medium truncate">
                              <Building2 className="w-3 h-3 text-[#94A3B8] shrink-0" />
                              {user.companyName}
                            </p>
                          ) : (
                            <p className="text-xs text-[#94A3B8] italic mt-0.5">Individual Account</p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">{getRoleBadge(user.role)}</div>
                    </div>

                    {/* Middle: Info Specs */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-[#475569] font-medium bg-slate-50 border border-[#E2E8F0] px-2.5 py-1.5 rounded-xl truncate">
                        <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A] pt-1">
                        <span className="flex items-center gap-1 text-[#94A3B8] font-normal">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          Joined {moment(user.createdAt).format("MMM DD, YYYY")}
                        </span>
                        
                        {/* Dynamic Activity Metrics */}
                        {user.role === "employer" && (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                            <Briefcase className="w-3 h-3" />
                            {user.jobCount || 0} Jobs
                          </span>
                        )}
                        {user.role === "jobseeker" && (
                          <span className="flex items-center gap-1 bg-[#047857]/5 text-[#047857] border border-[#047857]/15 px-2 py-0.5 rounded-md text-[11px]">
                            <Award className="w-3 h-3" />
                            {user.applicationCount || 0} Apps
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Dangerous Actions Footer */}
                  <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex justify-end">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50/60 rounded-xl border border-transparent hover:border-rose-100/60 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Member
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersManagement;