/**
 * CLARITY-AI Neural Test Suite
 * Login testing with quantum precision - Refactored for async interaction
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    // Reset mock behavior if needed (e.g., if default is success)
    loginMock.mockResolvedValue({ success: true }); // Default success unless overridden
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

  // TODO: Update expected error messages after checking Login.tsx
  it('shows generic error for invalid fields on submit', async () => {
    render(<Login />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.click(submitButton);

    // Expect the generic error message set in handleSubmit
    expect(await screen.findByText(/please enter valid credentials/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls authService.login with correct credentials on valid submission', async () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const testEmail = 'valid@example.com';
    const testPassword = 'correctPassword';

    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);
    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(loginMock).toHaveBeenCalledWith(testEmail, testPassword);
    });

    // Check navigation (assuming successful login redirects)
    // We need to import useNavigate from the mocked 'react-router-dom'
    const { useNavigate } = await import('react-router-dom');
    const navigateMockFn = useNavigate(); // Get the actual mock function instance
    await waitFor(() => {
       expect(navigateMockFn).toHaveBeenCalledWith('/dashboard'); // Or the expected route
    });
  });

  it('displays error message from authService on login failure', async () => {
    // Configure the mock *before* rendering
    loginMock.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongPassword');
    await user.click(submitButton);

    // Wait for the error message to appear (implementation might vary)
    // This assumes the error is displayed directly. Adjust if it uses alerts, etc.
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
