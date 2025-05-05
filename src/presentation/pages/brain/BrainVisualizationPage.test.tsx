/**
 * CLARITY-AI Neural Test Suite
 * BrainVisualizationPage testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrainVisualizationPage from './BrainVisualizationPage';

// Mock the hooks that would otherwise cause issues in tests
vi.mock('@application/context/BrainVisualizationContext', () => ({
  useBrainVisualizationContext: vi.fn(() => ({
    isLoading: true, // Set to true to test loading state
    visualizationState: { mode: 'anatomical' },
  })),
}));

vi.mock('@application/hooks/useBrainModel', () => ({
  useBrainModel: vi.fn(() => ({
    brainModel: { id: 'test', regions: [] },
    isLoading: true, // Set to true to test loading state
  })),
}));

// Explicitly mock the component that would render a Canvas/WebGL content
vi.mock('@presentation/organisms/BrainVisualizationContainer', () => ({
  default: () => <div data-testid="mock-brain-vis-container">Mocked Brain Vis Container</div>,
}));

describe('BrainVisualizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(<BrainVisualizationPage />);
    
    // Check that loading text is in the document
    expect(screen.getByText('Loading Brain Visualization...')).toBeInTheDocument();
    
    // Check that the loading indicator is present
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('shows proper loading UI', () => {
    render(<BrainVisualizationPage />);
    
    // Look for loading container
    const loadingContainer = screen.getByText('Loading Brain Visualization...');
    expect(loadingContainer).toBeInTheDocument();
    
    // Verify loading spinner exists
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
  });
});
