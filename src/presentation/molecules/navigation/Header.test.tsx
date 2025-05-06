/**
 * CLARITY-AI Neural Test Suite
 * Header testing with quantum precision
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react'; // Import waitFor and fireEvent
import '@testing-library/jest-dom';
import Header from './Header';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified'; // Use enhanced render
import { authService } from '../../../infrastructure/api/authService'; // Import mocked service
import { type User as DomainUser, UserRole, Permission } from '../../../domain/types/auth/auth'; // Import necessary types/enums

// Mock authService specifically for this test file
vi.mock('../../../infrastructure/api/authService', async () => {
  const mockUserData: DomainUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CLINICIAN,
    permissions: [Permission.VIEW_PATIENTS],
  };
  return {
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue(mockUserData),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
    },
  };
});

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
  // Define a mock authenticated context value (can be reused or customized per test)
  const mockAuthContext: AppAuthContextType = {
    isAuthenticated: true,
    user: {
      id: 'mock-user-id',
      name: 'Mock Context User', // Use this name in assertions
      email: 'mock.context@example.com',
      role: UserRole.ADMIN,
      permissions: [Permission.MANAGE_USERS],
    },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuthStatus: vi.fn(),
    renewSession: vi.fn(),
  };

  it('renders with neural precision', async () => {
  it('renders with neural precision', async () => {
    renderWithProviders(<Header {...mockProps} />, { authContextValue: mockAuthContext });

    // Wait for elements to appear, expecting data from global mock
    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mock Context User')).toBeInTheDocument(); // Expecting name from provided context
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('responds to user interaction with quantum precision', async () => {
    // Define mock context for this test
    const mockAuthContext: AppAuthContextType = {
      isAuthenticated: true,
      user: { id: 'ctx-user', name: 'Context User', email: 'ctx@test.com', role: UserRole.CLINICIAN, permissions: [] },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
      renewSession: vi.fn(),
    };

    // Import the service mock to assert against it
    const { authService } = await import('../../../infrastructure/api/authService');

    render(<Header {...mockProps} />, { authContextValue: mockAuthContext });

    // Wait for the logout button (rendered due to mock context) and click it
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Assert the underlying service mock was called
    expect(authService.logout).toHaveBeenCalled();
  });
});
