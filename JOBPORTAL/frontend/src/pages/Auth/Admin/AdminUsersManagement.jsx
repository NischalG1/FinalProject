import { useEffect, useState } from "react";
import {
  Users,
  Trash2,
  Briefcase,
  UserCheck,
  Mail,
  Calendar,
  Shield,
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
  const [filter, setFilter] = useState("all"); // all, jobseeker, employer, admin

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users from:", API_PATHS.ADMIN.GET_ALL_USERS);
      
      const response = await axiosInstance.get(API_PATHS.ADMIN.GET_ALL_USERS);
      let usersData = response.data || [];

      console.log("Fetched users:", usersData.length, "users");
      console.log("Users data:", usersData);
      
      // Ensure all required fields are present
      usersData = usersData.map((user) => ({
        ...user,
        name: user.name || "Unknown",
        email: user.email || "No email",
        role: user.role || "unknown",
        jobCount: user.jobCount || 0,
        applicationCount: user.applicationCount || 0,
        createdAt: user.createdAt || new Date(),
      }));

      // Filter by role if not "all"
      if (filter !== "all") {
        usersData = usersData.filter((user) => user.role === filter);
      }

      console.log("Filtered users:", usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error response:", error.response);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load users";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${userName}"? This action cannot be undone and will delete all associated data.`
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));
      toast.success("User removed successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to remove user");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      ),
      employer: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          Employer
        </span>
      ),
      jobseeker: (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Job Seeker
        </span>
      ),
    };
    return badges[role] || badges.jobseeker;
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="admin-users">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-users">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            View and manage all platform users. Remove suspicious accounts if
            needed.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex gap-2">
          {[
            { value: "all", label: "All Users" },
            { value: "jobseeker", label: "Job Seekers" },
            { value: "employer", label: "Employers" },
            { value: "admin", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No users in the system"
                : `No ${filter} users found`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {user.companyName && (
                              <div className="text-xs text-gray-500">
                                {user.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.role === "employer" && (
                          <span>{user.jobCount || 0} jobs posted</span>
                        )}
                        {user.role === "jobseeker" && (
                          <span>{user.applicationCount || 0} applications</span>
                        )}
                        {user.role === "admin" && <span>-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {moment(user.createdAt).format("MMM DD, YYYY")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.role === "jobseeker").length}
              </div>
              <div className="text-sm text-gray-600">Job Seekers</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter((u) => u.role === "employer").length}
              </div>
              <div className="text-sm text-gray-600">Employers</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {users.filter((u) => u.role === "admin").length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersManagement;
