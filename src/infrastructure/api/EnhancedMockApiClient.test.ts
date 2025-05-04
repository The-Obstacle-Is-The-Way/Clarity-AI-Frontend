/**
 * NOVAMIND Neural Test Suite - EnhancedMockApiClient
 * Testing mock API client behavior with quantum precision
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios'; // Import axios for mocking its methods
import { EnhancedMockApiClient } from './EnhancedMockApiClient'; // Corrected import path
import type { BrainModel } from '@domain/types'; // Import BrainModel type
import { BrainTypeVerifier } from '@domain/utils/brain/type-verification'; // Import verifier

// Mock axios specifically for logActivity calls within the mock client
vi.mock('axios');

describe('EnhancedMockApiClient', () => {
  let mockApiClient: EnhancedMockApiClient;
  const brainVerifier = new BrainTypeVerifier(); // Instantiate verifier

  beforeEach(() => {
    mockApiClient = new EnhancedMockApiClient({ mockDelay: 0 }); // Use the client directly
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  // Keep afterEach if needed for other potential global mocks, otherwise remove
  afterEach(() => {
    // vi.clearAllMocks(); // Already called in beforeEach
  });

  it('getPatient returns patient data with proper structure', async () => {
    const patientId = 'test-patient-123';
    // Mock the axios post call made by logActivity
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });

    const patient = await mockApiClient.getPatient(patientId);

    expect(patient).toBeDefined();
    expect(patient.id).toBe(patientId);
    expect(patient.firstName).toBe('John');
    // Add more assertions for structure if needed

    // Verify logActivity called axios.post correctly
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'getPatient',
        details: { patientId },
      })
    );
  });

  it('getPatients returns an array of patients', async () => {
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });
    const patients = await mockApiClient.getPatients();
    expect(Array.isArray(patients)).toBe(true);
    expect(patients.length).toBeGreaterThan(0);
    // Add structure checks for patient objects within the array

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'getPatients',
      })
    );
  });

  // Test the specific getBrainModel method directly
  it('getBrainModel returns model that conforms to BrainModel type', async () => {
    const modelId = 'test-model-123';
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });

    const model = await mockApiClient.getBrainModel(modelId);

    expect(model).toBeDefined();
    expect(model.id).toBe(modelId);

    // Re-enable BrainTypeVerifier checks
    const verificationResult = brainVerifier.verifyBrainModel(model);
    if (!verificationResult.success) {
      console.error('BrainModel Verification Failed:', verificationResult.error);
    }
    expect(verificationResult.success).toBe(true);

    // Keep specific assertions for key fields as well
    expect(model.regions).toBeDefined();
    expect(Array.isArray(model.regions)).toBe(true);
    expect(model.connections).toBeDefined();
    expect(model.scan).toBeDefined();
    expect(model.metadata).toBeDefined();
    expect(model.analysisResults).toBeDefined();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'getBrainModel',
        details: { modelId },
      })
    );
  });

  // Test the generic GET method handling the /brain-models/:modelId route
  it('GET /brain-models/:modelId returns a valid BrainModel', async () => {
    const modelId = 'DEMO_SCAN_SPECIAL';
    const endpoint = `/brain-models/${modelId}`;
    vi.mocked(axios.post).mockResolvedValue({ status: 200 }); // Mock logActivity call within GET
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200 }); // Mock logActivity call within getBrainModel

    const model = await mockApiClient.get<BrainModel>(endpoint);

    expect(model).toBeDefined();
    expect(model.id).toBe(modelId);

    // Re-enable BrainTypeVerifier checks
    const verificationResult = brainVerifier.verifyBrainModel(model);
    if (!verificationResult.success) {
      console.error('BrainModel Verification Failed (GET route):', verificationResult.error);
    }
    expect(verificationResult.success).toBe(true);

    expect(model.regions).toBeDefined(); // Basic check

    // Check logActivity calls - one for GET, one for internal getBrainModel
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'GET_Request',
        details: { endpoint, params: undefined }, // Assuming no params passed
      })
    );
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'getBrainModel',
        details: { modelId },
      })
    );
  });

  it('login returns valid user credentials and logs activity', async () => {
    const email = 'mock@example.com'; // Use the email that matches mockUser.email
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });

    const result = await mockApiClient.login(email, 'password');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined(); // Token object should be defined
    expect(result.token.token).toBeDefined(); // Check structure based on mock impl
    expect(result.user.id).toBeDefined();

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/audit-logs',
      expect.objectContaining({
        action: 'POST_Request',
        details: { endpoint: '/api/v1/auth/login', data: { email } },
      })
    );
  });
});
