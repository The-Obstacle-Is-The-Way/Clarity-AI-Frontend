/**
 * Enhanced Authentication Provider
 *
 * Provides robust authentication state and methods to the application with
 * enhanced HIPAA compliance, 2FA, and client-side encryption.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import { toast } from 'sonner';

import {
  AppAuthContext as AuthContext,
  type AppAuthContextType,
} from '@/application/context/AuthContext.tsx';
import { useAuthService } from '@application/hooks/useAuthService';
import type { User, Permission } from '@domain/types/auth/auth';
import { AuditEventType } from '@domain/types/audit/AuditEventType';
import SessionTimeoutModal from './SessionTimeoutModal';
import { useAuditLog } from '@application/hooks/useAuditLog';

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
  } = useAuthService();

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
    ): Promise<boolean> => {
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
          return true;
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
          logAudit(AuditEventType.USER_LOGIN_FAILURE, { email, error: result.error });
          toast.error(result.error || 'Login failed.');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Login failed: ${errorMessage}`);
        setIsAuthenticated(false);
        setUser(null);
        setSessionExpiresAt(null);
        logAudit(AuditEventType.USER_LOGIN_FAILURE, { email, error: errorMessage });
        toast.error(`Login failed: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [serviceLogin, logAudit, navigate]
  );

  const logout = useCallback(async () => {
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
      toast.error(`Logout failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [serviceLogout, logAudit, navigate, user?.id]);

  const verifyMFA = useCallback(
    async (code: string): Promise<boolean> => {
      if (!user) {
        setError('Cannot verify MFA without a user session.');
        return false;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await serviceVerifyMFA(user.id, code);
        if (result.success) {
          setIsAuthenticated(true);
          setUser(result.user ?? user);
          setSessionExpiresAt(result.sessionExpiresAt ?? sessionExpiresAt);
          logAudit(AuditEventType.USER_MFA_VERIFY_SUCCESS, { userId: user.id });
          toast.success('MFA verification successful!');
          navigate('/');
          return true;
        } else {
          setError(result.error || 'MFA verification failed.');
          logAudit(AuditEventType.USER_MFA_VERIFY_FAILURE, {
            userId: user.id,
            error: result.error,
          });
          toast.error(result.error || 'MFA verification failed.');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`MFA verification failed: ${errorMessage}`);
        logAudit(AuditEventType.USER_MFA_VERIFY_FAILURE, {
          userId: user.id,
          error: errorMessage,
        });
        toast.error(`MFA verification failed: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, serviceVerifyMFA, logAudit, navigate, sessionExpiresAt]
  );

  // --- Session Renewal & Expiration Check ---

  const renewSession = useCallback(async () => {
    if (!user) return;
    try {
      const result = await serviceRenewSession(user.id);
      if (result.success && result.sessionExpiresAt) {
        setSessionExpiresAt(result.sessionExpiresAt);
        logAudit(AuditEventType.USER_SESSION_RENEWED, { userId: user.id });
        toast.info('Session extended.');
      } else {
        logAudit(AuditEventType.USER_SESSION_RENEWAL_FAILED, {
          userId: user.id,
          error: result.error,
        });
        toast.warning(result.error || 'Could not extend session.');
      }
    } catch (err) {
      logAudit(AuditEventType.USER_SESSION_RENEWAL_FAILED, {
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error('Failed to extend session.');
    }
  }, [user, serviceRenewSession, logAudit, toast]);

  const checkSessionExpiration = useCallback(() => {
    if (!sessionExpiresAt) return Infinity;
    const now = Date.now();
    const remainingTime = sessionExpiresAt - now;
    if (remainingTime <= 0) {
      if (isAuthenticated) {
        logAudit(AuditEventType.USER_SESSION_EXPIRED, { userId: user?.id });
        toast.warning('Your session has expired. Please log in again.');
        logout();
      }
      return 0;
    }
    return remainingTime;
  }, [sessionExpiresAt, isAuthenticated, user?.id, logAudit, logout, toast]);

  // --- Idle Timer Logic ---

  const { reset } = useIdleTimer({
    onIdle: () => {
      if (isAuthenticated) {
        logAudit(AuditEventType.USER_SESSION_TIMEOUT_IDLE, { userId: user?.id });
        toast.warning('You have been logged out due to inactivity.');
        logout();
      }
    },
    onActive: () => {
      // console.log('User is active');
    },
    onPrompt: () => {
      if (isAuthenticated) {
        logAudit(AuditEventType.USER_SESSION_TIMEOUT_WARNING, { userId: user?.id });
        setIsSessionTimeoutModalOpen(true);
      }
    },
    timeout,
    promptTimeout,
    throttle: 500,
    crossTab: true,
    syncTimers: 200,
  });

  const extendSession = useCallback(() => {
    console.log('Extending session...');
    reset();
    renewSession();
    setIsSessionTimeoutModalOpen(false);
    logAudit(AuditEventType.USER_SESSION_EXTENDED_MANUALLY, { userId: user?.id });
    toast.info('Session extended.');
  }, [renewSession, logAudit, user?.id, toast, reset]);

  // --- Permissions ---

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return user?.permissions?.includes(permission) ?? false;
    },
    [user?.permissions]
  );

  // --- Context Value ---

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo<AppAuthContextType>(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      verifyMFA,
      checkSessionExpiration,
      renewSession,
      extendSession,
      hasPermission,
      getSessionExpiration: checkSessionExpiration,
      clearError: () => setError(null),
    }),
    [
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      verifyMFA,
      checkSessionExpiration,
      renewSession,
      extendSession,
      hasPermission,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutModal
        isOpen={isSessionTimeoutModalOpen}
        onClose={() => setIsSessionTimeoutModalOpen(false)}
        onExtend={extendSession}
        remainingTime={promptTimeout / 1000}
        warningThreshold={DEFAULT_SESSION_WARNING_MINUTES * 60}
        onExtendSession={extendSession}
      />
    </AuthContext.Provider>
  );
};
