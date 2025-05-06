/**
 * Debug-focused test for Login component
 * This test includes comprehensive instrumentation to detect exactly where state updates might be failing
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

// Import the Login component
import Login from '@/presentation/pages/auth/Login';

// Import debugging utilities
import { testLogger, logDOMState } from '@/test/debug-utils';

// Mock authService with detailed instrumentation - place mock first, before any variable definitions
vi.mock('@/infrastructure/api/authService', () => {
  return {
    authService: {
      login: vi.fn().mockImplementation((credentials) => {
        console.log(`[MOCK] authService.login called with:`, credentials);
        
        return new Promise((resolve) => {
          console.log('[MOCK] authService.login promise created');
          
          // Use a deliberate delay to ensure we can observe state transitions
          setTimeout(() => {
            console.log('[MOCK] authService.login resolving promise...');
            resolve({ success: true });
          }, 100);
        });
      }),
      getCurrentUser: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn().mockReturnValue(false)
    }
  };
});

// Mock other dependencies needed for rendering
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => {
      console.log('[MOCK] useNavigate called');
      return vi.fn();
    }
  };
});

vi.mock('@/infrastructure/clients/auditLogClient', () => ({
  auditLogClient: { 
    log: vi.fn().mockImplementation((eventType, data) => {
      console.log('[MOCK] auditLogClient.log called with:', eventType, data);
    })
  },
  AuditEventType: {
    USER_LOGIN: 'USER_LOGIN',
  },
}));

// Import the mocked authService after mocking it
import { authService } from '@/infrastructure/api/authService';

describe('Login Component - Debug Tests', () => {
  // Setup our testing environment
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    testLogger.test('Login.debug', 'beforeEach', 'Cleared all mocks');
    
    // Add instrumentation to the mocked authService methods after clearing
    vi.mocked(authService.login).mockImplementation((credentials) => {
      testLogger.mock('authService', 'login', [credentials]);
      testLogger.mock('authService', 'login', [], 'Creating promise...');
      
      return new Promise((resolve) => {
        testLogger.mock('authService', 'login', [], 'Promise pending...');
        
        // Use a deliberate delay to ensure we can observe state transitions
        setTimeout(() => {
          testLogger.mock('authService', 'login', [], 'Resolving promise with success');
          resolve({ success: true });
        }, 100);
      });
    });
  });
  
  afterEach(() => {
    // Log any unexpected errors after each test
    testLogger.test('Login.debug', 'afterEach', 'Test completed');
  });
  
  it('shows loading state when the login button is clicked', async () => {
    testLogger.test('Login.debug', 'START', 'Loading state visibility test');
    
    // Setup user event
    const user = userEvent.setup();
    
    // Log test phase
    testLogger.test('Login.debug', 'RENDER', 'Rendering Login component');
    
    // Render with instrumentation
    const { container } = render(<Login />);
    
    // Log initial DOM state
    logDOMState(screen, container);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /sign in/i });
    
    testLogger.test('Login.debug', 'INTERACTION', 'Starting form interaction');
    
    // Fill out the form with valid data
    await user.type(emailInput, 'test@example.com');
    testLogger.dom('Typed email: test@example.com');
    
    await user.type(passwordInput, 'password123');
    testLogger.dom('Typed password: password123');
    
    // Verify button is enabled before submission
    expect(button).toBeEnabled();
    testLogger.dom(`Button before click: text="${button.textContent}", disabled=${button.disabled}`);
    
    // Click the login button to trigger form submission
    testLogger.test('Login.debug', 'CLICK', 'Clicking login button');
    await user.click(button);
    
    // Log DOM state immediately after click
    testLogger.test('Login.debug', 'POST-CLICK', 'Checking DOM state after click');
    logDOMState(screen, container);
    
    // This is the key assertion that captures the loading state
    // We'll use multiple approaches to capture it
    
    // 1. Use findByText with sufficient timeout
    testLogger.test('Login.debug', 'ASSERTION', 'Waiting for "Signing in..." text');
    try {
      const loadingText = await screen.findByText(/signing in/i, {}, { timeout: 500 });
      testLogger.dom(`Found loading text: "${loadingText.textContent}"`);
    } catch (e) {
      testLogger.error('findByText', e);
      testLogger.dom('Failed to find "Signing in..." text - capturing current DOM state:');
      logDOMState(screen, container);
    }
    
    // 2. Use waitFor to check button disabled state
    testLogger.test('Login.debug', 'ASSERTION', 'Waiting for button to be disabled');
    try {
      await waitFor(() => {
        const submitButton = screen.getByRole('button');
        testLogger.dom(`Current button state: text="${submitButton.textContent}", disabled=${submitButton.disabled}`);
        expect(submitButton).toBeDisabled();
      }, { timeout: 500 });
      testLogger.dom('Button is now disabled as expected');
    } catch (e) {
      testLogger.error('waitFor disabled', e);
      testLogger.dom('Failed to detect disabled button - capturing current DOM state:');
      logDOMState(screen, container);
    }
    
    // 3. Verify mock function was called
    testLogger.test('Login.debug', 'ASSERTION', 'Checking if authService.login was called');
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledTimes(1);
      testLogger.mock('authService', 'login', [], `Called ${vi.mocked(authService.login).mock.calls.length} times`);
    }, { timeout: 500 });
    
    // Wait for promise to complete to observe final state
    testLogger.test('Login.debug', 'FINAL', 'Waiting for all promises to complete');
    await vi.waitFor(() => expect(authService.login).toHaveBeenCalled(), { timeout: 1000 });
    
    // This promise ensures we wait for all microtasks to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Final DOM snapshot
    testLogger.test('Login.debug', 'FINAL-DOM', 'Final DOM state after all operations');
    logDOMState(screen, container);
  });
}); 