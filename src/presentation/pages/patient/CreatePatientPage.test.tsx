// src/presentation/pages/CreatePatientPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreatePatientPage from './CreatePatientPage';
import { useCreatePatient } from '@application/hooks/useCreatePatient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock dependencies
vi.mock('@application/hooks/useCreatePatient');
vi.mock('@presentation/organisms/PatientForm', () => ({
  // Mock form that captures onSubmit prop and respects isLoading
  default: ({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading?: boolean }) => (
    <form
      data-testid="mock-patient-form"
      onSubmit={(e) => {
        e.preventDefault();
        // Simulate submitting some data only if not loading
        if (!isLoading) {
          onSubmit({
            first_name: 'Mocked',
            last_name: 'Submit',
            date_of_birth: '2024-01-01',
            status: 'active',
          });
        }
      }}
    >
      {/* Ensure button is disabled based on isLoading prop */}
      <button type="submit" disabled={isLoading ?? false}>
        Submit Mock Form
      </button>
    </form>
  ),
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ), // Simple link mock
  };
});

// Helper
const renderWithProviders = (initialEntries: string[] = ['/patients/new']) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/patients/new" element={<CreatePatientPage />} />
          <Route path="/patients" element={<div>Patient List Page</div>} />
          {/* Add other routes if needed */}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CreatePatientPage', () => {
  const mockMutate = vi.fn();
  const mockUseCreatePatient = useCreatePatient as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock return value for each test
    mockUseCreatePatient.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      isError: false,
    });
  });

  it('should render the page title and the patient form', () => {
    renderWithProviders();
    expect(screen.getByRole('heading', { name: /Create New Patient/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-patient-form')).toBeInTheDocument();
  });

  it('should call the createPatient mutation on form submission', async () => {
    renderWithProviders();
    const submitButton = screen.getByRole('button', { name: /Submit Mock Form/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      // Check if called with the data from the mocked form
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Mocked', last_name: 'Submit' }),
        expect.any(Object) // For the options object { onSuccess, onError }
      );
    });
  });

  it('should navigate to /patients on successful mutation', async () => {
    // Redefine mockMutate for this specific test to simulate success
    mockMutate.mockImplementation((_data, options) => {
      // Call the onSuccess callback provided to the hook
      if (options?.onSuccess) {
        options.onSuccess({
          id: 'new-id',
          first_name: 'New',
          last_name: 'Patient' /* ...other fields */,
        });
      }
    });
    mockUseCreatePatient.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      isError: false,
    });

    renderWithProviders();
    const submitButton = screen.getByRole('button', { name: /Submit Mock Form/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/patients');
    });
  });

  it('should display loading state on the form button during mutation', () => {
    mockUseCreatePatient.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
      isError: false,
    });
    renderWithProviders();
    expect(screen.getByRole('button', { name: /Submit Mock Form/i })).toBeDisabled();
  });

  it('should display error message if mutation fails', () => {
    const error = new Error('Network Error');
    mockUseCreatePatient.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: error,
      isError: true,
    });
    renderWithProviders();
    expect(screen.getByText(/Creation Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
  });

  it('renders the back button link', () => {
    renderWithProviders();
    const backButtonLink = screen.getByRole('link', { name: /Back to Patients/i });
    expect(backButtonLink).toBeInTheDocument();
    expect(backButtonLink).toHaveAttribute('href', '/patients');
  });
});
