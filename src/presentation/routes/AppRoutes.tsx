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

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/new" element={<CreatePatientPage />} />
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/analytics/xgboost" element={<XGBoostAnalyticsPage />} />
          <Route path="/analytics/sentiment" element={<SentimentAnalyticsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
