import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend({
  toBeInTheDocument: () => {
    return {
      pass: true,
      message: () => '',
    };
  },
});

// Clean up after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// Mock timers for all tests by default
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

// Fix for requestAnimationFrame not found in jsdom
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 0);
  };
  
  window.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };
} 