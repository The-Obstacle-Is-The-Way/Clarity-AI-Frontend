/**
 * CLARITY-AI Neural Test Suite
 * Header testing with quantum precision
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react'; // Import waitFor and fireEvent
import '@testing-library/jest-dom';
import Header from './Header';
import { render } from '../../../infrastructure/testing/utils/test-utils.unified'; // Correct relative path
// import { useAuth } from '../../../application/context/AuthContext'; // No longer needed here, rely on global mock

// Remove local mock - Rely on global mock in src/test/setup.ts
/*
vi.mock('../../../application/context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../application/context/AuthContext')>();
  return {
    ...actual,
    useAuth: vi.fn(() => ({ // Mock useAuth locally if needed, otherwise rely on global authService mock
      isAuthenticated: true,
      user: { name: 'Test User', email: 'test@example.com', id: '1' },
      logout: vi.fn(),
    })),
  };
});
*/

const mockProps = {
  title: 'Test Dashboard',
};

describe('Header', () => {
  it('renders with neural precision', async () => {
    render(<Header {...mockProps} />);

    // Wait for elements to appear, expecting data from global mock
    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument(); // Expecting name from global mock user
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('responds to user interaction with quantum precision', async () => {
    // Need to get the mocked service function, not the hook return value
    // Import vi explicitly if needed, or ensure globals: true is set in vitest config
    // Assuming globals: true, otherwise import { Mock } from 'vitest';
    const { authService } = await vi.importActual<typeof import('../../../infrastructure/api/authService')>('../../../infrastructure/api/authService');
    const logoutMock = authService.logout as import('vitest').Mock; // Use imported Mock type

    render(<Header {...mockProps} />);

    // Wait for the logout button and click it
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Assert the mocked service function was called
    expect(logoutMock).toHaveBeenCalled();
  });
});
