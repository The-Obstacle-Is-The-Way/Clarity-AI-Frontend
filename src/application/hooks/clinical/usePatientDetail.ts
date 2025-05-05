// src/application/hooks/usePatientDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getPatientById } from '@infrastructure/api/patientService';
import type { Patient } from '@domain/patients/patientTypes';
import { PATIENT_DETAIL_QUERY_KEY_PREFIX } from '@application/constants/queryKeys';

/**
 * Custom hook to fetch detailed data for a single patient using React Query.
 *
 * @param {string | undefined} patientId - The ID of the patient to fetch. Query is disabled if undefined.
 * @param {object} options - Optional React Query options.
 * @param {boolean} [options.enabled=true] - Controls if the query should automatically execute.
 * @returns The result object from React Query's useQuery.
 */
export const usePatientDetail = (
  patientId: string | undefined,
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;

  // Query key includes the patientId to ensure uniqueness
  const queryKey = [PATIENT_DETAIL_QUERY_KEY_PREFIX, patientId];

  return useQuery<Patient, Error>({
    queryKey: queryKey,
    // Only run the query function if patientId is defined
    queryFn: () => {
      if (!patientId) {
        // This should ideally not be reached if 'enabled' is used correctly,
        // but provides type safety and a clear error.
        return Promise.reject(new Error('Patient ID is undefined'));
      }
      return getPatientById(patientId);
    },
    // The query is enabled only if patientId is truthy and the enabled option is true
    enabled: !!patientId && enabled,
    // Standard cache time, adjust as needed
    staleTime: 5 * 60 * 1000,
    // You might want to configure retry behavior, especially for detail views
    // retry: 1,
  });
};
