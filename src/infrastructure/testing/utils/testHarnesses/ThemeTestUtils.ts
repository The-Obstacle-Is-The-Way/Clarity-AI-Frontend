import { act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

type Theme = 'light' | 'dark' | 'system';

/**
 * Utility functions for testing theme-related components.
 * Handles common theme testing patterns including localStorage manipulation
 * and DOM class verification.
 */
export const ThemeTestUtils = {
  /**
   * Set up a clean environment for theme testing.
   * Clears document classes and localStorage.
   */
  setupThemeTest() {
    // Clear DOM state
    document.documentElement.classList.remove('light', 'dark');
    
    // Clear localStorage
    const originalLocalStorage = window.localStorage;
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      return {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
    });
    
    return {
      /**
       * Store a theme in mocked localStorage.
       */
      storeTheme(theme: Theme, storageKey = 'ui-theme') {
        window.localStorage.getItem.mockImplementation((key: string) => {
          if (key === storageKey) {
            return theme;
          }
          return null;
        });
      },
      
      /**
       * Wait for a theme change to be applied with extended timeout.
       * This accounts for potential timing issues with React effects and DOM updates.
       */
      async waitForThemeChange(expectedTheme: Theme, timeout = 3000) {
        await act(async () => {
          // Allow time for React useEffect to run
          await new Promise(resolve => setTimeout(resolve, 50));
        });
        
        // Wait for theme to be applied with specified timeout
        await waitFor(
          () => {
            const hasExpectedClass = document.documentElement.classList.contains(expectedTheme);
            const hasOtherClass = document.documentElement.classList.contains(
              expectedTheme === 'light' ? 'dark' : 'light'
            );
            
            // Success criteria: expected class exists and other class doesn't
            expect(hasExpectedClass).toBe(true);
            expect(hasOtherClass).toBe(false);
            
            return true;
          },
          { timeout }
        );
      },
      
      /**
       * Clean up after theme tests.
       */
      cleanup() {
        // Restore original localStorage
        vi.restoreAllMocks();
        
        // Clear any applied theme classes
        document.documentElement.classList.remove('light', 'dark');
      },
      
      /**
       * Force immediate execution of effect callbacks.
       * Useful for synchronizing theme changes in tests.
       */
      async flushEffects() {
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      },
      
      /**
       * Mock system color scheme preference.
       */
      mockSystemTheme(isDark: boolean) {
        // Mock the matchMedia API
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: vi.fn().mockImplementation(query => ({
            matches: isDark,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          })),
        });
      },
    };
  },
}; 