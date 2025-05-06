import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified';
import { Input } from './input';

describe('Input Component', () => {
  it('renders correctly with default props', async () => {
    renderWithProviders(<Input data-testid="test-input" />);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-10');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
    });
  });

  it('accepts custom className', async () => {
    renderWithProviders(<Input data-testid="test-input" className="custom-class" />);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex'); // Should still have default classes
    });
  });

  it('forwards ref correctly', async () => {
    const ref = React.createRef<HTMLInputElement>();
    renderWithProviders(<Input data-testid="test-input" ref={ref} />);

    await waitFor(() => {
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });
    expect(ref.current).toBe(screen.getByTestId('test-input'));
  });

  it('handles type attribute correctly', async () => {
    renderWithProviders(<Input data-testid="test-input" type="password" />);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('handles disabled state correctly', async () => {
    renderWithProviders(<Input data-testid="test-input" disabled />);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  it('handles placeholder correctly', async () => {
    const placeholder = 'Enter text here';
    renderWithProviders(<Input data-testid="test-input" placeholder={placeholder} />);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('placeholder', placeholder);
    });
  });
});
