// src/presentation/organisms/ClinicalRecordList.tsx
import React, { useState } from 'react';
import { useClinicalRecords } from '@application/hooks/useClinicalRecords';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/atoms';
import { Skeleton } from '@/presentation/atoms';
import { Button } from '@/presentation/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/atoms/display/table';
import { Terminal, FileText } from 'lucide-react';
import type { ClinicalRecord } from '@domain/clinical-records/clinicalRecordTypes';

interface ClinicalRecordListProps {
  /** The ID of the patient whose records are being displayed */
  patientId: string | undefined;
}

const RECORDS_PER_PAGE = 10;

/**
 * Displays a list of clinical records for a given patient.
 * Handles fetching data, pagination, loading, and error states.
 */
const ClinicalRecordList: React.FC<ClinicalRecordListProps> = ({ patientId }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: recordsData,
    isLoading,
    isError,
    error,
    isFetching, // Use isFetching for background loading indicators
  } = useClinicalRecords({
    patientId: patientId,
    page: currentPage,
    limit: RECORDS_PER_PAGE,
    sortBy: 'record_date', // Default sort
    sortOrder: 'desc',
  });

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (recordsData && currentPage < recordsData.total_pages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      // Initial loading state
      return (
        <div className="space-y-2 mt-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Clinical Records</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      );
    }

    if (!recordsData || recordsData.records.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          No clinical records found for this patient.
        </div>
      );
    }

    // Display table with records
    return (
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recordsData.records.map((record: ClinicalRecord) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.record_date).toLocaleDateString()}</TableCell>
              <TableCell>{record.record_type}</TableCell>
              <TableCell>{record.summary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Clinical Records</h2>
      {isFetching && !isLoading && (
        <div className="text-sm text-gray-500 mb-2">Updating records...</div>
      )}
      {renderContent()}

      {/* Pagination Controls */}
      {recordsData && recordsData.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-700">
            Page {recordsData.page} of {recordsData.total_pages} (Total: {recordsData.total_count}{' '}
            records)
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === recordsData.total_pages || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalRecordList;
