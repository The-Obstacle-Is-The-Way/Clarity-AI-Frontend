// src/presentation/pages/PatientDetailPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatientDetail } from '@application/hooks/usePatientDetail';
import { useUpdatePatient } from '@application/hooks/useUpdatePatient';
import PatientDetailCard from '@presentation/organisms/PatientDetailCard';
import PatientForm from '@presentation/organisms/PatientForm';
import { Alert, AlertDescription, AlertTitle } from "@presentation/atoms/alert";
import { Skeleton } from "@presentation/atoms/skeleton";
import { Terminal, ArrowLeft, Edit, X } from 'lucide-react';
import { Button } from "@presentation/atoms/button";
import type { UpdatePatientInput } from '@domain/patients/patientSchemas';

/**
 * Renders the detail page for a single patient.
 * Fetches patient data based on the ID from the URL parameter.
 * Allows toggling between viewing and editing patient details.
 */
const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const { data: patient, error: fetchError, isLoading: isLoadingDetail, isError: isFetchError } = usePatientDetail(patientId);
  const { mutate: updatePatient, isLoading: isUpdating, error: updateError, isError: isUpdateError } = useUpdatePatient();

  const handleUpdateSubmit = (data: UpdatePatientInput) => {
    if (!patientId) return;
    console.log("Submitting update:", data);
    updatePatient(
      { patientId, patientData: data },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const renderContent = () => {
    if (isLoadingDetail) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
        </div>
      );
    }

    if (isFetchError || !patient) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'An unknown error occurred fetching patient details.';
       return (
         <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Patient Details</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
      );
    }

    if (isEditing) {
      const defaultValues: UpdatePatientInput = {
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        date_of_birth: patient.date_of_birth || '',
        status: patient.status || 'active',
      };
      return (
        <div className="mt-6">
          {isUpdateError && (
             <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Update Failed</AlertTitle>
                <AlertDescription>
                  {updateError instanceof Error ? updateError.message : "An unexpected error occurred."}
                   Please check the form fields or try again later.
                </AlertDescription>
              </Alert>
          )}
          <PatientForm
            onSubmit={handleUpdateSubmit}
            isLoading={isUpdating}
            defaultValues={defaultValues}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="mt-4"
            disabled={isUpdating}
          >
             <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </div>
      );
    } else {
      return (
        <>
          <PatientDetailCard patient={patient} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="mt-4"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Patient
          </Button>
        </>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
             <Link to="/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
            </Link>
        </Button>

      <h1 className="text-3xl font-bold mb-6">
        Patient Details {patient && !isEditing ? `- ${patient.first_name} ${patient.last_name}` : ''}
        {isEditing && '(Editing)'}
      </h1>
      {renderContent()}
      {/* Placeholder for other sections like Clinical Records, Analytics */}
    </div>
  );
};

export default PatientDetailPage;
