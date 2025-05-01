// src/presentation/pages/PatientDetailPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientDetailPage from './PatientDetailPage';
import { usePatientDetail } from '@application/hooks/usePatientDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom'; // Use MemoryRouter
import type { Patient } from '@domain/patients/patientTypes';

// Mock dependencies
vi.mock('@application/hooks/usePatientDetail');
vi.mock('@presentation/organisms/PatientDetailCard', () => ({
  default: ({ patient }: { patient: Patient }) => (
    <div data-testid="patient-detail-card">Patient: {patient.first_name} {patient.last_name}</div>
  ),
}));

// Helper to wrap component in necessary providers and routes
const renderWithProvidersAndRoutes = (initialEntries: string[]) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          {/* Add other routes if needed for navigation checks */}
          <Route path="/patients" element={<div>Patient List Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PatientDetailPage', () => {
  const mockUsePatientDetail = usePatientDetail as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks
  });

  it('should extract patientId from URL and call usePatientDetail hook', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: true, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    expect(mockUsePatientDetail).toHaveBeenCalledWith('test-id-123');
  });

  it('should render loading state', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: true, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument(); // Check for skeleton presence
    expect(screen.queryByTestId('patient-detail-card')).not.toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Patient not found';
    mockUsePatientDetail.mockReturnValue({ isLoading: false, data: null, error: new Error(errorMessage), isError: true });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    expect(screen.getByText(/Error Fetching Patient Details/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId('patient-detail-card')).not.toBeInTheDocument();
  });

  it('should render PatientDetailCard with patient data when loaded', () => {
    const mockPatient: Patient = {
      id: 'test-id-123',
      first_name: 'Detailed',
      last_name: 'Patient',
      date_of_birth: '1990-01-01',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsePatientDetail.mockReturnValue({ isLoading: false, data: mockPatient, error: null, isError: false });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);

    expect(screen.getByTestId('patient-detail-card')).toBeInTheDocument();
    expect(screen.getByText('Patient: Detailed Patient')).toBeInTheDocument(); // Check mock card content
    expect(screen.getByRole('heading', { name: /Patient Details - Detailed Patient/i })).toBeInTheDocument();
  });

   it('should render back button link', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: false, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    const backButtonLink = screen.getByRole('link', { name: /Back to Patients/i });
    expect(backButtonLink).toBeInTheDocument();
    expect(backButtonLink).toHaveAttribute('href', '/patients');
  });

});
