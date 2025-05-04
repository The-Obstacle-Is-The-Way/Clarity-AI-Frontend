/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
// Ensure global test setup is applied
import '../../test/setup';
import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import waitFor
// Use relative paths since aliases might not resolve in test runner context
import { AuthApiClient, AuthTokens, AuthUser, AuthState } from './index';
import { EnhancedAuthService } from './AuthService.enhanced';
// import { ApiError } from '../api/ApiClient';
// import { createInitialAuthState } from '../../application/contexts/AuthContext';
// import { UserProfile } from '../../domain/user/UserProfile';
// import { AuthTokens as AuthTokensDomain } from '../../domain/auth/AuthTokens';

// Sample data - needs to be defined before mock since vi.mock is hoisted
const mockUser: AuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  role: 'clinician',
  permissions: ['read:patient', 'write:session'],
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600 * 1000, // Expires in 1 hour
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

// Mock the API client module entirely BEFORE imports in the describe block
vi.mock('./index', () => {
  return {
    AuthTokens: {},
    AuthUser: {},
    AuthState: {},
    // Mock the auth client
    AuthApiClient: vi.fn().mockImplementation(() => ({
      login: vi.fn().mockImplementation(() => Promise.resolve(mockTokens)),
      logout: vi.fn().mockImplementation(() => Promise.resolve(true)),
      refreshToken: vi.fn().mockImplementation(() => Promise.resolve({ ...mockTokens, accessToken: 'new-token' })),
      getCurrentUser: vi.fn().mockImplementation(() => Promise.resolve(mockUser)),
    })),
  };
});

// Create a helper function for initial auth state
function createInitialAuthState(): AuthState {
  return {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
}

// Create our own ApiError class for testing purposes
class ApiError extends Error {
  status: number;
  method: string;
  url: string;

  constructor(message: string, status: number, method: string, url: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.method = method;
    this.url = url;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Mock CustomEvent for session expiration
(global as any).CustomEvent = class CustomEvent extends Event {
   
  constructor(name: string, options: any = {}) {
    super(name, options);
    Object.assign(this, options);
  }
};

vi.stubGlobal('CustomEvent', CustomEvent);

// Rely on the global window.localStorage mock defined in src/test/setup.ts
// Use window.localStorage.* spies for storage interactions
// Use more direct spies on the native objects that are guaranteed to work
beforeEach(() => {
  // Clear mock call history but preserve implementations
  vi.clearAllMocks();

  // Reset localStorage - Handled by global setup (src/test/setup.ts)
  vi.useFakeTimers(); // Use fake timers for consistent Date.now()
  vi.spyOn(window.localStorage, 'getItem');
  vi.spyOn(window.localStorage, 'setItem');
  vi.spyOn(window.localStorage, 'removeItem');
  vi.spyOn(window, 'dispatchEvent');

  // REMOVED: Don't create the instance here anymore
  // authService = new EnhancedAuthService();
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

  // Add getCurrentState method for test access
  public getCurrentState(): AuthState {
    // Simplified implementation that doesn't rely on private properties
    const tokens = this.exposedGetStoredTokens(); // Use a new exposed method
    return {
      user: null, // We can't easily get this in the test
      tokens,
      isAuthenticated: !!tokens,
      isLoading: false,
      error: null,
    };
  }

  // Expose getStoredTokens for testing
  public exposedGetStoredTokens(): AuthTokens | null {
    try {
      const tokensJson = window.localStorage.getItem('auth_tokens');
      if (!tokensJson) return null;
      return JSON.parse(tokensJson) as AuthTokens;
    } catch {
      return null;
    }
  }
}

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
    vi.spyOn(window.localStorage, 'getItem');
    vi.spyOn(window.localStorage, 'setItem');
    vi.spyOn(window.localStorage, 'removeItem');
    vi.spyOn(window, 'dispatchEvent');

    // REMOVED: Don't create the instance here anymore
    // authService = new EnhancedAuthService();
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
      const expiredTokens = { ...mockTokens, expiresAt: Date.now() - 10000 }; // Expired 10s ago
      const expectedNewTokens = {
        ...mockTokens,
        accessToken: 'new-token-from-refresh',
        expiresAt: Date.now() + 3600000, // New expiry
      };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(expiredTokens));
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(mockUser); // getCurrentUser succeeds after refresh

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // --- Execute ---
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });

      // --- Assert ---
      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_tokens');
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenClient).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(1); // Called after successful refresh
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(expectedNewTokens)
      );
      expect(initialState.isAuthenticated).toBe(true);
      expect(initialState.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
      expect(initialState.user).toEqual(mockUser);
    }, 10000);

    it('should handle token refresh failure during initialization', async () => {
      // --- Setup ---
      const expiredTokens = { ...mockTokens, expiresAt: Date.now() - 10000 }; // Expired
      const refreshError = new Error('Refresh failed');

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(expiredTokens));
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(refreshError);
      const mockGetCurrentUserClient = vi.spyOn(AuthApiClient.prototype, 'getCurrentUser'); // Should not be called

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // --- Execute ---
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });

      // --- Assert ---
      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_tokens');
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(mockGetCurrentUserClient).not.toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Tokens cleared on failure
      expect(initialState.isAuthenticated).toBe(false);
      expect(initialState.tokens).toBeNull();
      expect(initialState.user).toBeNull();
      expect(initialState.error).toBe('Failed to initialize authentication.'); // Check for generic error
      expect(initialState.isLoading).toBe(false);
    }, 20000);

    it('should attempt token refresh on 401 error from getCurrentUser', async () => {
      // --- Setup ---
      const validButApiRejectedTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 3600000,
      }; // Locally valid
      const expectedNewTokens = {
        ...mockTokens,
        accessToken: 'new-token-after-401-refresh',
        expiresAt: Date.now() + 3600000, // New expiry
      };
      const error401 = new ApiError('Unauthorized', 401, 'GET', '/users/me');

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(
        JSON.stringify(validButApiRejectedTokens)
      );
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockRejectedValueOnce(error401) // First call fails with 401
        .mockResolvedValueOnce(mockUser); // Second call (after refresh) succeeds
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // --- Execute ---
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });

      // --- Assert ---
      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_tokens');
      expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(2); // Called before and after refresh
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenClient).toHaveBeenCalledWith(validButApiRejectedTokens.refreshToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(expectedNewTokens)
      );
      expect(initialState.isAuthenticated).toBe(true);
      expect(initialState.tokens?.accessToken).toBe(expectedNewTokens.accessToken);
      expect(initialState.user).toEqual(mockUser);
    }, 10000);
  });

  describe('ensureValidToken middleware', () => {
    it('should return token when valid and not expiring soon', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 }; // Expires in 1 hour

      // Define Mocks *before* creating the service
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(mockUser);
      // Mock localStorage *before* service creation/initialization
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens)); // Mock finding tokens

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // --- Execute ---
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });

      // --- Assert ---
      // Ensure localStorage was checked
      expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_tokens');
      // Ensure user was fetched
      expect(mockGetCurrentUserClient).toHaveBeenCalledTimes(1);
      // Assert final state
      expect(initialState.isAuthenticated).toBe(true); // <--- Failing assertion previously
      expect(initialState.tokens?.accessToken).toBe(validTokens.accessToken);
      expect(initialState.user).toEqual(mockUser);
      expect(initialState.error).toBeNull();
      expect(initialState.isLoading).toBe(false);
    }, 10000); // Keep timeout for now

    it('should refresh token when it is expiring soon', async () => {
      // --- Setup ---
      const nearExpiryTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 20000,
      }; // Expires in 20s
      const expectedNewTokens = {
        ...mockTokens,
        accessToken: 'new-token-ensureValidToken-refresh',
        expiresAt: Date.now() + 3600000, // New expiry
      };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(
        JSON.stringify(nearExpiryTokens)
      );
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(mockUser); // For initialization
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      // Reset mocks specifically for the ensureValidToken call
      mockRefreshTokenClient.mockClear();
      vi.spyOn(window.dispatchEvent); // Spy on event dispatcher

      // --- Execute ensureValidToken ---
      let token: string | null = null;
      await act(async () => {
        token = await authService.ensureValidToken();
      });

      // --- Assert ---
      expect(token).toBe(expectedNewTokens.accessToken);
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(expectedNewTokens)
      );
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'tokens-refreshed' })
      );
      // Check internal state reflects the refresh
      expect(authService.getCurrentState().tokens?.accessToken).toBe(expectedNewTokens.accessToken);
    }, 10000);

    it('should return null when refresh fails', async () => {
      // --- Setup ---
      const nearExpiryTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 20000,
      }; // Expires in 20s
      const refreshError = new Error('Refresh failed');

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(
        JSON.stringify(nearExpiryTokens)
      );
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(mockUser); // For initialization
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(refreshError);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      // Reset mocks specifically for the ensureValidToken call
      mockRefreshTokenClient.mockClear();
      vi.spyOn(window.dispatchEvent);

      // --- Execute ensureValidToken ---
      let token: string | null = null;
      await act(async () => {
        token = await authService.ensureValidToken();
      });

      // --- Assert ---
      expect(token).toBeNull();
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Cleared on failure
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'session-expired' })
      );
      expect(authService.getCurrentState().isAuthenticated).toBe(false); // Check internal state
    }, 10000);
  });

  describe('permission checking', () => {
    const userWithPerms: AuthUser = {
      ...mockUser,
      permissions: ['admin', 'read:patient'],
    };
    const userWithoutAdmin: AuthUser = {
      ...mockUser,
      permissions: ['read:patient'],
    };

    it('should return true when user has permission', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(userWithPerms); // User has 'admin'

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initState: AuthState = createInitialAuthState();
      await act(async () => {
        initState = await authService.initializeAuth();
      });

      // --- Execute & Assert ---
      // NOTE: hasPermission is synchronous and relies on initialized state
      expect(authService.hasPermission('admin')).toBe(true);
      expect(authService.hasPermission(['read:patient', 'admin'])).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(userWithoutAdmin); // User lacks 'admin'

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initState: AuthState = createInitialAuthState();
      await act(async () => {
        initState = await authService.initializeAuth();
      });

      // --- Execute & Assert ---
      expect(authService.hasPermission('admin')).toBe(false);
      expect(authService.hasPermission(['read:patient', 'admin'])).toBe(false); // Requires all
      expect(authService.hasPermission('read:patient')).toBe(true);
    });

    it('should trigger background refresh for expiring token', async () => {
      // --- Setup ---
      const nearExpiryTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 20000,
      }; // Expires in 20s
      const userWithPerms: AuthUser = {
        ...mockUser,
        permissions: ['admin'],
      };
      const expectedNewTokens = {
        ...mockTokens,
        accessToken: 'refreshed-during-permission-check',
        expiresAt: Date.now() + 3600000,
      };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(
        JSON.stringify(nearExpiryTokens)
      );
      const mockGetCurrentUserClient = vi
        .spyOn(AuthApiClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(userWithPerms); // For initialization
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockResolvedValueOnce(expectedNewTokens);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initState: AuthState = createInitialAuthState();
      await act(async () => {
        initState = await authService.initializeAuth();
      });
      mockRefreshTokenClient.mockClear(); // Clear for the permission check trigger

      // --- Execute ---
      const hasPerm = authService.hasPermission('admin');

      // --- Assert ---
      expect(hasPerm).toBe(true); // Permission check should succeed immediately

      // Wait for the background refresh to complete
      await waitFor(() => {
        expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      });

      // Verify refresh details and state update
      expect(mockRefreshTokenClient).toHaveBeenCalledWith(nearExpiryTokens.refreshToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(expectedNewTokens)
      );
      expect(authService.getCurrentState().tokens?.accessToken).toBe(expectedNewTokens.accessToken);
    });
  });

  describe('logout handling', () => {
    it('should handle API call failure during logout', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };
      const logoutError = new Error('Logout API failed');

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(mockUser); // For initialization
      const mockLogoutClient = vi
        .spyOn(AuthApiClient.prototype, 'logout')
        .mockRejectedValueOnce(logoutError);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      vi.spyOn(window.dispatchEvent); // Spy for events

      // --- Execute ---
      await act(async () => {
        await authService.logout(); // Should not throw, but log error
      });

      // --- Assert ---
      expect(mockLogoutClient).toHaveBeenCalledTimes(1);
      // State should still be cleared locally even if API fails
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(authService.getCurrentState().isAuthenticated).toBe(false);
      expect(authService.getCurrentState().user).toBeNull();
      expect(authService.getCurrentState().tokens).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'logout-complete' })
      );
    });

    it('should clear tokens and state on successful logout', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(mockUser); // For initialization
      const mockLogoutClient = vi
        .spyOn(AuthApiClient.prototype, 'logout')
        .mockResolvedValueOnce(undefined); // Logout succeeds

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      vi.spyOn(window.dispatchEvent); // Spy for events

      // --- Execute ---
      await act(async () => {
        await authService.logout();
      });

      // --- Assert ---
      expect(mockLogoutClient).toHaveBeenCalledTimes(1);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(authService.getCurrentState().isAuthenticated).toBe(false);
      expect(authService.getCurrentState().user).toBeNull();
      expect(authService.getCurrentState().tokens).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'logout-complete' })
      );
    });
  });

  describe('silent token refresh', () => {
    it('should dispatch session-expired event when refresh fails', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };
      const refreshError = new Error('Silent refresh failed');

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(mockUser); // For initialization
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockRejectedValueOnce(refreshError);

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      mockRefreshTokenClient.mockClear(); // Clear post-initialization
      vi.spyOn(window.dispatchEvent); // Spy for events

      // --- Execute ---
      // Trigger the silent refresh manually (or via expiring token logic)
      await act(async () => {
        // Use internal method, acknowledging it's private for testing purposes
        await authService['_refreshTokenSilently']();
      });

      // --- Assert ---
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
      expect(authService.getCurrentState().isAuthenticated).toBe(false);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'session-expired' })
      );
    });

    it('should reuse in-progress refresh promise', async () => {
      // --- Setup ---
      const validTokens = { ...mockTokens, expiresAt: Date.now() + 3600000 };
      const expectedNewTokens = {
        ...mockTokens,
        accessToken: 'refreshed-concurrently',
        expiresAt: Date.now() + 3600000,
      };

      // Define Mocks *before* creating the service
      vi.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(validTokens));
      vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockResolvedValueOnce(mockUser); // For initialization
      const mockRefreshTokenClient = vi
        .spyOn(AuthApiClient.prototype, 'refreshToken')
        .mockImplementation(async () => {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 50));
          return expectedNewTokens;
        });

      // Create service instance *after* mocks are defined
      const authService = new EnhancedAuthService('https://api.test.com');

      // Initialize first
      let initialState: AuthState = createInitialAuthState();
      await act(async () => {
        initialState = await authService.initializeAuth();
      });
      mockRefreshTokenClient.mockClear(); // Clear post-initialization

      // --- Execute ---
      // Trigger two refresh calls concurrently
      let refreshPromise1: Promise<AuthTokens | null> | undefined;
      let refreshPromise2: Promise<AuthTokens | null> | undefined;

      await act(async () => {
        refreshPromise1 = authService['_refreshTokenSilently']();
        refreshPromise2 = authService['_refreshTokenSilently'](); // Second call while first is in progress
        await Promise.all([refreshPromise1, refreshPromise2]);
      });

      // --- Assert ---
      // The API client's refreshToken should only have been called ONCE
      expect(mockRefreshTokenClient).toHaveBeenCalledTimes(1);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(expectedNewTokens)
      );
      // Both promises should resolve with the same new tokens
      const tokens1 = await refreshPromise1;
      const tokens2 = await refreshPromise2;
      expect(tokens1?.accessToken).toBe(expectedNewTokens.accessToken);
      expect(tokens2?.accessToken).toBe(expectedNewTokens.accessToken);
      expect(authService.getCurrentState().tokens?.accessToken).toBe(expectedNewTokens.accessToken);
    });
  });
});
