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
import { ThemeProvider, useTheme } from '@application/providers/ThemeProvider';

// Context providers
import { AuthProvider, AppAuthContext, type AppAuthContextType } from '@application/context/AuthContext';

// Mock authService for testing
vi.mock('@infrastructure/api/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn().mockResolvedValue({ success: true }),
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'clinician',
      permissions: ['VIEW_PATIENTS', 'EDIT_PATIENTS'],
    }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    renewSession: vi.fn().mockResolvedValue({ success: true }),
  },
}));

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
  authContextValue?: AppAuthContextType;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  currentTheme = 'light',
  authContextValue,
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={currentTheme}>
        {authContextValue ? (
          <AppAuthContext.Provider value={authContextValue}>
            <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
          </AppAuthContext.Provider>
        ) : (
          <AuthProvider>
            <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
          </AuthProvider>
        )}
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
  authContextValue?: AppAuthContextType;
}

// Type for theme context value that's captured during rendering
interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * and returns enhanced functions for theme testing.
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
) => {
  const {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    defaultTheme = 'light',
    authContextValue,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      currentTheme={defaultTheme}
      authContextValue={authContextValue}
    >
      {children}
    </AllTheProviders>
  );

  // Store the theme context value to return it
  let themeContextValue: ThemeContextValue | undefined;

  // Create a consumer component to capture the context value
  const ContextConsumer = () => {
    themeContextValue = useTheme();
    return null;
  };

  // Store renderResult - Use standard synchronous render
  const renderResult = testingLibraryRender(
    <>
      {ui}
      <ContextConsumer />
    </>,
    { wrapper: Wrapper, ...renderOptions }
  );

  // Capture theme context value *after* initial render
  const capturedThemeContext = themeContextValue;

  if (!capturedThemeContext) {
    // This might still happen if ThemeProvider itself has async init logic,
    // but less likely than with the previous async act approach.
    console.warn(
      'ThemeContext value was not captured immediately after initial render. Theme helpers might be unreliable if ThemeProvider initializes asynchronously.'
    );
  }

  // Return the standard render result plus theme helper functions
  return {
    ...renderResult,
    getCurrentTheme: () => capturedThemeContext?.theme,
    setTheme: (theme: ThemeMode) => {
      // Wrap theme state updates in act
      act(() => {
        capturedThemeContext?.setTheme(theme);
      });
    },
    enableDarkMode: () => {
      act(() => {
        capturedThemeContext?.setTheme('dark');
      });
    },
    disableDarkMode: () => {
      act(() => {
        capturedThemeContext?.setTheme('light');
      });
    },
    isDarkMode: () => capturedThemeContext?.theme === 'dark',
  };
};

// Basic render function - Revert to synchronous
export function renderBasic(
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
) {
  const {
    initialRoute,
    queryClient: customQueryClient,
    defaultTheme: customTheme,
    authContextValue,
    ...restOptions
  } = options;

  const queryClient = customQueryClient || createTestQueryClient();
  const currentInitialRoute = initialRoute || '/';
  const currentTheme = customTheme || 'light';

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={currentInitialRoute}
      queryClient={queryClient}
      currentTheme={currentTheme}
      authContextValue={authContextValue}
    >
      {children}
    </AllTheProviders>
  );

  // Standard synchronous render
  const renderResult = testingLibraryRender(ui, { wrapper: Wrapper, ...restOptions });

  return renderResult;
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the default render export with our enhanced version
export { renderWithProviders as render };
