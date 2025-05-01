// src/infrastructure/api/patientService.ts
import apiClient from './apiClient';
import type {
  Patient,
  PaginatedPatientsResponse,
} from '@domain/patients/patientTypes';

/**
 * Fetches a list of patients from the API, potentially with pagination.
 * @param params - Optional query parameters.
 * @param params.page - The page number to fetch.
 * @param params.limit - The number of items per page.
 * @param params.search - Optional search term.
 * @returns A promise resolving to the paginated patient data.
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
  }\n};\n\n/**\n * Updates an existing patient via the API.\n *\n * @param {string} patientId - The ID of the patient to update.\n * @param {Partial<Omit<Patient, \'id\' | \'created_at\' | \'updated_at\'>\>} patientData - The partial data to update.\n * @returns {Promise<Patient>} A promise resolving to the updated patient data.\n */\nexport const updatePatient = async (patientId: string, patientData: Partial<Omit<Patient, \'id\' | \'created_at\' | \'updated_at\'>>): Promise<Patient> => {\n   if (!patientId) {\n    throw new Error(\'Patient ID is required for update\');\n  }\n  try {\n    // Adjust endpoint and HTTP method (PUT or PATCH) as needed\n    const response = await apiClient.put<Patient>(`/patients/${patientId}`, patientData);\n    return response;\n  } catch (error) {\n    console.error(`Failed to update patient with ID ${patientId}:`, error);\n    throw error;\n  }\n};

/**
 * Creates a new patient via the API.
 * @param patientData - The data for the new patient.
 * @returns A promise resolving to the newly created patient data.
 */
export const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => {
  try {
    // Adjust endpoint as needed
    const response = await apiClient.post<Patient>('/patients', patientData);
    return response;
  } catch (error) {
    console.error('Failed to create patient:', error);
    throw error;
  }
};

/**
 * Fetches a single patient by their ID.
 * @param patientId - The ID of the patient to fetch.
 * @returns A promise resolving to the patient data.
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

/**
 * Deletes a patient by their ID.
 * @param patientId - The ID of the patient to delete.
 * @returns A promise that resolves when the deletion is successful.
 * @throws {Error} If patientId is not provided or if the API call fails.
 */
export const deletePatient = async (patientId: string): Promise<void> => {
  if (!patientId) {
    throw new Error('Patient ID is required for deletion');
  }
  try {
    // Adjust endpoint as needed
    await apiClient.delete(`/patients/${patientId}`);
    // DELETE requests often return 204 No Content, so no response body is expected.
  } catch (error) {
    console.error(`Failed to delete patient with ID ${patientId}:`, error);
    throw error; // Re-throw to be caught by the mutation hook
  }
};
