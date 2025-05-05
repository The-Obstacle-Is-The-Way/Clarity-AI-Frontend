// src/presentation/pages/PatientDetailPage.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientDetailPage from './PatientDetailPage';
import { usePatientDetail } from '@application/hooks/usePatientDetail';
import { useUpdatePatient } from '@application/hooks/useUpdatePatient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Patient } from '@domain/patients/patientTypes';

// Mock dependencies
vi.mock('@application/hooks/usePatientDetail');
vi.mock('@application/hooks/useUpdatePatient');
vi.mock('@application/hooks/useDeletePatient', () => ({
  useDeletePatient: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    isError: false,
  }),
}));

// Mock the PatientDetailCard component
vi.mock('@presentation/organisms/patient/PatientDetailCard', () => ({
  default: ({ patient }: { patient: Patient }) => (
    <div data-testid="patient-detail-card">
      Patient: {patient.first_name} {patient.last_name}
    </div>
  ),
}));

// Mock the PatientForm component
vi.mock('@presentation/organisms/patient/PatientForm', () => ({
  default: ({
    onSubmit,
    isLoading,
    defaultValues,
  }: {
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading: boolean;
    defaultValues?: Record<string, unknown>;
  }) => (
    <form
      data-testid="mock-patient-form"
      onSubmit={(e) => {
        e.preventDefault();
        // Simulate submitting updated data (can be simple)
        onSubmit({ ...defaultValues, first_name: 'Updated Name' });
      }}
    >
      <div data-testid="form-default-values">{JSON.stringify(defaultValues)}</div>
      <button type="submit" disabled={isLoading}>
        Submit Update
      </button>
    </form>
  ),
}));

// Mock the clinical records component
vi.mock('@presentation/organisms/clinical/ClinicalRecordList', () => ({
  default: () => <div data-testid="clinical-records">Clinical Records</div>,
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
  const mockMutate = vi.fn();
  const mockUseUpdatePatient = useUpdatePatient as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks
    // Default mock for update hook
    mockUseUpdatePatient.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
      isError: false,
    });
  });

  it('should extract patientId from URL and call usePatientDetail hook', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: true, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    expect(mockUsePatientDetail).toHaveBeenCalledWith('test-id-123');
  });

  it('should render loading state', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: true, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    // Check for multiple pulsing elements instead of a specific testid
    const pulsingElements = screen.queryAllByRole('status', { busy: true }); // Or query by class if more specific
    // Or, more generically, check for the container holding the pulses
    // Example: expect(screen.getByTestId('loading-container')).toBeInTheDocument();
    // Let's check for the presence of the pulsing divs structure shown in the error log
    const pulsingDivs = screen.queryAllByText('', { selector: 'div.animate-pulse' });
    expect(pulsingDivs.length).toBeGreaterThan(0); // Expect at least one pulsing element
    expect(screen.queryByTestId('patient-detail-card')).not.toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Patient not found';
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: null,
      error: new Error(errorMessage),
      isError: true,
    });
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
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);

    expect(screen.getByTestId('patient-detail-card')).toBeInTheDocument();
    expect(screen.getByText('Patient: Detailed Patient')).toBeInTheDocument(); // Check mock card content
    expect(
      screen.getByRole('heading', { name: /Patient Details - Detailed Patient/i })
    ).toBeInTheDocument();
  });

  it('should render back button link', () => {
    mockUsePatientDetail.mockReturnValue({ isLoading: false, data: null, error: null });
    renderWithProvidersAndRoutes(['/patients/test-id-123']);
    const backButtonLink = screen.getByRole('link', { name: /Back to Patients/i });
    expect(backButtonLink).toBeInTheDocument();
    expect(backButtonLink).toHaveAttribute('href', '/patients');
  });

  // --- Tests for Edit Functionality ---

  it('should show Edit button in view mode', () => {
    const mockPatient: Patient = {
      id: 'test-edit-1',
      first_name: 'Editable',
      last_name: 'User',
    } as Patient;
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes(['/patients/test-edit-1']);

    expect(screen.getByRole('button', { name: /Edit Patient/i })).toBeInTheDocument();
    expect(screen.queryByTestId('mock-patient-form')).not.toBeInTheDocument();
  });

  it('should switch to edit mode and render PatientForm when Edit button is clicked', async () => {
    // Make sure mockPatient includes all fields expected by the form/stringify
    const mockPatient: Patient = {
      id: 'test-edit-2',
      first_name: 'Initial',
      last_name: 'Name',
      date_of_birth: '1990-01-01', // Add fields expected in stringify
      status: 'active', // Add fields expected in stringify
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes(['/patients/test-edit-2']);

    const editButton = screen.getByRole('button', { name: /Edit Patient/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('mock-patient-form')).toBeInTheDocument();
      // Check if form received correct default values
      // Use the full mockPatient object for comparison as the mock stringifies it
      const expectedDefaultValues = {
        first_name: mockPatient.first_name,
        last_name: mockPatient.last_name,
        date_of_birth: mockPatient.date_of_birth,
        status: mockPatient.status,
        // Add other fields if the form expects them as defaultValues
      };
      expect(screen.getByTestId('form-default-values')).toHaveTextContent(
        JSON.stringify(expectedDefaultValues)
      );
      expect(screen.queryByTestId('patient-detail-card')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  it('should call update mutation when form is submitted in edit mode', async () => {
    const patientId = 'test-update-id';
    const mockPatient: Patient = {
      id: patientId,
      first_name: 'Before',
      last_name: 'Update',
    } as Patient;
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes([`/patients/${patientId}`]);

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Patient/i }));
    await waitFor(() => expect(screen.getByTestId('mock-patient-form')).toBeInTheDocument());

    // Submit the mocked form
    const submitButton = screen.getByRole('button', { name: /Submit Update/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        {
          patientId: patientId,
          patientData: expect.objectContaining({ first_name: 'Updated Name' }), // Data from mocked form submit
        },
        expect.any(Object) // Options object
      );
    });
  });

  it('should switch back to view mode when Cancel button is clicked', async () => {
    const mockPatient: Patient = {
      id: 'test-cancel-1',
      first_name: 'Cancel',
      last_name: 'Me',
    } as Patient;
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes(['/patients/test-cancel-1']);

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Patient/i }));
    await waitFor(() => expect(screen.getByTestId('mock-patient-form')).toBeInTheDocument());

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByTestId('patient-detail-card')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-patient-form')).not.toBeInTheDocument();
    });
  });

  it('should display update error message in edit mode', async () => {
    const updateError = new Error('Update conflict');
    mockUseUpdatePatient.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: updateError,
      isError: true,
    });
    const mockPatient: Patient = {
      id: 'test-error-update',
      first_name: 'Error',
      last_name: 'Case',
    } as Patient;
    mockUsePatientDetail.mockReturnValue({
      isLoading: false,
      data: mockPatient,
      error: null,
      isError: false,
    });
    renderWithProvidersAndRoutes(['/patients/test-error-update']);

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Patient/i }));
    await waitFor(() => expect(screen.getByTestId('mock-patient-form')).toBeInTheDocument());

    // Check if error message is displayed (doesn't require submitting as the hook is mocked)
    expect(screen.getByText(/Update Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Update conflict/i)).toBeInTheDocument();
  });
});
