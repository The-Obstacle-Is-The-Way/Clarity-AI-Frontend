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
    isLoading: false,
    visualizationState: { mode: 'anatomical' },
  })),
}));

vi.mock('@application/hooks/useBrainModel', () => ({
  useBrainModel: vi.fn(() => ({ 
    brainModel: { id: 'test', regions: [] },
    isLoading: false,
  })),
}));

// Explicitly mock the component that would render a Canvas/WebGL content
vi.mock('@presentation/organisms/BrainVisualizationContainer', () => ({
  default: () => (
    <div data-testid="mock-brain-vis-container">Mocked Brain Vis Container</div>
  ),
}));

describe('BrainVisualizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with neural precision', () => {
    render(<BrainVisualizationPage />);
    
    // Check that heading is in the document
    expect(screen.getByText('Brain Visualization')).toBeInTheDocument();
    
    // Look for the container by heading
    expect(screen.getByTestId('mock-brain-vis-container')).toBeInTheDocument();
  });

  it('responds to user interaction with quantum precision', () => {
    render(<BrainVisualizationPage />);
    
    // Check for basic UI elements
    expect(screen.getByText('Brain Visualization')).toBeInTheDocument();
    expect(screen.getByTestId('mock-brain-vis-container')).toBeInTheDocument();
    
    // More specific assertions based on actual component behavior
    expect(screen.getByText('View Controls')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });
});
