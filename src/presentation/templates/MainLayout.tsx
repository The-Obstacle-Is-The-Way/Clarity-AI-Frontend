import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@presentation/molecules';
import Sidebar from '@presentation/organisms/Sidebar';
import LoadingIndicator from '@/presentation/atoms/feedback/LoadingIndicator';
import { Button } from '@presentation/atoms';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '@/lib/utils';
import { useTheme } from '@/application/hooks/useTheme';

/**
 * MainLayout - Provides the primary application structure with sidebar and header.
 */
const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={cn("flex h-screen bg-background text-foreground", theme)}>
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/40">
          <ErrorBoundary>
            <Suspense fallback={<LoadingIndicator />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
