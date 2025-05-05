/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * NeuralActivityController testing with focused, incremental tests.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNeuralActivityController } from './neural-activity.controller';
import * as Controller from './neural-activity.controller';

// Comprehensive mocks for dependencies
vi.mock('@application/services/brain/brain-model.service', () => ({
  brainModelService: {
    getBaselineActivity: vi.fn().mockResolvedValue({
      success: true,
      value: {
        regionActivations: [
          { id: 'prefrontal-cortex', value: 0.5 },
          { id: 'amygdala', value: 0.3 },
          { id: 'hippocampus', value: 0.4 }
        ],
        connectionStrengths: [
          { sourceId: 'prefrontal-cortex', targetId: 'amygdala', value: 0.6 },
          { sourceId: 'prefrontal-cortex', targetId: 'hippocampus', value: 0.7 },
          { sourceId: 'amygdala', targetId: 'hippocampus', value: 0.4 }
        ]
      }
    }),
    getSymptomActivity: vi.fn().mockResolvedValue({
      success: true,
      value: {
        symptomId: 'depression',
        regionImpacts: [
          { id: 'prefrontal-cortex', value: -0.2 },
          { id: 'amygdala', value: 0.3 }
        ],
        connectionImpacts: [
          { sourceId: 'prefrontal-cortex', targetId: 'amygdala', value: -0.1 }
        ]
      }
    }),
    getMedicationActivity: vi.fn().mockResolvedValue({
      success: true,
      value: {
        medicationId: 'ssri',
        regionImpacts: [
          { id: 'prefrontal-cortex', value: 0.2 },
          { id: 'amygdala', value: -0.1 }
        ],
        connectionImpacts: [
          { sourceId: 'prefrontal-cortex', targetId: 'amygdala', value: 0.1 }
        ]
      }
    })
  }
}));

describe('NeuralActivityController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exists as a module', () => {
    expect(Controller).toBeDefined();
  });

  it('initializes with safe default state', () => {
    const { result } = renderHook(() => useNeuralActivityController('patient123'));
    
    expect(result.current).toBeDefined();
    expect(result.current.getCurrentState).toBeInstanceOf(Function);
    expect(result.current.applySymptomActivity).toBeInstanceOf(Function);
    expect(result.current.applyMedicationActivity).toBeInstanceOf(Function);
    expect(result.current.resetToBaseline).toBeInstanceOf(Function);
  });

  it('loads baseline activity on initialization', async () => {
    const { result } = renderHook(() => useNeuralActivityController('patient123'));
    
    // Wait for the baseline to load (simulated by setTimeout)
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Get the current state
    const currentState = result.current.getCurrentState();
    
    expect(currentState).toBeDefined();
    expect(currentState.metrics).toBeDefined();
    expect(currentState.baselineLoaded).toBe(true);
  });

  it('applies symptom activity correctly', async () => {
    const { result } = renderHook(() => useNeuralActivityController('patient123'));
    
    // Wait for the baseline to load
    await new Promise(resolve => setTimeout(resolve, 10));
    
    let symptomResult;
    await act(async () => {
      symptomResult = await result.current.applySymptomActivity('depression');
    });
    
    expect(symptomResult).toBeDefined();
    expect(symptomResult.success).toBe(true);
    
    // Check that the state has been updated
    const updatedState = result.current.getCurrentState();
    expect(updatedState.activeRegions.size).toBeGreaterThan(0);
  });

  it('applies medication activity correctly', async () => {
    const { result } = renderHook(() => useNeuralActivityController('patient123'));
    
    // Wait for the baseline to load
    await new Promise(resolve => setTimeout(resolve, 10));
    
    let medicationResult;
    await act(async () => {
      medicationResult = await result.current.applyMedicationActivity('ssri');
    });
    
    expect(medicationResult).toBeDefined();
    expect(medicationResult.success).toBe(true);
  });

  it('resets to baseline correctly', async () => {
    const { result } = renderHook(() => useNeuralActivityController('patient123'));
    
    // Wait for the baseline to load
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Apply some changes first
    await act(async () => {
      await result.current.applySymptomActivity('depression');
    });
    
    // Then reset
    let resetResult;
    await act(() => {
      resetResult = result.current.resetToBaseline();
    });
    
    expect(resetResult).toBeDefined();
    expect(resetResult.success).toBe(true);
  });
});
