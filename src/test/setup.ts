// src/test/setup.ts - Test environment setup
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill for fetch in test environment
import { server } from './mocks/server';
import { vi } from 'vitest';

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
  constructor(callback: ResizeObserverCallback) {}
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
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window objects needed for React Three Fiber
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Create MSW server for API mocking
export const setupServer = () => {
  // Start MSW Server before tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  
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