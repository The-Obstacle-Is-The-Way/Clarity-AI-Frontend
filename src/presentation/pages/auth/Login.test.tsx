/**
 * CLARITY-AI Neural Test Suite
 * Login testing with quantum precision - Refactored for async interaction
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest'; // Add vi
import { render, screen } from '@testing-library/react'; // Remove waitFor
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// --- Mocking Dependencies ---

// 1. Mock authService *within this file* for direct access to mocks
vi.mock('@/infrastructure/api/authService', () => ({
  authService: {
    login: vi.fn(), // Mock login function
    // Add other methods if Login component uses them directly
  },
}));

// 2. Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  const navigateMock = vi.fn(); // Create a persistent mock navigate function
  return {
    ...actual,
    useNavigate: () => navigateMock, // Return the mock function
    MemoryRouter: actual.MemoryRouter,
  };
});

// 3. Mock auditLogClient
vi.mock('@/infrastructure/clients/auditLogClient', () => ({
  auditLogClient: {
    log: vi.fn(),
  },
  AuditEventType: {
    LOGIN: 'LOGIN',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    MFA_CHALLENGE: 'MFA_CHALLENGE',
    USER_LOGIN: 'USER_LOGIN', // Added missing type based on component usage
    UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT' // Added missing type
  },
}));

// --- Imports (after mocks) ---
// Import the mocked service *after* vi.mock
import { authService } from '@/infrastructure/api/authService';
// Import the component under test
import Login from './Login';

// --- Test Suite ---

describe('Login Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  // Access the specific mock instance for login
  const loginMock = vi.mocked(authService.login);

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    // Reset mock behavior - Default success
    loginMock.mockResolvedValue({ success: true });
  });

  it('renders login form correctly', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /Clarity-AI Digital Twin/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Secure Provider Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows generic error if fields are invalid on submit', async () => {
    render(<Login />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Test with invalid email
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'longenough'); // Password is valid here
    await user.click(submitButton);
    // Check the actual component's error message logic
    await vi.waitFor(async () => {
      // The component relies on simple state checks before submit handler calls API
       expect(await screen.findByText(/please enter valid credentials/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(loginMock).not.toHaveBeenCalled();

    // Clear fields and test with invalid password
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'valid@test.com'); // Email is valid here
    await user.type(passwordInput, 'short'); // Password invalid (< 6 chars)
    await user.click(submitButton);
    await vi.waitFor(async () => {
      expect(await screen.findByText(/please enter valid credentials/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls authService.login and handles success', async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const testEmail = 'valid@example.com';
    const testPassword = 'correctPassword'; // Must be >= 6 chars

    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(submitButton);

    // 1. Wait for loading state to appear (using vi.waitFor)
    await vi.waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in.../i);
    });

    // 2. Wait for the mock to have been called (using vi.waitFor)
    await vi.waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(loginMock).toHaveBeenCalledWith(testEmail, testPassword);
    });

    // Add assertions here if component should show loading state or success message
    // Navigation check might still belong in a higher-level integration test
  });

  it('displays error message from authService on login failure', async () => {
    const errorMessage = 'Invalid credentials from API';
    // Configure the mock to reject
    loginMock.mockRejectedValueOnce(new Error(errorMessage));

    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongPassword'); // >= 6 chars
    await user.click(submitButton);

    // 1. Wait for loading state to appear (using vi.waitFor)
    await vi.waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in.../i);
    });

    // 2. Wait for the error message (using vi.waitFor)
    await vi.waitFor(async () => {
        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
