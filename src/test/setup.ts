/**
 * NOVAMIND Global Test Setup
 * 
 * This file is automatically imported by test files that require
 * global environment configuration.
 */

// Fix "ResizeObserver is not defined" error in tests
import { vi } from 'vitest';

// Mock global objects that might be missing in JSDOM
if (typeof window !== 'undefined') {
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  );

  // Mock matchMedia which is not implemented in JSDOM
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Configure localStorage mock for theme tests
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) {
          delete store[key];
        }
      }),
    },
    writable: true,
    configurable: true,
  });
}

// Set up document for theme tests
if (typeof document !== 'undefined') {
  // Remove any existing theme classes
  document.documentElement.classList.remove('light', 'dark');
  
  // Set default theme to light
  document.documentElement.classList.add('light');
}

// Global test tear-down utility
export const cleanupDom = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('light');
  }
  
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
}; 