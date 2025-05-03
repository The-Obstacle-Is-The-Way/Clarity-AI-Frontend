import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/application/context/AuthContext';
// Use import type as Permission is only used as a type
import type { Permission } from '@domain/types/auth/auth';
import LoadingIndicator from '@/presentation/atoms/feedback/LoadingIndicator';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredPermission?: Permission; // Optional permission requirement
}

/**
 * ProtectedRoute Component
 *
 * Handles authentication and optional permission checks before rendering
 * its children. Redirects to login if not authenticated or lacks permissions.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading indicator while checking auth status
    return <LoadingIndicator />;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Pass the original location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to an unauthorized page or show an error message
    console.warn(
      `User ${user?.id} lacks permission ${requiredPermission} for ${location.pathname}`
    );
    // You might want a dedicated "Unauthorized" page component here
    return <Navigate to="/unauthorized" replace />;
    // Alternatively, display an inline error:
    // return (
    //   <div>
    //     <h1>Access Denied</h1>
    //     <p>You do not have the required permissions to view this page.</p>
    //   </div>
    // );
  }

  // If authenticated and has necessary permissions (or none required),
  // render the children components.
  // The actual layout (like MainLayout) should wrap the <Outlet /> in the main App or router setup.
  return children;
};

export default ProtectedRoute;
