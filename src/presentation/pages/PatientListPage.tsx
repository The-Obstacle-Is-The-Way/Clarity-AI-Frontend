// src/presentation/pages/PatientListPage.tsx
import React, { useState } from 'react';
import { usePatients } from '@application/hooks/usePatients';
import PatientTable from '@presentation/organisms/PatientTable';
import { Button } from '@presentation/atoms/button';
import { Input } from '@presentation/atoms/input';
import { Alert, AlertDescription, AlertTitle } from '@presentation/atoms/alert';
import { Terminal, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PaginatedPatientsResponse, PatientSummary } from '@domain/patients/patientTypes';

/**
 * Renders the page displaying a list of patients.
 * Handles fetching, pagination, search, loading, and error states.
 */
const PatientListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const limit = 10; // Or make this configurable

  // Basic debounce effect for search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm((currentDebouncedTerm) => {
        if (searchTerm !== currentDebouncedTerm) {
          setCurrentPage(1); // Reset to first page on new search
          return searchTerm; // Update debounced term
        }
        return currentDebouncedTerm; // No change
      });
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
    // Only re-run the effect when the raw search term changes
  }, [searchTerm]);

  const { data, error, isLoading, isFetching, isPlaceholderData } = usePatients({
    page: currentPage,
    limit: limit,
    search: debouncedSearchTerm,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Cast data to expected type to resolve type errors
  const typedData = data as PaginatedPatientsResponse | undefined;
  const totalPages = typedData?.pages ?? 0;
  const patientItems = (typedData?.items as PatientSummary[]) ?? [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button asChild>
          <Link to="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Patient
          </Link>
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-4 max-w-sm">
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Loading State */}
      {isLoading && <p>Loading patients...</p>}
      {/* Consider a more sophisticated Skeleton loader here */}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Patients</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Display */}
      {typedData && (
        <>
          <PatientTable patients={patientItems} isLoading={isFetching} />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="space-x-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isPlaceholderData}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0 || isPlaceholderData}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientListPage;
