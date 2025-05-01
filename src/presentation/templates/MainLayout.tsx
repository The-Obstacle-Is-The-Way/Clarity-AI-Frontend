import React, { type ReactNode } from 'react';
import { useAuth } from '@application/context/AuthContext';
import { Button } from '@presentation/atoms/button'; // Assuming Button atom exists
import { LogOut } from 'lucide-react'; // Using lucide icon

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout Template Component
 *
 * Provides the basic structure for authenticated pages,
 * including a header with user info/logout and a content area.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to /login will happen automatically via ProtectedRoute
    } catch (error) {
      console.error('Logout failed in layout:', error);
      // Optionally show an error toast to the user
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            {/* Placeholder for Logo/Brand */}
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">Clarity AI</span>
            </a>
            {/* Placeholder for Nav */}
            <nav className="flex items-center gap-6 text-sm">
              {/* Add NavLinks here later */}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {isAuthLoading ? (
              <div className="h-5 w-20 animate-pulse rounded-md bg-muted"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground" data-testid="user-email-display">
                  {user.email} ({user.roles?.join(', ') || 'User'})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Log out"
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className="text-sm text-destructive">Not Authenticated</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-screen-2xl py-6">
        {children} { /* Render the nested route components */}
      </main>

      {/* Footer (Optional) */}
      {/* <footer className="border-t border-border/40 py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clarity AI
        </div>
      </footer> */}
    </div>
  );
};

export default MainLayout;
