// src/presentation/organisms/PatientDetailCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/presentation/atoms";
import { Badge } from "@/presentation/atoms";
import { cn } from '@/lib/utils';
import type { Patient } from '@domain/patients/patientTypes';

interface PatientDetailCardProps {
  patient: Patient;
}

/**
 * Displays the details of a single patient in a card format.
 */
const PatientDetailCard: React.FC<PatientDetailCardProps> = ({ patient }) => {

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <p className="text-base">{value || 'N/A'}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{patient.first_name} {patient.last_name}</CardTitle>
        <CardDescription>Patient ID: {patient.id}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <DetailItem label="First Name" value={patient.first_name} />
        <DetailItem label="Last Name" value={patient.last_name} />
        <DetailItem label="Date of Birth" value={patient.date_of_birth} />
        <DetailItem label="Status">
             <Badge variant={patient.status === 'inactive' ? 'destructive' : 'default'}>
                {patient.status}
              </Badge>
        </DetailItem>
        <DetailItem label="Registered On" value={new Date(patient.created_at).toLocaleDateString()} />
        <DetailItem label="Last Updated" value={new Date(patient.updated_at).toLocaleString()} />
         {/* Add more fields as needed */}
        {/* Example: <DetailItem label="Primary Diagnosis" value={patient.primary_diagnosis_code} /> */}
      </CardContent>
    </Card>
  );
};

export default PatientDetailCard;
