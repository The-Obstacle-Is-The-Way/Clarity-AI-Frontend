// src/application/hooks/useClinicalRecords.ts
import { useQuery } from '@tanstack/react-query';
import { getClinicalRecords as getClinicalRecordsApi } from '@infrastructure/api/clinicalRecordService';
import {
  CLINICAL_RECORDS_QUERY_KEY_PREFIX,
} from '@application/constants/queryKeys'; // Corrected import path
import type { PaginatedClinicalRecordsResponse } from '@domain/clinical-records/clinicalRecordTypes';

interface UseClinicalRecordsParams {
  patientId: string | undefined;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Add other filters as needed
}

/**
 * Hook to fetch paginated clinical records for a specific patient.
 *
 * @param {UseClinicalRecordsParams} params - Parameters including patientId and optional pagination/filtering.
 * @returns {object} TanStack Query object including data, isLoading, isError, error, etc.
 */
export const useClinicalRecords = ({
  patientId,
  page = 1,
  limit = 10,
  sortBy,
  sortOrder,
}: UseClinicalRecordsParams) => {
  const queryKey = [
    CLINICAL_RECORDS_QUERY_KEY_PREFIX,
    patientId,
    { page, limit, sortBy, sortOrder }, // Include params in query key for caching
  ];

  return useQuery<PaginatedClinicalRecordsResponse, Error>({
    queryKey: queryKey,
    queryFn: () => {
      if (!patientId) {
        // Or return a default empty state, depending on desired UX
        return Promise.reject(new Error('Patient ID is required'));
      }
      return getClinicalRecordsApi(patientId, {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    },
    enabled: !!patientId, // Only run the query if patientId is available
    // keepPreviousData: true, // Consider enabling for smoother pagination UX
    // staleTime: 5 * 60 * 1000, // 5 minutes, adjust as needed
  });
};
