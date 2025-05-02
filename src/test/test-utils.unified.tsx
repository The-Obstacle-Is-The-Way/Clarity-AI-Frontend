/**
 * NOVAMIND Unified Test Utilities
 *
 * Provides quantum-level test utilities for psychiatric digital twin components
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render as testingLibraryRender, type RenderOptions, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Import theme types and components
import type { ThemeMode } from '@application/providers/ThemeProvider';
import {
  ThemeProvider,
  useTheme,
  type ThemeProviderState,
} from '@application/providers/ThemeProvider';

// Context providers
import { AuthProvider } from '@application/context/AuthContext';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        staleTime: Infinity, // Prevent automatic refetching
      },
    },
  });
}

/**
 * AllTheProviders wraps the component under test with all necessary providers
 */
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
  currentTheme?: ThemeMode;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  currentTheme = 'light', // Default to light for consistency
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={currentTheme}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Extended render options to include our custom provider options
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  defaultTheme?: ThemeMode;
}

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * and returns enhanced functions for theme testing.
 */
export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions = {}) => {
  const {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    defaultTheme = 'light',
    ...renderOptions
  } = options;

  // Define the wrapper directly using AllTheProviders
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      currentTheme={defaultTheme}
    >
      {children}
    </AllTheProviders>
  );

  // Store the theme context value to return it
  let themeContextValue: ThemeProviderState | undefined;

  // Create a consumer component to capture the context value
  const ContextConsumer = () => {
    themeContextValue = useTheme();
    return null;
  };

  // Render with the wrapper and the consumer
  const renderResult = testingLibraryRender(
    <>
      {ui}
      <ContextConsumer />
    </>,
    { wrapper: Wrapper, ...renderOptions }
  );

  // Ensure themeContextValue is defined before returning
  if (!themeContextValue) {
    throw new Error(
      'ThemeContext value was not captured. Ensure ThemeProvider is correctly set up.'
    );
  }

  // Return the standard render result plus theme helper functions
  return {
    ...renderResult,
    // Helper function to get current theme
    getCurrentTheme: () => themeContextValue?.theme,
    // Helper to directly set theme value
    setTheme: (theme: ThemeMode) => {
      act(() => {
        themeContextValue?.setTheme(theme);
      });
    },
    // Helper to enable dark mode
    enableDarkMode: () => {
      act(() => {
        themeContextValue?.setTheme('dark');
      });
    },
    // Helper to disable dark mode (set to light)
    disableDarkMode: () => {
      act(() => {
        themeContextValue?.setTheme('light');
      });
    },
    // Helper to check if dark mode is active
    isDarkMode: () => themeContextValue?.theme === 'dark',
  };
};

// Basic render function that doesn't include theme helpers
export function render(ui: ReactElement, options: ExtendedRenderOptions = {}) {
  return renderWithProviders(ui, options);
}

// Re-export everything from testing-library
export * from '@testing-library/react';
