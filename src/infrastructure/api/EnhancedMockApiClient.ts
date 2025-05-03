/* eslint-disable */
/**
 * NOVAMIND Enhanced Mock API Client
 * Quantum-level mock implementation with neural precision
 */

import axios from 'axios';
import { IApiClient } from './IApiClient';
import type { ApiPatient } from './ApiClient.runtime';
// import { mockApi, getMockDb } from './mockApi';
import { type User, UserRole, Permission } from '@domain/types/auth/auth';
// import { type ApiError, type ApiResponse } from './types'; // Import ApiError as type only
import type { BrainModel, ScannerMachine, Vector3D } from '@domain/types';
import type { BrainRegion, BrainScan, NeuralConnection } from '@domain/types/brain/models';

// Mock User Data (align with domain User type)
const mockUser: User = {
  id: 'mock-user-123',
  email: 'mock@example.com',
  name: 'Mock User', // Use name instead of first/last
  role: UserRole.CLINICIAN, // Use UserRole enum
  permissions: [Permission.VIEW_PATIENTS, Permission.EDIT_PATIENTS], // Use Permission enum
  lastLogin: new Date(),
  // profile: { /* mock profile data */ }, // Profile is optional
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
  private logActivity(action: string, details: any): void {
    if (typeof window !== 'undefined' && this.auditEnabled) {
      // Directly log to console for mock audit, avoid network call
      console.debug('[Mock Audit]', action, {
        details,
        timestamp: new Date().toISOString(),
        userId: mockUser.id, // Include mock user ID in log
      });
      try {
        // Use a relative path for the audit log endpoint if base URL is /api
        axios
          .post('/api/audit-logs', {
            action,
            timestamp: new Date().toISOString(),
            details,
            userId: mockUser.id, // Use mock user ID
          })
          .catch(() => {
            // Fallback console log if network call fails
            console.debug('[Mock Audit Fallback]', action, details);
          });
      } catch (e) {
        // Fallback console log if axios call throws synchronously (unlikely)
        console.debug('[Mock Audit Error]', action, details);
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
  async login(email: string /*, password: string */): Promise<any> { // Password unused
    await this.delay();
    console.log(`[MockClient] login called for ${email} (Simulating cookie setting)`);
    this.logActivity('POST_Request', { endpoint: '/api/v1/auth/login', data: { email } });

    if (email === mockUser.email) {
      // Return data matching AuthResult structure (success, user, token)
      // Align returned user with domain User type
      return {
        success: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name, 
          role: mockUser.role, 
          permissions: mockUser.permissions,
          lastLogin: mockUser.lastLogin,
        },
        token: {
          token: `mock-token-${Date.now()}`,
          expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
        },
        requiresMFA: false, // Example
      };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
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
    // Handle /brain-models/:modelId pattern
    const brainModelMatch = endpoint.match(/^\/brain-models\/([^/]+)$/);
    if (brainModelMatch) {
      const modelId = brainModelMatch[1];
      console.log(`[MockClient] Returning mock BrainModel for ID from GET: ${modelId}`);
      const brainModel = await this.getBrainModel(modelId); // Call the specific mock method
      return Promise.resolve(brainModel as unknown as T);
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

  async getUser(userId: string): Promise<any> {
    await this.delay();
    if (userId === mockUser.id) {
      return { ...mockUser }; 
    } else {
      throw new Error('User not found');
    }
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
      medicalHistory: {
        conditions: ['depression', 'anxiety'],
        medications: ['fluoxetine', 'alprazolam'],
        allergies: [],
      },
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
      {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        demographicData: { age: 43, ethnicity: 'caucasian' },
      },
      {
        id: 'patient-2',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        demographicData: { age: 33, ethnicity: 'asian' },
      },
    ];
  }

  async getPatientById(patientId: string): Promise<ApiPatient> {
    await this.delay();
    this.logActivity('getPatientById', { patientId });
    // Simple mock: return a generic patient or find from the list above
    const patients = await this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
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
      details: 'Mock prediction based on simulated data.',
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
  async getBrainModel(modelId: string = 'DEMO_SCAN_001'): Promise<BrainModel> {
    await this.delay();
    this.logActivity('getBrainModel', { modelId });
    console.log(`[MockClient] Returning mock BrainModel for ID: ${modelId}`);

    // Define helper for Vector3D
    const vec = (x: number, y: number, z: number): Vector3D => ({ x, y, z });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockMachine: ScannerMachine = {
      id: 'scanner-001',
      type: 'Siemens Prisma',
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    };

    const mockScan: BrainScan = {
      id: `scan-for-${modelId}`,
      patientId: 'mock-patient-for-model',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: vec(128, 128, 64),
      metadata: { acquisitionTime: '10min' },
      dataQualityScore: 0.92,
      notes: 'Simulated scan for mock brain model',
      technician: 'Tech McTechface',
    };

    const baseRegion = {
      volume: 100,
      activity: 0.5,
      color: '#CCCCCC',
      activityLevel: 0.5,
      type: 'cortical' as const,
      hemisphereLocation: 'left' as const,
      dataConfidence: 0.95,
      isActive: true,
    };

    const mockRegion1: BrainRegion = {
      ...baseRegion,
      id: 'region-mock-1',
      name: 'Mock Prefrontal Cortex',
      position: vec(10, 20, 30),
      connections: ['region-mock-2'],
      hemisphereLocation: 'left',
    };

    const mockRegion2: BrainRegion = {
      ...baseRegion,
      id: 'region-mock-2',
      name: 'Mock Amygdala',
      position: vec(-5, -15, 25),
      connections: ['region-mock-1'],
      hemisphereLocation: 'right',
    };

    const mockConnection1: NeuralConnection = {
      id: 'conn-mock-1-2',
      sourceId: 'region-mock-1',
      targetId: 'region-mock-2',
      strength: 0.75,
      type: 'inhibitory',
      directionality: 'unidirectional',
      activityLevel: 0.7,
      dataConfidence: 0.9,
    };

    // Build comprehensive object that satisfies both SSoT verification and index typing
    const brainModelFull = {
      id: modelId,
      patientId: 'mock-patient-for-model', // Use consistent mock patient ID
      scan: mockScan, // Embed the fully typed mock scan
      regions: [mockRegion1, mockRegion2], // Embed fully typed mock regions
      connections: [mockConnection1], // Embed fully typed mock connections
      metadata: {
        version: '1.1.0',
        generatedAt: new Date().toISOString(),
        algorithm: 'MockBrainGen v1.0',
      },
      analysisResults: {
        overallHealth: 0.92,
        anomalies: [],
        recommendations: ['Maintain healthy lifestyle', 'Regular check-ups'],
      },
      // Additional SSoT-required fields
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      processingLevel: 'raw',
      lastUpdated: new Date().toISOString(),
      algorithmVersion: 'MockBrainGen v1.0',
    };

    return Promise.resolve(brainModelFull as unknown as BrainModel);
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
