/**
 * Session Timeout Warning Modal
 *
 * Displays a HIPAA-compliant session timeout warning and provides
 * options to extend the session or logout safely.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/presentation/atoms/display/Card';
import { Button } from '@presentation/atoms';
import { Progress } from '@/presentation/atoms/feedback/progress';
import { useSecureAuth } from '../hooks/useSecureAuth';
import { auditLogClient, AuditEventType } from '../../infrastructure/clients/auditLogClient';

interface SessionTimeoutModalProps {
  timeoutInMinutes: number;
  warningThresholdInMinutes: number;
  warningThreshold: number;
  onLogout: () => void;
  onExtendSession?: () => void;
}

/**
 * SessionTimeoutModal component for alerting users about session expiration
 * Provides options to extend session or log out
 */
export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  timeoutInMinutes,
  warningThresholdInMinutes,
  warningThreshold,
  onLogout,
  onExtendSession
}) => {
  const [visible, setVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeoutInMinutes * 60 * 1000);
  const [progress, setProgress] = useState(100);
  const { renewSession, logout, getSessionExpiration } = useSecureAuth();

  // Format time remaining in human-readable format
  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Check session status and update modal visibility
  const checkSessionStatus = useCallback(() => {
    const sessionExpiration = getSessionExpiration();
    if (!sessionExpiration) return;

    const now = new Date().getTime();
    const expiration = new Date(sessionExpiration).getTime();
    const remaining = expiration - now;
    const warningThreshold = warningThresholdInMinutes * 60 * 1000;

    setTimeRemaining(remaining);

    // Calculate progress percentage
    const totalDuration = timeoutInMinutes * 60 * 1000;
    const newProgress = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
    setProgress(newProgress);

    // Show modal if within warning threshold
    if (remaining <= warningThreshold && remaining > 0) {
      setVisible(true);
    } else if (remaining <= 0) {
      // Auto logout when session expires
      handleLogout();
    } else {
      setVisible(false);
    }
  }, [getSessionExpiration, timeoutInMinutes, warningThresholdInMinutes]);

  // Extend session handler
  const handleExtendSession = useCallback(() => {
    renewSession();
    setVisible(false);

    // Log session extension for audit purposes
    auditLogClient.log(AuditEventType.USER_SESSION_RENEWED, {
      action: 'SESSION_EXTENDED',
      details: 'User extended their session',
      timestamp: new Date(),
      result: 'success',
    });

    if (onExtendSession) {
      onExtendSession();
    }
  }, [renewSession, onExtendSession]);

  // Logout handler
  const handleLogout = useCallback(() => {
    // Log logout for audit purposes
    auditLogClient.log(AuditEventType.USER_TIMEOUT, {
      action: 'SESSION_TIMEOUT_LOGOUT',
      details: 'User logged out due to session timeout',
      timestamp: new Date(),
      result: 'success',
    });

    logout();

    if (onLogout) {
      onLogout();
    }
  }, [logout, onLogout]);

  // Set up timer to check session status
  useEffect(() => {
    const timer = setInterval(checkSessionStatus, 5000);
    return () => clearInterval(timer);
  }, [checkSessionStatus]);

  // Only render if visible
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-[400px] shadow-lg">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Session Timeout Warning</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your session will expire in {formatTimeRemaining(timeRemaining)}. Would you like to
            continue?
          </p>
          <Progress value={progress} className="h-2" />
        </CardContent>
        <CardFooter className="flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleExtendSession}>Stay Logged In</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
