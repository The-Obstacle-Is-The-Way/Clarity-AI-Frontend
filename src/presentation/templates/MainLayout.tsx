import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@presentation/molecules';
import LoadingIndicator from '@/presentation/atoms/feedback/LoadingIndicator';
import { Button } from '@presentation/atoms';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '@/lib/utils';
import { useTheme } from '@/application/hooks/useTheme';

interface MainLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * MainLayout - Provides the primary application structure with sidebar and header.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={cn('flex h-screen bg-background text-foreground', className)}>
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar}>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="ml-auto">
            Toggle Theme ({isDarkMode ? 'Light' : 'Dark'})
          </Button>
        </Header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingIndicator text="Loading page..." />}>
              {children ?? <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
