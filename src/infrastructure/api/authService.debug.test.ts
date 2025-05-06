/**
 * Standalone test for authService to verify mocking works correctly
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// import type { SpyInstance } from 'vitest'; // Incorrect type
import type { LoginCredentials } from '@/domain/types/auth/auth'; // Import necessary type
import '../../../src/test/debug-setup'; // Import extended setup
// import { authService } from '@/infrastructure/api/authService'; // Import the REAL service - Using alias
import { authService } from '../../../src/infrastructure/api/authService'; // Import the REAL service - Using relative path for diagnostics

// No top-level vi.mock needed

describe('authService Mock Verification with spyOn', () => {
  // Rely on inference or use MockedFunction if necessary
  let loginSpy: ReturnType<typeof vi.spyOn>;
  let getCurrentUserSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on and mock implementations BEFORE each test
    loginSpy = vi.spyOn(authService, 'login').mockImplementation(async (credentials: LoginCredentials) => { // Match original signature
      console.log('[SPY MOCK] login called with:', credentials);
      return Promise.resolve({ success: true, token: 'fake-token-spy' });
    });
    getCurrentUserSpy = vi.spyOn(authService, 'getCurrentUser').mockImplementation(async () => {
      console.log('[SPY MOCK] getCurrentUser called');
      return Promise.resolve({
        id: 'test-user-spy',
        name: 'Test User Spy',
        email: 'spy@example.com',
      });
    });
    // Note: We are not mocking/spying on isAuthenticated here
    console.log('[TEST] Spies created');
  });

  afterEach(() => {
    // Restore original implementations AFTER each test
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
    console.log('[TEST] Spies restored');
  });

  it('should allow spying on login method', async () => {
    console.log('[TEST] Starting login test (spyOn)');
    const testCredentials = { email: 'test@example.com', password: 'password123' };
    const result = await authService.login(testCredentials); // Pass credentials object
    console.log('[TEST] Login call completed, result:', result);

    // Verify spy was called correctly
    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith(testCredentials); // Check with credentials object

    // Verify mock returns expected data
    expect(result).toEqual({ success: true, token: 'fake-token-spy' });
    console.log('[TEST] Login assertions passed (spyOn)');
  });

  it('should allow spying on getCurrentUser method', async () => {
    console.log('[TEST] Starting getCurrentUser test (spyOn)');
    const user = await authService.getCurrentUser();
    console.log('[TEST] getCurrentUser call completed, user:', user);

    // Verify spy was called correctly
    expect(getCurrentUserSpy).toHaveBeenCalledTimes(1);

    // Verify mock returns expected data
    expect(user).toEqual({
      id: 'test-user-spy',
      name: 'Test User Spy',
      email: 'spy@example.com',
    });
    console.log('[TEST] getCurrentUser assertions passed (spyOn)');
  });
}); 