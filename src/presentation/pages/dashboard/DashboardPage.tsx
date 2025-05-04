import React from 'react';
import Dashboard from './Dashboard';

/**
 * DashboardPage Component
 *
 * This component simply re-exports the Dashboard component to maintain
 * routing consistency in the application, as some routes reference DashboardPage
 * while others reference Dashboard.
 */
const DashboardPage: React.FC = () => {
  return <Dashboard />;
};

export default DashboardPage;
