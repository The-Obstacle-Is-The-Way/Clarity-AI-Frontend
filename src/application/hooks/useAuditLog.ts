import { useCallback } from 'react';
// Use import type as AuditEventType is only used as a type here
import type { AuditEventType } from '@domain/types/audit/AuditEventType';

// Placeholder for Audit Log API client or service
// In a real implementation, this would likely interact with an API endpoint
const auditLogService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logEvent: async (eventType: AuditEventType, details: any): Promise<void> => {
    console.log('[Audit Log - Mock]', eventType, details);
    // Replace with actual API call, e.g.:
    // await apiClient.post('/audit-logs', { eventType, details, timestamp: new Date() });
    await new Promise((resolve) => setTimeout(resolve, 50)); // Wrap resolve
  },
};

/**
 * Hook for logging audit events.
 * Provides a stable `log` function to be used throughout the application.
 */
export const useAuditLog = () => {
  const log = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (eventType: AuditEventType, details: any = {}): Promise<void> => {
      try {
        // Add common context if needed, e.g., user ID, session ID
        const enhancedDetails = {
          ...details,
          // userId: authContext.user?.id, // Example: Get user from AuthContext
          timestamp: new Date().toISOString(),
        };
        await auditLogService.logEvent(eventType, enhancedDetails);
      } catch (error) {
        console.error('Failed to log audit event:', eventType, error);
        // Optionally, implement retry logic or fallback logging
      }
    },
    [] // Dependencies array - add context dependencies if needed (e.g., authContext.user?.id)
  );

  return { log };
}; 