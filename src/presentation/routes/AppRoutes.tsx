import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Import pages
import LoginPage from '@presentation/pages/LoginPage';
import DashboardPage from '@presentation/pages/DashboardPage';
import PatientsList from '@presentation/pages/PatientsList';
import NeuralSingularityDemo from '@presentation/pages/NeuralSingularityDemo';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Public route for the singularity demo */}
      <Route path="/singularity" element={<NeuralSingularityDemo />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 