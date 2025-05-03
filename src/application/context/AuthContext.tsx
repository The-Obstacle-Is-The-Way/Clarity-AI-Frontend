import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// import { apiClient } from '@infrastructure/api/ApiGateway'; // No longer needed directly
import { authService } from '@infrastructure/api/authService'; // Import the service
// Import Permission enum and other types from domain
import type { Permission } from '@domain/types/auth/auth';
// Import DomainUser and use it directly
import type { User as DomainUser } from '@domain/types/auth/auth';

// Remove local User definition
/*
export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[]; 
  is_active: boolean;
}
*/

// Use DomainUser in AuthState
export interface AuthState {
  isAuthenticated: boolean;
  user: DomainUser | null; // Use DomainUser
  isLoading: boolean;
  error: string | null;
}

// Use DomainUser in AuthAction payload
type AuthAction =
  | { type: 'AUTH_CHECK_START' }
  | { type: 'AUTH_CHECK_SUCCESS'; payload: DomainUser } // Use DomainUser
  | { type: 'AUTH_CHECK_FAILURE' }
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: DomainUser } // Use DomainUser
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT_REQUEST' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_FAILURE'; payload: string }
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

// Rename context type and EXPORT IT
export interface AppAuthContextType extends Omit<AuthState, 'token' | 'user'> {
  user: DomainUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
  extendSession: () => Promise<void>; 
  getSessionExpiration: () => number; 
}

// Rename exported context
export const AppAuthContext = createContext<AppAuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component - Uses authService now
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    dispatch({ type: 'AUTH_CHECK_START' });
    try {
      const user = await authService.getCurrentUser();
      if (user && user.id) {
        dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: user });
      } else {
        // Throw an error if user data is invalid or incomplete
        throw new Error('Invalid user data received during auth check');
      }
    } catch (authCheckError) { // Renamed error variable
      // Log the specific error for debugging
      console.error('Auth check failed:', authCheckError);
      dispatch({ type: 'AUTH_CHECK_FAILURE' });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function - pass email instead of username
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      await authService.login({ email, password, rememberMe });
      const user = await authService.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('Failed to fetch user data after login.');
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (loginError: unknown) { // Use unknown for error type
      console.error('Login failed:', loginError);
      const errorMessage = 
        loginError instanceof Error ? loginError.message : 'An unknown error occurred during login';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw loginError; // Re-throw to allow components to handle
    }
  }, []);

  // Logout function - Calls logout endpoint via authService
  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT_REQUEST' });
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (logoutError: unknown) { // Use unknown for error type
      console.error('Logout failed:', logoutError);
      const errorMessage = 
        logoutError instanceof Error ? logoutError.message : 'An unknown error occurred during logout';
      dispatch({ type: 'LOGOUT_FAILURE', payload: errorMessage });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // --- Placeholder implementations for context methods --- 

  const hasPermission = useCallback((permission: Permission): boolean => {
    // Use state.user (which is DomainUser | null)
    // Check domain user permissions array
    console.warn('hasPermission check needs verification based on DomainUser structure');
    return state.user?.permissions?.includes(permission) ?? false; 
  }, [state.user]);

  const extendSession = useCallback(async (): Promise<void> => {
    // Placeholder: Call backend renew/extend endpoint via authService if available
    console.warn('extendSession not implemented in AuthContext');
    // Example: await authService.renewSession();
    return Promise.resolve();
  }, []);

  const getSessionExpiration = useCallback((): number => {
    // Placeholder: Needs logic to get actual expiration from cookie/storage/state
    console.warn('getSessionExpiration not fully implemented in AuthContext');
    return Date.now() + 60 * 60 * 1000; // Return placeholder (e.g., 1 hour from now)
  }, []);

  // Use renamed type for value
  const contextValue: AppAuthContextType = {
    ...state, 
    login,
    logout,
    clearError,
    hasPermission,
    extendSession,
    getSessionExpiration,
  };

  // Provide renamed context
  return <AppAuthContext.Provider value={contextValue}>{children}</AppAuthContext.Provider>;
};

// Custom hook for using auth context - use renamed context
export const useAuth = (): AppAuthContextType => {
  const context = useContext(AppAuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
