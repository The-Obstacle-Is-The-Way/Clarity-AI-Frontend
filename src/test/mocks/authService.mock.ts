import { vi } from 'vitest';
import { testLogger } from '../debug-utils';

// Create a detailed, debuggable mock of the auth service
export const mockAuthService = {
  login: vi.fn().mockImplementation((email: string, password: string) => {
    testLogger.mock('authService', 'login', [email, password]);
    
    // Return a promise that logs before and after resolution
    return new Promise((resolve) => {
      testLogger.mock('authService', 'login', null, 'Promise pending...');
      
      // Small delay to ensure async behavior is observable
      setTimeout(() => {
        const result = { token: 'fake-test-token' };
        testLogger.mock('authService', 'login', null, 'Promise resolved with:');
        testLogger.mock('authService', 'login', null, result);
        resolve(result);
      }, 50);
    });
  }),

  getCurrentUser: vi.fn().mockImplementation(() => {
    testLogger.mock('authService', 'getCurrentUser', [], null);
    return null;
  }),

  logout: vi.fn().mockImplementation(() => {
    testLogger.mock('authService', 'logout', [], undefined);
    return Promise.resolve();
  }),

  // Reset all mocks for clean test states
  resetMocks: () => {
    mockAuthService.login.mockClear();
    mockAuthService.getCurrentUser.mockClear();
    mockAuthService.logout.mockClear();
    testLogger.mock('authService', 'resetMocks', [], 'All mocks reset');
  }
};

// For use with vi.mock
export const createAuthServiceMock = () => mockAuthService; 