// src/presentation/pages/PatientListPage.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import PatientListPage from './PatientListPage';
import { usePatients } from '@application/hooks/usePatients';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@application/hooks/usePatients');
vi.mock('@presentation/organisms/PatientTable', () => ({
  // Simple mock that just displays number of patients
  default: ({ patients }: { patients: unknown[] }): React.ReactElement => (
    <div data-testid="patient-table">Patients: {patients.length}</div>
  ),
}));

// Helper to wrap component in necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PatientListPage', () => {
  const mockUsePatients = usePatients as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePatients.mockReturnValue({
      isLoading: false,
      data: { items: [], total: 0, page: 1, size: 10, pages: 0 },
      error: null,
      isPlaceholderData: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (vi.isMockFunction(setTimeout)) {
      vi.useRealTimers();
    }
  });

  it('should render loading state initially', () => {
    mockUsePatients.mockReturnValueOnce({
      isLoading: true,
      data: null,
      error: null,
    });
    renderWithProviders(<PatientListPage />);
    expect(screen.getByText(/Loading patients.../i)).toBeInTheDocument();
  });

  it('should display error message when fetching fails', () => {
    const errorMessage = 'Failed to fetch';
    mockUsePatients.mockReturnValueOnce({
      isLoading: false,
      data: null,
      error: new Error(errorMessage),
    });
    renderWithProviders(<PatientListPage />);
    expect(screen.getByText(/Error Fetching Patients/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render patient table with data', () => {
    const mockData = {
      items: [{ id: '1' }],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    };
    mockUsePatients.mockReturnValueOnce({
      isLoading: false,
      data: mockData,
      error: null,
      isPlaceholderData: false,
    });
    renderWithProviders(<PatientListPage />);
    expect(screen.getByTestId('patient-table')).toHaveTextContent('Patients: 1');
  });

  it('should handle pagination correctly', async () => {
    const user = userEvent.setup();
    const mockDataPage1 = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: `p1-${i}` })),
      total: 20,
      page: 1,
      size: 10,
      pages: 2,
    };
    const mockDataPage2 = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: `p2-${i}` })),
      total: 20,
      page: 2,
      size: 10,
      pages: 2,
    };

    // Initial render with page 1 data
    mockUsePatients.mockReturnValueOnce({
      isLoading: false,
      data: mockDataPage1,
      error: null,
      isPlaceholderData: false,
    });
    renderWithProviders(<PatientListPage />);
    expect(mockUsePatients).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

    // Mock response for page 2
    mockUsePatients.mockReturnValueOnce({
      isLoading: false,
      data: mockDataPage2,
      error: null,
      isPlaceholderData: false,
    });

    // Click next
    const nextButton = screen.getByRole('button', { name: /Next/i });
    await user.click(nextButton);

    // Wait for query to be called with page 2
    await waitFor(() => {
      expect(mockUsePatients).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
  });

  it('should update search term and trigger refetch after debounce', async () => {
    vi.useFakeTimers();
    // Setup userEvent with timers, disable artificial delay
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime, delay: null });

    renderWithProviders(<PatientListPage />);

    // Initial render call
    expect(mockUsePatients).toHaveBeenCalledTimes(1);
    expect(mockUsePatients).toHaveBeenCalledWith(expect.objectContaining({ search: '' }));

    const searchInput = screen.getByPlaceholderText(/Search patients.../i);
    // Use userEvent.type
    await user.type(searchInput, 'test search');

    // Assert before advancing timers
    expect(mockUsePatients).toHaveBeenCalledTimes(1);

    // Mock the return value for the expected second call
    // Ensure mocked data matches the expected structure (PaginatedPatientsResponse)
    const mockSearchResults = {
      items: [
        {
          id: 'found',
          first_name: 'Test',
          last_name: 'Found',
          date_of_birth: '2000-01-01',
          status: 'active',
          created_at: '',
          updated_at: '',
        },
      ],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    };
    mockUsePatients.mockReturnValue({
      isLoading: false,
      data: mockSearchResults,
      error: null,
      isPlaceholderData: false,
    });

    // Fast-forward time past the debounce period (500ms)
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Now the hook should be called with the new search term
    await waitFor(
      () => {
        expect(mockUsePatients).toHaveBeenCalledTimes(2);
      },
      { timeout: 10000 } // Increase waitFor timeout drastically
    );

    // Verify the arguments of the second call specifically
    expect(mockUsePatients).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ search: 'test search', page: 1 })
    );

    // Clean up timers
    vi.useRealTimers();
  });
});
