// src/presentation/organisms/XGBoostInputForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import XGBoostInputForm from './XGBoostInputForm';

// Mock the UI components from Shadcn since they're not available in tests
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" {...props} />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }: React.ComponentProps<'select'>) => <select {...props}>{children}</select>,
  SelectContent: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value, ...props }: React.ComponentProps<'option'>) => <option value={value} {...props}>{children}</option>,
  SelectTrigger: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SelectValue: (_props: unknown) => null,
}));

describe('XGBoostInputForm', () => {
  it('renders the form with all fields', () => {
    const mockOnSubmit = vi.fn();
    
    render(
      <XGBoostInputForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );
    
    // Form should be visible
    expect(screen.getByTestId('xgboost-form')).toBeInTheDocument();
    
    // Check if submit button is present
    expect(screen.getByTestId('xgboost-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('xgboost-submit-button')).not.toBeDisabled();
  });
  
  it('disables the form when loading', () => {
    const mockOnSubmit = vi.fn();
    
    render(
      <XGBoostInputForm 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
      />
    );
    
    // Submit button should be disabled when loading
    expect(screen.getByTestId('xgboost-submit-button')).toBeDisabled();
    expect(screen.getByTestId('xgboost-submit-button')).toHaveTextContent('Running Prediction...');
  });
});