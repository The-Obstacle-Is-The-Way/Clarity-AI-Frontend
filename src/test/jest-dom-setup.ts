// src/test/jest-dom-setup.ts
// This must be imported before any tests that use @testing-library/jest-dom matchers

// Import the jest-dom matchers to extend expect for Vitest
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

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
