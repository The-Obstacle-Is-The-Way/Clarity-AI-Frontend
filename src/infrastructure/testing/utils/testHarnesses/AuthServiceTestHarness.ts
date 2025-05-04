import { beforeEach, afterEach, vi } from 'vitest';
import type { User } from '../../../../domain/types/auth/auth';
import type { AuthTokens } from '../../../../domain/types/auth/auth';
import { EnhancedAuthService as AuthService } from '../../auth/AuthService.enhanced';

/**
 * A comprehensive test harness for AuthService testing.
 * This utility class provides helper methods for mocking key dependencies
 * and simplifying test setup for auth-related functionality.
 */
export class AuthServiceTestHarness {
  // Mock API client with all methods pre-mocked
  mockApiClient = {
    login: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn()
  };
  
  // Mock localStorage implementation
  mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  
  // Pre-configured instance with mocks injected
  authService: AuthService;
  
  // Hold original implementations for cleanup
  private originalLocalStorage: Storage;
  
  constructor() {
    // Store original implementations
    this.originalLocalStorage = window.localStorage;
    
    // Setup the test environment
    this.setupLocalStorageMock();
    this.authService = new AuthService(this.mockApiClient);
  }
  
  /**
   * Setup before each test.
   * Call this in the beforeEach hook of your test suite.
   */
  setupTest() {
    // Clear all mocks before each test
    vi.clearAllMocks();
    this.mockStorage.getItem.mockReturnValue(null);
    
    // Setup fake timers
    vi.useFakeTimers();
  }
  
  /**
   * Cleanup after each test.
   * Call this in the afterEach hook of your test suite.
   */
  cleanupTest() {
    // Restore real implementations
    vi.useRealTimers();
    
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: this.originalLocalStorage,
      writable: true
    });
  }
  
  /**
   * Apply setup and cleanup hooks to the current test suite.
   */
  applyTestHooks() {
    beforeEach(() => this.setupTest());
    afterEach(() => this.cleanupTest());
  }
  
  /**
   * Simulate stored auth tokens in localStorage.
   */
  simulateStoredTokens(tokens: AuthTokens) {
    this.mockStorage.getItem.mockImplementation((key: string) => {
      if (key === 'auth_tokens') {
        return JSON.stringify(tokens);
      }
      return null;
    });
  }
  
  /**
   * Simulate a successful login.
   */
  simulateSuccessfulLogin(user: User, tokens: AuthTokens) {
    this.simulateStoredTokens(tokens);
    this.mockApiClient.getCurrentUser.mockResolvedValue(user);
  }
  
  /**
   * Simulate an expired token situation.
   */
  simulateExpiredToken(refreshToken: string, newTokens?: AuthTokens) {
    const expiredTokens: AuthTokens = {
      accessToken: 'expired-token',
      refreshToken,
      expiresAt: Date.now() - 1000 // Expired 1 second ago
    };
    
    this.simulateStoredTokens(expiredTokens);
    
    if (newTokens) {
      this.mockApiClient.refreshToken.mockResolvedValue(newTokens);
    }
  }
  
  /**
   * Simulate a token that will expire soon.
   */
  simulateExpiringToken(refreshToken: string, newTokens?: AuthTokens) {
    const expiringTokens: AuthTokens = {
      accessToken: 'expiring-token',
      refreshToken,
      expiresAt: Date.now() + 60000 // Expires in 1 minute
    };
    
    this.simulateStoredTokens(expiringTokens);
    
    if (newTokens) {
      this.mockApiClient.refreshToken.mockResolvedValue(newTokens);
    }
  }
  
  /**
   * Simulate a failed token refresh.
   */
  simulateRefreshFailure() {
    this.mockApiClient.refreshToken.mockRejectedValue(
      new Error('Token refresh failed')
    );
  }
  
  /**
   * Verify localStorage was updated with new tokens.
   */
  verifyTokensStoredInLocalStorage(expectedTokens: AuthTokens) {
    // Find the matching call to localStorage.setItem
    const calls = this.mockStorage.setItem.mock.calls;
    const tokenSetCall = calls.find(call => call[0] === 'auth_tokens');
    
    if (!tokenSetCall) {
      return false;
    }
    
    try {
      const storedTokens = JSON.parse(tokenSetCall[1]);
      return JSON.stringify(storedTokens) === JSON.stringify(expectedTokens);
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Advance timers to trigger token refresh.
   */
  advanceTimersToRefresh() {
    // Advance past the token refresh window
    vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
  }
  
  /**
   * Setup localStorage mock implementation.
   */
  private setupLocalStorageMock() {
    // Replace localStorage with mock implementation
    Object.defineProperty(window, 'localStorage', {
      value: this.mockStorage,
      writable: true
    });
  }
}

/**
 * Extended AuthService class that exposes protected methods for testing.
 */
export class TestableAuthService extends AuthService {
  public exposeCheckTokenExpiration(tokens: AuthTokens): boolean {
    return this.checkTokenExpiration(tokens);
  }
  
  public exposeRefreshAuthToken(refreshToken: string): Promise<AuthTokens> {
    return this.refreshAuthToken(refreshToken);
  }
  
  public exposeClearAuthState(): void {
    return this.clearAuthState();
  }
} 