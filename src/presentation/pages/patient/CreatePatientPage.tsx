// src/presentation/pages/CreatePatientPage.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PatientForm } from '@presentation/organisms/patient';
import { useCreatePatient } from '@/application/hooks/useCreatePatient';
import type { CreatePatientInput } from '@domain/patients/patientSchemas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/atoms';
import { Button } from '@/presentation/atoms';
import { ArrowLeft, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/atoms';

/**
 * Renders the page for creating a new patient.
 */
const CreatePatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createPatient, isPending: isLoading, error, isError } = useCreatePatient();

  const handleFormSubmit = (data: CreatePatientInput) => {
    console.log('Submitting patient data:', data);
    createPatient(data, {
      onSuccess: (_createdPatient) => {
        // Navigate back to the patient list after successful creation
        // Could also navigate to the new patient's detail page:
        // navigate(`/patients/${createdPatient.id}`);
        navigate('/patients');
      },
      // onError is handled globally in the hook via toast
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link to="/patients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Patient</CardTitle>
          <CardDescription>Enter the details for the new patient.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display general mutation error above the form */}
          {isError && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Creation Failed</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unexpected error occurred.'} Please
                check the form fields or try again later.
              </AlertDescription>
            </Alert>
          )}

          <PatientForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePatientPage;
