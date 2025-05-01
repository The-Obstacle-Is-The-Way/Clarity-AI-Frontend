// src/test/setup.ts - Test environment setup
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill for fetch in test environment
import { server } from './mocks/server';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Setup global test functions using vi.stubGlobal
// This is needed for jest-dom to work properly
import { expect } from 'vitest';
vi.stubGlobal('expect', expect);

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
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  
  constructor() {
    this.root = null;
    this.rootMargin = '0px';
    this.thresholds = [0];
  }
  
  disconnect() {
    return null;
  }
  
  observe() {
    return null;
  }
  
  takeRecords() {
    return [];
  }
  
  unobserve() {
    return null;
  }
}

// Mock ResizeObserver
class MockResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
}

// Setup global mocks
global.IntersectionObserver = MockIntersectionObserver;
global.ResizeObserver = MockResizeObserver as any;

// Mock window.matchMedia
const createMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Set up matchMedia with false as default
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(createMatchMedia(false)),
});

// Helper to toggle matchMedia for tests (exposed via vi.stubGlobal rather than globalThis)
const toggleMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation(createMatchMedia(matches));
};
vi.stubGlobal('toggleMatchMedia', toggleMatchMedia);

// Initial media match state
const globalCurrentMatchesState = false;
vi.stubGlobal('globalCurrentMatchesState', globalCurrentMatchesState);

// Mock window objects needed for React Three Fiber
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
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
} catch (error) {
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