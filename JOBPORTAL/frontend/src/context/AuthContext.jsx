// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utlis/axiosinstance";
import { API_PATHS } from "../utlis/apiPaths";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        // ✅ ALWAYS fetch fresh user data from backend
        try {
          const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
          const freshUserData = response.data;
          
          // Save fresh data to localStorage
          localStorage.setItem('user', JSON.stringify(freshUserData));
          
          console.log('[AuthContext] User loaded from backend:', {
            id: freshUserData._id,
            email: freshUserData.email,
            role: freshUserData.role,
            name: freshUserData.name
          });
          
          setUser(freshUserData);
          setIsAuthenticated(true);
        } catch (fetchError) {
          console.error('[AuthContext] Failed to fetch user from backend:', fetchError);
          // Fallback to localStorage data if fetch fails
          let userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else {
        console.log('[AuthContext] No token or user in localStorage');
      }
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    // Save token first
    localStorage.setItem('token', token);
    
    // ✅ Fetch fresh user data from backend
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      const freshUserData = response.data;
      
      localStorage.setItem('user', JSON.stringify(freshUserData));
      console.log('[AuthContext] Login - user data from backend:', freshUserData);
      setUser(freshUserData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[AuthContext] Login - failed to fetch user data:', error);
      // Fallback to provided user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};