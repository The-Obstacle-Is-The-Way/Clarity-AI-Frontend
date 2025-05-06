// src/test/jest-dom-setup.ts
// This must be imported before any tests that use @testing-library/jest-dom matchers

// Import the jest-dom matchers to extend expect for Vitest
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// --- Pointer Events Polyfill/Mocks for JSDOM ---
// JSDOM lacks full Pointer Events support, which Radix UI uses.
if (typeof window !== 'undefined') {
  // Mock PointerEvent if necessary (some JSDOM/Vitest versions might have it partially)
  if (!window.PointerEvent) {
    class PointerEvent extends MouseEvent { // Inherit from MouseEvent for basic props
      public pointerId?: number;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId;
      }
    }
    window.PointerEvent = PointerEvent as any;
  }

  // Mock pointer capture methods
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  }
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
  if (!window.HTMLElement.prototype.setPointerCapture) {
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
  }
  // Mock scrollIntoView as it's sometimes missing or problematic in JSDOM
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
}

// --- Global Mocks ---

// Global default mock for authService to ensure AuthProvider initializes sanely in most tests
vi.mock('@/infrastructure/api/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({ success: true }), // Default successful login
    logout: vi.fn().mockResolvedValue({ success: true }),
    getCurrentUser: vi.fn().mockResolvedValue({ // Default mock user
      id: 'global-mock-user-id',
      name: 'Global Mock User',
      email: 'global.mock@example.com',
      role: 'clinician',
      permissions: ['VIEW_PATIENTS'],
    }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    renewSession: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Note: Since globals: true is set in vitest.config.ts, Vitest will automatically
// make 'expect' available globally, and @testing-library/jest-dom will extend it
