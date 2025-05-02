// src/test/setup.ts - Test environment setup
import 'whatwg-fetch'; // Polyfill for fetch in test environment
import { server } from './mocks/server';
import { vi, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
vi.stubGlobal('mockLocalStorage', localStorageMock);

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver more robustly
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Enhance window.matchMedia mock for framer-motion
// Based on https://github.com/framer/motion/blob/main/packages/framer-motion/src/utils/test-utils.ts
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    const instance = {
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    // Store instances to potentially trigger listeners later if needed
    // window.matchMediaInstances = window.matchMediaInstances || [];
    // window.matchMediaInstances.push(instance);
    return instance;
  }),
});

// Helper to toggle matchMedia for tests (exposed via vi.stubGlobal rather than globalThis)
const toggleMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};
vi.stubGlobal('toggleMatchMedia', toggleMatchMedia);

// Mock PointerEvent methods for Radix UI components in JSDOM
if (typeof window !== 'undefined' && !window.PointerEvent) {
  // Just assign Event and cast to any to satisfy existence checks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.PointerEvent = Event as any;
  // Add necessary methods if tests require them
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  // Mock scrollIntoView for Radix UI components
  Element.prototype.scrollIntoView = vi.fn();
}

// Initial media match state
const globalCurrentMatchesState = false;
vi.stubGlobal('globalCurrentMatchesState', globalCurrentMatchesState);

// Mock window objects needed for React Three Fiber
if (typeof global.TextEncoder === 'undefined') {
  // Use dynamic import instead of require for ESM compatibility
  import('util')
    .then((util) => {
      global.TextEncoder = util.TextEncoder;
    })
    .catch((err) => {
      console.error('Failed to dynamically import util for TextEncoder polyfill:', err);
    });
}

// Configure MSW
// Adjusted to use "warn" instead of "error" for onUnhandledRequest
export const setupServer = () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  
  // Reset handlers after each test (important for test isolation)
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests are done
  afterAll(() => server.close());
};

// Create directory for MSW server if it doesn't exist yet
try {
  setupServer();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (_error) {
  console.warn('MSW server not set up. Will need to create server.ts in test/mocks/');
}

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Global setup/teardown can go here if needed
beforeEach(() => {
  // Reset mocks before each test if not using restoreMocks: true in config
});

// Example of mocking a global API
// vi.mock('some-global-library', () => ({
//   // Mock implementation
// }));