/**
 * NOVAMIND Unified Test Utilities
 *
 * Provides quantum-level test utilities for psychiatric digital twin components
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, act } from '@testing-library/react'; // Import act
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Import the relevant contexts and types
import DataContext from '../application/contexts/DataContext';
// Removed incorrect ThemeContext imports
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';

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
// MockThemeProvider removed - Use the actual ThemeProvider from the application
import type { ThemeMode } from '../presentation/providers/ThemeProvider';
import {
  ThemeProvider,
  useTheme,
  ThemeProviderContext,
  type ThemeProviderState,
} from '../presentation/providers/ThemeProvider'; // Import necessary items from provider

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
    <UserContext.Provider value={userContextValue as any}>
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
    <VisualizationContext.Provider value={visualizationContextValue as any}>
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
  currentTheme?: ThemeMode; // Use the imported ThemeMode type
  setCurrentTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'system'>>;
}

const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
  currentTheme = 'light', // Default to light for consistency
  // setCurrentTheme is removed as ThemeProvider manages its own state
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Use the actual ThemeProvider, passing only necessary props */}
      {/* Use the actual ThemeProvider */}
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
}

/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
  defaultTheme?: ThemeMode; // Use ThemeMode type
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

  // Render with the simplified wrapper
  // Removed duplicate renderResult declaration

  // Store the theme context value to return it
  let themeContextValue: ThemeProviderState | undefined; // Use type imported from provider

  // Create a consumer component to capture the context value
  const ContextConsumer = () => {
    themeContextValue = useTheme();
    return null; // This component doesn't render anything itself
  };

  // Render with the wrapper and the consumer
  const renderResult = render(
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

  console.log('[DEBUG renderWithProviders] Returning helpers:', {
    setTheme: !!themeContextValue.setTheme,
    isDarkMode: typeof (() => themeContextValue?.theme === 'dark'),
    getCurrentThemeMode: typeof (() => themeContextValue?.theme),
    getCurrentAppliedTheme: typeof (() => themeContextValue?.theme),
    enableDarkMode: typeof (() => {
      /* ... */
    }),
    disableDarkMode: typeof (() => {
      /* ... */
    }),
  });

  // Return standard render result plus theme context helpers
  return {
    ...renderResult,
    setTheme: themeContextValue.setTheme,
    isDarkMode: () => themeContextValue?.theme === 'dark', // Helper based on context
    getCurrentThemeMode: () => themeContextValue?.theme, // Helper for selected mode (uses 'theme' property)
    getCurrentAppliedTheme: () => themeContextValue?.theme, // Helper for applied theme
    // Add helpers to directly manipulate theme for testing purposes
    enableDarkMode: () => {
      console.log('[DEBUG enableDarkMode] Calling setTheme("dark")');
      // Use act to wrap state update
      act(() => {
        themeContextValue?.setTheme('dark');
      });
      // Note: DOM class update happens via ThemeProvider's useEffect
      // these helpers primarily affect the DOM for class assertions.
    },
    disableDarkMode: () => {
      console.log('[DEBUG disableDarkMode] Calling setTheme("light")');
      act(() => {
        themeContextValue?.setTheme('light');
      });
    },
  };
};

// Re-export testing-library utilities for convenience
export * from '@testing-library/react';

// Export other test utilities
export { createTestQueryClient, mockDataContextValue };
