/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite - Debug Version
 */

/// <reference types="vitest" />

import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { BrainModel } from '@domain/types/brain/models';
import { useBrainVisualization } from './useBrainVisualization';

// Define the mock brain model data directly in the test file
const mockBrainModel: BrainModel = {
  id: 'test-brain-model',
  patientId: 'test-patient',
  regions: [
    {
      id: 'test-region',
      name: 'Test Region',
      position: { x: 0, y: 0, z: 0 },
      color: '#ff0000',
      connections: ['other-region'],
      activityLevel: 0.5,
      isActive: true,
      hemisphereLocation: 'left',
      dataConfidence: 0.8,
      volumeMl: 100,
      riskFactor: 0.2,
      clinicalSignificance: 'normal',
      tissueType: 'gray',
      volume: 1500,
      activity: 0.5,
    },
  ],
  connections: [
    {
      id: 'test-connection',
      sourceId: 'test-region',
      targetId: 'other-region',
      strength: 0.7,
      type: 'excitatory',
      directionality: 'bidirectional',
      activityLevel: 0.6,
      pathwayLength: 10,
      dataConfidence: 0.8,
    },
  ],
  scan: {
    id: 'test-scan',
    patientId: 'test-patient',
    scanDate: new Date().toISOString(),
    scanType: 'fMRI',
    resolution: { x: 2, y: 2, z: 2 },
    scannerModel: 'Test Scanner',
    contrastAgent: false,
    notes: 'Test scan',
    technician: 'Test Tech',
    processingMethod: 'standard',
    dataQualityScore: 0.9,
    metadata: {}, // Added missing metadata property
  },
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  processingLevel: 'analyzed',
  lastUpdated: new Date().toISOString(),
};

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn((options: any) => {
      // Check if the query key matches the one used in the hook
      if (options.queryKey[0] === 'brainModel' && options.queryKey[1] === 'test-patient') {
        return {
          data: mockBrainModel,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      // Return default state for other keys if needed
      return {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      };
    }),
  };
});

// Test Suite
describe('useBrainVisualization Hook', () => {
  // Create a test wrapper with QueryClientProvider for each test
  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    });
    
    return ({ children }: { children: React.ReactNode }) => {
      // Use React.createElement to avoid JSX transform issues in .ts file
      return React.createElement(
        QueryClientProvider,
        { client: testQueryClient },
        children
      );
    };
  };

  it('renders without crashing and loads brain model data', async () => {
    // Arrange - Setup the wrapper with query client
    const wrapper = createWrapper();

    // Act - Render the hook with test parameters
    const { result } = renderHook(
      () => useBrainVisualization({
        patientId: 'test-patient',
        disabled: false,
        autoRotate: false,
        highlightActiveRegions: false,
      }),
      { wrapper }
    );

    // Assert - Check initial loading state (Removed - mock is synchronous)
    // expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete (Removed - mock is synchronous)
    // await waitFor(() => {
    //   expect(result.current.isLoading).toBe(false);
    // }, { timeout: 1000 });
    
    // Assert final state (should be available immediately)
    expect(result.current.isLoading).toBe(false); // Check isLoading from mock
    expect(result.current.brainModel).toBeDefined();
    expect(result.current.brainModel?.id).toBe('test-brain-model');
    expect(result.current.brainModel?.patientId).toBe('test-patient');
    expect(result.current.brainModel?.regions).toHaveLength(1);
    expect(result.current.brainModel?.connections).toHaveLength(1);
  });
});
