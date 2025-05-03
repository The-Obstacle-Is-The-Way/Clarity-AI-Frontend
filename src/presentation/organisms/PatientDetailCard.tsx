// src/presentation/organisms/PatientDetailCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/atoms';
import { Badge } from '@/presentation/atoms';
import { cn } from '@/lib/utils';
import type { Patient } from '@domain/patients/patientTypes';
import { User } from 'lucide-react';

interface PatientDetailCardProps {
  patient: Patient;
}

/**
 * Displays the details of a single patient in a card format.
 */
const PatientDetailCard: React.FC<PatientDetailCardProps> = ({ patient }) => {
  if (!patient) {
    return <div>Loading patient details...</div>;
  }

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <p className="text-base">{value || 'N/A'}</p>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" /> Patient Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="First Name" value={patient.first_name} />
        <DetailItem label="Last Name" value={patient.last_name} />
        <DetailItem label="Date of Birth" value={patient.date_of_birth} />
        <DetailItem 
          label="Status" 
          value={
            <Badge variant={patient.status === 'active' ? 'secondary' : 'destructive'}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1).replace('_', ' ')}
            </Badge>
          }
        />
        <DetailItem label="Last Updated" value={new Date(patient.updated_at).toLocaleString()} />
        {/* Example: <DetailItem label="Primary Diagnosis" value={patient.primary_diagnosis_code} /> */}
      </CardContent>
    </Card>
  );
};

export default PatientDetailCard;
