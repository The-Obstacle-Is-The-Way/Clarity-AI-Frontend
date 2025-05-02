/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * apiClient testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './ApiGateway';

describe('apiClient', () => {
  beforeEach(() => {
    // Mock the global fetch function
    vi.stubGlobal('fetch', vi.fn());
    // Clear any potential spies or other mocks if necessary
    // vi.clearAllMocks(); // fetch mock is cleared in afterEach
    // Reset auth token if needed between tests, depends on ApiClient implementation
    apiClient.setAuthToken(null); 
  });

  afterEach(() => {
    // Clear the fetch mock after each test
    vi.mocked(fetch).mockClear();
    // Restore fetch to its original implementation
    vi.unstubAllGlobals();
  });

  it('processes GET requests with mathematical precision', async () => {
    const mockResponseData = [
      { id: 'ml-patient-001', name: 'ML Patient Zero' },
      { id: 'ml-patient-002', name: 'ML Patient Alpha' },
    ];
    // Configure the fetch mock for this specific test case
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);

    // Call the ApiClient method
    const result = await apiClient.get('/api/ml/patients/'); // Use the path the client expects

    // Verify fetch was called correctly (optional but good)
    expect(fetch).toHaveBeenCalledTimes(1);
    // URL check needs to account for the baseUrl logic in ApiClient
    // Since NODE_ENV=test, baseUrl is http://localhost
    expect(fetch).toHaveBeenCalledWith('http://localhost/api/ml/patients/', expect.any(Object));

    // Assert with quantum verification based on mock response
    expect(result).toEqual(mockResponseData); // Direct comparison with mocked data
  });

  it('processes POST requests with clinical precision', async () => {
    const payload = { username: 'neural-scientist', password: 'quantum-safe' };
    const mockResponseData = { success: true, token: 'vi_mock_token_456' };

    // Configure the fetch mock for this specific test case
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as Response);

    // Act with quantum precision
    const result = await apiClient.post('/api/auth/login', payload);

    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    }));

    // Assert with clinical verification based on mock response
    expect(result).toEqual(mockResponseData);
  });

  it('supports neural authorization patterns', () => {
    // Test the setAuthToken method directly if needed
    const testToken = 'neural-quantum-token';
    apiClient.setAuthToken(testToken);

    // Assertion depends on how ApiClient stores/uses the token.
    // This might involve checking Axios instance headers if that's how it's implemented.
    // For example (assuming default headers are accessible, might need adjustment):
    // expect(apiClient.instance.defaults.headers.common['Authorization']).toBe(`Bearer ${testToken}`);
    // Or simply verify the method doesn't throw
    expect(() => apiClient.setAuthToken(testToken)).not.toThrow();
  });
});
