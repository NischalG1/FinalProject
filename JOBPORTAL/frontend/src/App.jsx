import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import JobSeekerDashboard from "./pages/Auth/JobSeeker/JobSeekerDashboard";
import FindJobs from "./pages/Auth/JobSeeker/FindJobs";
import JobDetails from "./pages/Auth/JobSeeker/JobDetails";
import SavedJobs from "./pages/Auth/JobSeeker/SavedJobs";
import UserProfile from "./pages/Auth/JobSeeker/UserProfile";
import EmployerDashboard from "./pages/Auth/Employer/EmployerDashboard";
import JobPostingForm from "./pages/Auth/Employer/JobPostingForm";
import ManageJobs from "./pages/Auth/Employer/ManageJobs";
import ApplicationViewer from "./pages/Auth/Employer/ApplicationViewer";
import EmployerProfilePage from "./pages/Auth/Employer/EmployerProfilePage";
import AdminDashboard from "./pages/Auth/Admin/AdminDashboard";
import AdminJobsApproval from "./pages/Auth/Admin/AdminJobsApproval";
import AdminUsersManagement from "./pages/Auth/Admin/AdminUsersManagement";
import AdminBroadcast from "./pages/Auth/Admin/AdminBroadcast"; // Optional - if you created this
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AcceptedJobs from "./pages/Auth/JobSeeker/AcceptedJobs";
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
              <Route path="/dashboard" element={<JobSeekerDashboard />} />
              <Route path="/find-jobs" element={<FindJobs />} />
              <Route path="/job/:jobId" element={<JobDetails />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/accepted-jobs" element={<AcceptedJobs />} />{" "}
              {/* Add this */}
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* Protected Routes - Employer */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route
                path="/employer-dashboard"
                element={<EmployerDashboard />}
              />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route
                path="/company-profile"
                element={<EmployerProfilePage />}
              />
            </Route>

            {/* Protected Routes - Admin */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-jobs" element={<AdminJobsApproval />} />
              <Route path="/admin-users" element={<AdminUsersManagement />} />
              {/* Optional: Admin Broadcast page */}
              <Route path="/admin-broadcast" element={<AdminBroadcast />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
