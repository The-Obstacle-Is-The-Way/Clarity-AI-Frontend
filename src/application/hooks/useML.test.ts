/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { useML } from './useML';

// Mock ApiClient with correct casing
vi.mock('@/infrastructure/api/ApiClient', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({}))
}));

// Mock the MLApiClient with correct module path
vi.mock('@/infrastructure/api/MLApiClient', () => {
  const mockMethods = {
    processText: vi.fn(),
    detectDepression: vi.fn(),
    assessRisk: vi.fn(),
    analyzeSentiment: vi.fn(),
    analyzeWellnessDimensions: vi.fn(),
    generateDigitalTwin: vi.fn(),
    createDigitalTwinSession: vi.fn(),
    getDigitalTwinSession: vi.fn(),
    sendMessageToSession: vi.fn(),
    endDigitalTwinSession: vi.fn(),
    getSessionInsights: vi.fn(),
    detectPHI: vi.fn(),
    redactPHI: vi.fn(),
    checkMLHealth: vi.fn(),
    checkPHIHealth: vi.fn(),
  };
  
  return {
    MLApiClient: vi.fn().mockImplementation(() => mockMethods)
  };
});

describe('useML', () => {
  let mockMLApiClient;
  
  beforeEach(() => {
    vi.resetAllMocks();
    // Get access to the mocked instance methods directly from the mock rather than using require
    mockMLApiClient = vi.mocked(vi.fn()).mockImplementation(() => ({
      processText: vi.fn(),
      detectDepression: vi.fn(),
      assessRisk: vi.fn(),
      analyzeSentiment: vi.fn(),
      analyzeWellnessDimensions: vi.fn(),
      generateDigitalTwin: vi.fn(),
      createDigitalTwinSession: vi.fn(),
      getDigitalTwinSession: vi.fn(),
      sendMessageToSession: vi.fn(),
      endDigitalTwinSession: vi.fn(),
      getSessionInsights: vi.fn(),
      detectPHI: vi.fn(),
      redactPHI: vi.fn(),
      checkMLHealth: vi.fn(),
      checkPHIHealth: vi.fn(),
    }))();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useML());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should reset error state', async () => {
    // Mock an API error
    const testError = new Error('Test error');
    mockMLApiClient.detectDepression.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useML());

    // First cause an error
    await act(async () => {
      try {
        await result.current.detectDepression('Test text');
      } catch (e) {
        // Expected to throw
      }
    });

    // Verify error was set
    expect(result.current.error).toEqual(testError);

    // Then reset it
    await act(async () => {
      result.current.resetError();
    });

    // Verify it was reset
    expect(result.current.error).toBeNull();
  });

  it('should call API methods with correct parameters', async () => {
    // Setup mock responses
    mockMLApiClient.analyzeSentiment.mockResolvedValue({ sentiment: 'positive' });
    mockMLApiClient.detectDepression.mockResolvedValue({ score: 0.2 });

    // Render hook
    const { result } = renderHook(() => useML());

    // Call methods
    await act(async () => {
      await result.current.analyzeSentiment('Happy text', { detailed: true });
      await result.current.detectDepression('Sample text');
    });

    // Verify correct parameters were passed
    expect(mockMLApiClient.analyzeSentiment).toHaveBeenCalledWith('Happy text', { detailed: true });
    expect(mockMLApiClient.detectDepression).toHaveBeenCalledWith('Sample text', undefined);
  });

  it('should handle API errors correctly', async () => {
    // Setup mock error
    const mockError = new Error('API failure');
    mockMLApiClient.assessRisk.mockRejectedValue(mockError);

    // Render hook
    const { result } = renderHook(() => useML());

    // Call method that will fail
    await act(async () => {
      try {
        await result.current.assessRisk('Text content', 'suicide');
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify error state
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);

    // Verify the API was called
    expect(mockMLApiClient.assessRisk).toHaveBeenCalled();

    // Get the mock function call args
    const args = mockMLApiClient.assessRisk.mock.calls[0];

    // Check individual arguments
    expect(args[0]).toBe('Text content');
    expect(args[1]).toBe('suicide');
  });

  it('should handle non-Error objects thrown by API', async () => {
    // Setup mock to throw a string instead of an Error
    mockMLApiClient.detectPHI.mockRejectedValue('String error');

    // Render hook
    const { result } = renderHook(() => useML());

    // Call method that will fail
    await act(async () => {
      try {
        await result.current.detectPHI('Patient data', 'strict');
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify error was converted to Error object
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
  });

  it('should call Digital Twin methods correctly', async () => {
    // Setup mock responses
    mockMLApiClient.createDigitalTwinSession.mockResolvedValue({
      session_id: 'session-123',
      status: 'active',
    });

    // Render hook
    const { result } = renderHook(() => useML());

    // Call method
    await act(async () => {
      await result.current.createDigitalTwinSession('therapist-123', 'patient-456', 'therapy', {
        context: 'initial session',
      });
    });

    // Verify correct parameters
    expect(mockMLApiClient.createDigitalTwinSession).toHaveBeenCalledWith(
      'therapist-123',
      'patient-456',
      'therapy',
      { context: 'initial session' }
    );
  });

  it('should call PHI protection methods correctly', async () => {
    // Setup mock response
    mockMLApiClient.redactPHI.mockResolvedValue({
      redacted: 'Patient [REDACTED] has arrived',
      count: 1,
    });

    // Render hook
    const { result } = renderHook(() => useML());

    // Call method
    await act(async () => {
      await result.current.redactPHI('Patient John Doe has arrived', '[REDACTED]', 'strict');
    });

    // Verify correct parameters
    expect(mockMLApiClient.redactPHI).toHaveBeenCalledWith(
      'Patient John Doe has arrived',
      '[REDACTED]',
      'strict'
    );
  });
});
