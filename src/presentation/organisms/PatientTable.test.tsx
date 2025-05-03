// src/presentation/organisms/PatientTable.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PatientTable from './PatientTable';
import { BrowserRouter } from 'react-router-dom'; // Needed for useNavigate
import type { Patient } from '@domain/patients/patientTypes';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock atoms used by the table if necessary (optional, depends on complexity)
vi.mock('@presentation/atoms/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));
vi.mock('@presentation/atoms/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className}></div>
  ),
}));

// Helper to wrap component in necessary providers
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('PatientTable', () => {
  const mockPatients: Patient[] = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1985-06-15',
      status: 'active',
      created_at: '2023-01-10T10:00:00Z',
      updated_at: '2023-01-10T10:00:00Z',
    },
    {
      id: '2',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1992-11-20',
      status: 'inactive',
      created_at: '2023-02-15T11:30:00Z',
      updated_at: '2023-02-15T11:30:00Z',
    },
  ];

  it('should render table headers correctly', () => {
    renderWithRouter(<PatientTable patients={[]} />);
    expect(screen.getByRole('columnheader', { name: /First Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Date of Birth/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Registered On/i })).toBeInTheDocument();
  });

  it('should render patient data correctly', () => {
    renderWithRouter(<PatientTable patients={mockPatients} />);
    expect(screen.getByRole('cell', { name: 'John' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Doe' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1985-06-15' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'active' })).toBeInTheDocument(); // Check status text
    expect(
      screen.getByText(new Date(mockPatients[0].created_at).toLocaleDateString())
    ).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'Jane' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Smith' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'inactive' })).toBeInTheDocument();
  });

  it('should render "No patients found." message when patients array is empty', () => {
    renderWithRouter(<PatientTable patients={[]} />);
    expect(screen.getByText(/No patients found./i)).toBeInTheDocument();
  });

  it('should call navigate function with correct patientId on row click', () => {
    renderWithRouter(<PatientTable patients={mockPatients} />);
    const johnDoeRow = screen.getByRole('cell', { name: 'John' }).closest('tr');
    expect(johnDoeRow).not.toBeNull();
    if (johnDoeRow) {
      fireEvent.click(johnDoeRow);
      expect(mockedNavigate).toHaveBeenCalledWith('/patients/1');
    }
  });

  it('should render skeleton rows when isLoading is true', () => {
    renderWithRouter(<PatientTable patients={[]} isLoading={true} />);
    const skeletonElements = screen.getAllByTestId('skeleton');
    // Expecting 5 skeleton rows * 5 columns = 25 skeleton divs
    expect(skeletonElements.length).toBe(25);
    expect(screen.queryByText(/No patients found./i)).not.toBeInTheDocument(); // Should not show no patients message
  });
});
