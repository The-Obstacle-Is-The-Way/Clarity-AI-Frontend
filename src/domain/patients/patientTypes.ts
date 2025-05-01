// src/domain/patients/patientTypes.ts

/**
 * Represents the core domain model for a Patient.
 * This should align with the data structure returned by the backend API.
 */
export interface Patient {
  id: string; // Typically UUID or database ID
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO 8601 date string (e.g., "YYYY-MM-DD")
  // Example status - adjust based on actual backend values
  status: 'active' | 'inactive' | 'pending_assessment' | 'discharged';
  created_at: string; // ISO 8601 timestamp string
  updated_at: string; // ISO 8601 timestamp string
  // Add other relevant fields as discovered from the API
  // e.g., assigned_clinician_id?: string;
  // e.g., primary_diagnosis_code?: string;
}

/**
 * Represents the data structure for paginated API responses for patients.
 */
export interface PaginatedPatientsResponse {
  items: Patient[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
