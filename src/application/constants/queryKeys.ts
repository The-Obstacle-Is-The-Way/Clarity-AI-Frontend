/** Root query key for patient list operations */
export const PATIENTS_QUERY_KEY = 'patients';

/** Prefix for individual patient detail queries. Use with patientId: [PATIENT_DETAIL_QUERY_KEY_PREFIX, patientId] */
export const PATIENT_DETAIL_QUERY_KEY_PREFIX = 'patientDetail';

/** Prefix for clinical record queries. Use with patientId and filters: [CLINICAL_RECORDS_QUERY_KEY_PREFIX, patientId, { filters }] */
export const CLINICAL_RECORDS_QUERY_KEY_PREFIX = 'clinicalRecords';

// Add other query keys as needed