import { authClient } from '@infrastructure/clients/authClient';

// Define the expected structure for login credentials matching backend
interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Authentication Service
 *
 * Provides methods for interacting with the backend authentication endpoints.
 * Uses the central apiClient configured for HttpOnly cookie handling.
 */
export const authService = {
  /**
   * Attempts to log in the user.
   * The backend handles setting HttpOnly cookies on success.
   * @param credentials - The user's login credentials.
   * @returns Promise<void> - Resolves on successful login (status 2xx), rejects otherwise.
   */
  login: async (credentials: LoginCredentials): Promise<void> => {
    // The actual token data is in the cookie, we just need the call to succeed.
    // No need to return the body of the /login response.
    await authClient.post<void>('/api/v1/auth/login', credentials);
  },

  /**
   * Logs out the user.
   * The backend handles clearing HttpOnly cookies.
   * @returns Promise<void> - Resolves on successful logout (status 2xx), rejects otherwise.
   */
  logout: async (): Promise<void> => {
    await authClient.post<void>('/api/v1/auth/logout');
  },

  /**
   * Fetches the profile of the currently authenticated user.
   * Relies on the browser automatically sending the auth cookie.
   * @returns Promise<User> - The user profile data.
   */
  getCurrentUser: async (): Promise<User> => {
    return authClient.get<User>('/api/v1/auth/me');
  },

  /**
   * Attempts to silently refresh the authentication tokens using the existing
   * HttpOnly refresh cookie. If the refresh succeeds, the backend will set new
   * cookies on the response.
   *
   * IMPORTANT: The frontend does not need to store or parse the returned JSON
   * body – the presence of a 2xx response is sufficient.
   */
  refreshToken: async (): Promise<void> => {
    await authClient.post<void>('/api/v1/auth/refresh');
  },

  // Note: Refresh token logic is handled via HttpOnly cookie by the browser/
  // backend. No explicit frontend call needed in this service for basic flow.
};

export default authService;
