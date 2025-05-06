/**
 * Minimal smoke test for Login component state update
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; // Import RTL waitFor
import userEvent from '@testing-library/user-event';
import Login from '@/presentation/pages/auth/Login';
import { expect, it, vi } from 'vitest';
import '@testing-library/jest-dom'; // Ensure matchers are available

// Import the service we want to spy on
import { authService } from '@/infrastructure/api/authService';

// Mock other dependencies needed for rendering
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('@/infrastructure/clients/auditLogClient', () => ({
  auditLogClient: { log: vi.fn() },
  AuditEventType: {
    USER_LOGIN: 'USER_LOGIN',
  },
}));

// --- Test ---

it('disables button while submitting', async () => {
  // Arrange: Spy on the login method and ensure it resolves successfully *after a tick*
  const loginSpy = vi.spyOn(authService, 'login').mockImplementation(async (credentials) => {
    console.log('[TEST] Login spy called with:', credentials);
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to event loop
    return { success: true };
  });

  const user = userEvent.setup();
  render(<Login />);
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const btn = screen.getByRole('button', { name: /sign in/i });

  // Act
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123'); // Must be >= 6 chars for component validation

  // Assert validation state updated before submit
  // This requires exposing validity state or checking input validity attributes if set
  // Since we don't have direct access, we'll assume the states update correctly for now,
  // but this is a potential failure point if state updates are slower than expected.

  await user.click(btn);

  // Assert: Check for loading state using RTL findBy* and waitFor
  const disabledButton = await screen.findByRole('button', { name: /signing in.../i });
  expect(disabledButton).toBeDisabled();

  // Also wait specifically for the mock to be called
  await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledTimes(1);
  });

  // Clean up the spy after the test
  loginSpy.mockRestore();
});
