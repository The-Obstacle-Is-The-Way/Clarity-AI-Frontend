/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * TemporalDynamicsController testing with focused, incremental tests.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTemporalDynamicsController } from './temporal-dynamics.controller';
import * as TemporalDynamicsController from './temporal-dynamics.controller';

// Mock the temporal service dependencies
vi.mock('@application/services/temporal/temporal.service', () => ({
  temporalService: {
    getTemporalDynamics: vi.fn().mockResolvedValue({
      success: true,
      value: {
        id: 'temporal-patient123-daily',
        timestamps: [Date.now() - 86400000, Date.now()],
        values: {
          regionA: [0.5, 0.6],
          regionB: [0.3, 0.2],
        },
        metadata: { scale: 'daily' },
        segments: [
          { id: 'segment1', start: 0, end: 1, pattern: 'stable' }
        ],
        patterns: [
          { id: 'pattern1', class: 'stable', confidence: 0.8 }
        ],
        stateTransitions: [
          { id: 'transition1', from: 'stable', to: 'increasing', time: Date.now() - 43200000 }
        ],
        criticalTransitions: [
          { id: 'critical1', time: Date.now() - 21600000, magnitude: 0.4 }
        ],
        features: {
          complexity: 0.6,
          periodicity: 0.3
        }
      }
    }),
    analyzeTemporalPatterns: vi.fn().mockResolvedValue({
      success: true,
      value: [
        { id: 'pattern1', class: 'periodic', confidence: 0.75 },
        { id: 'pattern2', class: 'trend', confidence: 0.85 }
      ]
    })
  }
}));

describe('TemporalDynamicsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exists as a module', () => {
    expect(TemporalDynamicsController).toBeDefined();
  });

  it('initializes with default configuration', () => {
    const { result } = renderHook(() => useTemporalDynamicsController('patient123'));
    
    expect(result.current).toBeDefined();
    expect(result.current.loadTemporalDynamics).toBeInstanceOf(Function);
    expect(result.current.analyzePatterns).toBeInstanceOf(Function);
    expect(result.current.detectStateTransitions).toBeInstanceOf(Function);
  });

  it('loads temporal dynamics correctly', async () => {
    const { result } = renderHook(() => useTemporalDynamicsController('patient123'));
    
    let dynamicsResult;
    await act(async () => {
      dynamicsResult = await result.current.loadTemporalDynamics('daily');
    });
    
    expect(dynamicsResult).toBeDefined();
    expect(dynamicsResult.success).toBe(true);
    expect(dynamicsResult.value).toHaveProperty('id');
    expect(dynamicsResult.value).toHaveProperty('timestamps');
    expect(dynamicsResult.value).toHaveProperty('values');
  });

  it('analyzes patterns correctly', async () => {
    const { result } = renderHook(() => useTemporalDynamicsController('patient123'));
    
    // Load data first
    await act(async () => {
      await result.current.loadTemporalDynamics('daily');
    });
    
    let patternsResult;
    await act(async () => {
      patternsResult = await result.current.analyzePatterns();
    });
    
    expect(patternsResult).toBeDefined();
    expect(patternsResult.success).toBe(true);
    expect(patternsResult.value).toBeInstanceOf(Array);
    expect(patternsResult.value.length).toBeGreaterThan(0);
  });
}); 