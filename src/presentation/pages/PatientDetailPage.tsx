// src/presentation/pages/PatientDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatientDetail } from '@application/hooks/usePatientDetail';
import PatientDetailCard from '@presentation/organisms/PatientDetailCard';
import { Alert, AlertDescription, AlertTitle } from "@presentation/atoms/alert";
import { Skeleton } from "@presentation/atoms/skeleton";
import { Terminal, ArrowLeft } from 'lucide-react';
import { Button } from "@presentation/atoms/button";

/**
 * Renders the detail page for a single patient.
 * Fetches patient data based on the ID from the URL parameter.
 */
const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient, error, isLoading, isError } = usePatientDetail(patientId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
        </div>
      );
    }

    if (isError || !patient) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred fetching patient details.';
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

    return <PatientDetailCard patient={patient} />;
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
        Patient Details {patient ? `- ${patient.first_name} ${patient.last_name}` : ''}
      </h1>
      {renderContent()}
      {/* Placeholder for other sections like Clinical Records, Analytics */}
    </div>
  );
};

export default PatientDetailPage;
