// src/presentation/organisms/PatientForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'; // Added act
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event'; // Import userEvent
import PatientForm from './PatientForm';
import { BrowserRouter } from 'react-router-dom'; // If any internal links are used

// Mock ResizeObserver specifically for this test file
// This might be necessary if the global setup isn't sufficient for Radix Select
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Mock child atoms if they cause issues or have complex internal state
// Usually not needed for basic form tests unless they prevent interaction

// Helper to wrap with necessary providers if form relies on context or routing
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>); // Simple Router wrap for now
};

describe('PatientForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all form fields', () => {
    renderWithProviders(<PatientForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Patient/i })).toBeInTheDocument();
  });

  it('should display validation errors for required fields', async () => {
    renderWithProviders(<PatientForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByRole('button', { name: /Create Patient/i });

    fireEvent.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth is required')).toBeInTheDocument();
      // Status has a default, so no error expected initially
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should display validation error for invalid date format', async () => {
  // Setup userEvent
  const user = userEvent.setup();
  renderWithProviders(<PatientForm onSubmit={mockOnSubmit} />);
    const firstNameInput = screen.getByLabelText(/First Name/i);
  const lastNameInput = screen.getByLabelText(/Last Name/i);
  const dobInput = screen.getByLabelText(/Date of Birth/i);
  const submitButton = screen.getByRole('button', { name: /Create Patient/i });

  // Fill required fields
  await user.type(firstNameInput, 'Test');
  await user.type(lastNameInput, 'Patient');

    // Provide input that satisfies min length but fails regex format
    // Use fireEvent.change for date input specifically
    fireEvent.change(dobInput, { target: { value: '01-01-2000' } });
    // await user.clear(dobInput);
    // await user.type(dobInput, '01-01-2000');

  // Submit
  await user.click(submitButton);

  // Check for the specific format error message
  const errorMessage = await screen.findByText('Date of Birth must be in YYYY-MM-DD format');
    expect(errorMessage).toBeInTheDocument();
  expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with correct data when form is valid', async () => {
    // Setup userEvent
  const user = userEvent.setup();
  renderWithProviders(<PatientForm onSubmit={mockOnSubmit} />);

  const firstNameInput = screen.getByLabelText(/First Name/i);
  const lastNameInput = screen.getByLabelText(/Last Name/i);
  const dobInput = screen.getByLabelText(/Date of Birth/i);
    const statusSelectTrigger = screen.getByRole('combobox'); // Shadcn select trigger
  const submitButton = screen.getByRole('button', { name: /Create Patient/i });

  // Fill in valid data using userEvent
  await user.type(firstNameInput, 'Test');
    await user.type(lastNameInput, 'Patient');
  await user.type(dobInput, '2000-01-01');

  // Select a status (Inactive) using userEvent
  await user.click(statusSelectTrigger); // Open dropdown
  const inactiveOption = await screen.findByRole('option', { name: 'Inactive' }, { timeout: 3000 }); // Increased timeout
  await user.click(inactiveOption); // Select option

  // Ensure state updates propagate before submitting
  await act(async () => {
    // Small delay might help in some cases, though usually not needed with userEvent
    await new Promise((r) => setTimeout(r, 50));
  });

  // Submit using userEvent
  await user.click(submitButton);

    // Assertions (remain the same, wrapped in waitFor for onSubmit mock)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'Test',
        last_name: 'Patient',
        date_of_birth: '2000-01-01',
        status: 'inactive',
      });
    });
  });

  it('should disable submit button when isLoading is true', () => {
    renderWithProviders(<PatientForm onSubmit={mockOnSubmit} isLoading={true} />);
    const submitButton = screen.getByRole('button', { name: /Saving.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should populate default values if provided (for edit mode)', () => {
    const defaultData = {
      first_name: 'Existing',
      last_name: 'User',
      date_of_birth: '1995-05-05',
      status: 'discharged' as const,
    };
    renderWithProviders(<PatientForm onSubmit={mockOnSubmit} defaultValues={defaultData} />);

    expect(screen.getByLabelText(/First Name/i)).toHaveValue(defaultData.first_name);
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue(defaultData.last_name);
    expect(screen.getByLabelText(/Date of Birth/i)).toHaveValue(defaultData.date_of_birth);
    // Check selected value in the trigger for Select component
    expect(screen.getByRole('combobox')).toHaveTextContent(/Discharged/i);
    // Check button text for update mode
    expect(screen.getByRole('button', { name: /Update Patient/i })).toBeInTheDocument();
  });
});
