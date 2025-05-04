/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useML } from './useML';
import { MLApiClient } from '../../infrastructure/api/MLApiClient';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

// Mock both the ApiClient and MLApiClient
vi.mock('../../infrastructure/api/MLApiClient', () => {
  const MLApiClient = vi.fn();
  MLApiClient.prototype.processText = vi.fn();
  MLApiClient.prototype.detectDepression = vi.fn();
  MLApiClient.prototype.assessRisk = vi.fn();
  MLApiClient.prototype.analyzeSentiment = vi.fn();
  MLApiClient.prototype.analyzeWellnessDimensions = vi.fn();
  MLApiClient.prototype.generateDigitalTwin = vi.fn();
  MLApiClient.prototype.createDigitalTwinSession = vi.fn();
  MLApiClient.prototype.getDigitalTwinSession = vi.fn();
  MLApiClient.prototype.sendMessageToSession = vi.fn();
  MLApiClient.prototype.endDigitalTwinSession = vi.fn();
  MLApiClient.prototype.getSessionInsights = vi.fn();
  MLApiClient.prototype.detectPHI = vi.fn();
  MLApiClient.prototype.redactPHI = vi.fn();
  MLApiClient.prototype.checkMLHealth = vi.fn();
  MLApiClient.prototype.checkPHIHealth = vi.fn();
  return { MLApiClient };
});

vi.mock('../../infrastructure/api/ApiClient', () => {
  const ApiClient = vi.fn();
  ApiClient.prototype.get = vi.fn();
  ApiClient.prototype.post = vi.fn();
  return { ApiClient };
});

// Create wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => {
    return React.createElement(
      QueryClientProvider, 
      { client: queryClient }, 
      children
    );
  };
};

describe('useML hook', () => {
  let mockMLApiClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get a reference to the mocked class instance that will be created
    const mockApiClientInstance = new ApiClient('/api');
    mockMLApiClient = new MLApiClient(mockApiClientInstance);
  });

  it('should correctly handle text analysis parameters', async () => {
    mockMLApiClient.analyzeSentiment.mockResolvedValue({ sentiment: 'positive' });
    mockMLApiClient.detectDepression.mockResolvedValue({ risk: 'low' });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.analyzeSentiment('Happy text', { detailed: true });
    await result.current.detectDepression('Sample text');

    // Verify parameters were passed correctly
    expect(mockMLApiClient.analyzeSentiment).toHaveBeenCalledWith('Happy text', { detailed: true });
    expect(mockMLApiClient.detectDepression).toHaveBeenCalledWith('Sample text', undefined);
  });

  it('should handle API errors correctly', async () => {
    // Setup mock error
    const mockError = new Error('API failure');
    mockMLApiClient.assessRisk.mockRejectedValue(mockError);

    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });

    // Call method that will fail
    try {
      await result.current.assessRisk('Text content', 'suicide');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify the error is what we expect
      expect(error).toBe(mockError);
    }

    // Verify the method was called with correct parameters
    expect(mockMLApiClient.assessRisk).toHaveBeenCalledWith('Text content', 'suicide', undefined);
  });

  it('should handle digital twin session parameters', async () => {
    mockMLApiClient.createDigitalTwinSession.mockResolvedValue({ id: 'session-123' });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.createDigitalTwinSession('therapist-123', 'patient-456', 'therapy', {
      context: 'initial session',
    });

    // Verify parameters were passed correctly
    expect(mockMLApiClient.createDigitalTwinSession).toHaveBeenCalledWith(
      'therapist-123',
      'patient-456',
      'therapy',
      { context: 'initial session' }
    );
  });

  it('should handle PHI protection parameters', async () => {
    mockMLApiClient.redactPHI.mockResolvedValue({ text: 'Patient [REDACTED] has arrived' });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.redactPHI('Patient John Doe has arrived', '[REDACTED]', 'strict');

    // Verify parameters were passed correctly
    expect(mockMLApiClient.redactPHI).toHaveBeenCalledWith(
      'Patient John Doe has arrived',
      '[REDACTED]',
      'strict'
    );
  });

  it('should handle text processing parameters', async () => {
    mockMLApiClient.processText.mockResolvedValue({ processed: true });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.processText('Sample text', 'general', { priority: 'high' });

    // Verify parameters were passed correctly
    expect(mockMLApiClient.processText).toHaveBeenCalledWith('Sample text', 'general', { priority: 'high' });
  });

  it('should handle health check calls', async () => {
    mockMLApiClient.checkMLHealth.mockResolvedValue({ status: 'healthy' });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.checkMLHealth();
    
    // Verify it was called
    expect(mockMLApiClient.checkMLHealth).toHaveBeenCalled();
  });

  it('should handle digital twin generation parameters', async () => {
    mockMLApiClient.generateDigitalTwin.mockResolvedValue({ id: 'twin-123' });
    
    const { result } = renderHook(() => useML(), { wrapper: createWrapper() });
    
    await result.current.generateDigitalTwin('patient-123', { name: 'John' });

    // Verify parameters were passed correctly
    expect(mockMLApiClient.generateDigitalTwin).toHaveBeenCalledWith({ name: 'John' }, undefined);
  });
});
