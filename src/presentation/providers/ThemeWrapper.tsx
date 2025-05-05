import React, { type ReactNode } from 'react';
import { ThemeProvider } from '@application/providers/ThemeProvider';

interface ThemeWrapperProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

/**
 * ThemeWrapper - Component to ensure consistent ThemeProvider usage
 * 
 * This wrapper component ensures that any component tree has access to the theme context
 */
export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  return <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>;
}; 