// src/application/hooks/useUpdatePatient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePatient } from '@infrastructure/api/patientService';
import type { Patient } from '@domain/patients/patientTypes';
import type { UpdatePatientInput } from '@domain/patients/patientSchemas';
import { PATIENTS_QUERY_KEY, PATIENT_DETAIL_QUERY_KEY_PREFIX } from '@application/constants/queryKeys';
import { toast } from 'react-toastify';

interface UpdatePatientVariables {
  patientId: string;
  patientData: UpdatePatientInput;
}

/**
 * Custom hook to handle updating an existing patient using React Query's useMutation.
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, UpdatePatientVariables>({
    mutationFn: ({ patientId, patientData }) => updatePatient(patientId, patientData),
    onSuccess: (updatedPatientData, variables) => {
      const { patientId } = variables;

      // Invalidate the general list of patients
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });

      // Invalidate the specific patient detail query
      queryClient.invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY_PREFIX, patientId] });

      // Optionally, update the cache directly for a faster UI update
      queryClient.setQueryData([PATIENT_DETAIL_QUERY_KEY_PREFIX, patientId], updatedPatientData);

      toast.success(`Patient "${updatedPatientData.first_name} ${updatedPatientData.last_name}" updated successfully!`);
    },
    onError: (error, variables) => {
      console.error(`Error updating patient ${variables.patientId}:`, error);
      toast.error(`Failed to update patient: ${error.message || 'Unknown error'}`);
    },
  });
};
