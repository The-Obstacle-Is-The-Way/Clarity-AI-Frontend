/**
 * Enhanced Authentication Provider
 *
 * Provides robust authentication state and methods to the application with
 * enhanced HIPAA compliance, 2FA, and client-side encryption.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '@infrastructure/api/ApiClient';
import { authClient } from '@infrastructure/clients/authClient';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient';
import { encryptionService } from '@infrastructure/services/encryptionService';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import type { User, Permission } from '@domain/types/auth/auth';
import { authService } from '@application/services/authService';
import type { AuthContextType, AuthProviderProps } from './authTypes'; // Keep this type import
import { useAuth } from '@/application/hooks/useAuth'; // Adjust path as needed
import { AuthContext } from '@/application/context/AuthContext';

// Constants for session management
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before expiration
const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const ENCRYPTION_ENABLED = true; // Toggle for client-side encryption

// Security tracking for suspicious activities
interface SecurityMetrics {
  failedLoginAttempts: number;
  lastFailedAttempt: number | null;
  lockoutUntil: number | null;
  suspiciousActivities: Array<{
    timestamp: number;
    activity: string;
    details: string;
  }>;
}

interface EnhancedAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced Authentication Provider
 */
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  // Authentication state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [requiresMFA, setRequiresMFA] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Session management
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(0);
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);

  // Security metrics
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    lastFailedAttempt: null,
    lockoutUntil: null,
    suspiciousActivities: [],
  });

  /**
   * Track suspicious activity
   */
  const trackSuspiciousActivity = useCallback((activity: string, details: string) => {
    setSecurityMetrics((prev) => ({
      ...prev,
      suspiciousActivities: [
        ...prev.suspiciousActivities,
        { timestamp: Date.now(), activity, details },
      ],
    }));

    // Log to audit system
    auditLogClient.log(AuditEventType.SUSPICIOUS_ACTIVITY, {
      action: 'suspicious_activity_detected',
      details: `${activity}: ${details}`,
      result: 'failure',
    });
  }, []);

  /**
   * Check session expiration time
   */
  const checkSessionExpiration = useCallback((): number => {
    if (!sessionExpiresAt) return Infinity;
    return sessionExpiresAt - Date.now();
  }, [sessionExpiresAt]);

  /**
   * Logout handler with audit logging
   */
  const logout = useCallback(async () => {
    const userId = user?.id;
    try {
      await authClient.logout();
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpiresAt(0);

      // Log successful logout
      auditLogClient.log(AuditEventType.USER_LOGOUT, {
        action: 'user_logout',
        userId: userId,
        details: 'User logged out successfully',
        result: 'success',
      });
    } catch (err) {
      // Log logout error
      auditLogClient.log(AuditEventType.USER_LOGOUT, {
        action: 'user_logout',
        userId: userId,
        details: `Logout failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        result: 'failure',
      });
      console.error('Logout failed:', err);
      setError('Failed to logout.');
    }
  }, [user]);

  // Placeholder function to extend session
  const extendSession = useCallback(async () => {
    console.log("Extending session...");
    try {
      // Call renewSession which returns SessionVerification
      const result = authClient.renewSession(); 
      
      // Check if renewal was considered valid by the client
      if (result.valid && result.remainingTime) {
        // Update local expiration time based on the renewed session\'s remaining time
        setSessionExpiresAt(Date.now() + result.remainingTime);
        setShowSessionWarning(false);
        auditLogClient.log(AuditEventType.USER_SESSION_RENEWED, {
          action: 'session_renew',
          details: 'User session extended successfully',
          result: 'success',
        });
      } else {
        // Throw error if renewal was not valid
        throw new Error('Session renewal failed or returned invalid result.');
      }
    } catch (err) {
       auditLogClient.log(AuditEventType.USER_SESSION_RENEWED, {
          action: 'session_renew',
          details: `Session extension failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          result: 'failure',
        });
      console.error("Failed to extend session:", err);
      // Optionally logout user if extension fails critically
      // logout(); 
    }
  }, [user]); // Keep user dependency for audit log, or remove if not needed

  /**
   * Initialize authentication state from storage with encryption
   */
  const initializeAuth = useCallback(async () => {
    try {
      if (authClient.isAuthenticated()) {
        let currentUser = authClient.getCurrentUser();

        // Decrypt sensitive user data if encryption is enabled
        if (ENCRYPTION_ENABLED && currentUser) {
          currentUser = {
            ...currentUser,
            // Decrypt any encrypted fields
            profile: currentUser.profile
              ? encryptionService.decryptObject(currentUser.profile)
              : currentUser.profile,
          };
        }

        const sessionVerification = authClient.verifySession();

        if (currentUser && sessionVerification.valid && sessionVerification.remainingTime) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setSessionExpiresAt(Date.now() + sessionVerification.remainingTime);

          // Log session restoration
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            action: 'session_restore',
            details: 'User session restored with enhanced security',
            result: 'success',
          });
        }
      }
    } catch (err) {
      console.error('Failed to initialize auth state:', err);
      setError('Authentication session could not be restored.');

      // Track as suspicious if error is unexpected
      if (err instanceof Error && !err.message.includes('expired')) {
        trackSuspiciousActivity(
          'session_restore_failed',
          `Unexpected error during session restoration: ${err.message}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [trackSuspiciousActivity]);

  /**
   * Login handler with enhanced security
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      // Check for account lockout
      if (securityMetrics.lockoutUntil && securityMetrics.lockoutUntil > Date.now()) {
        const remainingLockoutTime = Math.ceil(
          (securityMetrics.lockoutUntil - Date.now()) / 1000 / 60
        );
        setError(
          `Account temporarily locked. Please try again in ${remainingLockoutTime} minutes.`
        );
        setIsLoading(false);
        return false;
      }

      try {
        // Attempt login through auth client
        const result = await authClient.login({
          email,
          password,
          rememberMe,
        });

        // Handle successful initial authentication
        if (result.success && result.user && result.token) {
          // Check if 2FA is required
          if (result.requiresMFA) {
            setRequiresMFA(true);
            setIsLoading(false);

            // Navigate to MFA verification page
            navigate('/mfa-verify', { state: { email } });
            return false;
          }

          // Encrypt sensitive data if enabled
          let processedUser = result.user;
          if (ENCRYPTION_ENABLED && processedUser.profile) {
            processedUser = {
              ...processedUser,
              profile: encryptionService.encryptObject(processedUser.profile),
            };
          }

          setUser(processedUser);
          setIsAuthenticated(true);
          setSessionExpiresAt(result.token.expiresAt);

          // Reset security metrics on successful login
          setSecurityMetrics({
            failedLoginAttempts: 0,
            lastFailedAttempt: null,
            lockoutUntil: null,
            suspiciousActivities: securityMetrics.suspiciousActivities,
          });

          setIsLoading(false);
          return true;
        } else {
          // Handle failed login
          setError(result.error || 'Authentication failed.');

          // Track failed login attempts
          const now = Date.now();
          const newAttempts = securityMetrics.failedLoginAttempts + 1;

          // Implement progressive lockout after multiple failed attempts
          let lockoutUntil = null;
          if (newAttempts >= 5) {
            // Lock for 15 minutes after 5 failed attempts
            lockoutUntil = now + 15 * 60 * 1000;

            // Log suspicious activity
            trackSuspiciousActivity(
              'multiple_failed_logins',
              `Account locked after ${newAttempts} failed login attempts`
            );
          }

          setSecurityMetrics({
            ...securityMetrics,
            failedLoginAttempts: newAttempts,
            lastFailedAttempt: now,
            lockoutUntil,
          });

          setIsLoading(false);
          return false;
        }
      } catch (err) {
        // Log unexpected errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Authentication error: ${errorMessage}`);
        trackSuspiciousActivity('login_error', errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [navigate, securityMetrics, trackSuspiciousActivity]
  );

  /**
   * Check permission with enhanced role-based access
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;

      // Check if user has the specific permission
      if (user.permissions.includes(permission)) {
        // Log access attempt for sensitive operations
        if (
          permission.includes('MODIFY') ||
          permission.includes('DELETE') ||
          permission.includes('PHI')
        ) {
          auditLogClient.log(AuditEventType.PERMISSION_CHANGE, {
            action: `permission_check: ${permission}`,
            details: `Permission ${permission} granted for user ${user.id}`,
            result: 'success',
          });
        }
        return true;
      }

      // Log denied permissions for audit
      auditLogClient.log(AuditEventType.PERMISSION_CHANGE, {
        action: `permission_check: ${permission}`,
        details: `Permission ${permission} denied for user ${user.id}`,
        result: 'failure',
      });

      return false;
    },
    [user]
  );

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Session monitoring
   * Checks session status periodically and sets warning when close to expiration
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const remainingTime = checkSessionExpiration();

      if (remainingTime <= 0) {
        // Session expired, log out
        auditLogClient.log(AuditEventType.USER_TIMEOUT, {
          action: 'session_expired',
          details: 'User session expired',
          result: 'success',
        });
        logout();
      } else if (remainingTime <= SESSION_WARNING_TIME) {
        // Show warning when less than warning threshold remaining
        setShowSessionWarning(true);
      }
    };

    // Initial check
    checkSession();

    // Set up periodic checks
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSessionExpiration, logout]);

  /**
   * Renew current session
   */
  const renewSession = useCallback((): void => {
    if (!isAuthenticated) return;

    try {
      // Use auth client to renew session
      const verification = authClient.renewSession();

      if (verification.valid && verification.remainingTime) {
        setSessionExpiresAt(Date.now() + verification.remainingTime);
        setShowSessionWarning(false);

        // Log session renewal
        auditLogClient.log(AuditEventType.USER_SESSION_RENEWED, {
          action: 'session_renewed',
          details: 'User session renewed',
          result: 'success',
        });
      }
    } catch (err) {
      console.error('Session renewal error:', err);
      trackSuspiciousActivity(
        'session_renewal_error',
        `Error renewing session: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [isAuthenticated, trackSuspiciousActivity]);

  /**
   * Context value
   */
  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      checkSessionExpiration,
      renewSession,
      hasPermission,
      extendSession,
      getSessionExpiration: checkSessionExpiration,
    }),
    [
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      checkSessionExpiration,
      renewSession,
      hasPermission,
      extendSession,
      checkSessionExpiration,
    ]
  );

  // Calculate props for SessionTimeoutModal
  const sessionTimeoutInMinutes = 60; // Example: Assume 60 min session
  const warningThresholdInMinutes = SESSION_WARNING_TIME / (60 * 1000);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showSessionWarning && (
        <SessionTimeoutModal 
          warningThreshold={SESSION_WARNING_TIME} 
          timeoutInMinutes={sessionTimeoutInMinutes} 
          warningThresholdInMinutes={warningThresholdInMinutes} 
          onLogout={logout} 
          onExtendSession={extendSession}
        />
      )}
    </AuthContext.Provider>
  );
};
