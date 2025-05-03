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
      const expectedNewTokens = { ...mockTokens, accessToken: 'new-token-from-refresh' };
      // Mock the refresh call to return new tokens
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);
      // Ensure getCurrentUser succeeds after refresh
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(mockUser);

      // --- Execute ---
      // Use act to wrap state updates
      let result;
      await act(async () => {
        result = await authService.initializeAuth();
      });

      // --- Verification ---
      await waitFor(() => {
        // Check if refreshToken was called
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(expiredTokens.refreshToken);
        // Check if getCurrentUser was called
        expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(1);
        // Check if new token was stored
        expect(window.localStorage.getItem('auth_tokens')).toContain(
          expectedNewTokens.accessToken,
        );
        expect(result.isAuthenticated).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.tokens?.accessToken).toEqual(expectedNewTokens.accessToken);
      });
    }, 10000); // Increase timeout for this specific complex test

    it('should handle token refresh failure during initialization', async () => {
      // --- Setup ---
      const expiryTime = expiredTokens.expiresAt;
      vi.setSystemTime(new Date(expiryTime + 10000));
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

      // Mock refresh to fail
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(new Error('Refresh failed'));
      // Mock getCurrentUser - it shouldn't be called if refresh fails
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser');

      // --- Execute ---
      let result;
      await act(async () => {
        result = await authService.initializeAuth();
      });

      // --- Verification ---
      await waitFor(() => {
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(expiredTokens.refreshToken);
        expect(mockGetCurrentUserClient).not.toHaveBeenCalled(); // Should not attempt getUser
        expect(window.localStorage.getItem('auth_tokens')).toBeNull(); // Tokens should be cleared
        expect(result.isAuthenticated).toBe(false);
        expect(result.user).toBeNull();
        expect(result.error).toMatch(/Session expired|Refresh failed/i); // Check error message
      });
    });

    it('should attempt token refresh on 401 error from getCurrentUser', async () => {
      // --- Setup ---
      // Start with seemingly valid tokens (e.g., expired on server but not locally yet)
      const validButStaleTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };
      window.localStorage.setItem('auth_tokens', JSON.stringify(validButStaleTokens));
      vi.setSystemTime(new Date());

      // Mock getCurrentUser to fail first (401), then succeed after refresh
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockRejectedValueOnce(new Error('Unauthorized')) // Simulate 401
        .mockResolvedValueOnce(mockUser); // Succeed after refresh

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-on-getuser' };
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // --- Execute ---
      let result;
      await act(async () => {
        result = await authService.initializeAuth();
      });

      // --- Verification ---
      await waitFor(() => {
        // Check execution flow
        expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(2); // Called twice: fail -> refresh -> success
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(validButStaleTokens.refreshToken);

        // Check final state
        expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
        expect(result.isAuthenticated).toBe(true);
        expect(result.user).toEqual(mockUser);
        expect(result.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
      });
    }, 10000); // Increase timeout for this complex interaction
  });

  describe('ensureValidToken middleware', () => {
    it('should return token when valid and not expiring soon', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 }; // Expires in 1 hour
      window.localStorage.setItem('auth_tokens', JSON.stringify(validTokens));
      // Ensure initial state is correct
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);
      expect(initialState.tokens?.accessToken).toBe(validTokens.accessToken);

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
      // Initialize state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);
      expect(initialState.tokens?.accessToken).toBe(nearExpiryTokens.accessToken);

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
      // Initialize state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);

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
        // Verify state by checking internal state (re-initialize)
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
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(userWithPerms);

      // Initialize and check state
      let initState;
      await act(async () => {
        initState = await authService.initializeAuth();
      });
      expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(1);
      expect(initState.isAuthenticated).toBe(true);
      expect(initState.user).toEqual(userWithPerms);
      expect(initState.user?.permissions).toEqual(['read:patients', 'admin:access']); // Verify permissions in state

      // --- Execute & Verification ---
      // Check permission using the service method AFTER state is confirmed
      expect(authService.hasPermission('read:patients')).toBe(true);
      expect(authService.hasPermission('admin:access')).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      // Setup - Use the authService state directly
      // Initialize with a user having specific permissions
      const userWithoutAdmin: AuthUser = { ...mockUser, permissions: ['read:patients'] };
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(userWithoutAdmin);

      let initState;
      await act(async () => {
        initState = await authService.initializeAuth();
      });
      expect(initState.isAuthenticated).toBe(true);
      expect(initState.user).toEqual(userWithoutAdmin);

      // Execute - check for a permission the user doesn't have
      const hasPermission = authService.hasPermission('administer');

      // Verify
      expect(hasPermission).toBe(false);
    });

    it('should trigger background refresh for expiring token', async () => {
      // --- Setup ---
      const refreshBuffer = 300000; // 5 minutes
      const nearExpiryTime = Date.now() + (refreshBuffer - 10000); // Expiring within offset (4m 50s from now)
      const nearExpiryTokens = { ...mockTokens, expiresAt: nearExpiryTime };
      window.localStorage.setItem('auth_tokens', JSON.stringify(nearExpiryTokens));
      vi.setSystemTime(new Date()); // Set current time

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-background' };
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // Initialize the service - this should set the timeout internally
      let initState;
      await act(async () => {
        initState = await authService.initializeAuth();
      });
      expect(initState.isAuthenticated).toBe(true);

      // --- Execute ---
      // Advance timers past the point where refresh should have been triggered
      // The timeout should be scheduled for roughly (nearExpiryTime - Date.now() - refreshBuffer)
      // which is roughly -10000 ms (meaning it should trigger almost immediately if logic is correct)
      // Let's advance by a small amount first, then by the buffer
      vi.advanceTimersByTime(1000); // Advance 1 second
      vi.runOnlyPendingTimers(); // Run any timers scheduled for now

      vi.advanceTimersByTime(refreshBuffer); // Advance by the buffer time
      vi.runOnlyPendingTimers(); // Run timers scheduled during the buffer

      // --- Verification ---
      await waitFor(() => {
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
        expect(window.localStorage.getItem('auth_tokens')).toContain(expectedNewTokens.accessToken);
      });

      // Optionally check the internal state by re-initializing
      const finalState = await authService.initializeAuth();
      expect(finalState.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
    }, 15000); // Increase timeout for timer-dependent test
  });

  describe('logout handling', () => {
    it('should handle API call failure during logout', async () => {
      // --- Setup ---
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      // Initialize and verify logged-in state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);

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
      // Initialize and verify logged-in state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);

      const mockLogoutClient = vi.spyOn(AuthApiClient.prototype, 'logout').mockResolvedValueOnce(undefined);

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
      // Initialize state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);

      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(new Error('Invalid refresh token'));

      // --- Execute ---
      // Trigger the refresh attempt (e.g., by calling ensureValidToken)
      await act(async () => {
        await authService.ensureValidToken();
      });

      // --- Verification ---
      await waitFor(async () => {
        expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
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
      // Initialize state
      const initialState = await authService.initializeAuth();
      expect(initialState.isAuthenticated).toBe(true);

      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-concurrently' };
      // Mock refresh to take a little time to simulate concurrency
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
          return expectedNewTokens;
        });

      // --- Execute ---
      // Call ensureValidToken multiple times concurrently
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
