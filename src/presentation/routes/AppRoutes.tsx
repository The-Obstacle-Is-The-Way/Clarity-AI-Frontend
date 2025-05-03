import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Non-lazy loaded page (Login is often needed immediately)
import LoginPage from '@presentation/pages/LoginPage';

// Lazy load pages accessed after login or complex pages
const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage'));
const PatientsList = lazy(() => import('@presentation/pages/PatientsList'));
const PatientDetailPage = lazy(() => import('@presentation/pages/PatientDetailPage'));
const CreatePatientPage = lazy(() => import('@presentation/pages/CreatePatientPage'));
const ProfilePage = lazy(() => import('@presentation/pages/ProfilePage'));
const XGBoostAnalyticsPage = lazy(() => import('@presentation/pages/XGBoostAnalyticsPage'));
const SentimentAnalyticsPage = lazy(() => import('@presentation/pages/SentimentAnalyticsPage'));

// Example Demo Page (can be lazy or not depending on use case)
const NeuralSingularityDemo = lazy(() => import('@presentation/pages/NeuralSingularityDemo'));

// Basic Suspense Fallback Component
const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <p>Loading page...</p> {/* Replace with a proper spinner/skeleton later */}
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Public route for the singularity demo */}
        <Route path="/singularity" element={<NeuralSingularityDemo />} />

        {/* Protected routes - Explicitly wrap each child */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <CreatePatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            <ProtectedRoute>
              <PatientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/xgboost"
          element={
            <ProtectedRoute>
              <XGBoostAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/sentiment"
          element={
            <ProtectedRoute>
              <SentimentAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Need to handle 404 or other routes */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
