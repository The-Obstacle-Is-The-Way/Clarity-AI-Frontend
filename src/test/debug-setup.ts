// src/test/debug-setup.ts
// Extended setup for debugging testing issues with Vitest+JSDOM

// Import standard jest-dom setup
import './jest-dom-setup';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Log JSDOM/Node environment information
console.log(`[DEBUG-SETUP] Node version: ${process.version}`);
console.log(`[DEBUG-SETUP] Test environment: ${process.env.TEST_ENV || 'not set'}`);

// Mock localStorage and sessionStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
}

// Apply storage mocks if not in a browser environment
if (typeof window !== 'undefined') {
  console.log('[DEBUG-SETUP] Window object is defined');
  
  // Check for document
  if (typeof document !== 'undefined') {
    console.log('[DEBUG-SETUP] Document object is defined');
  } else {
    console.error('[DEBUG-SETUP] Document object is missing!');
  }
  
  // Mock localStorage if it doesn't exist
  if (!window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: new LocalStorageMock(),
      writable: false
    });
    console.log('[DEBUG-SETUP] Added localStorage mock');
  }
  
  // Mock sessionStorage if it doesn't exist
  if (!window.sessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: new LocalStorageMock(),
      writable: false
    });
    console.log('[DEBUG-SETUP] Added sessionStorage mock');
  }
  
  // Add missing JSDOM properties that might be needed
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    console.log('[DEBUG-SETUP] Added matchMedia polyfill');
  }
  
  // Mock IntersectionObserver if it doesn't exist
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() { return null; }
      unobserve() { return null; }
      disconnect() { return null; }
    };
    console.log('[DEBUG-SETUP] Added IntersectionObserver polyfill');
  }
  
  // Ensure HTMLDialogElement exists
  if (!window.HTMLDialogElement) {
    // @ts-expect-error - adding mock HTMLDialogElement
    window.HTMLDialogElement = class HTMLDialogElement extends HTMLElement {
      showModal() { return null; }
      close() { return null; }
      show() { return null; }
    };
    console.log('[DEBUG-SETUP] Added HTMLDialogElement polyfill');
  }
  
  // Required for userEvent
  if (!window.getComputedStyle) {
    window.getComputedStyle = element => {
      return {
        getPropertyValue: prop => {
          return '';
        }
      };
    };
    console.log('[DEBUG-SETUP] Added getComputedStyle polyfill');
  }
} else {
  // Create globals for a Node.js environment
  console.log('[DEBUG-SETUP] No window object, creating global storage mocks for Node environment');
  
  global.localStorage = new LocalStorageMock();
  global.sessionStorage = new LocalStorageMock();
}

// Fix for testing-library/user-event
// Ensure document.createRange exists
if (typeof document !== 'undefined' && !document.createRange) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    createContextualFragment: (html) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.children[0];
    },
  });
  console.log('[DEBUG-SETUP] Added document.createRange polyfill');
}

// Global debug helpers
global.__DEBUG_TEST__ = {
  logStateChanges: true,
  logMockCalls: true,
  logDOMUpdates: true,
  captureSnapshots: true,
};

console.log('[DEBUG-SETUP] Debug test setup complete');

// Remove global authService mock to allow individual tests to mock it
vi.doUnmock('@/infrastructure/api/authService');
console.log('[DEBUG-SETUP] Global authService mock cleared'); 