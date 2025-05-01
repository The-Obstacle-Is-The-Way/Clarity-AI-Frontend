// src/infrastructure/api/patientService.ts
import apiClient from './apiClient';
import type {
  Patient,
  PaginatedPatientsResponse,
} from '@domain/patients/patientTypes';

/**
 * Fetches a list of patients from the API, potentially with pagination.
 *
 * @param {object} params - Optional query parameters.
 * @param {number} [params.page=1] - The page number to fetch.
 * @param {number} [params.limit=20] - The number of items per page.
 * @param {string} [params.search] - Optional search term.
 * @returns {Promise<PaginatedPatientsResponse>} A promise resolving to the paginated patient data.
 */
export const getPatients = async (params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedPatientsResponse> => {
  // Default pagination values if not provided
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.search && { search: params.search }), // Add search only if provided
  };

  try {
    // Adjust the endpoint based on the confirmed backend API structure
    // Assuming the backend returns data in the PaginatedPatientsResponse structure
    const response = await apiClient.get<PaginatedPatientsResponse>('/patients', {
      params: queryParams,
    });
    return response; // apiClient should ideally return the parsed data directly
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    // Re-throw the error to be handled by React Query or calling component
    throw error;
  }
};

/**
 * Fetches a single patient by their ID.
 *
 * @param {string} patientId - The ID of the patient to fetch.
 * @returns {Promise<Patient>} A promise resolving to the patient data.
 */
export const getPatientById = async (patientId: string): Promise<Patient> => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }
  try {
    // Adjust endpoint as needed
    const response = await apiClient.get<Patient>(`/patients/${patientId}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch patient with ID ${patientId}:`, error);
    throw error;
  }
};

// Add functions for createPatient, updatePatient, deletePatient later
// export const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => { ... };
// export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => { ... };
// export const deletePatient = async (patientId: string): Promise<void> => { ... };
