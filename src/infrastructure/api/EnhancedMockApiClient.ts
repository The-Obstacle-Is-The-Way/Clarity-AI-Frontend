/* eslint-disable */
/**
 * NOVAMIND Enhanced Mock API Client
 * Quantum-level mock implementation with neural precision
 */

import axios from 'axios';
import { IApiClient } from './IApiClient';
import type { ApiPatient } from './ApiClient.runtime';
import type { User } from '@application/context/AuthContext'; // Import User type

// Define mock user data matching the User interface
const mockUser: User = {
  id: 'mock-user-123',
  email: 'test@example.com',
  first_name: 'Mock',
  last_name: 'User',
  roles: ['clinician'],
  is_active: true,
};

/**
 * Enhanced mock client for development and testing with simulated latency
 */
export class EnhancedMockApiClient implements IApiClient {
  private mockDelay: number;
  private auditEnabled: boolean;

  constructor(config?: { mockDelay?: number; auditEnabled?: boolean }) {
    this.mockDelay = config?.mockDelay ?? 400; // Default 400ms delay
    this.auditEnabled = config?.auditEnabled ?? true; // Default audit enabled
  }

  /**
   * Simulate network delay
   */
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log audit activity
   */
  private logActivity(
    action: string,
    details: any
  ): void {
    if (typeof window !== 'undefined' && this.auditEnabled) {
      try {
        // Use a relative path for the audit log endpoint if base URL is /api
        axios.post('/api/audit-logs', {
            action,
            timestamp: new Date().toISOString(),
            details,
            userId: mockUser.id, // Use mock user ID
          })
          .catch(() => {
            console.debug('[Mock Audit]', action, details);
          });
      } catch (e) {
        console.debug('[Mock Audit]', action, details);
      }
    } else {
      console.debug('[Mock Audit]', action, details);
    }
  }

  // API Implementation methods

  // --- IApiClient methods ---

  // Add a mock login method matching the interface signature if required,
  // even if not directly used by the primary cookie flow's AuthContext.
  // It might be used elsewhere or expected by tests.
  async login(email: string, password: string): Promise<any> {
    await this.delay();
    console.log(`[MockClient] login called for ${email} (Simulating cookie setting)`);
    this.logActivity('POST_Request', { endpoint: '/api/v1/auth/login', data: { email } });
    
    // Return structure to match test expectations
    return Promise.resolve({
      token: 'mock-access-token-for-test',
      id: mockUser.id,
      name: `${mockUser.first_name} ${mockUser.last_name}`,
      role: mockUser.roles[0],
      // Additional fields from original implementation
      access_token: 'mock-access-token-from-unused-login',
      refresh_token: 'mock-refresh-token-from-unused-login',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles
      }
    });
  }

  setAuthToken(token: string | null): void {
    console.log(`[MockClient] setAuthToken called: ${token ? 'present' : 'null'}`);
  }

  clearAuthToken(): void {
    console.log('[MockClient] clearAuthToken called');
  }

  isAuthenticated(): boolean {
    console.log('[MockClient] isAuthenticated called');
    // This method isn't used by the current AuthContext flow, but returning true
    // makes sense for a generally authenticated mock state.
    return true;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.delay();
    console.log(`[MockClient] GET called: ${endpoint}`, params);
    this.logActivity('GET_Request', { endpoint, params });

    if (endpoint === '/api/v1/auth/me') {
      console.log('[MockClient] Returning mock user data for /api/v1/auth/me');
      return Promise.resolve(mockUser as unknown as T);
    }
    if (endpoint.startsWith('/api/patients/') && endpoint.length > '/api/patients/'.length) {
      const patientId = endpoint.split('/').pop() || 'mock-patient-id';
      console.log(`[MockClient] Returning mock patient data for ID: ${patientId}`);
      const patient = await this.getPatientById(patientId);
      return Promise.resolve(patient as unknown as T);
    }
    if (endpoint === '/api/patients') {
      console.log('[MockClient] Returning mock patient list');
      const patients = await this.getPatients();
      return Promise.resolve(patients as unknown as T);
    }

    console.warn(`[MockClient] Unhandled GET request for: ${endpoint}`);
    return Promise.resolve({ message: `Mock GET success for ${endpoint}` } as unknown as T);
  }

  async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    await this.delay();
    console.log(`[MockClient] POST called: ${endpoint}`, data, config);
    this.logActivity('POST_Request', { endpoint, data });

    if (endpoint === '/api/v1/auth/login') {
      console.log('[MockClient] Simulating successful login cookie set for /api/v1/auth/login');
      return Promise.resolve({} as unknown as T);
    }
    if (endpoint === '/api/v1/auth/logout') {
      console.log('[MockClient] Simulating successful logout cookie clear for /api/v1/auth/logout');
      return Promise.resolve({} as unknown as T);
    }
    // Add other specific POST endpoint mocks here
    if (endpoint === '/api/analytics/xgboost/predict') {
      console.log('[MockClient] Simulating predictTreatmentResponse');
      const prediction = await this.predictTreatmentResponse('mock-patient', data);
      return Promise.resolve(prediction as unknown as T);
    }

    console.warn(`[MockClient] Unhandled POST request for: ${endpoint}`);
    return Promise.resolve({ message: `Mock POST success for ${endpoint}` } as unknown as T);
  }

  async put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    await this.delay();
    console.log(`[MockClient] PUT called: ${endpoint}`, data, config);
    this.logActivity('PUT_Request', { endpoint, data });
    console.warn(`[MockClient] Unhandled PUT request for: ${endpoint}`);
    // Simulate generic success for PUT
    return Promise.resolve({ message: `Mock PUT success for ${endpoint}` } as unknown as T);
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    await this.delay();
    console.log(`[MockClient] DELETE called: ${endpoint}`, config);
    this.logActivity('DELETE_Request', { endpoint });
    console.warn(`[MockClient] Unhandled DELETE request for: ${endpoint}`);
    // Simulate generic success for DELETE
    return Promise.resolve({ message: `Mock DELETE success for ${endpoint}` } as unknown as T);
  }

  // --- Remove outdated/incorrect methods ---
  // The old `login` method is removed as it doesn't match the IApiClient or the cookie flow.
  // Keep existing specific mock methods if they are still useful for testing other features.

  // Example: Keep existing patient methods if needed for other tests

  /**
   * Get patient by ID (Existing mock method)
   */
  async getPatient(patientId: string): Promise<ApiPatient> {
    await this.delay();
    this.logActivity('getPatient', { patientId });
    // Keep existing mock patient data
    return {
      id: patientId,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      demographicData: { age: 43, ethnicity: 'caucasian', weight: '180lbs', height: '5\'10"' },
      medicalHistory: { conditions: ['depression', 'anxiety'], medications: ['fluoxetine', 'alprazolam'], allergies: [] },
    };
  }

  /**
   * Get all patients (Existing mock method)
   */
  async getPatients(): Promise<ApiPatient[]> {
    await this.delay();
    this.logActivity('getPatients', {});
    // Keep existing mock patients data
    return [
      { id: 'patient-1', firstName: 'John', lastName: 'Doe', dateOfBirth: '1980-01-01', gender: 'male', demographicData: { age: 43, ethnicity: 'caucasian' } },
      { id: 'patient-2', firstName: 'Jane', lastName: 'Smith', dateOfBirth: '1990-05-15', gender: 'female', demographicData: { age: 33, ethnicity: 'asian' } },
    ];
  }

  async getPatientById(patientId: string): Promise<ApiPatient> {
    await this.delay();
    this.logActivity('getPatientById', { patientId });
    // Simple mock: return a generic patient or find from the list above
    const patients = await this.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (patient) return patient;
    // Return a default mock if ID not found
    return {
      id: patientId,
      firstName: 'Mock',
      lastName: 'Patient',
      dateOfBirth: '1985-01-01',
      gender: 'other',
      demographicData: { age: 38, ethnicity: 'unknown' },
      medicalHistory: { conditions: ['mock_condition'], medications: ['mock_med'], allergies: [] },
    };
  }

  async predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any> {
    await this.delay();
    this.logActivity('predictTreatmentResponse', { patientId, treatmentData });
    console.log('[MockClient] Simulating predictTreatmentResponse');
    // Return a mock prediction structure
    return Promise.resolve({
      patientId: patientId,
      treatment: treatmentData?.treatmentName || 'mock_treatment',
      predictedEfficacy: Math.random() * 0.6 + 0.2, // Random efficacy between 0.2 and 0.8
      confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1.0
      details: 'Mock prediction based on simulated data.'
    });
  }

  async getRiskAssessment(patientId: string): Promise<any> {
    await this.delay();
    this.logActivity('getRiskAssessment', { patientId });
    console.log('[MockClient] Simulating getRiskAssessment');
    // Return a mock risk assessment structure
    return Promise.resolve({
      patientId: patientId,
      overallRisk: Math.random() > 0.5 ? 'High' : 'Moderate',
      factors: [
        { factor: 'Depression Severity', score: Math.random(), weight: 0.4 },
        { factor: 'Previous Attempts', score: Math.random() > 0.8 ? 1 : 0, weight: 0.3 },
        { factor: 'Social Support', score: 1 - Math.random(), weight: 0.3 },
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // Brain Model operations
  // ===================================

  /**
   * Get brain model data
   */
  async getBrainModel(modelId: string): Promise<{
    id: string;
    patientId: string;
    scanDate: string;
    regions: Array<{
      id: string;
      name: string;
      coordinates: [number, number, number];
      size: number;
      connections: string[];
    }>;
    connections: Array<{
      from: string;
      to: string;
      strength: number;
    }>;
  }> {
    await this.delay();
    this.logActivity('getBrainModel', { modelId });

    return {
      id: modelId,
      patientId: 'patient-1',
      scanDate: '2023-10-15',
      regions: [
        {
          id: 'r1',
          name: 'prefrontal cortex',
          coordinates: [0, 5, 0],
          size: 3,
          connections: ['r2', 'r3'],
        },
        {
          id: 'r2',
          name: 'amygdala',
          coordinates: [2, 0, 1],
          size: 1,
          connections: ['r1'],
        },
        {
          id: 'r3',
          name: 'hippocampus',
          coordinates: [-2, 0, 1],
          size: 1.5,
          connections: ['r1', 'r2'],
        },
      ],
      connections: [
        { from: 'r1', to: 'r2', strength: 0.8 },
        { from: 'r1', to: 'r3', strength: 0.6 },
        { from: 'r2', to: 'r1', strength: 0.5 },
        { from: 'r3', to: 'r1', strength: 0.7 },
        { from: 'r3', to: 'r2', strength: 0.4 },
      ],
    };
  }

  /**
   * Update brain model activity levels
   */
  async updateBrainActivity(
    modelId: string,
    activityData: {
      regions: Array<{ id: string; activity: number }>;
    }
  ): Promise<{ success: boolean }> {
    await this.delay();
    this.logActivity('updateBrainActivity', { modelId, activityData });

    return { success: true };
  }

  /**
   * Get visualization data
   */
  async getVisualizationData(
    modelId: string,
    params?: Record<string, string>
  ): Promise<{
    timestamps: string[];
    activityData: Array<{
      regionId: string;
      values: number[];
    }>;
    connectivityData: Array<{
      fromRegion: string;
      toRegion: string;
      values: number[];
    }>;
  }> {
    await this.delay();
    this.logActivity('getVisualizationData', { modelId, params });

    const timestamps = Array.from({ length: 10 }, (_, i) =>
      new Date(Date.now() - i * 86400000).toISOString()
    ).reverse();

    return {
      timestamps,
      activityData: [
        {
          regionId: 'r1',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
        {
          regionId: 'r2',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
        {
          regionId: 'r3',
          values: Array.from({ length: 10 }, () => Math.random()),
        },
      ],
      connectivityData: [
        {
          fromRegion: 'r1',
          toRegion: 'r2',
          values: Array.from({ length: 10 }, () => Math.random() * 0.5 + 0.5),
        },
        {
          fromRegion: 'r1',
          toRegion: 'r3',
          values: Array.from({ length: 10 }, () => Math.random() * 0.5 + 0.3),
        },
      ],
    };
  }
}

// Export default instance
const enhancedMockApiClient = new EnhancedMockApiClient();
export default enhancedMockApiClient;
