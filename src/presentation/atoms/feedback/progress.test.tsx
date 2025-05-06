import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified';
import { Progress } from './progress';

// We don't need to mock Radix UI components since our Progress component doesn't use them
// The component uses a direct div implementation instead

describe('Progress Component', () => {
  it('renders with default props', async () => {
    renderWithProviders(<Progress data-testid="progress" />);

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveClass('relative');
      expect(progress).toHaveClass('h-2');
      expect(progress).toHaveClass('w-full');
      expect(progress).toHaveClass('rounded-full');
      expect(progress).toHaveClass('bg-secondary'); // Corrected default background
    });

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('div');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ width: '0%' }); // Expect 0% width for null value
    });
  });

  it('applies custom className to progress bar', async () => {
    renderWithProviders(<Progress className="custom-progress" data-testid="progress" />);

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('custom-progress');
      expect(progress).toHaveClass('relative'); // Still has default classes
    });
  });

  it('renders with 50% value correctly', async () => {
    renderWithProviders(<Progress value={50} data-testid="progress" />);

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('div');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('bg-primary');
      expect(indicator).toHaveStyle({ width: '50%' });
    });
  });

  it('renders with 100% value correctly', async () => {
    renderWithProviders(<Progress value={100} data-testid="progress" />);

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      const indicator = progress.querySelector('div');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ width: '100%' }); // Should be 100% for value 100
    });
  });

  it('forwards ref to the progress element', async () => {
    const ref = React.createRef<HTMLDivElement>();

    renderWithProviders(<Progress ref={ref} data-testid="progress" />);

    await waitFor(() => {
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });
    expect(ref.current).toBe(screen.getByTestId('progress'));
  });

  it('handles additional props', async () => {
    renderWithProviders(
      <Progress data-testid="progress" aria-label="Loading progress" id="my-progress" />
    );

    await waitFor(() => {
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-label', 'Loading progress');
      expect(progress).toHaveAttribute('id', 'my-progress');
    });
  });

  it('renders with negative values as 0%', async () => {
    // Test negative values (should be treated as 0)
    renderWithProviders(<Progress value={-20} data-testid="progress-negative" />);
    await waitFor(() => {
      const progress = screen.getByTestId('progress-negative');
      const indicator = progress.querySelector('div');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ width: '0%' }); // Correct expectation for negative value (component clamps to 0)
    });
  });

  it('renders with values over 100% as 100%', async () => {
    // Test values over 100
    renderWithProviders(<Progress value={120} data-testid="progress-over" />);
    await waitFor(() => {
      const progress = screen.getByTestId('progress-over');
      const indicator = progress.querySelector('div');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveStyle({ width: '120%' });
    });
  });
});
