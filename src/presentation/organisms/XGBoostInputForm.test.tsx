// src/presentation/organisms/XGBoostInputForm.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import XGBoostInputForm from './XGBoostInputForm';

// Mock the UI components from Shadcn since they're not available in tests
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, value, ...props }: any) => <option value={value} {...props}>{children}</option>,
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: (props: any) => <span {...props} />,
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