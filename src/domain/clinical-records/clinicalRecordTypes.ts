// src/domain/clinical-records/clinicalRecordTypes.ts

/**
 * Represents a single clinical record associated with a patient.
 * Note: Fields are based on common EMR/EHR structures and may need
 * adjustment based on the actual backend API schema.
 * HIPAA considerations: Sensitive fields might need masking/redaction
 * at the presentation layer.
 */
export interface ClinicalRecord {
  /** Unique identifier for the clinical record */
  id: string;

  /** Identifier for the patient this record belongs to */
  patient_id: string;

  /** Type of record (e.g., 'Progress Note', 'Lab Result', 'Medication Order') */
  record_type: string;

  /** Date and time the record was created or occurred */
  record_date: string; // ISO 8601 format timestamp

  /** Summary or title of the record */
  summary: string;

  /** Detailed content of the record (potentially large, consider fetching separately if needed) */
  details?: string; // This might contain sensitive PHI

  /** Identifier for the clinician who created the record */
  created_by_clinician_id?: string;

  /** Timestamp when the record was created in the system */
  created_at: string; // ISO 8601 format timestamp

  /** Timestamp when the record was last updated */
  updated_at: string; // ISO 8601 format timestamp
}

/**
 * Represents the structure for paginated clinical records responses from the API.
 */
export interface PaginatedClinicalRecordsResponse {
  records: ClinicalRecord[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}
