import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDropdown from "../../components/notifications/NotificationDropdown";
import {
  EMPLOYER_NAVIGATION_MENU,
  JOBSEEKER_NAVIGATION_MENU,
  ADMIN_NAVIGATION_MENU,
} from "../../utlis/data";

// Navigation Item Component - Green Theme
const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left group relative ${
        isActive
          ? "bg-[#E7F3E8] text-[#1D2226] font-semibold"
          : "text-[#5E6F8D] hover:text-[#1D2226] hover:bg-[#F3F6F9]"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${
          isActive
            ? "text-[#0A6642]"
            : "text-[#5E6F8D] group-hover:text-[#0A6642]"
        }`}
      />
      {!isCollapsed && (
        <span className="text-sm tracking-normal truncate">{item.name}</span>
      )}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#0A6642] rounded-r" />
      )}
    </button>
  );
};

// User Profile Container - Green Theme
const UserProfileButton = ({ user, onClick, isCollapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-xl border border-[#E9ECEF] bg-white hover:bg-[#F3F6F9] transition-colors group ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-[#E9ECEF]"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#0A6642] flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      {!isCollapsed && (
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-xs font-semibold text-[#1D2226] truncate">
            {user?.name || "User"}
          </p>
          <p className="text-[11px] text-[#5E6F8D] capitalize mt-0.5">
            {user?.role || "Member"}
          </p>
        </div>
      )}
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigationMenu =
    user?.role === "admin"
      ? ADMIN_NAVIGATION_MENU
      : user?.role === "employer"
        ? EMPLOYER_NAVIGATION_MENU
        : JOBSEEKER_NAVIGATION_MENU;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F6F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#E9ECEF] border-t-[#0A6642] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-[#5E6F8D]">
            Loading account directory...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F6F9] flex items-center justify-center p-4">
        <div className="text-center p-6 rounded-xl bg-white border border-[#E9ECEF] max-w-sm">
          <p className="text-sm font-semibold text-[#1D2226] mb-1">
            Session Expired
          </p>
          <p className="text-xs text-[#5E6F8D] mb-4">
            Please log in to verify your identity.
          </p>
        </div>
      </div>
    );
  }

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    // In DashboardLayout.jsx - update the routeMap
    const routeMap = {
      dashboard: "/dashboard",
      "employer-dashboard": "/employer-dashboard",
      "admin-dashboard": "/admin-dashboard",
      "find-jobs": "/find-jobs",
      "saved-jobs": "/saved-jobs",
      "accepted-jobs": "/accepted-jobs", // Add this
      profile: "/profile",
      "post-job": "/post-job",
      "manage-jobs": "/manage-jobs",
      applicants: "/applicants",
      "admin-broadcast": "/admin-broadcast",
    };
    navigate(routeMap[itemId] || `/${itemId}`);
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Get role-specific tagline
  const getRoleTagline = () => {
    switch (user?.role) {
      case "admin":
        return "Admin Panel";
      case "employer":
        return "Employer Portal";
      case "jobseeker":
        return "Professional Network";
      default:
        return "Professional Network";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] text-[#1D2226] flex font-sans antialiased">
      {/* Sidebar Navigation - Green Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${
          isCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-[#E9ECEF] shadow-sm`}
      >
        {/* Brand Header - Down2Work Green Theme */}
        <div
          className={`flex items-center h-14 px-4 border-b border-[#E9ECEF] ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A6642] flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-base font-bold text-[#0A6642] tracking-tight">
                  Down2<span className="text-[#085433]">Work</span>
                </span>
                <p className="text-[8px] text-[#5E6F8D] uppercase tracking-wider font-medium -mt-0.5">
                  {getRoleTagline()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Middle list */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {navigationMenu.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Bottom Utility Deck - Green Theme */}
        <div className="border-t border-[#E9ECEF] p-3 space-y-2 bg-[#F8FAFB]">
          <UserProfileButton
            user={user}
            onClick={() => handleNavigation("profile")}
            isCollapsed={isCollapsed}
          />

          <button
            className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-[#5E6F8D] hover:text-[#1D2226] hover:bg-[#F3F6F9] transition-colors rounded-xl ${
              isCollapsed ? "justify-center" : ""
            }`}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          
        </div>

        {/* Structural Collapse Toggle Pin - Green Theme */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-16 w-6 h-6 bg-white border border-[#E9ECEF] rounded-full flex items-center justify-center text-[#5E6F8D] hover:text-[#0A6642] transition-colors shadow-sm z-50"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        )}
      </aside>

      {/* Mobile Screen Mask */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1D2226]/20 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Context Content Body Area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{
          marginLeft: isMobile ? 0 : isCollapsed ? "80px" : "256px",
        }}
      >
        {/* Sticky Utility Header - Green Theme */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E9ECEF] h-14 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg border border-[#E9ECEF] bg-white text-[#5E6F8D] hover:text-[#0A6642] hover:border-[#0A6642] transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            )}

            
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Dropdown - Replaces the static bell */}
            <NotificationDropdown />

            {/* Avatar for Mobile Viewports */}
            <button
              onClick={() => handleNavigation("profile")}
              className="md:hidden w-7 h-7 rounded-full border border-[#E9ECEF] overflow-hidden"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#0A6642] flex items-center justify-center text-white font-bold text-[10px]">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </button>

            {/* Desktop Brand Badge - Green Theme */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#E7F3E8] rounded-full border border-[#B8D9BF]">
              <Sparkles className="w-3 h-3 text-[#0A6642]" />
              <span className="text-[10px] font-semibold text-[#0A6642] tracking-wider uppercase">
                Down2Work
              </span>
            </div>
          </div>
        </header>

        {/* Central Workspace Render Node */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
