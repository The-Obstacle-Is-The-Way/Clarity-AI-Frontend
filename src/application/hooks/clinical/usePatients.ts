// src/application/hooks/usePatients.ts
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '@infrastructure/api/patientService';
import type { PaginatedPatientsResponse } from '@domain/patients/patientTypes';
import { PATIENTS_QUERY_KEY } from '@application/constants/queryKeys';

// export const PATIENTS_QUERY_KEY = 'patients'; // Remove local definition

interface UsePatientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean; // Allow disabling the query
}

/**
 * Custom hook to fetch paginated patient data using React Query.
 *
 * @param {UsePatientsOptions} options - Options for pagination, search, and query control.
 * @returns The result object from React Query's useQuery, containing patient data, loading state, error state, etc.
 */
export const usePatients = (options: UsePatientsOptions = {}) => {
  const { page = 1, limit = 20, search, enabled = true } = options;

  // The query key includes parameters that affect the fetched data
  // to ensure proper caching and refetching when parameters change.
  const queryKey = [PATIENTS_QUERY_KEY, { page, limit, search }];

  return useQuery<PaginatedPatientsResponse, Error>({
    queryKey: queryKey,
    queryFn: () => getPatients({ page, limit, search }),
    // Keep previous data while fetching new data for smoother pagination
    placeholderData: (previousData) => previousData,
    // Cache time (e.g., 5 minutes)
    staleTime: 5 * 60 * 1000,
    enabled: enabled, // Control whether the query runs automatically
    // Add other React Query options as needed (e.g., retry, refetchOnWindowFocus)
  });
};
