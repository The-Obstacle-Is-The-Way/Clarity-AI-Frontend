/**
 * CLARITY-AI Neural Test Suite
 * ErrorBoundary testing with quantum precision
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { render } from '../../infrastructure/testing/utils/test-utils.unified';

// Mock console.error to prevent polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

// A component that throws an error
const Bomb = () => {
  throw new Error('💥');
};

// Mock props for testing children rendering
const mockPropsChildren = {
  children: React.createElement('div', { 'data-testid': 'test-child' }, 'Test Child'),
};

// Mock props for testing error fallback
const mockPropsError = {
  children: React.createElement(Bomb),
};

describe('ErrorBoundary', () => {
  // Restore console.error after tests
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', async () => {
    render(<ErrorBoundary {...mockPropsChildren} />);

    // Wait for the child to render
    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('renders fallback UI when an error is thrown', async () => {
    render(<ErrorBoundary {...mockPropsError} />);

    // Wait for the fallback UI to appear
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/The error has been logged/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      // Optionally check that the child component is NOT rendered
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });
  });

  // Add more component-specific tests
}); 