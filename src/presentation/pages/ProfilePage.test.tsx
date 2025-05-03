import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ProfilePage from './ProfilePage';
import { AuthContext, type AuthContextType } from '@application/context/AuthContext';
import { renderWithProviders } from '@infrastructure/testing/utils/test-utils.unified';

// Mock presentation components if they interfere with basic rendering tests
vi.mock('@presentation/atoms/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));
vi.mock('@presentation/atoms/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (authValue: Partial<AuthContextType>) => {
    return renderWithProviders(
      <AuthContext.Provider value={authValue as AuthContextType}>
        <ProfilePage />
      </AuthContext.Provider>
    );
  };

  it('should render loading state initially', () => {
    renderWithAuth({ user: null, isLoading: true });
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  it('should render error state if loading is finished but user is null', async () => {
    renderWithAuth({ user: null, isLoading: false });
    expect(
      screen.getByText(/Error: User data not found. Please log in again./i)
    ).toBeInTheDocument();
  });

  it('should render user profile information when data is loaded', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      roles: ['clinician', 'admin'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    };
    renderWithAuth({ user: mockUser, isLoading: false });

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.first_name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.last_name)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('clinician')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    const statusBadge = screen.getByText('Active').closest('[data-testid="badge"]');
    expect(statusBadge).toHaveAttribute('data-variant', 'default');
  });

  it('should handle missing optional fields gracefully', async () => {
    const mockUserMinimal = {
      id: '2',
      email: 'minimal@example.com',
      first_name: null,
      last_name: null,
      roles: [],
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    };
    renderWithAuth({ user: mockUserMinimal, isLoading: false });

    expect(screen.getByText(mockUserMinimal.email)).toBeInTheDocument();
    expect(screen.getAllByText('N/A').length).toBe(2);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('No roles assigned')).toBeInTheDocument();
    const statusBadge = screen.getByText('Inactive').closest('[data-testid="badge"]');
    expect(statusBadge).toHaveAttribute('data-variant', 'destructive');
  });
});
