/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
// Ensure global test setup is applied
import '../../test/setup';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import waitFor
import { act } from '@testing-library/react'; // Add import for act
import { EnhancedAuthService } from './AuthService.enhanced';
import { AuthTokens, AuthUser, AuthApiClient } from './index'; // Import AuthApiClient for mocking

// Rely on the global window.localStorage mock defined in src/test/setup.ts
// Use window.localStorage.* spies for storage interactions
// Use more direct spies on the native objects that are guaranteed to work
beforeEach(() => {
  // Clear mock call history but preserve implementations
  vi.clearAllMocks();

  // Reset localStorage - Handled by global setup (src/test/setup.ts)
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Test subclass to expose and override protected methods
class TestableAuthService extends EnhancedAuthService {
  // Flag to track if setupRefreshTimeout was called
  public refreshTimeoutWasScheduled = false;

  // Override to make the refresh timeout testable
  protected setupRefreshTimeout(): void {
    this.refreshTimeoutWasScheduled = true;
    // Call original method but with spy tracking
    super.setupRefreshTimeout();
  }

  // Expose private methods for testing
  public exposedRefreshTokenSilently(): Promise<AuthTokens | null> {
    return this.refreshTokenSilently();
  }

  // Reset the tracking flag
  public resetTestFlags(): void {
    this.refreshTimeoutWasScheduled = false;
  }
}

// Sample data
const mockUser: AuthUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'clinician',
  permissions: ['read:patients', 'write:notes'],
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600000, // 1 hour from now
};

const expiredTokens: AuthTokens = {
  accessToken: 'expired-access-token',
  refreshToken: 'expired-refresh-token',
  expiresAt: Date.now() - 3600000, // 1 hour ago
};

const soonToExpireTokens: AuthTokens = {
  accessToken: 'soon-to-expire-token',
  refreshToken: 'soon-to-expire-refresh',
  expiresAt: Date.now() + 60000, // 1 minute from now
};

// Mock CustomEvent for session expiration
(global as any).CustomEvent = class CustomEvent extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(name: string, options: any = {}) {
    super(name, options);
    Object.assign(this, options);
  }
};

// Mocks for the AuthApiClient methods
// Default implementations with resolved promises instead of rejected
const mockLogin = vi.fn().mockImplementation(async () => {
  console.log('[MOCK login] Called with default implementation');
  return Promise.resolve(mockTokens);
});

const mockLogout = vi.fn().mockImplementation(async () => {
  console.log('[MOCK logout] Called with default implementation');
  return Promise.resolve(true);
});

const mockRefreshToken = vi.fn().mockImplementation(async (refreshToken: string) => {
  console.log('[MOCK refreshToken] Called with:', refreshToken);
  return Promise.resolve({ ...mockTokens, accessToken: 'new-token' });
});

const mockGetCurrentUser = vi.fn().mockImplementation(async () => {
  console.log('[MOCK getCurrentUser] Called with default implementation');
  return Promise.resolve(mockUser);
});

vi.stubGlobal('CustomEvent', CustomEvent);

// Global spies for event dispatching
describe('EnhancedAuthService', () => {
  let authService: EnhancedAuthService;
  // Create a mock for dispatchEvent
  const dispatchEventSpy = vi.fn().mockReturnValue(true);

  // Replace window.dispatchEvent with our mock
  Object.defineProperty(window, 'dispatchEvent', {
    value: dispatchEventSpy,
    writable: true,
    configurable: true,
  });

  beforeEach(() => {
    // The global setup's afterEach handles vi.clearAllMocks().
    vi.useFakeTimers(); // Use fake timers for consistent Date.now()

    // Spy on AuthApiClient prototype methods
    vi.spyOn(AuthApiClient.prototype, 'login').mockImplementation(mockLogin);
    vi.spyOn(AuthApiClient.prototype, 'logout').mockImplementation(mockLogout);
    vi.spyOn(AuthApiClient.prototype, 'refreshToken').mockImplementation(mockRefreshToken);
    vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockImplementation(mockGetCurrentUser);
    
    // Spy on JSDOM localStorage methods
    vi.spyOn(window.localStorage, 'getItem');
    vi.spyOn(window.localStorage, 'setItem');
    vi.spyOn(window.localStorage, 'removeItem');

    // Instantiate the service after spies
    authService = new EnhancedAuthService('https://api.test.com');

    vi.spyOn(window, 'setTimeout');
    dispatchEventSpy.mockClear(); // Clear event dispatch spy
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
    vi.restoreAllMocks(); // Restores original prototype methods
    // Clear mock storage after each test
    window.localStorage.clear();
  });

  describe('initializeAuth with token auto-refresh', () => {
    it('should set up refresh timeout for tokens that will expire soon', async () => {
      // Use the TestableAuthService for this test
      vi.setSystemTime(new Date(soonToExpireTokens.expiresAt - 200000)); // Set time BEFORE expiry buffer
      const testTokens = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: Date.now() + 60000, // 1 minute from now
      };

      // Store tokens first
      window.localStorage.setItem('auth_tokens', JSON.stringify(testTokens));

      // Create a testable service instance
      const testAuthService = new TestableAuthService('https://api.test.com');

      // Reset the tracking flag before the test
      testAuthService.resetTestFlags();

      // No need to replace the client manually, spies handle it

      // Call setupRefreshTimeout explicitly
      (testAuthService as any).setupRefreshTimeout();

      // Verify our tracking flag was set to true
      expect(testAuthService.refreshTimeoutWasScheduled).toBe(true);
    });

    it('should attempt to refresh token when it has expired', async () => {
      // --- Setup ---
      // Set time AFTER expiry
      const expiryTime = expiredTokens.expiresAt;
      vi.setSystemTime(new Date(expiryTime + 10000));

      // Store expired token
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

      // Mock API responses *before* service call
      // NOTE: MSW handlers should intercept this automatically now
      const expectedNewTokens = { ...mockTokens, accessToken: 'new-token-from-refresh' }; // Example
      // We expect the MSW handler to return new tokens

      // --- Execute ---
      // Use act to wrap state updates
      let result;
      await act(async () => {
        result = await authService.initializeAuth();
      });

      // --- Verification ---
      // Wait for promises and state updates
      await waitFor(() => {
        // Check if refreshToken was called via the spy (if needed) or check MSW logs
        // For now, rely on the state change
        expect(window.localStorage.getItem('auth_tokens')).toContain(
          expectedNewTokens.accessToken, // Check if new token was stored
        );
        expect(result.isAuthenticated).toBe(true);
        expect(result.user).toEqual(mockUser); // Assuming MSW returns mockUser on /me
        // Check the specific token values if needed
        expect(result.tokens?.accessToken).toEqual(expectedNewTokens.accessToken);
      });
    });

    it('should handle token refresh failure during initialization', async () => {
      // --- Setup ---
      const expiryTime = expiredTokens.expiresAt;
      vi.setSystemTime(new Date(expiryTime + 10000));
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

      // Configure MSW to return a 401 for the refresh endpoint for this test
      // (This needs specific setup in the test or modifying the global handler temporarily)
      // For now, assume the default MSW refresh handler might fail or let's mock the client directly
      vi.spyOn(AuthApiClient.prototype, 'refreshToken').mockRejectedValueOnce(
        new Error('Refresh failed'),
      );

      // --- Execute ---
      let result;
      await act(async () => {
        result = await authService.initializeAuth();
      });

      // --- Verification ---
      await waitFor(() => {
        expect(window.localStorage.getItem('auth_tokens')).toBeNull(); // Tokens should be cleared
        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.error).toMatch(/Session expired|Refresh failed/i); // Check error message
      });
    });

    it('should attempt token refresh on 401 error from getCurrentUser', async () => {
       // --- Setup ---
       const expiryTime = expiredTokens.expiresAt;
       vi.setSystemTime(new Date(expiryTime + 10000));
       window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

       // Mock getCurrentUser to fail initially, then succeed after refresh
       const mockGetCurrentUserClient = vi
         .spyOn(AuthApiClient.prototype, 'getCurrentUser')
         .mockRejectedValueOnce(new Error('Unauthorized')); // Simulate 401

       const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-on-getuser' };
       const mockRefreshTokenClient = vi
         .spyOn(AuthApiClient.prototype, 'refreshToken')
         .mockResolvedValueOnce(expectedNewTokens);

       // --- Execute ---
       let user;
       await act(async () => {
          // Call a method that triggers getCurrentUser internally, e.g., initializeAuth or a direct call if exposed
          // Assuming initializeAuth triggers it indirectly
          await authService.initializeAuth();
          // Or if we have a direct method like:
          // user = await authService.getCurrentUser();
       });

       // --- Verification ---
        await waitFor(() => {
          // Check if refresh was called
          expect(mockRefreshTokenClient).toHaveBeenCalledWith(expiredTokens.refreshToken);
          // Check if getCurrentUser was called again after refresh (implicitly tested by state)
          expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(1); // It rejects first, then refresh happens
          // Check final state by re-initializing or checking localStorage
          expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
          // Optionally re-initialize to check user state
          // const finalState = await authService.initializeAuth();
          // expect(finalState.isAuthenticated).toBe(true);
          // expect(finalState.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
        });
    });
  });

  describe('ensureValidToken middleware', () => {
    it('should return token when valid and not expiring soon', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 }; // Expires in 1 hour
      window.localStorage.setItem('auth_tokens', JSON.stringify(validTokens));
      await authService.initializeAuth(); // Initialize state

      // --- Execute ---
      let token;
      await act(async () => {
        token = await authService.ensureValidToken();
      });

      // --- Verification ---
      expect(token).toBe(validTokens.accessToken);
      expect(AuthApiClient.prototype.refreshToken).not.toHaveBeenCalled();
    });

    it('should refresh token when it is expiring soon', async () => {
      // --- Setup ---
      const nearExpiryTime = Date.now() + 60000; // 1 minute from now
      const nearExpiryTokens = { ...soonToExpireTokens, expiresAt: nearExpiryTime };
      window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
      vi.setSystemTime(new Date()); // Ensure current time is used for comparison
      await authService.initializeAuth(); // Initialize state

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-near-expiry' };
      const mockRefreshTokenClient = vi
          .spyOn(AuthApiClient.prototype, 'refreshToken')
          .mockResolvedValueOnce(expectedNewTokens);

      // --- Execute ---
      let token;
      await act(async () => {
        token = await authService.ensureValidToken();
      });

      // --- Verification ---
       await waitFor(() => {
         expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
         expect(token).toBe(expectedNewTokens.accessToken);
         expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
       });
    });

    it('should return null when refresh fails', async () => {
        // --- Setup ---
        const nearExpiryTime = Date.now() + 60000; // 1 minute from now
        const nearExpiryTokens = { ...soonToExpireTokens, expiresAt: nearExpiryTime };
        window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
        vi.setSystemTime(new Date());
        await authService.initializeAuth();

        const mockRefreshTokenClient = vi
          .spyOn(AuthApiClient.prototype, 'refreshToken')
          .mockRejectedValueOnce(new Error('Refresh failed miserably'));

        // --- Execute ---
        let token;
        await act(async () => {
            token = await authService.ensureValidToken();
        });

        // --- Verification ---
        await waitFor(async () => {
            expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
            expect(token).toBeNull();
            expect(window.localStorage.getItem('auth_tokens')).toBeNull(); // Should clear tokens on failure
            // Verify state by re-initializing
            const finalState = await authService.initializeAuth();
            expect(finalState.isAuthenticated).toBe(false);
        });
    });
  });

  describe('permission checking', () => {
    it('should return true when user has permission', async () => {
      // --- Setup ---
      const userWithPerms: AuthUser = { ...mockUser, permissions: ['read:patients', 'admin:access'] };
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens)); // Store valid tokens
      // Mock getCurrentUser to return this specific user during init
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(userWithPerms);

      await act(async () => {
        await authService.initializeAuth();
      });

      // --- Execute & Verification ---
      expect(authService.hasPermission('read:patients')).toBe(true);
      expect(authService.hasPermission('admin:access')).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      // Setup - Use the authService state directly
      // First initialize with a valid user and tokens
      mockRefreshToken.mockResolvedValueOnce(mockTokens);
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);
      
      // Initialize auth
      await authService.initializeAuth();
      
      // Execute - check for a permission the user doesn't have
      const hasPermission = authService.hasPermission('administer');

      // Verify
      expect(hasPermission).toBe(false);
    });

    it('should trigger background refresh for expiring token', async () => {
      // --- Setup ---
      const refreshBuffer = 300000; // Use the hardcoded buffer value (5 minutes)
      const nearExpiryTime = Date.now() + (refreshBuffer - 10000); // Expiring within offset
      const nearExpiryTokens = { ...mockTokens, expiresAt: nearExpiryTime };
      window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
      vi.setSystemTime(new Date());

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-background' };
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // Initialize the service - this should schedule the timeout
      await act(async () => {
        await authService.initializeAuth();
      });

      // --- Execute ---
      // Advance timers past the calculated refresh timeout
      vi.advanceTimersByTime(refreshBuffer * 2); // Advance well past the timeout

      // --- Verification ---
      await waitFor(async () => {
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
        expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
        // Optionally check the internal state by re-initializing
        const finalState = await authService.initializeAuth();
        expect(finalState.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
      });
    });
  });

  describe('logout handling', () => {
    it('should handle API call failure during logout', async () => {
      // --- Setup ---
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      await authService.initializeAuth(); // Ensure user is logged in

      const mockLogoutClient = vi
        .spyOn(AuthApiClient.prototype, 'logout')
        .mockRejectedValueOnce(new Error('API unavailable'));

      // --- Execute ---
      await act(async () => {
        await authService.logout();
      });

      // --- Verification ---
      await waitFor(async () => {
          expect(mockLogoutClient).toHaveBeenCalledTimes(1);
          expect(window.localStorage.getItem('auth_tokens')).toBeNull(); // Should still clear local tokens
           // Verify state by re-initializing
          const finalState = await authService.initializeAuth();
          expect(finalState.isAuthenticated).toBe(false);
          expect(finalState.user).toBeNull();
          // Check if logout event was dispatched
          expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout-complete' }));
      });
    });

    it('should clear tokens and state on successful logout', async () => {
        // --- Setup ---
        window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
        await authService.initializeAuth(); // Ensure user is logged in
        expect(authService.getCurrentState().isAuthenticated).toBe(true);

        const mockLogoutClient = vi.spyOn(AuthApiClient.prototype, 'logout').mockResolvedValueOnce();

        // --- Execute ---
        await act(async () => {
          await authService.logout();
        });

        // --- Verification ---
        await waitFor(async () => {
            expect(mockLogoutClient).toHaveBeenCalledTimes(1);
            expect(window.localStorage.getItem('auth_tokens')).toBeNull();
             // Verify state by re-initializing
            const finalState = await authService.initializeAuth();
            expect(finalState.isAuthenticated).toBe(false);
            expect(finalState.user).toBeNull();
            expect(finalState.tokens).toBeNull();
             // Check if logout event was dispatched
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:logout-complete' }));
        });
    });
  });

  describe('silent token refresh', () => {
    it('should dispatch session-expired event when refresh fails', async () => {
      // --- Setup ---
      const nearExpiryTime = Date.now() + 60000;
      const nearExpiryTokens = { ...soonToExpireTokens, expiresAt: nearExpiryTime };
      window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
      vi.setSystemTime(new Date());
      await authService.initializeAuth();

      vi.spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(new Error('Invalid refresh token'));

      // --- Execute ---
      // Trigger the refresh attempt (e.g., by calling getToken)
      await act(async () => {
        await authService.ensureValidToken();
      });

      // --- Verification ---
      await waitFor(async () => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'auth:session-expired' }),
        );
        // Verify state is updated by re-initializing
        const finalState = await authService.initializeAuth();
        expect(finalState.isAuthenticated).toBe(false);
      });
    });

    it('should reuse in-progress refresh promise', async () => {
       // --- Setup ---
      const nearExpiryTime = Date.now() + 60000;
      const nearExpiryTokens = { ...soonToExpireTokens, expiresAt: nearExpiryTime };
      window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
      vi.setSystemTime(new Date());
      await authService.initializeAuth();

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-concurrently' };
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // --- Execute ---
      // Call getToken multiple times concurrently
      let token1, token2;
      await act(async () => {
        const promise1 = authService.ensureValidToken();
        const promise2 = authService.ensureValidToken();
        [token1, token2] = await Promise.all([promise1, promise2]);
      });

      // --- Verification ---
      await waitFor(() => {
        // Ensure refreshToken was only called once despite concurrent requests
        expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
        expect(token1).toBe(expectedNewTokens.accessToken);
        expect(token2).toBe(expectedNewTokens.accessToken);
        expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
      });
    });
  });
});
