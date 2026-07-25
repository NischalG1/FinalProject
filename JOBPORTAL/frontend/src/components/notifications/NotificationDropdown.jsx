// frontend/src/components/notifications/NotificationDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, X, Trash2, CheckCheck, AlertCircle, Briefcase, UserCheck, FileText, Sparkles } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadMore,
    initialized,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <button className="relative p-2 rounded-full hover:bg-[#F3F6F9] text-[#5E6F8D] transition-colors cursor-pointer">
        <Bell className="h-5 w-5" />
      </button>
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "job_approved":
      case "job_rejected":
        return <Briefcase className="w-5 h-5" />;
      case "job_posted":
        return <FileText className="w-5 h-5" />;
      case "new_application":
      case "application_status":
        return <UserCheck className="w-5 h-5" />;
      case "job_saved":
        return <Sparkles className="w-5 h-5" />;
      case "admin":
      case "system":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "job_approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "job_rejected":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "job_posted":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "new_application":
      case "application_status":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "admin":
      case "system":
        return "bg-amber-50 text-amber-600 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[#F3F6F9] text-[#5E6F8D] hover:text-[#0A6642] transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-[#B2405A] text-white text-[10px] font-bold rounded-full ring-2 ring-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white border border-[#E9ECEF] rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9ECEF] bg-[#F8FAFB]">
            <div>
              <h3 className="font-bold text-[#1D2226] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-[#5E6F8D] font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 text-[#5E6F8D] hover:text-[#0A6642] hover:bg-[#E7F3E8] rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="p-1.5 text-[#5E6F8D] hover:text-[#B2405A] hover:bg-[#FDE7E9] rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#5E6F8D] hover:text-[#1D2226] hover:bg-[#F3F6F9] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px]">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E9ECEF] border-t-[#0A6642]"></div>
              </div>
            ) : !initialized ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-[#5E6F8D]" />
                </div>
                <p className="text-[#5E6F8D] text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[#F3F6F9] rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-[#5E6F8D]" />
                </div>
                <p className="text-[#1D2226] font-semibold text-sm">No notifications</p>
                <p className="text-[#5E6F8D] text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFB] transition-colors cursor-pointer border-b border-[#F1F5F9] last:border-0 ${
                      !notification.read ? "bg-[#F3F8FF]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-xl border ${getNotificationColor(notification.type)} shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${!notification.read ? "text-[#0A6642]" : "text-[#1D2226]"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-[#0A6642] rounded-full shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-[#5E6F8D] line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-[#94A3B8] font-medium">
                          {moment(notification.createdAt).fromNow()}
                        </span>
                        {notification.sender && (
                          <span className="text-[10px] text-[#5E6F8D]">
                            from {notification.sender.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-[#B2405A] hover:bg-[#FDE7E9] rounded-lg transition-all shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm font-semibold text-[#0A6642] hover:bg-[#F3F6F9] transition-colors border-t border-[#E9ECEF] disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;