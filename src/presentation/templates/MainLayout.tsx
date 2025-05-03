import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@presentation/molecules';
import Sidebar from '@presentation/organisms/Sidebar';
import LoadingIndicator from '@/presentation/atoms/feedback/LoadingIndicator';
import { Button } from '@presentation/atoms';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '@/lib/utils';
import { useTheme } from '@/application/hooks/useTheme';
import { Menu, Sun, Moon } from 'lucide-react';

/**
 * MainLayout - Provides the primary application structure with sidebar and header.
 */
const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const headerActions = (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <div className={cn('flex h-screen bg-background text-foreground', theme)}>
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Clarity AI Dashboard" actions={headerActions} />
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
