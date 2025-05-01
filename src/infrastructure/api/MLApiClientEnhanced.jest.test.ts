/* eslint-disable */
/**
 * MLApiClientEnhanced Test Suite
 *
 * This test suite specifically focuses on ensuring MLApiClientEnhanced properly
 * handles error cases and retries, which are critical for production resilience
 * and achieving 80% test coverage.
 */

import { MLApiClientEnhanced, MLErrorType } from './MLApiClientEnhanced';
import { Mocked } from 'vitest'; // Import Mocked type
import { ApiClient } from './apiClient';
import { MLApiClient } from './MLApiClient';

// Use Jest-style mocking (Vitest compatible)
vi.mock('./MLApiClient');
vi.mock('./apiClient');

// Mock setTimeout and clearTimeout for faster tests
vi.useFakeTimers();

describe('MLApiClientEnhanced - Production Error Handling Tests', () => {
  let mlApiClientEnhanced: MLApiClientEnhanced;
  let apiClientMock: Mocked<ApiClient>;
  let mlApiClientMock: Mocked<MLApiClient>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Set up the ApiClient mock
    apiClientMock = {
      baseUrl: 'https://api.test.com',
      headers: {},
      fetch: vi.fn(),
    } as unknown as Mocked<ApiClient>;

    // Set up the MLApiClient mock
    mlApiClientMock = {
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
    } as unknown as Mocked<MLApiClient>;

    // Mock MLApiClient constructor
    (MLApiClient as any).mockImplementation(() => mlApiClientMock); // Use 'any' for simplicity here

    // Create the enhanced client
    mlApiClientEnhanced = new MLApiClientEnhanced(apiClientMock);

    // Replace the client with our mock
    (mlApiClientEnhanced as any).client = mlApiClientMock;

    // Configure timeout settings for faster tests
    (mlApiClientEnhanced as any).retryConfig.baseDelayMs = 10;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test Suite: PHI Protection Resiliency
   * Critical path for HIPAA compliance
   */
  describe('PHI Protection Resiliency', () => {
    it('should validate PHI detection requirements strictly', async () => {
      // Attempt with missing required params
      await expect(mlApiClientEnhanced.detectPHI('')).rejects.toThrow(/Validation failed/);
      expect(mlApiClientMock.detectPHI).not.toHaveBeenCalled();

      // Attempt with valid params
      mlApiClientMock.detectPHI.mockResolvedValue({ phi_detected: false });
      await mlApiClientEnhanced.detectPHI('Valid text content');
      expect(mlApiClientMock.detectPHI).toHaveBeenCalledWith('Valid text content', undefined);
    });

    it('should handle PHI detection errors gracefully', async () => {
      // Set up error simulation
      const errorResponse = {
        isAxiosError: true,
        message: 'PHI Detection Service Error',
        response: {
          status: 503,
          data: { message: 'PHI service unavailable' },
          headers: { 'x-request-id': 'phi-req-123' },
        },
      };
      // Set the error on the mock
      mlApiClientMock.detectPHI.mockRejectedValue(errorResponse);

      // Execute and verify error contains proper diagnostics
      try {
        await mlApiClientEnhanced.detectPHI('Test content with PHI');
        fail('Should have thrown an error');
      } catch (error: any) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        // This is the correct catch block for the try on line 104
        expect(error.type).toBe(MLErrorType.SERVICE_UNAVAILABLE); // Expect SERVICE_UNAVAILABLE for 503
        expect(error.statusCode).toBe(503);
        expect(error.requestId).toBe('phi-req-123');
        expect(error.endpoint).toBe('detectPHI');
        // Errors should include contextual info for debugging
        expect(error.details).toBeDefined();
      } // Correctly closing the catch block
    });

    it('should handle PHI redaction with proper error context', async () => {
      // Test successful redaction
      mlApiClientMock.redactPHI.mockResolvedValue({
        redacted_text: 'Text with [REDACTED]',
        phi_detected: true,
      });

      const result = await mlApiClientEnhanced.redactPHI('Text with PHI', '[REDACTED]');
      expect(result).toEqual({
        redacted_text: 'Text with [REDACTED]',
        phi_detected: true,
      });

      // Test validation requirement
      await expect(mlApiClientEnhanced.redactPHI('')).rejects.toThrow(
        'Text is required and must be a string'
      ); // Match exact validation message
    });
  });

  /**
   * Test Suite: Network Resilience
   * Critical for production use across unstable networks
   */
  describe('Network Resilience', () => {
    it('should retry on network errors up to maximum retry count', async () => {
      // Create network error
      const networkError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNREFUSED',
        response: undefined,
      };

      // Always fail with network error
      mlApiClientMock.checkMLHealth.mockRejectedValue(networkError);

      // Set retry config to 2
      (mlApiClientEnhanced as any).retryConfig.maxRetries = 2;

      // Attempt call
      await expect(mlApiClientEnhanced.checkMLHealth()).rejects.toThrow();

      // Should attempt 3 times (original + 2 retries)
      expect(mlApiClientMock.checkMLHealth).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff for retries', async () => {
      // Create timeout error
      const timeoutError = {
        isAxiosError: true,
        message: 'timeout of 5000ms exceeded',
        code: 'ECONNABORTED',
        response: undefined,
      };

      // Fail with timeout for all calls
      mlApiClientMock.processText.mockRejectedValue(timeoutError);

      // Set max retries to ensure we see multiple timeouts
      (mlApiClientEnhanced as any).retryConfig.maxRetries = 3;
      (mlApiClientEnhanced as any).retryConfig.baseDelayMs = 100;

      // Start the API call (it will fail, but we don't need to wait for it)
      const promise = mlApiClientEnhanced.processText('test').catch(() => {
        // Expected to fail - we're just testing the retry mechanism
      });

      // Let all timers run to completion
      vi.runAllTimers();

      // Wait for the promise to complete
      await promise;

      // Verify the method was called multiple times (original + retries)
      expect(mlApiClientMock.processText).toHaveBeenCalledTimes(4); // Original call + 3 retries
    });

    it('should recover automatically when a transient error resolves', async () => {
      // Set up to fail twice with timeout then succeed
      mlApiClientMock.assessRisk
        .mockRejectedValueOnce({
          isAxiosError: true,
          message: 'Network Error',
          code: 'ECONNREFUSED',
        })
        .mockRejectedValueOnce({
          isAxiosError: true,
          message: 'timeout of 5000ms exceeded',
          code: 'ECONNABORTED',
        })
        .mockResolvedValueOnce({ risk_level: 'low', confidence: 0.9 });

      // Should eventually succeed after retries
      const result = await mlApiClientEnhanced.assessRisk('patient showing symptoms');

      // Verify we get the successful result
      expect(result).toEqual({ risk_level: 'low', confidence: 0.9 });
      expect(mlApiClientMock.assessRisk).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Test Suite: Authorization Handling
   * Critical for security compliance
   */
  describe('Authorization Handling', () => {
    it('should not retry authentication errors', async () => {
      // Create auth error
      const authError = {
        isAxiosError: true,
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: { message: 'Invalid or expired token' },
          headers: { 'x-request-id': 'auth-req-123' },
        },
      };

      // Fail with auth error
      mlApiClientMock.getDigitalTwinSession.mockRejectedValue(authError);

      // Attempt call
      try {
        await mlApiClientEnhanced.getDigitalTwinSession('session-123');
        fail('Should have thrown an error');
      } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        expect(error.type).toBe(MLErrorType.TOKEN_REVOKED);
        expect(error.retryable).toBe(false); // Auth errors are not retryable
      }

      // Should only be called once (no retries)
      expect(mlApiClientMock.getDigitalTwinSession).toHaveBeenCalledTimes(1);
    });

    it('should handle rate limiting errors', async () => {
      // Create rate limit error
      const rateLimitError = {
        isAxiosError: true,
        message: 'Request failed with status code 429',
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' },
          headers: { 'x-request-id': 'rate-req-123', 'retry-after': '30' },
        },
      };

      // Fail with rate limit error
      mlApiClientMock.analyzeWellnessDimensions.mockRejectedValue(rateLimitError);

      // Attempt call
      try {
        await mlApiClientEnhanced.analyzeWellnessDimensions('analyze this text');
        fail('Should have thrown an error');
      } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        expect(error.type).toBe(MLErrorType.RATE_LIMIT);
        expect(error.statusCode).toBe(429);
        expect(error.retryable).toBe(true); // Rate limit errors are retryable
        expect(error.details).toBeDefined();
      }
    });
  });

  /**
   * Test Suite: Digital Twin Reliability
   * Critical for clinical data integrity
   */
  describe('Digital Twin Reliability', () => {
    it('should strictly validate digital twin session creation parameters', async () => {
      mlApiClientMock.createDigitalTwinSession.mockResolvedValue({ session_id: 'new-session-123' });

      // Validate therapist ID requirement
      await expect(mlApiClientEnhanced.createDigitalTwinSession('', 'patient-123')).rejects.toThrow(
        /Therapist ID is required/
      );

      // Validate patient ID requirement
      await expect(
        mlApiClientEnhanced.createDigitalTwinSession('therapist-123', '')
      ).rejects.toThrow(/Patient ID is required/);

      // Valid call
      await mlApiClientEnhanced.createDigitalTwinSession('therapist-123', 'patient-123');
      expect(mlApiClientMock.createDigitalTwinSession).toHaveBeenCalledWith(
        'therapist-123',
        'patient-123',
        undefined,
        undefined
      );
    });

    it('should normalize error responses for digital twin operations', async () => {
      // Create various error formats to ensure consistent handling
      const errors = [
        // String error
        'Session creation failed',

        // Error object
        new Error('Session not found'),

        // API error object
        {
          isAxiosError: true,
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { errorCode: 'INTERNAL_ERROR', message: 'Internal server error' },
          },
        },
      ];

      // Test with each error format
      for (const errorValue of errors) {
        // Reset mock
        vi.clearAllMocks();
        mlApiClientMock.getSessionInsights.mockRejectedValue(errorValue);

        // Attempt call
        try {
          await mlApiClientEnhanced.getSessionInsights('session-123');
          fail('Should have thrown an error');
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
          // All errors should be normalized to MLApiError format
          expect(error.message).toBeDefined();
          expect(error.type).toBeDefined();
          expect(error.endpoint).toBe('getSessionInsights');
        }
      }
    });
  });
});
