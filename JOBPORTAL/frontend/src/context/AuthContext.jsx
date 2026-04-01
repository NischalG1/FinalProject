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
        let userData = JSON.parse(userStr);
        
        // Validate user data has required fields
        if (userData && userData._id && userData.email) {
          // If role is missing, try to fetch from backend
          if (!userData.role) {
            console.warn('[AuthContext] User role missing in localStorage, fetching from backend');
            try {
              const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
              
              if (response.data && response.data.role) {
                userData = { ...userData, ...response.data };
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('[AuthContext] User role fetched from backend:', response.data.role);
              } else {
                console.warn('[AuthContext] Backend response missing role, defaulting to jobseeker');
                userData.role = 'jobseeker';
                localStorage.setItem('user', JSON.stringify(userData));
              }
            } catch (fetchError) {
              console.error('[AuthContext] Failed to fetch user from backend, defaulting to jobseeker:', fetchError);
              userData.role = 'jobseeker';
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
          
          console.log('[AuthContext] User loaded:', {
            id: userData._id,
            email: userData.email,
            role: userData.role,
            name: userData.name
          });
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.error('[AuthContext] Invalid user data in localStorage');
          logout();
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

  const login = (userData, token) => {
    // Ensure user data has all required fields
    if (!userData || !userData._id || !userData.email) {
      console.error('[AuthContext] Invalid user data provided to login');
      return;
    }

    // Ensure role is set (default to 'jobseeker' if missing)
    if (!userData.role) {
      console.warn('[AuthContext] User role missing, defaulting to jobseeker');
      userData.role = 'jobseeker';
    }

    console.log('[AuthContext] Logging in user:', {
      id: userData._id,
      email: userData.email,
      role: userData.role,
      name: userData.name
    });

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/'
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