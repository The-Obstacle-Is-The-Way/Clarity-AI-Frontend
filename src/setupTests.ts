import { vi } from 'vitest';
import type { User as DomainUser } from './domain/types/auth/auth';
import { UserRole, Permission } from './domain/types/auth/auth';

// Mock the authService to prevent actual API calls during tests
// and to control the resolved value of getCurrentUser synchronously/immediately.
vi.mock('./infrastructure/api/authService', async (/* importOriginal */) => {
  // Dynamically import the original module type if needed, or define mock structure
  // const actual = await importOriginal<typeof import('@infrastructure/api/authService')>();

  // Define mock user data consistent with DomainUser
  const mockUserData: DomainUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.CLINICIAN,
    permissions: [Permission.VIEW_PATIENTS],
    // lastLogin: new Date(), // Optional
    // profile: {}, // Optional
  };

  return {
    // Keep other exports if necessary, otherwise just mock what's needed
    // ...actual, 
    authService: {
      // Mock other authService methods as needed (login, logout, etc.)
      // For now, focus on getCurrentUser causing the act warnings
      getCurrentUser: vi.fn().mockResolvedValue(mockUserData), 
      // Example: Mock login to resolve successfully without API call
      login: vi.fn().mockResolvedValue(undefined), 
      // Example: Mock logout to resolve successfully without API call
      logout: vi.fn().mockResolvedValue(undefined), 
      // Add mocks for other functions used by the application if they exist in the real service
    }
  };
});

// Optional: Mock console.error globally if needed, like in ErrorBoundary test
// vi.spyOn(console, 'error').mockImplementation(() => {});

// Clean up mocks after each test to prevent state leakage
afterEach(() => {
  vi.restoreAllMocks();
  // If using global spies like console.error, restore them here too if not handled by restoreAllMocks
});

// Add any other global test setup here (e.g., JSDOM extensions, global mocks) 