// src/presentation/organisms/PatientTable.tsx
import React from 'react';
import type { Patient } from '@domain/patients/patientTypes';
import { format } from 'date-fns';
import { Button } from "@/presentation/atoms";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/presentation/atoms/display/table";
import { Badge } from "@/presentation/atoms"; // Use index
import { Skeleton } from "@/presentation/atoms"; // Use index
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/atoms';
import { Terminal, FileText } from "lucide-react";
import type { ClinicalRecord } from "@domain/clinical-records/clinicalRecordTypes";

interface PatientTableProps {
  patients: Patient[];
  isLoading?: boolean; // Optional loading state for skeleton rows
}

/**
 * Renders a table displaying a list of patients.
 * Includes handling for loading state via skeleton rows.
 * Rows are clickable to navigate to patient detail pages.
 */
const PatientTable: React.FC<PatientTableProps> = ({ patients, isLoading = false }) => {
  const navigate = useNavigate();

  const handleRowClick = (patientId: string) => {
    navigate(`/patients/${patientId}`); // Navigate to detail page
  };

  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-24" data-testid="skeleton" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" data-testid="skeleton" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" data-testid="skeleton" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" data-testid="skeleton" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" data-testid="skeleton" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Table>
      <TableCaption>A list of registered patients.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Date of Birth</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered On</TableHead> {/* Example: Created At */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && renderSkeletonRows(5)} 
        {!isLoading && patients.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No patients found.
            </TableCell>
          </TableRow>
        )}
        {!isLoading && patients.map((patient) => (
          <TableRow
            key={patient.id}
            onClick={() => handleRowClick(patient.id)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell className="font-medium">{patient.first_name}</TableCell>
            <TableCell>{patient.last_name}</TableCell>
            <TableCell>{patient.date_of_birth}</TableCell>
            <TableCell>
              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                {patient.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PatientTable;
