/**
 * Standalone test for authService to verify mocking works correctly
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../../src/test/debug-setup'; // Import extended setup

// Mock authService for testing - ensure this is called before importing the module
vi.mock('@/infrastructure/api/authService', () => ({
  authService: {
    login: vi.fn().mockImplementation((_email, _password) => {
      // console.log(`[MOCK] authService.login called with: ${email}, ${password}`);
      return Promise.resolve({ success: true, token: 'fake-token' });
    }),
    getCurrentUser: vi.fn().mockReturnValue({
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    }),
    isAuthenticated: vi.fn().mockReturnValue(true),
  },
}));

// Import after mocking
import { authService } from '@/infrastructure/api/authService';

describe('authService Mock Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log('[TEST] Mocks cleared');
  });

  afterEach(() => {
    console.log('[TEST] Test completed');
  });

  it('should allow mocking of login method', async () => {
    console.log('[TEST] Starting login test');
    
    // Call the mocked login method
    const result = await authService.login('test@example.com', 'password123');
    
    // Verify mock was called correctly
    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Verify mock returns expected data
    expect(result).toEqual({ success: true, token: 'fake-token' });
    
    console.log('[TEST] Login method mock verified successfully');
  });

  it('should allow mocking of getCurrentUser method', () => {
    console.log('[TEST] Starting getCurrentUser test');
    
    // Call the mocked getCurrentUser method
    const user = authService.getCurrentUser();
    
    // Verify mock was called correctly
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    
    // Verify mock returns expected data
    expect(user).toEqual({
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    });
    
    console.log('[TEST] getCurrentUser method mock verified successfully');
  });
}); 