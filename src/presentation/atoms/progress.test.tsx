import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../infrastructure/testing/utils/test-utils.unified';
import { Progress } from './progress';

// We don't need to mock Radix UI components since our Progress component doesn't use them
// The component uses a direct div implementation instead

describe('Progress Component', () => {
  it('renders with default props', () => {
    renderWithProviders(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();

    // Check default classes
    expect(progress).toHaveClass('relative');
    expect(progress).toHaveClass('h-2');
    expect(progress).toHaveClass('w-full');
    expect(progress).toHaveClass('rounded-full');
    expect(progress).toHaveClass('bg-secondary'); // Corrected default background

    // No indicator should be present when no value is provided
    // The component only renders the indicator when percentage is not null
    const indicator = progress.querySelector('div');
    expect(indicator).toBeNull();
  });

  it('applies custom className to progress bar', () => {
    renderWithProviders(<Progress className="custom-progress" data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('custom-progress');
    expect(progress).toHaveClass('relative'); // Still has default classes
  });

  it('renders with 50% value correctly', () => {
    renderWithProviders(<Progress value={50} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('div');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-primary');
    expect(indicator).toHaveStyle({ width: '50%' });
  });

  it('renders with 100% value correctly', () => {
    renderWithProviders(<Progress value={100} data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    const indicator = progress.querySelector('div');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ width: '100%' }); // Should be 100% for value 100
  });

  it('forwards ref to the progress element', () => {
    const ref = React.createRef<HTMLDivElement>();

    renderWithProviders(<Progress ref={ref} data-testid="progress" />);

    expect(ref.current).toBe(screen.getByTestId('progress'));
  });

  it('handles additional props', () => {
    renderWithProviders(
      <Progress data-testid="progress" aria-label="Loading progress" id="my-progress" />
    );

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading progress');
    expect(progress).toHaveAttribute('id', 'my-progress');
  });

  it('renders with negative values as 0%', () => {
    // Test negative values (should be treated as 0)
    renderWithProviders(<Progress value={-20} data-testid="progress-negative" />);
    const progress = screen.getByTestId('progress-negative');
    const indicator = progress.querySelector('div');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ width: '0%' }); // Correct expectation for negative value
  });

  it('renders with values over 100% as 100%', () => {
    // Test values over 100
    renderWithProviders(<Progress value={120} data-testid="progress-over" />);
    const progress = screen.getByTestId('progress-over');
    const indicator = progress.querySelector('div');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ width: '100%' }); // Correct expectation for value > 100
  });
});
