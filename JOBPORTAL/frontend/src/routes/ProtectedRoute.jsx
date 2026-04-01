import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Checking access:', {
    requiredRole,
    loading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    path: location.pathname
  });

  if (loading) {
    console.log('[ProtectedRoute] Auth is loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role && user.role !== requiredRole) {
    // Only redirect if user has a valid role that doesn't match
    // If role is undefined, let it through to the component to handle
    let redirectPath = "/dashboard";
    if (user.role === "employer") {
      redirectPath = "/employer-dashboard";
    } else if (user.role === "admin") {
      redirectPath = "/admin-dashboard";
    }
    console.log('[ProtectedRoute] Role mismatch. Required:', requiredRole, 'User role:', user.role, 'Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // If role is required but user role is undefined, allow through but component should handle it
  if (requiredRole && !user?.role) {
    console.warn('[ProtectedRoute] User role is undefined but route requires:', requiredRole);
    // Still render the component - it will handle the undefined role
  }

  console.log('[ProtectedRoute] Access granted! Rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoute;
