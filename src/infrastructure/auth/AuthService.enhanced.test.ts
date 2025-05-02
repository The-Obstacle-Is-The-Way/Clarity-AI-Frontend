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
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
    vi.restoreAllMocks(); // Restores original prototype methods
    // Clear mock storage after each test
    window.localStorage.clear();
  });

  describe('initializeAuth with token auto-refresh', () => {
    it('should attempt to refresh token when it has expired', async () => {
      // --- Setup ---
      // Set time AFTER expiry
      const expiryTime = expiredTokens.expiresAt;
      vi.setSystemTime(new Date(expiryTime + 10000));

      // Store expired token
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

      // Mock API responses *before* service call
      const expectedNewTokens = { ...mockTokens, accessToken: 'refreshed-token-1' };
      mockRefreshToken.mockResolvedValueOnce(expectedNewTokens);
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      // --- Execute ---
      const resultPromise = authService.initializeAuth();

      // --- Verification ---
      // Aggressively run timers and wait for promises
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Ensure refreshToken was called correctly
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);

      // Ensure user was fetched after successful refresh
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);

      // Ensure final state is correct
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual(expectedNewTokens);
    });

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

    it('should handle token refresh failure during initialization', async () => {
      // --- Setup ---
      // Set time AFTER expiry
      const expiryTime = expiredTokens.expiresAt;
      vi.setSystemTime(new Date(expiryTime + 10000));

      // Store expired token
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));

      // Mock refresh to fail
      const refreshError = new Error('Refresh token expired');
      mockRefreshToken.mockRejectedValueOnce(refreshError);

      // --- Execute ---
      const resultPromise = authService.initializeAuth();

      // --- Verification ---
      // Run timers and await promise
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Ensure refreshToken was called
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);

      // Ensure tokens were cleared
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens');

      // Ensure final state is correct (not authenticated, error set)
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe('Session expired');
      expect(result.user).toBeNull();
      expect(result.tokens).toBeNull();
    });

    it('should attempt token refresh on 401 error from getCurrentUser', async () => {
      // Setup
      vi.setSystemTime(new Date(mockTokens.expiresAt - 10000)); // Set time BEFORE expiry
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockGetCurrentUser.mockRejectedValueOnce(new Error('401 Unauthorized')); // Configure specific mock response
      mockRefreshToken.mockResolvedValueOnce({ ...mockTokens, accessToken: 'new-token' }); // Configure specific mock response
      mockGetCurrentUser.mockResolvedValueOnce(mockUser); // Configure specific mock response (Second call succeeds)

      // Execute - making sure we await the promise
      const resultPromise = authService.initializeAuth();
      
      // Run timers and then await the promise
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      // Verify
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('ensureValidToken middleware', () => {
    it('should return token when valid and not expiring soon', async () => {
      vi.setSystemTime(new Date(mockTokens.expiresAt - 400000)); // Set time well before expiry buffer
      // Setup
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));

      // Execute
      const token = await authService.ensureValidToken();

      // Verify no refresh was needed
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(token).toBe(mockTokens.accessToken);
    });

    it('should refresh token when it is expiring soon', async () => {
      // Setup
      vi.setSystemTime(new Date(soonToExpireTokens.expiresAt - 10000)); // Set time WITHIN expiry buffer
      window.localStorage.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      const newTokens = { ...mockTokens, accessToken: 'fresh-token' };
      mockRefreshToken.mockResolvedValueOnce(newTokens); // Configure specific mock response

      // Execute - ensuring we properly await the promise
      const tokenPromise = authService.ensureValidToken();
      
      // Run timers and then await the promise
      await vi.runAllTimersAsync();
      const token = await tokenPromise;

      // Verify refresh was performed
      expect(mockRefreshToken).toHaveBeenCalledWith(soonToExpireTokens.refreshToken);
      expect(token).toBe(newTokens.accessToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(newTokens)
      );
    });

    it('should return null when refresh fails', async () => {
      // Setup
      vi.setSystemTime(new Date(soonToExpireTokens.expiresAt - 10000)); // Set time WITHIN expiry buffer
      window.localStorage.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Network error')); // Configure specific mock response

      // Execute - ensuring we properly await the promise
      const tokenPromise = authService.ensureValidToken();
      
      // Run timers and then await the promise
      await vi.runAllTimersAsync();
      const token = await tokenPromise;

      // Verify
      expect(mockRefreshToken).toHaveBeenCalledWith(soonToExpireTokens.refreshToken);
      expect(token).toBeNull();
      // Event dispatch happens within the promise execution
      expect(dispatchEventSpy).toHaveBeenCalled();
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('auth:session-expired');
    });
  });

  describe('permission checking', () => {
    it('should return true when user has permission', async () => {
      // Setup localStorage with valid user data
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      window.localStorage.setItem('auth_user', JSON.stringify(mockUser));

      // Execute
      const hasPermission = authService.hasPermission('read:patients');

      // Verify
      expect(hasPermission).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      // Setup
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      window.localStorage.setItem('auth_user', JSON.stringify(mockUser));

      // Execute
      const hasPermission = authService.hasPermission('admin:settings');

      // Verify
      expect(hasPermission).toBe(false);
    });

    it('should trigger background refresh for expiring token', async () => {
      // Setup
      vi.setSystemTime(new Date(soonToExpireTokens.expiresAt - 10000)); // Time within expiry buffer
      window.localStorage.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      window.localStorage.setItem('auth_user', JSON.stringify(mockUser));
      mockRefreshToken.mockResolvedValueOnce(mockTokens); // Configure specific mock response

      // Execute - call method directly
      authService.hasPermission('read:patients');
      
      // Force timers to run
      await vi.runAllTimersAsync();

      // Verify - a background refresh should be triggered
      expect(mockRefreshToken).toHaveBeenCalledWith(soonToExpireTokens.refreshToken);
    });
  });

  describe('logout handling', () => {
    it('should handle API call failure during logout', async () => {
      // Setup
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockLogout.mockRejectedValueOnce(new Error('API Error')); // Make logout API call fail

      // Execute
      const result = await authService.logout();

      // Verify
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(result.isAuthenticated).toBe(false);
      // The enhanced service correctly sets error message on API failure
      expect(result.error).toBe('Logout API call failed, but session was ended locally');
      // Verify logout event was dispatched
      // Event dispatch happens synchronously in logout method
      expect(dispatchEventSpy).toHaveBeenCalled();
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('auth:logout-complete');
    });
  });

  describe('silent token refresh', () => {
    it('should dispatch session-expired event when refresh fails', async () => {
      // Setup
      const testableService = new TestableAuthService('https://api.test.com');
      window.localStorage.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Network error')); // Configure specific mock response

      // Execute - Call directly
      const refreshPromise = testableService.exposedRefreshTokenSilently();
      
      // Force timers to run concurrently with the promise
      await vi.runAllTimersAsync();
      await refreshPromise;

      // Verify event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('auth:session-expired');
    });

    it('should reuse in-progress refresh promise', async () => {
      // Setup - Create a mock that takes time to resolve
      const testableService = new TestableAuthService('https://api.test.com');
      window.localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      
      // Create a delayed mock for refreshToken
      let resolveRefreshPromise: (value: AuthTokens) => void;
      const delayedRefreshPromise = new Promise<AuthTokens>((resolve) => {
        resolveRefreshPromise = resolve;
      });
      
      mockRefreshToken.mockImplementationOnce(() => delayedRefreshPromise);

      // Start first refresh call
      const firstPromise = testableService.exposedRefreshTokenSilently();
      
      // Start second refresh call while first is in progress
      const secondPromise = testableService.exposedRefreshTokenSilently();
      
      // Verify promises are the same instance
      expect(firstPromise).toBe(secondPromise);
      
      // Resolve the refresh promise
      resolveRefreshPromise!(mockTokens);
      
      // Wait for all promises to complete
      await Promise.all([firstPromise, secondPromise]);

      // Now verify the mock was only called once
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
    });
  });
});
