import { authClient } from '@infrastructure/clients/authClient';
import type { AuthResult, LoginCredentials, User } from '@domain/types/auth/auth';

// Define the expected structure for login credentials matching backend

/**
 * Service layer for authentication.
 * Handles interactions with the authClient.
 */
export const authService = {
  /**
   * Logs in a user using the authClient.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    // Pass credentials directly to the authClient
    return authClient.login(credentials);
  },

  /**
   * Logs out the current user via authClient.
   */
  logout: async (): Promise<void> => {
    return authClient.logout();
  },

  /**
   * Retrieves the current user profile via authClient.
   */
  getCurrentUser: async (): Promise<User | null> => {
    // Assuming authClient.getCurrentUser returns User | null
    return authClient.getCurrentUser();
  },

  /**
   * Checks if the user is authenticated via authClient.
   */
  isAuthenticated: (): boolean => {
    return authClient.isAuthenticated();
  },

  /**
   * Renews the session via authClient.
   */
  renewSession: () => {
    // Assuming authClient.renewSession returns void or verification info
    return authClient.renewSession();
  },

  // Removed refreshToken as it's not in authClient
};

export default authService;
