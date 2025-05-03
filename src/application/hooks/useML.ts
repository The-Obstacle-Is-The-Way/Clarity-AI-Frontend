/* eslint-disable */
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MLApiClient } from '@infrastructure/api/MLApiClient';
import { ApiClient } from '@/infrastructure/api/ApiClient'; // Import base ApiClient

/**
 * useML - React hook for accessing ML capabilities
 *
 * This hook provides access to the ML API client with added React state management
 * for tracking loading states and errors.
 */
export const useML = (config?: { enablePolling?: boolean; pollInterval?: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Instantiate the base API client
  const baseApiClient = useMemo(() => new ApiClient({ baseURL: '/api' }), []); // Adjust baseURL if needed
  // Instantiate the ML API client with the base client
  const apiClientInstance = useMemo(() => new MLApiClient(baseApiClient), [baseApiClient]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle API requests with loading and error state management
   */
  const withLoadingState = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Text analysis methods
  const processText = useCallback(
    (text: string, modelType?: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => apiClientInstance.processText(text, modelType, options));
    },
    [withLoadingState, apiClientInstance]
  );

  const detectDepression = useCallback(
    (text: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => apiClientInstance.detectDepression(text, options));
    },
    [withLoadingState, apiClientInstance]
  );

  const assessRisk = useCallback(
    (text: string, riskType?: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => apiClientInstance.assessRisk(text, riskType, options));
    },
    [withLoadingState, apiClientInstance]
  );

  const analyzeSentiment = useCallback(
    (text: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => apiClientInstance.analyzeSentiment(text, options));
    },
    [withLoadingState, apiClientInstance]
  );

  const analyzeWellnessDimensions = useCallback(
    (text: string, dimensions?: string[], options?: Record<string, unknown>) => {
      return withLoadingState(() =>
        apiClientInstance.analyzeWellnessDimensions(text, dimensions, options)
      );
    },
    [withLoadingState, apiClientInstance]
  );

  // Digital twin methods
  const generateDigitalTwin = useCallback(
    (
      patientId: string,
      patientData: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        apiClientInstance.generateDigitalTwin(patientId, patientData, options)
      );
    },
    [withLoadingState, apiClientInstance]
  );

  const createDigitalTwinSession = useCallback(
    (
      therapistId: string,
      patientId: string,
      sessionType?: string,
      sessionParams?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        apiClientInstance.createDigitalTwinSession(
          therapistId,
          patientId,
          sessionType,
          sessionParams
        )
      );
    },
    [withLoadingState, apiClientInstance]
  );

  const getDigitalTwinSession = useCallback(
    (sessionId: string) => {
      return withLoadingState(() => apiClientInstance.getDigitalTwinSession(sessionId));
    },
    [withLoadingState, apiClientInstance]
  );

  const sendMessageToSession = useCallback(
    (
      sessionId: string,
      message: string,
      senderId?: string,
      senderType?: string,
      messageParams?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        apiClientInstance.sendMessageToSession(
          sessionId,
          message,
          senderId,
          senderType,
          messageParams
        )
      );
    },
    [withLoadingState, apiClientInstance]
  );

  const endDigitalTwinSession = useCallback(
    (sessionId: string, endReason?: string) => {
      return withLoadingState(() => apiClientInstance.endDigitalTwinSession(sessionId, endReason));
    },
    [withLoadingState, apiClientInstance]
  );

  const getSessionInsights = useCallback(
    (sessionId: string, insightType?: string) => {
      return withLoadingState(() => apiClientInstance.getSessionInsights(sessionId, insightType));
    },
    [withLoadingState, apiClientInstance]
  );

  // PHI protection methods
  const detectPHI = useCallback(
    (text: string, detectionLevel?: string) => {
      return withLoadingState(() => apiClientInstance.detectPHI(text, detectionLevel));
    },
    [withLoadingState, apiClientInstance]
  );

  const redactPHI = useCallback(
    (text: string, replacement?: string, detectionLevel?: string) => {
      return withLoadingState(() => apiClientInstance.redactPHI(text, replacement, detectionLevel));
    },
    [withLoadingState, apiClientInstance]
  );

  // Health check methods
  const checkMLHealth = useCallback(() => {
    return withLoadingState(() => apiClientInstance.checkMLHealth());
  }, [withLoadingState, apiClientInstance]);

  const checkPHIHealth = useCallback(() => {
    return withLoadingState(() => apiClientInstance.checkPHIHealth());
  }, [withLoadingState, apiClientInstance]);

  const { data: models } = useQuery<
    ModelMetadata[],
    Error
  >({
    queryKey: ['mlModels'],
    queryFn: () => apiClientInstance.getAvailableModels(),
    enabled: !!apiClientInstance,
    ...(config?.enablePolling
      ? {
          refetchInterval: config.pollInterval,
        }
      : {})
  });

  return {
    // State
    isLoading,
    error,
    resetError,

    // Text analysis methods
    processText,
    detectDepression,
    assessRisk,
    analyzeSentiment,
    analyzeWellnessDimensions,

    // Digital twin methods
    generateDigitalTwin,
    createDigitalTwinSession,
    getDigitalTwinSession,
    sendMessageToSession,
    endDigitalTwinSession,
    getSessionInsights,

    // PHI protection methods
    detectPHI,
    redactPHI,

    // Health check methods
    checkMLHealth,
    checkPHIHealth,

    // Additional data
    models,
  };
}
