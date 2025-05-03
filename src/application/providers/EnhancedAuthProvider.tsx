/**
 * Enhanced Authentication Provider
 *
 * Provides robust authentication state and methods to the application with
 * enhanced HIPAA compliance, 2FA, and client-side encryption.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type FC,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import { toast } from 'sonner';
import {
  AuthContext,
  type AuthContextType,
  type AppAuthContextType,
} from '@/application/context/AuthContext.tsx';
import { useSecureAuth } from '@application/hooks/useSecureAuth';
import type { User, Permission } from '@domain/types/auth/auth';
import { AuditEventType } from '@domain/types/audit/AuditEventType';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import { useAuditLog } from '@application/hooks/useAuditLog';
import { useAuthContext } from '@application/context/AuthContext';

interface EnhancedAuthProviderProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
  sessionWarningMinutes?: number;
}

// Default values
const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;
const DEFAULT_SESSION_WARNING_MINUTES = 5;

/**
 * Provides authentication context with enhanced features like session management,
 * idle timeout, and audit logging.
 */
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({
  children,
  sessionTimeoutMinutes = DEFAULT_SESSION_TIMEOUT_MINUTES,
  sessionWarningMinutes = DEFAULT_SESSION_WARNING_MINUTES,
}) => {
  const navigate = useNavigate();
  const {
    login: serviceLogin,
    logout: serviceLogout,
    checkAuthStatus,
    verifyMFA: serviceVerifyMFA,
    renewSession: serviceRenewSession,
  } = useSecureAuth();

  const { log: logAudit } = useAuditLog();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionTimeoutModalOpen, setIsSessionTimeoutModalOpen] =
    useState<boolean>(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  const timeout = sessionTimeoutMinutes * 60 * 1000;
  const promptTimeout = sessionWarningMinutes * 60 * 1000;

  // --- Session Management & Initialization ---

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
      setSessionExpiresAt(authStatus.sessionExpiresAt ?? null);
      if (authStatus.isAuthenticated && authStatus.user) {
        logAudit(AuditEventType.USER_SESSION_VALIDATED, {
          userId: authStatus.user.id,
        });
      }
    } catch (err) {
      setError('Failed to check authentication status.');
      setIsAuthenticated(false);
      setUser(null);
      setSessionExpiresAt(null);
      logAudit(AuditEventType.USER_SESSION_VALIDATION_FAILED, {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus, logAudit]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // --- Login/Logout/MFA Logic ---

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean | undefined = false
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await serviceLogin(email, password, rememberMe);
        setIsAuthenticated(result.isAuthenticated);
        setUser(result.user);
        setSessionExpiresAt(result.sessionExpiresAt ?? null);

        if (result.isAuthenticated && result.user) {
          logAudit(AuditEventType.USER_LOGIN_SUCCESS, {
            userId: result.user.id,
            email,
          });
          toast.success('Login successful!');
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
          logAudit(AuditEventType.USER_LOGIN_FAILURE, { email, error: result.error });
          toast.error(result.error || 'Login failed.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Login failed: ${errorMessage}`);
        setIsAuthenticated(false);
        setUser(null);
        setSessionExpiresAt(null);
        logAudit(AuditEventType.USER_LOGIN_FAILURE, { email, error: errorMessage });
        toast.error(`Login failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [serviceLogin, logAudit]
  );

  const logout = useCallback(async (): Promise<void> => {
    const userId = user?.id;
    setIsLoading(true);
    setError(null);
    try {
      await serviceLogout();
      setIsAuthenticated(false);
      setUser(null);
      setSessionExpiresAt(null);
      logAudit(AuditEventType.USER_LOGOUT, { userId: userId ?? 'unknown' });
      toast.info('You have been logged out.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Logout failed: ${errorMessage}`);
      logAudit(AuditEventType.USER_LOGOUT_FAILED, {
        userId: userId ?? 'unknown',
        error: errorMessage,
      });
      toast.error(`