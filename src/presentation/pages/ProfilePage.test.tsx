import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import { useAuth } from '@application/hooks/useAuth'; // Adjust mock path as needed
import { BrowserRouter } from 'react-router-dom'; // Needed if <Link> is used inside

// Mock the useAuth hook
vi.mock('@application/hooks/useAuth');

// Mock presentation components if they interfere with basic rendering tests
vi.mock('@presentation/atoms/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="card-title">{children}</h2>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));
vi.mock('@presentation/atoms/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

describe('ProfilePage', () => {
  const mockUseAuth = useAuth as jest.Mock;

  it('should render loading state initially', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    render(
        <BrowserRouter>
            <ProfilePage />
        </BrowserRouter>
    );
    expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
  });

  it('should render error state if loading is finished but user is null', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    render(
        <BrowserRouter>
            <ProfilePage />
        </BrowserRouter>
    );
    expect(screen.getByText(/Error: User data not found/i)).toBeInTheDocument();
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
    };
    mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });

    render(
        <BrowserRouter>
            <ProfilePage />
        </BrowserRouter>
    );

    // Wait for potential async updates if any (though not strictly needed here)
    // await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
    // });

    // Check for key user details
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.first_name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.last_name)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Check roles are displayed
    expect(screen.getByText('clinician')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();

    // Verify badge variant for status
    const statusBadge = screen.getByText('Active').closest('[data-testid="badge"]');
    expect(statusBadge).toHaveAttribute('data-variant', 'default');
  });

    it('should handle missing optional fields gracefully', () => {
    const mockUserMinimal = {
      id: '2',
      email: 'minimal@example.com',
      first_name: null,
      last_name: null,
      roles: [],
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUseAuth.mockReturnValue({ user: mockUserMinimal, isLoading: false });

    render(
        <BrowserRouter>
            <ProfilePage />
        </BrowserRouter>
    );

    expect(screen.getByText(mockUserMinimal.email)).toBeInTheDocument();
    // Check that placeholders or lack of crash occurs
    expect(screen.getAllByText('N/A').length).toBe(2); // For first and last name
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('No roles assigned')).toBeInTheDocument();

    // Verify badge variant for status
    const statusBadge = screen.getByText('Inactive').closest('[data-testid="badge"]');
    expect(statusBadge).toHaveAttribute('data-variant', 'destructive');
  });
});
