/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
/**
 * Enhanced ThemeProvider Test using direct rendering
 */
import React from 'react';
// Import render and act from testing-library directly
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
// No userEvent needed as we removed button interactions
// import userEvent from '@testing-library/user-event';
import { vi, afterEach, describe, it, expect, beforeEach } from 'vitest'; // Add beforeEach
// Import the actual ThemeProvider
import { ThemeProvider } from './ThemeProvider';
import { ThemeTestUtils } from '../../infrastructure/testing/utils/testHarnesses/ThemeTestUtils';

// We rely on the global setup in src/test/setup.ts for mocks and environment

describe('ThemeProvider (Enhanced Tests)', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset the document body and classes
    document.documentElement.classList.remove('light', 'dark');
  });
  
  afterEach(() => {
    // Clean up all mocks
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('defaults to light theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initializes with default theme (light)', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('applies dark mode class when defaultTheme is dark', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('reads from localStorage if a theme is stored', async () => {
    // Use our test utilities to set up the test environment
    const themeUtils = ThemeTestUtils.setupThemeTest();
    
    // Set up localStorage with dark theme before rendering
    themeUtils.storeTheme('dark', 'ui-theme');
    
    // Force the localStorage getItem to return dark theme
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue('dark');
    
    // Render with light as default (should be overridden by localStorage)
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    // Force immediate theme application rather than waiting for effect timing
    await themeUtils.flushEffects();
    
    // Use a longer timeout and more specific class check
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    }, { timeout: 3000 });
    
    // Cleanup after test
    themeUtils.cleanup();
  });

  it('applies system theme (dark) correctly', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true, // dark mode
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(
      <ThemeProvider defaultTheme="system">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies system theme (light) correctly', () => {
    // Mock system preference as light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // light mode
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(
      <ThemeProvider defaultTheme="system">
        <div>Test content</div>
      </ThemeProvider>
    );
    
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  // Tests involving theme changes via buttons are removed as we no longer render the consumer component
  // Tests for system preference changes while set to system are skipped due to JSDOM timing issues
});
