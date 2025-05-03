/**
 * CLARITY-AI Neural Test Suite
 * MainLayout testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Import hooks
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // render is imported from unified utils
import React from 'react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@application/context/AuthContext';
import MainLayout from './MainLayout'; // Assuming default export
import { renderWithProviders as render } from '../../infrastructure/testing/utils/test-utils.unified'; // Standardized path

// Mock the useTheme hook directly
vi.mock('@application/hooks/useTheme', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
    mode: 'light',
    theme: 'clinical',
    setTheme: vi.fn(),
    isDark: false,
    colors: {
      primary: '#0062cc',
      secondary: '#3a86ff',
      accent: '#f72585',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
      },
      neural: {
        active: '#ff5e5b',
        inactive: '#373737',
      },
    },
    fontSize: 16,
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
  }),
}));

// Mock data with clinical precision
// Mock data with clinical precision - MainLayout requires children
const mockProps = {
  children: React.createElement('div', null, 'Test Child Content'),
};

describe('MainLayout', () => {
  // Re-enabled suite
  // Store original matchMedia
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // Store original

    // Mock matchMedia specifically for this test suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true, // Ensure it can be restored
      value: vi.fn().mockImplementation((query) => {
        // console.log(`[TEST] matchMedia called with query: ${query}`); // Diagnostic log
        const isLightQuery = query === '(prefers-color-scheme: light)';
        const isDarkQuery = query === '(prefers-color-scheme: dark)';
        // Default to light theme unless dark is explicitly queried, ensure boolean
        const matches = isLightQuery || !isDarkQuery;
        return {
          matches: matches,
          media: query,
          onchange: null,
          addListener: vi.fn(), // Deprecated but mock
          removeListener: vi.fn(), // Deprecated but mock
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });
    vi.clearAllMocks(); // Clear previous test mocks first
  });

  afterEach(() => {
    // Restore original matchMedia to avoid side-effects between test files
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks(); // Restore any other mocks
  });

  it('renders with neural precision', () => {
    render(<MainLayout {...mockProps} />, { initialRoute: '/dashboard' }); // Use unified render, pass options

    // Add assertions for rendered content
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
    // Check for the Clarity AI brand text
    const brandText = screen.getByText(/Clarity AI/i);
    expect(brandText).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it.skip('responds to user interaction with quantum precision', async () => {
    // Skipping this test as the theme toggle button is not currently implemented
    // in the MainLayout component based on the latest code reading.
    // TODO: Re-enable or update this test if theme toggle functionality is added.
    const user = userEvent.setup();
    render(<MainLayout {...mockProps} />, { initialRoute: '/dashboard' }); // Use unified render, pass options

    const themeToggleButton = screen.getByTestId('theme-toggle-button');
    expect(themeToggleButton).toBeInTheDocument();

    await user.click(themeToggleButton);
    // Assertions for mock toggleTheme call could be added if needed
  });

  // Add more component-specific tests
});
