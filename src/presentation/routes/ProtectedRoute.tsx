import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@application/context/AuthContext';
import MainLayout from '@presentation/templates/MainLayout';

/**
 * Protected Route Component
 *
 * Ensures routes are only accessible to authenticated users.
 * Redirects unauthenticated users to the login page.
 * Wraps authenticated routes with the MainLayout.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark:bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes within the MainLayout
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
