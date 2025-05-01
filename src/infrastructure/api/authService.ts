import { apiClient } from '@infrastructure/api/ApiGateway';
import type { User } from '@application/context/AuthContext';

/**
 * Authentication Service
 *
 * Service for handling authentication-related API interactions.
 * Provides methods for login, logout, token refresh, and user operations
 * using the API Gateway.
 */
export class AuthService {
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns User data and token
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.login(email, password);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  static async logout(): Promise<void> {
    try {
      // Clear auth token from the API client
      apiClient.clearAuthToken();
      
      // Additional logout functionality can be added here
      // such as invalidating the token on the server
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh the authentication token
   * @param refreshToken - Current refresh token
   * @returns New access token and refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh-token',
        { refreshToken }
      );
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get the current user's profile
   * @returns User profile data
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Request a password reset for a given email
   * @param email - User email
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/request-password-reset', { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Complete password reset with token
   * @param token - Reset token
   * @param newPassword - New password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }
}

export default AuthService; 