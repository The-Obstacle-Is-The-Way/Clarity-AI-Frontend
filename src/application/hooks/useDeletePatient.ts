// src/application/hooks/useDeletePatient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used

import { deletePatient as deletePatientApi } from '@infrastructure/api/patientService';
import { PATIENTS_QUERY_KEY } from './usePatients';
import { PATIENT_DETAIL_QUERY_KEY_PREFIX } from './usePatientDetail';

/**
 * Hook for deleting a patient.
 * Provides mutation function, loading state, and handles success/error cases
 * including cache invalidation and notifications.
 *
 * @returns {object} Mutation object from TanStack Query including `mutate`, `isLoading`, etc.
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (patientId: string) => deletePatientApi(patientId),
    onSuccess: (_, patientId) => {
      toast.success('Patient deleted successfully');

      // Invalidate the main list query to refetch
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });

      // Optionally, remove the specific patient detail query from cache immediately
      queryClient.removeQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY_PREFIX, patientId] });

      // Navigate back to the patient list after successful deletion
      navigate('/patients');
    },
    onError: (error) => {
      console.error('Failed to delete patient:', error);
      // Display a more user-friendly error message
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to delete patient: ${message}`);
    },
  });
};
