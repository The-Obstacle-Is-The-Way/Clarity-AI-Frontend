// src/application/hooks/useCreatePatient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPatient } from '@infrastructure/api/patientService';
import type { Patient } from '@domain/patients/patientTypes';
import type { CreatePatientInput } from '@domain/patients/patientSchemas';
import { PATIENTS_QUERY_KEY } from './usePatients'; // Import query key
import { toast } from 'react-toastify'; // For success/error notifications

/**
 * Custom hook to handle the creation of a new patient using React Query's useMutation.
 *
 * Provides mutation function, loading state, error state, and handles cache invalidation on success.
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, CreatePatientInput>({
    mutationFn: createPatient,
    onSuccess: (data) => {
      // Invalidate the patients list query to refetch and show the new patient
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
      toast.success(`Patient "${data.first_name} ${data.last_name}" created successfully!`);
      // Optionally, pre-populate the cache for the new patient's detail view:
      // queryClient.setQueryData([PATIENT_DETAIL_QUERY_KEY_PREFIX, data.id], data);
    },
    onError: (error) => {
      console.error("Error creating patient:", error);
      toast.error(`Failed to create patient: ${error.message || 'Unknown error'}`);
      // More sophisticated error handling can be added here
    },
    // You can add onMutate or onSettled callbacks if needed
  });
};
