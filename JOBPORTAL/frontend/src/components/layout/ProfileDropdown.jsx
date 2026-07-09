import { 
  ChevronDown, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User, 
  Briefcase,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  onLogout,
  userRole,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = userRole || user?.role;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'employer': return 'Employer';
      case 'jobseeker': return 'Job Seeker';
      default: return 'Member';
    }
  };

  const getProfilePath = () => {
    if (role === 'jobseeker') return '/profile';
    if (role === 'employer') return '/company-profile';
    if (role === 'admin') return '/admin-dashboard';
    return '/profile';
  };

  return (
    <div className="relative">
      {/* Trigger Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-white hover:bg-[#F1F5F9]/60 border border-[#E2E8F0] shadow-sm transition-all duration-200 group cursor-pointer"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#E2E8F0] group-hover:ring-[#047857]/40 transition-all duration-200"
          />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-[#047857] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm tracking-wide">
              {companyName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-[#475569] group-hover:text-[#0F172A] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#047857]' : ''}`} />
      </button>

      {/* Dropdown Card Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] py-2 z-50 animate-in slide-in-from-top-2 duration-200 ease-out">
          {/* User Profile Summary Panel */}
          <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="h-12 w-12 rounded-xl object-cover border border-[#E2E8F0]"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[#047857] flex items-center justify-center shadow-inner">
                  <span className="text-white font-extrabold text-lg">
                    {companyName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {companyName}
                </p>
                <p className="text-xs text-[#475569] font-medium truncate mt-0.5">{email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#047857]/10 text-[#047857] text-[11px] font-semibold rounded-md border border-[#047857]/20 tracking-wide">
                  {getRoleLabel(role)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Actions Context */}
          <div className="py-1 px-1.5 space-y-0.5">
            <button
              onClick={() => { navigate(getProfilePath()); onToggle(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 group"
            >
              <User className="h-4 w-4 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">View Profile</span>
            </button>

            {role === 'employer' && (
              <button
                onClick={() => { navigate('/manage-jobs'); onToggle(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 group"
              >
                <Briefcase className="h-4 w-4 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">My Jobs</span>
              </button>
            )}

            {role === 'jobseeker' && (
              <button
                onClick={() => { navigate('/saved-jobs'); onToggle(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 group"
              >
                <Sparkles className="h-4 w-4 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Saved Jobs</span>
              </button>
            )}

            <button
              onClick={() => { navigate('/settings'); onToggle(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 group"
            >
              <Settings className="h-4 w-4 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">Settings</span>
            </button>

            <button
              onClick={() => { navigate('/help'); onToggle(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-all duration-200 group"
            >
              <HelpCircle className="h-4 w-4 text-[#94A3B8] group-hover:text-[#047857] transition-colors" />
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">Help & Support</span>
            </button>
          </div>

          <div className="border-t border-[#E2E8F0] my-1"></div>

          {/* Sign Out Action Row */}
          <div className="px-1.5">
            <button
              onClick={() => { onLogout(); onToggle(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-all duration-200 font-medium group"
            >
              <LogOut className="h-4 w-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Build Info Stamp Footer */}
          <div className="px-4 py-1.5 mt-1 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-[10px] text-[#94A3B8] font-medium tracking-wider text-center">
              JobPortal v2.0 • © 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;