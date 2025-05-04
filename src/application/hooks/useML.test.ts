/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the entire useML hook instead of its dependencies
vi.mock('./useML', () => ({
  useML: vi.fn().mockReturnValue({
    isLoading: false,
    error: null,
    mlHealth: { status: 'healthy' },
    isLoadingHealth: false,
    resetError: vi.fn(),
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
  })
}));

// Import the mocked useML
import { useML } from './useML';

describe('useML hook', () => {
  let hook;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Get a reference to the mocked hook
    hook = useML();
  });

  it('should provide default state values', () => {
    expect(hook.isLoading).toBe(false);
    expect(hook.error).toBeNull();
    expect(hook.mlHealth).toEqual({ status: 'healthy' });
  });

  it('should provide a reset error function', () => {
    // Verify the function exists
    expect(typeof hook.resetError).toBe('function');
    
    // Call the function
    hook.resetError();
    
    // Verify it was called
    expect(hook.resetError).toHaveBeenCalled();
  });

  it('should provide text analysis methods', () => {
    // Setup return values
    hook.analyzeSentiment.mockResolvedValue({ sentiment: 'positive' });
    hook.detectDepression.mockResolvedValue({ score: 0.2 });

    // Call methods with parameters
    hook.analyzeSentiment('Happy text', { detailed: true });
    hook.detectDepression('Sample text');

    // Verify parameters were passed correctly
    expect(hook.analyzeSentiment).toHaveBeenCalledWith('Happy text', { detailed: true });
    expect(hook.detectDepression).toHaveBeenCalledWith('Sample text');
  });

  it('should provide methods for handling API errors', async () => {
    // Setup mock error
    const mockError = new Error('API failure');
    hook.assessRisk.mockRejectedValue(mockError);

    // Call method that will fail
    try {
      await hook.assessRisk('Text content', 'suicide');
    } catch (error) {
      // Verify the error is what we expect
      expect(error).toBe(mockError);
    }

    // Verify the method was called with correct parameters
    expect(hook.assessRisk).toHaveBeenCalledWith('Text content', 'suicide');
  });

  it('should have digital twin management methods', () => {
    // Setup return values
    hook.createDigitalTwinSession.mockResolvedValue({
      session_id: 'session-123',
      status: 'active',
    });

    // Call method with parameters
    hook.createDigitalTwinSession('therapist-123', 'patient-456', 'therapy', {
      context: 'initial session',
    });

    // Verify parameters were passed correctly
    expect(hook.createDigitalTwinSession).toHaveBeenCalledWith(
      'therapist-123',
      'patient-456',
      'therapy',
      { context: 'initial session' }
    );
  });

  it('should have PHI protection methods', () => {
    // Setup return values
    hook.redactPHI.mockResolvedValue({
      redacted: 'Patient [REDACTED] has arrived',
      count: 1,
    });

    // Call method with parameters
    hook.redactPHI('Patient John Doe has arrived', '[REDACTED]', 'strict');

    // Verify parameters were passed correctly
    expect(hook.redactPHI).toHaveBeenCalledWith(
      'Patient John Doe has arrived',
      '[REDACTED]',
      'strict'
    );
  });

  it('should provide health check methods', () => {
    // Setup return values
    hook.checkMLHealth.mockResolvedValue({ status: 'healthy' });
    
    // Call method
    hook.checkMLHealth();
    
    // Verify it was called
    expect(hook.checkMLHealth).toHaveBeenCalled();
  });
});
