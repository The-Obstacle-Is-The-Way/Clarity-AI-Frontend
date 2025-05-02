// src/presentation/pages/PatientListPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

  // Implement the skipped test for search functionality
  it('should update search term and trigger refetch after debounce', async () => {
    // Set up fake timers to control debounce
    vi.useFakeTimers();
    
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    // Initial render
    const mockData = {
      items: [{ id: '1', first_name: 'John', last_name: 'Doe' }],
      total: 1,
      page: 1,
      size: 10,
      pages: 1,
    };
    
    mockUsePatients.mockReturnValue({
      isLoading: false,
      data: mockData,
      error: null,
      isPlaceholderData: false,
    });
    
    renderWithProviders(<PatientListPage />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText(/Search patients/i);
    
    // Type in search box
    await user.type(searchInput, 'Smith');
    
    // Fast-forward past debounce timer
    await vi.advanceTimersByTimeAsync(500); // Assuming 300-500ms debounce
    
    // Verify the hook was called with the search term
    await waitFor(() => {
      expect(mockUsePatients).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'Smith' })
      );
    });
    
    // Restore real timers
    vi.useRealTimers();
  });
});
