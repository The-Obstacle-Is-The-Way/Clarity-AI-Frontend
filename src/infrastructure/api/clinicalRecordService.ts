// src/infrastructure/api/clinicalRecordService.ts
import { apiClient } from './apiClient';
import type {
  ClinicalRecord,
  PaginatedClinicalRecordsResponse,
} from '@domain/clinical-records/clinicalRecordTypes';

/**
 * Fetches clinical records for a specific patient from the API.
 *
 * @param {string} patientId - The ID of the patient whose records are to be fetched.
 * @param {object} [params] - Optional query parameters for pagination, filtering, sorting.
 * @param {number} [params.page=1] - The page number to fetch.
 * @param {number} [params.limit=10] - The number of records per page.
 * @param {string} [params.sort_by] - Field to sort by (e.g., 'record_date').
 * @param {'asc' | 'desc'} [params.sort_order] - Sort order.
 * @returns {Promise<PaginatedClinicalRecordsResponse>} A promise resolving to the paginated clinical record data.
 */
export const getClinicalRecords = async (
  patientId: string,
  params: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    // Add other potential filter params like record_type, date_range etc.
  } = {},
): Promise<PaginatedClinicalRecordsResponse> => {
  if (!patientId) {
    throw new Error('Patient ID is required to fetch clinical records');
  }

  // Default pagination/sorting values if not provided
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10, // Default to 10 records per page
    ...(params.sort_by && { sort_by: params.sort_by }),
    ...(params.sort_order && { sort_order: params.sort_order }),
  };

  try {
    // Assumed endpoint structure: /api/patients/{patientId}/records
    // The actual backend might use /api/records?patient_id={patientId} etc.
    // Verify the exact endpoint and parameter names.
    const response = await apiClient.get<PaginatedClinicalRecordsResponse>(
      `/patients/${patientId}/records`,
      {
        params: queryParams,
      }
    );
    return response; // apiClient should ideally return the parsed data directly
  } catch (error) {
    console.error(`Failed to fetch clinical records for patient ID ${patientId}:`, error);
    throw error;
  }
};

/**
 * Fetches a single clinical record by its ID.
 * NOTE: Endpoint needs verification. Assumes /api/records/{recordId}.
 *
 * @param {string} recordId - The ID of the clinical record to fetch.
 * @returns {Promise<ClinicalRecord>} A promise resolving to the detailed clinical record data.
 */
export const getClinicalRecordById = async (recordId: string): Promise<ClinicalRecord> => {
  if (!recordId) {
    throw new Error('Record ID is required');
  }
  // --- VERIFY THIS ENDPOINT --- 
  const endpoint = `/records/${recordId}`; 
  // const endpoint = `/patients/${patientId}/records/${recordId}`; // Alternative?

  try {
    console.warn(`Fetching record using assumed endpoint: ${endpoint}. Verify this endpoint.`);
    const response = await apiClient.get<ClinicalRecord>(endpoint);
    return response;
  } catch (error) {
    console.error(`Failed to fetch clinical record with ID ${recordId}:`, error);
    throw error;
  }
};
