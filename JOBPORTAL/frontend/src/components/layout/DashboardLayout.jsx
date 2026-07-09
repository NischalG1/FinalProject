import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  EMPLOYER_NAVIGATION_MENU, 
  JOBSEEKER_NAVIGATION_MENU, 
  ADMIN_NAVIGATION_MENU 
} from "../../utlis/data";

// Pastel/Dark Light-Mode Navigation Item Component
const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left group relative ${
        isActive
          ? "bg-[#F1F5F9] text-[#0F172A] font-semibold"
          : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${
        isActive ? "text-[#047857]" : "text-[#94A3B8] group-hover:text-[#475569]"
      }`} />
      {!isCollapsed && (
        <span className="text-sm tracking-normal truncate">{item.name}</span>
      )}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#047857]" />
      )}
    </button>
  );
};

// User Profile Container
const UserProfileButton = ({ user, onClick, isCollapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9]/50 transition-colors group ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#047857] flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      {!isCollapsed && (
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-xs font-semibold text-[#0F172A] truncate">
            {user?.name || "User"}
          </p>
          <p className="text-[11px] text-[#475569] capitalize mt-0.5">
            {user?.role || "Member"}
          </p>
        </div>
      )}
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications] = useState([
    { id: 1, read: false },
    { id: 2, read: false },
    { id: 3, read: true },
  ]);

  const navigationMenu = user?.role === "admin"
    ? ADMIN_NAVIGATION_MENU
    : user?.role === "employer" 
      ? EMPLOYER_NAVIGATION_MENU 
      : JOBSEEKER_NAVIGATION_MENU;

  const unreadCount = notifications.filter(n => !n.read).length;

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
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#E2E8F0] border-t-[#047857] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-[#475569]">Loading account directory...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
        <div className="text-center p-6 rounded-lg bg-white border border-[#E2E8F0] max-w-sm">
          <p className="text-sm font-semibold text-[#0F172A] mb-1">Session Expired</p>
          <p className="text-xs text-[#475569] mb-4">Please log in to verify your identity.</p>
        </div>
      </div>
    );
  }

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    const routeMap = {
      dashboard: "/dashboard",
      "employer-dashboard": "/employer-dashboard",
      "admin-dashboard": "/admin-dashboard",
      "find-jobs": "/find-jobs",
      "saved-jobs": "/saved-jobs",
      profile: "/profile",
      "post-job": "/post-job",
      "manage-jobs": "/manage-jobs",
      applicants: "/applicants",
      "company-profile": "/company-profile",
      "admin-jobs": "/admin-jobs",
      "admin-users": "/admin-users",
    };
    navigate(routeMap[itemId] || `/${itemId}`);
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 ease-in-out ${
          isMobile
            ? sidebarOpen ? "translate-x-0" : "-translate-x-full"
            : "translate-x-0"
        } ${
          isCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-[#E2E8F0]`}
      >
        {/* Brand Header */}
        <div className={`flex items-center h-14 px-4 border-b border-[#E2E8F0] ${
          isCollapsed ? "justify-center" : ""
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#047857] flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-black text-white">JP</span>
            </div>
            {!isCollapsed && (
              <span className="text-base font-bold text-[#0F172A] tracking-tight">
                Job<span className="text-[#047857] font-medium">Portal</span>
              </span>
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

        {/* Bottom Utility Deck */}
        <div className="border-t border-[#E2E8F0] p-3 space-y-2 bg-[#F8FAFC]">
          <UserProfileButton 
            user={user} 
            onClick={() => handleNavigation("profile")}
            isCollapsed={isCollapsed}
          />
          
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Structural Collapse Toggle Pin */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-16 w-6 h-6 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-colors shadow-sm z-50"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        )}
      </aside>

      {/* Mobile Screen Mask */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/20 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Context Content Body Area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{ 
          marginLeft: isMobile ? 0 : isCollapsed ? '80px' : '256px',
        }}
      >
        {/* Sticky Utility Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-14 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A]"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
            
            {/* Search Component */}
            <div className="hidden md:flex items-center bg-[#F1F5F9] rounded px-3 py-1.5 w-72 border border-transparent focus-within:border-[#94A3B8] focus-within:bg-white transition-all">
              <Search className="h-4 w-4 text-[#475569] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search resources, directories..."
                className="bg-transparent border-none outline-none text-xs text-[#0F172A] w-full placeholder-[#94A3B8]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Badge */}
            <button className="relative p-2 rounded-full hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#047857] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Avatar for Mobile Viewports */}
            <button
              onClick={() => handleNavigation("profile")}
              className="md:hidden w-7 h-7 rounded-full border border-[#E2E8F0] overflow-hidden"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#047857] flex items-center justify-center text-white font-bold text-[10px]">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Central Workspace Render Node */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;