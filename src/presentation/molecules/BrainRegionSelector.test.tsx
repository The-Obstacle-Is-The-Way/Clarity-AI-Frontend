/**
 * CLARITY-AI Neural Test Suite
 * BrainRegionSelector test with clinical precision
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest'; // Added vi import
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrainRegionSelector from './BrainRegionSelector';
import type { BrainRegionSelectorProps } from './BrainRegionSelector'; // Import the props type

describe('BrainRegionSelector', () => {
  it('renders with clinical precision', () => {
    // Add necessary mock props based on BrainRegionSelector's definition
    const mockProps: BrainRegionSelectorProps = {
      regions: [], // Provide empty array or mock BrainRegion objects
      selectedRegionId: undefined,
      onSelectRegion: vi.fn(),
    };
    render(<BrainRegionSelector {...mockProps} />);
    expect(screen.getByTestId('brainregionselector')).toBeInTheDocument();
  });
});
