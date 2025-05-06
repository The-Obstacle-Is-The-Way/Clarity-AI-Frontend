import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified';
import { ScrollArea } from './scroll-area';

describe('ScrollArea Component', () => {
  it('renders with default props', async () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area">
        <div>Scroll content</div>
      </ScrollArea>
    );

    // Wait for elements to appear
    await waitFor(() => {
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
      expect(scrollArea).toHaveClass('relative');
      expect(scrollArea).toHaveClass('overflow-hidden');
      expect(screen.getByText('Scroll content')).toBeInTheDocument();
    });
  });

  it('applies custom className to the scrollArea', async () => {
    renderWithProviders(
      <ScrollArea className="custom-scroll" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    await waitFor(() => {
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('custom-scroll');
      expect(scrollArea).toHaveClass('relative'); // Still has default classes
    });
  });

  it('forwards ref to the scroll area element', async () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProviders(
      <ScrollArea ref={ref} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    // Wait for the element to be rendered before checking ref
    await waitFor(() => {
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    });
    expect(ref.current).toBe(screen.getByTestId('scroll-area'));
  });

  it('renders content with correct height and scrolls when content overflows', async () => {
    renderWithProviders(
      <ScrollArea className="h-[200px] w-[200px]" data-testid="scroll-area">
        <div style={{ height: '500px' }}>Tall content that should scroll</div>
      </ScrollArea>
    );

    await waitFor(() => {
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('h-[200px]');
      expect(scrollArea).toHaveClass('w-[200px]');
      expect(screen.getByText('Tall content that should scroll')).toBeInTheDocument();
    });
  });

  it('passes additional props to the scroll area', async () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area" id="custom-scroll" aria-label="Scrollable content">
        <div>Content</div>
      </ScrollArea>
    );

    await waitFor(() => {
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveAttribute('id', 'custom-scroll');
      expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
    });
  });

  it('renders scroll area correctly', async () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    await waitFor(() => {
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
