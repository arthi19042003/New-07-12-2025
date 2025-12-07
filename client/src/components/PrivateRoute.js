// client/src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; 
  
  if (!user) {
    // 1. Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || user.userType || "").toLowerCase();
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // 2. Authenticated, but unauthorized role, redirect to their main dashboard
    // Fallback logic for unauthorized users
    const redirectPath = {
      'employer': '/employer/dashboard',
      'recruiter': '/recruiter/dashboard',
      'hiringmanager': '/hiring-manager/dashboard',
      'candidate': '/dashboard',
    }[userRole] || '/dashboard';
    
    // In a real application, you might use a toast or error page here
    console.warn(`Access denied for role ${userRole}. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Authenticated and authorized
  return children;
};

export default PrivateRoute;