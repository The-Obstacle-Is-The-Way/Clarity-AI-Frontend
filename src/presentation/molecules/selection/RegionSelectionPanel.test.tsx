/**
 * CLARITY-AI Neural Test Suite
 * RegionSelectionPanel testing with quantum precision
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// import userEvent from '@testing-library/user-event'; // Removed unused import
import RegionSelectionPanel from './RegionSelectionPanel';
// import type { BrainRegion } from '@/domain/types/brain/models'; // Removed unused import
import { render } from '../../../infrastructure/testing/utils/test-utils.unified'; // Correct relative path

// Mock data
const mockProps = {
  regions: [
    { id: 'region-1', name: 'Region 1', description: 'Desc 1' },
    { id: 'region-2', name: 'Region 2', description: 'Desc 2' },
  ],
  selectedRegionIds: ['region-1'],
  onRegionSelect: vi.fn(),
  onRegionHover: vi.fn(),
};

describe('RegionSelectionPanel', () => {
  it('renders with neural precision', async () => {
    render(<RegionSelectionPanel {...mockProps} />);

    // Wait for the list items (regions) to appear
    await waitFor(() => {
      expect(screen.getByText('Region 1')).toBeInTheDocument();
      expect(screen.getByText('Region 2')).toBeInTheDocument();
      // Check if the selected region has the correct class
      const region1Element = screen.getByText('Region 1');
      // Find the parent div that likely holds the background class
      const region1Container = region1Element.closest('div[class*="px-3 py-1"]'); 
      expect(region1Container).toHaveClass('bg-blue-500/30'); // Check for the selection class
    });
  });

  it('responds to user interaction with quantum precision', async () => {
    const onRegionSelectMock = vi.fn();
    render(<RegionSelectionPanel {...mockProps} onRegionSelect={onRegionSelectMock} />);

    // Wait for the non-selected region button
    const region2Button = await screen.findByText('Region 2');
    region2Button.click(); // Simulate click

    // Assert the callback was called with the region ID and the new selected state (true)
    expect(onRegionSelectMock).toHaveBeenCalledWith('region-2', true);
  });

  // Add more component-specific tests
});
