import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '@infrastructure/api/ApiGateway';

// Define authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'clinician' | 'researcher' | 'patient';
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialAuthState,
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

// Create context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check for saved auth token on mount
  useEffect(() => {
    const loadAuthState = async () => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        try {
          apiClient.setAuthToken(token);

          // Attempt to validate the token and get user info
          // This would be an API call to fetch the current user
          // For now, we'll simulate this with mock data
          const userData = {
            id: 'user123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'clinician' as const,
            permissions: ['read:patients', 'write:patients'],
          };

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, token },
          });
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    loadAuthState();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      // Authenticate with the API
      const response = await apiClient.login(email, password);

      // Extract token and user data from response
      const { token, user } = response;

      // Store token
      localStorage.setItem('auth_token', token);

      // Set token in API client for future requests
      apiClient.setAuthToken(token);

      // Update auth state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred during login';

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
    }
  };

  // Logout function
  const logout = () => {
    // Clear token from storage
    localStorage.removeItem('auth_token');

    // Clear token from API client
    apiClient.clearAuthToken();

    // Update auth state
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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
