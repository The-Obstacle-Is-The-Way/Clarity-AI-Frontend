/**
 * Minimal smoke test for Login component state update
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@/presentation/pages/auth/Login';
import { expect, it, vi } from 'vitest';
import '@testing-library/jest-dom'; // Ensure matchers are available

// Minimal mocks needed just for rendering Login without external errors
vi.mock('@/infrastructure/api/authService', () => ({
  authService: { login: vi.fn().mockResolvedValue({ success: true }) }, // Mock login to prevent errors
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('@/infrastructure/clients/auditLogClient', () => ({
  auditLogClient: { log: vi.fn() },
  AuditEventType: { USER_LOGIN: 'USER_LOGIN' }, // Mock necessary types
}));

it('disables button while submitting', async () => {
  render(<Login />);
  const user = userEvent.setup();
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const btn = screen.getByRole('button', { name: /sign in/i });

  // Enter valid credentials to pass initial validation
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123'); // >= 6 chars

  expect(btn).toBeEnabled(); // Check initial state

  await user.click(btn);

  // Use findBy* which incorporates waitFor
  const disabledButton = await screen.findByRole('button', { name: /signing in.../i });

  // Assert the button found is disabled and has the correct text
  expect(disabledButton).toBeInTheDocument();
  expect(disabledButton).toBeDisabled();

  // Optionally check the original button reference if needed (might be the same element)
  // expect(btn).toBeDisabled(); 
});
