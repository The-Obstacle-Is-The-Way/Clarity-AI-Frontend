import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified';
import { Input } from './input';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-10');
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
  });

  it('accepts custom className', () => {
    renderWithProviders(<Input data-testid="test-input" className="custom-class" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass('flex'); // Should still have default classes
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    renderWithProviders(<Input data-testid="test-input" ref={ref} />);

    const input = screen.getByTestId('test-input');
    expect(ref.current).toBe(input);
  });

  it('handles type attribute correctly', () => {
    renderWithProviders(<Input data-testid="test-input" type="password" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(<Input data-testid="test-input" disabled />);

    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('handles placeholder correctly', () => {
    const placeholder = 'Enter text here';
    renderWithProviders(<Input data-testid="test-input" placeholder={placeholder} />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', placeholder);
  });
});
