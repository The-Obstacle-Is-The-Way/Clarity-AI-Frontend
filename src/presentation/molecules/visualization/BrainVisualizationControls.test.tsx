/**
 * BrainVisualizationControls - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrainVisualizationControls from './BrainVisualizationControls';
// import { type BrainRegion } from '@/domain/types/brain/brainRegionTypes'; // Removed unused import
import { render } from '../../../infrastructure/testing/utils/test-utils.unified'; // Correct relative path

// Minimal test to verify component can be imported
// Mock props
const mockProps = {
  viewMode: 'normal' as const,
  rotationSpeed: 1,
  rotationEnabled: true,
  onViewModeChange: vi.fn(),
  onRotationSpeedChange: vi.fn(),
  onRotationToggle: vi.fn(),
};

describe('BrainVisualizationControls', () => {
  it('renders controls correctly', async () => {
    render(<BrainVisualizationControls {...mockProps} />);

    // Wait for elements to render (accounts for provider delays)
    await waitFor(() => {
      expect(screen.getByText('View:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Normal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Activity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Connections/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rotation: On/i })).toBeInTheDocument();
      expect(screen.getByText('Speed:')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  // Basic interaction test example
  it('calls onViewModeChange when a view button is clicked', async () => {
    render(<BrainVisualizationControls {...mockProps} />);

    // Wait for the button to be present
    const activityButton = await screen.findByRole('button', { name: /Activity/i });
    fireEvent.click(activityButton);

    // Assert the mock was called
    expect(mockProps.onViewModeChange).toHaveBeenCalledWith('activity');
  });
});
