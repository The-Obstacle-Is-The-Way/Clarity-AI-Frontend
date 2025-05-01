import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../infrastructure/testing/utils/test-utils.unified';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<Alert data-testid="test-alert">Alert Content</Alert>);

      const alert = screen.getByTestId('test-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Alert Content');
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveAttribute('data-variant', 'default');
      expect(alert).toHaveClass('relative');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('p-4');
    });

    it('applies destructive variant classes correctly', () => {
      renderWithProviders(
        <Alert data-testid="test-alert" variant="destructive">
          Alert Content
        </Alert>
      );

      const alert = screen.getByTestId('test-alert');
      expect(alert).toHaveAttribute('data-variant', 'destructive');
      expect(alert).toHaveClass('border-destructive');
      expect(alert).toHaveClass('text-destructive');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <Alert data-testid="test-alert" className="custom-class">
          Alert Content
        </Alert>
      );

      const alert = screen.getByTestId('test-alert');
      expect(alert).toHaveClass('custom-class');
      expect(alert).toHaveClass('relative'); // Should still have default classes
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(
        <Alert data-testid="test-alert" ref={ref}>
          Alert Content
        </Alert>
      );

      const alert = screen.getByTestId('test-alert');
      expect(ref.current).toBe(alert);
    });
  });

  describe('AlertTitle', () => {
    it('renders correctly', () => {
      renderWithProviders(<AlertTitle data-testid="test-title">Alert Title</AlertTitle>);

      const title = screen.getByTestId('test-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Alert Title');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('mb-1');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <AlertTitle data-testid="test-title" className="custom-title">
          Alert Title
        </AlertTitle>
      );

      const title = screen.getByTestId('test-title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('font-medium'); // Should still have default classes
    });
  });

  describe('AlertDescription', () => {
    it('renders correctly', () => {
      renderWithProviders(
        <AlertDescription data-testid="test-desc">Alert Description</AlertDescription>
      );

      const desc = screen.getByTestId('test-desc');
      expect(desc).toBeInTheDocument();
      expect(desc).toHaveTextContent('Alert Description');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('opacity-90');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <AlertDescription data-testid="test-desc" className="custom-desc">
          Alert Description
        </AlertDescription>
      );

      const desc = screen.getByTestId('test-desc');
      expect(desc).toHaveClass('custom-desc');
      expect(desc).toHaveClass('text-sm'); // Should still have default classes
    });
  });

  describe('Alert Components Integration', () => {
    it('renders a complete alert with all subcomponents', () => {
      renderWithProviders(
        <Alert data-testid="full-alert">
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>This is the alert description.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('full-alert');
      expect(alert).toBeInTheDocument();
      
      // Check content is rendered correctly
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('This is the alert description.')).toBeInTheDocument();
      
      // Verify parent-child relationships
      expect(alert).toHaveTextContent('Alert Title');
      expect(alert).toHaveTextContent('This is the alert description.');
    });
  });
}); 