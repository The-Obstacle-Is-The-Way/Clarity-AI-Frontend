/**
 * NOVAMIND Unified Test Utilities
 *
 * Provides quantum-level test utilities for psychiatric digital twin components
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render as testingLibRender, type RenderOptions, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Import the relevant contexts and types
import DataContext from '../application/contexts/DataContext';
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';
import type { ThemeMode } from '../presentation/providers/ThemeProvider';
import {
  ThemeProvider,
  useTheme,
  type ThemeProviderState,
} from '../presentation/providers/ThemeProvider';

// Default mock data context for tests
const mockDataContextValue = {
  patientData: null,
  brainModels: [],
  isLoadingPatient: false,
  isLoadingModels: false,
  patientError: null,
  modelsError: null,
  refreshPatientData: vi.fn(),
  refreshBrainModels: vi.fn(),
};

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
 * Mock implementation of UserProvider for tests
 */
const MockUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a basic mock user context with minimal values needed for tests
  const userContextValue = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'clinician', // This will be cast to UserRole
      organization: 'Test Hospital',
      preferences: {
        theme: 'clinical',
        visualizationDefaults: {
          detailLevel: 'medium',
          colorScheme: 'clinical',
          annotationsVisible: true,
          timeScale: 1.0,
        },
        dashboardLayout: 'detailed',
      },
      lastLogin: new Date().toISOString(),
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    updatePreferences: vi.fn(),
    resetPreferences: vi.fn(),
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <div data-testid="mock-user-provider">{children}</div>
    </UserContext.Provider>
  );
};

/**
 * Mock implementation of VisualizationProvider for tests
 */
const MockVisualizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Minimal mock visualization context values needed for tests
  const visualizationContextValue = {
    settings: {
      renderMode: 'standard', // This will be cast to RenderMode enum
      detailLevel: 'medium', // This will be cast to DetailLevel enum
      showConnections: true,
      connectionThreshold: 0.3,
      activationThreshold: 0.2,
      sliceView: false,
      highlightRegions: [],
      timeScale: 1.0,
      colorMapping: 'clinical', // This will be cast to ColorMapping enum
      transparencyLevel: 0.1,
      annotationsVisible: true,
      showClinicalMarkers: true,
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    isLoading: false,
    setIsLoading: vi.fn(),
    activeRegions: new Map(),
    setActiveRegion: vi.fn(),
    clearActiveRegions: vi.fn(),
    captureSnapshot: vi.fn().mockResolvedValue('data:image/png;base64,test'),
  };

  return (
    <VisualizationContext.Provider value={visualizationContextValue}>
      <div data-testid="mock-visualization-provider">{children}</div>
    </VisualizationContext.Provider>
  );
};

/**
 * AllTheProviders wraps the component under test with all necessary providers
 */
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
  currentTheme?: ThemeMode;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
  currentTheme = 'light', // Default to light for consistency
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={currentTheme}>
        <MockUserProvider>
          <MockVisualizationProvider>
            <DataContext.Provider value={mockDataContext}>
              <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
            </DataContext.Provider>
          </MockVisualizationProvider>
        </MockUserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
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
    mockDataContext = mockDataContextValue,
    defaultTheme = 'light', // Default to light if not provided
    ...renderOptions
  } = options;

  // Define the wrapper directly using AllTheProviders, passing the defaultTheme
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      mockDataContext={mockDataContext}
      currentTheme={defaultTheme} // Pass defaultTheme to AllTheProviders
    >
      {children}
    </AllTheProviders>
  );

  // Store the theme context value to return it
  let themeContextValue: ThemeProviderState | undefined;

  // Create a consumer component to capture the context value
  const ContextConsumer = () => {
    themeContextValue = useTheme();
    return null; // This component doesn't render anything itself
  };

  // Render with the wrapper and the consumer
  const renderResult = testingLibRender(
    <>
      {ui}
      <ContextConsumer />
    </>,
    { wrapper: Wrapper, ...renderOptions } as RenderOptions
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

// Simplified render that doesn't include theme helpers
export function render(ui: ReactElement, options: ExtendedRenderOptions = {}): ReturnType<typeof testingLibRender> {
  const {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    mockDataContext = mockDataContextValue,
    defaultTheme = 'light',
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      mockDataContext={mockDataContext}
      currentTheme={defaultTheme}
    >
      {children}
    </AllTheProviders>
  );

  return testingLibRender(ui, { wrapper: Wrapper, ...renderOptions } as RenderOptions);
}

// Re-export testing-library utilities for convenience
export * from '@testing-library/react';

// Export other test utilities
export { createTestQueryClient, mockDataContextValue }; 