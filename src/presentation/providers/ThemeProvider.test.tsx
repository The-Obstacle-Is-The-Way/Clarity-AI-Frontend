/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
// Import the test setup first to ensure JSDOM environment is properly configured
import '../../test/setup.ts';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider'; // Import from presentation layer
import React from 'react'; // Import React for JSX

// Test component that uses the theme
function TestComponent() {
  // This provider only exposes 'theme' and 'setTheme'
  const { theme, setTheme } = useTheme();
  return (
    <div>
      {/* Display applied theme */}
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

// Enhanced matchMedia mock for tests
function setupMatchMedia(prefersDark = false) {
  // Define a MediaQueryList mock with a _listeners array to track listeners
  const mediaQueryList = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn((listener) => {
      // Store listeners in an array to support multiple listeners
      mediaQueryList._listeners = mediaQueryList._listeners || [];
      mediaQueryList._listeners.push(listener);
    }),
    removeListener: vi.fn((listener) => {
      // Remove the listener from the array
      mediaQueryList._listeners = (mediaQueryList._listeners || []).filter((l) => l !== listener);
    }),
    addEventListener: vi.fn((event, listener) => {
      if (event === 'change') {
        mediaQueryList._listeners = mediaQueryList._listeners || [];
        mediaQueryList._listeners.push(listener);
      }
    }),
    removeEventListener: vi.fn((event, listener) => {
      if (event === 'change') {
        mediaQueryList._listeners = (mediaQueryList._listeners || []).filter((l) => l !== listener);
      }
    }),
    // Method to simulate a media query change
    _triggerChange: (prefersDarkValue) => {
      mediaQueryList.matches = prefersDarkValue;
      // Notify all registered listeners
      (mediaQueryList._listeners || []).forEach((listener) => {
        if (typeof listener === 'function') {
          listener({ matches: prefersDarkValue });
        } else if (listener && typeof listener.handleEvent === 'function') {
          listener.handleEvent({ matches: prefersDarkValue });
        }
      });
    },
    _listeners: [],
  };

  // Replace window.matchMedia with our enhanced mock
  window.matchMedia = vi.fn().mockImplementation(() => mediaQueryList);

  // Return the mock for additional control in tests
  return mediaQueryList;
}

describe('ThemeProvider', () => {
  let mediaQueryList;

  beforeEach(() => {
    // Set up enhanced matchMedia mock before each test
    mediaQueryList = setupMatchMedia(false); // Default to light mode

    // Also ensure localStorage is properly mocked
    globalThis.mockLocalStorage.getItem.mockReset();
    globalThis.mockLocalStorage.setItem.mockReset();
    globalThis.mockLocalStorage.removeItem.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('uses system theme by default (prefers light)', async () => {
    // Setup matchMedia to prefer light
    mediaQueryList.matches = false;
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Verify theme is set to system and document has light class
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('uses system theme by default (prefers dark)', async () => {
    // Setup matchMedia to prefer dark
    mediaQueryList.matches = true;
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Verify theme is set to system and document has dark class
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('loads saved theme from localStorage', async () => {
    // Set up localStorage to return 'dark'
    globalThis.mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'ui-theme') return 'dark';
      return null;
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Verify theme is set to dark from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  it('allows changing theme', async () => {
    // Start with system theme (light)
    mediaQueryList.matches = false;
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);

    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> light)
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    // Change to dark theme
    await user.click(screen.getByText('Dark'));

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'dark');

    // Change to light theme
    await user.click(screen.getByText('Light'));

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'light');

    // Change back to system theme
    await user.click(screen.getByText('System'));

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    expect(globalThis.mockLocalStorage.setItem).toHaveBeenCalledWith('ui-theme', 'system');
  });

  it('follows system theme when set to system', async () => {
    // Start with system theme (dark)
    mediaQueryList.matches = true;
    globalThis.mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state (system -> dark)
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    // Simulate system theme change to light
    act(() => {
      mediaQueryList._triggerChange(false);
    });

    // Verify theme changes to light
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    // Theme state remains 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');

    // Simulate system theme change back to dark
    act(() => {
      mediaQueryList._triggerChange(true);
    });

    // Verify theme changes to dark
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    // Theme state remains 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this specific test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Wrap in a function to capture the error
    const renderWithoutProvider = () => {
      render(<TestComponent />);
    };

    // Expecting a specific error message is more robust
    expect(renderWithoutProvider).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });
});
