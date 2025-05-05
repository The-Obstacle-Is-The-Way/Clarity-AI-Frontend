import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AppRoutes from '@presentation/routes/AppRoutes';
import ErrorBoundary from '@presentation/providers/ErrorBoundary';
import { AuthProvider } from '@application/context/AuthContext';
import { ThemeProvider } from '@application/providers/ThemeProvider';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Root App Component
 * 
 * Provides all global providers and context for the application
 * and renders the main routes component
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <ToastContainer position="top-right" autoClose={5000} />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App; 