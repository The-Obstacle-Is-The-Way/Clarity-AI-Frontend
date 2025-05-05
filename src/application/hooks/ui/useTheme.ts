import { useContext } from 'react';
import { ThemeContext } from '@application/contexts/ThemeContext';

/**
 * Hook to access theme context throughout the application
 * Provides access to current theme mode, dark mode status, and theme actions
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
