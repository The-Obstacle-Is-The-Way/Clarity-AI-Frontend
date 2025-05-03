import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// import { apiClient } from '@infrastructure/api/ApiGateway'; // No longer needed directly
import { authService } from '@infrastructure/api/authService'; // Import the service

// Define authentication types based on backend UserResponse
export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  is_active: boolean;
  // Removed permissions, align with backend /me response
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // Tracks initial loading and login/logout process
  error: string | null;
}

// Action types - Simplified, no token management
type AuthAction =
  | { type: 'AUTH_CHECK_START' } // For initial load
  | { type: 'AUTH_CHECK_SUCCESS'; payload: User }
  | { type: 'AUTH_CHECK_FAILURE' } // User not authenticated initially
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT_REQUEST' } // Added for logout process
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: string } // Added for logout errors
  | { type: 'CLEAR_ERROR' };

// Initial auth state - isLoading is true initially to check auth status
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true, // Start loading to check session
  error: null,
};

// Auth reducer - Adapted for cookie-based flow
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_CHECK_START':
    case 'LOGIN_REQUEST':
    case 'LOGOUT_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_CHECK_SUCCESS':
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CHECK_FAILURE': // Represents no active session found initially
      return {
        ...initialAuthState,
        isLoading: false, // Finished loading, just not authenticated
      };
    case 'LOGIN_FAILURE':
    case 'LOGOUT_FAILURE': // Handle logout error
      return {
        ...state, // Keep isAuthenticated potentially true if logout failed mid-process
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...initialAuthState,
        isLoading: false, // Finished logging out
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context - Note: No token exposed
interface AuthContextType extends Omit<AuthState, 'token'> {
  // login takes username (email) and password
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>; // Logout is now async
  clearError: () => void;
}

// Export AuthContext so it can be used for testing providers
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component - Uses authService now
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check authentication status on mount by calling /auth/me via authService
  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'AUTH_CHECK_START' });
    try {
      const user = await authService.getCurrentUser(); // Use service
      if (user && user.id) {
        dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: user });
      } else {
         throw new Error('Invalid user data received');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_CHECK_FAILURE' });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function - Calls login endpoint via authService, then fetches user profile
  const login = useCallback(async (username: string, password: string, rememberMe = false) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      // Step 1: Call the login endpoint via service.
      await authService.login({ username, password, remember_me: rememberMe });

      // Step 2: If login successful, fetch user data via service
      const user = await authService.getCurrentUser();
       if (!user || !user.id) {
         throw new Error('Failed to fetch user data after login.');
       }

      // Step 3: Update state with user data
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });

    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        (error instanceof Error ? error.message : 'An unknown error occurred during login');
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function - Calls logout endpoint via authService
  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT_REQUEST' });
    try {
      await authService.logout(); // Use service
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error: any) {
       console.error("Logout failed:", error);
       const errorMessage =
         error?.response?.data?.detail ||
         (error instanceof Error ? error.message : 'An unknown error occurred during logout');
      dispatch({ type: 'LOGOUT_FAILURE', payload: errorMessage });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
