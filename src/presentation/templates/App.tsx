import type { ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@presentation/ErrorBoundary';

// Pages
import Dashboard from '@presentation/pages/Dashboard';
import BrainVisualizationPage from '@presentation/pages/BrainVisualizationPage';
import LoginPage from '@presentation/pages/LoginPage';
import NotFound from '@presentation/pages/NotFound';

// Components
import NeuralControlPanel from '@presentation/organisms/NeuralControlPanel';

// Providers
import { ThemeProvider } from '@application/providers/ThemeProvider';
import { AuthProvider } from '@application/context/AuthContext';

// Routes
import ProtectedRoute from '@presentation/routes/ProtectedRoute';

// Styles
import '../../presentation/styles/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Wrapper component to ensure consistent ThemeProvider usage
interface ThemeWrapperProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children, defaultTheme = 'dark' }) => {
  return <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>;
};

// Define the main App component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Brain Visualization Routes */}
                  <Route path="/brain-visualization/demo" element={<BrainVisualizationPage />} />
                  <Route
                    path="/brain-visualization/:patientId"
                    element={<BrainVisualizationPage />}
                  />

                  {/* Test Routes */}
                  <Route
                    path="/test/neural-control-panel"
                    element={
                      <div className="p-4 bg-background text-foreground min-h-screen">
                        <h1 className="text-xl font-semibold mb-6">Neural Control Panel Test</h1>
                        <NeuralControlPanel
                          patientId="DEMO_PATIENT_001"
                          brainModelId="DEMO_SCAN_001"
                          onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/brain-model-container/demo"
                    element={
                      <div className="p-4 bg-background text-foreground min-h-screen">
                        <h1 className="text-xl font-semibold mb-6">Brain Model Container Test</h1>
                        <div className="h-[80vh] border border-gray-700 rounded-lg overflow-hidden">
                          <NeuralControlPanel
                            patientId="DEMO_PATIENT_001"
                            brainModelId="DEMO_SCAN_001"
                            onSettingsChange={(settings) =>
                              console.log('Settings changed:', settings)
                            }
                          />
                        </div>
                      </div>
                    }
                  />
                </Route>

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeWrapper>
    </QueryClientProvider>
  );
};

export default App;
