// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../utlis/axiosinstance";
import { API_PATHS } from "../utlis/apiPaths";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

  // Fetch unread count - only if authenticated
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch unread count error:", error);
      // Don't show error toast for unread count failures
    }
  }, [isAuthenticated, user]);

  // Fetch notifications with pagination - only if authenticated
  const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL, {
        params: { limit: 20, page: pageNum },
      });

      const { notifications: newNotifications, total, totalPages: totalPagesData } = response.data;

      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      setTotalPages(totalPagesData);
      setHasMore(pageNum < totalPagesData);
      setPage(pageNum);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      // Only show toast if it's not an auth error
      if (error.response?.status !== 401) {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_READ(notificationId));
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true, readAt: new Date() } : notif
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
      toast.error("Failed to mark notification as read");
    }
  }, [isAuthenticated, user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Failed to mark all as read");
    }
  }, [isAuthenticated, user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      await axiosInstance.delete(API_PATHS.NOTIFICATIONS.DELETE(notificationId));
      
      const deleted = notifications.find((n) => n._id === notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete notification");
    }
  }, [isAuthenticated, user, notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      await axiosInstance.delete(API_PATHS.NOTIFICATIONS.CLEAR_ALL);
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Clear all error:", error);
      toast.error("Failed to clear notifications");
    }
  }, [isAuthenticated, user]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore && isAuthenticated) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications, isAuthenticated]);

  // Initialize notifications when user becomes authenticated
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        if (!initialized) {
          fetchNotifications(1, true);
          fetchUnreadCount();
          setInitialized(true);
        }

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
      } else {
        // Reset state when logged out
        setNotifications([]);
        setUnreadCount(0);
        setHasMore(true);
        setPage(1);
        setTotalPages(1);
        setInitialized(false);
      }
    }
  }, [isAuthenticated, user, authLoading, fetchNotifications, fetchUnreadCount, initialized]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    page,
    totalPages,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    loadMore,
    initialized,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};