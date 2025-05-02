// src/presentation/pages/PatientListPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PatientListPage from './PatientListPage';
import { usePatients } from '@application/hooks/usePatients';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@application/hooks/usePatients');
vi.mock('@presentation/organisms/PatientTable', () => ({
  // Simple mock that just displays number of patients
  default: ({ patients }: { patients: unknown[] }) => ( // Use unknown[] instead of any[]
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
    vi.clearAllMocks(); // Clear mocks before each test
    // Minimal setup: Only mock the initial return value needed for render
    mockUsePatients.mockReturnValue({
        isLoading: false,
        data: { items: [], total: 0, page: 1, size: 10, pages: 0 }, // Empty initial data
        error: null,
    });
  });

  afterEach(() => {
      vi.restoreAllMocks();
      if (vi.isMockFunction(setTimeout)) { // Ensure timers are restored if faked
          vi.useRealTimers();
      }
  });

  it('should render loading state initially', () => {
    mockUsePatients.mockReturnValue({ isLoading: true, data: null, error: null });
    renderWithProviders(<PatientListPage />);
    expect(screen.getByText(/Loading patients.../i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to fetch';
    mockUsePatients.mockReturnValue({ isLoading: false, data: null, error: new Error(errorMessage) });
    renderWithProviders(<PatientListPage />);
    expect(screen.getByText(/Error Fetching Patients/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render patient table and pagination when data is loaded', () => {
    const mockData = {
      items: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      size: 10,
      pages: 1,
    };
    mockUsePatients.mockReturnValue({ isLoading: false, data: mockData, error: null });
    renderWithProviders(<PatientListPage />);

    expect(screen.getByTestId('patient-table')).toHaveTextContent('Patients: 2');
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('should handle pagination clicks', async () => {
     const mockDataPage1 = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: `p${i + 1}` })),
      total: 25,
      page: 1,
      size: 10,
      pages: 3,
    };
     const mockDataPage2 = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: `p${i + 11}` })),
      total: 25,
      page: 2,
      size: 10,
      pages: 3,
    };

    // Initial render page 1
    mockUsePatients.mockReturnValue({ isLoading: false, data: mockDataPage1, error: null, isPreviousData: false });
    renderWithProviders(<PatientListPage />);

    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(nextButton).toBeEnabled();

    // Simulate data for page 2 after click
    mockUsePatients.mockReturnValue({ isLoading: false, data: mockDataPage2, error: null, isPreviousData: false });
    fireEvent.click(nextButton);

    // Check if usePatients was called with page 2 (hook handles the state update)
    // We assert the effect: pagination display updates
    // Note: In a real scenario, React Query handles the refetch and state update.
    // We re-render or assert based on the *mocked* hook return value changing.
    waitFor(() => {
       expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument(); // This might require adjustments based on how state updates
       expect(usePatients).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  it('should update search term and trigger refetch after debounce', async () => {
    vi.useFakeTimers(); // Use fake timers for debounce

    renderWithProviders(<PatientListPage />);

    // Initial render call
    expect(mockUsePatients).toHaveBeenCalledTimes(1);
    expect(mockUsePatients).toHaveBeenCalledWith(expect.objectContaining({ search: '' }));

    const searchInput = screen.getByPlaceholderText(/Search patients.../i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // IMPORTANT: Assert *before* advancing timers
    // Expect NO additional calls yet
    expect(mockUsePatients).toHaveBeenCalledTimes(1);

    // Mock the return value *for the expected second call*
    mockUsePatients.mockReturnValueOnce({
        isLoading: false,
        data: { items: [{ id: 'found' }], total: 1, page: 1, size: 10, pages: 1 }, // Simulate search results
        error: null,
    });

    // Fast-forward time past the debounce period (500ms)
    act(() => {
       vi.advanceTimersByTime(500);
    });

    // Now the hook should be called with the new search term
    await waitFor(() => {
      expect(mockUsePatients).toHaveBeenCalledTimes(2);
    });
    // Verify the arguments of the second call specifically
    expect(mockUsePatients).toHaveBeenNthCalledWith(2, expect.objectContaining({ search: 'test search', page: 1 }));

    vi.useRealTimers(); // Restore real timers
  });

});
