/**
 * NOVAMIND Neural Test Suite – Rebuilt
 * NeuroSyncOrchestrator testing with focused, incremental tests.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNeuroSyncOrchestrator } from './neuro-sync.orchestrator';
import * as NeuroSyncOrchestrator from './neuro-sync.orchestrator';

// ──────────────────────────────────────────
// Service mocks
// ──────────────────────────────────────────
vi.mock('@/application/services/brain/brain-model.service', () => ({
  brainModelService: {
    fetchBrainModel: vi.fn().mockResolvedValue({
      success: true,
      value: {
        id: 'brain-model-123',
        regions: [
          {
            id: 'prefrontal-cortex',
            name: 'Prefrontal Cortex',
            coordinates: { x: 0, y: 0, z: 0 },
            volume: 120,
          },
          {
            id: 'amygdala',
            name: 'Amygdala',
            coordinates: { x: 10, y: 5, z: -5 },
            volume: 80,
          },
        ],
        connections: [
          {
            id: 'connection-1',
            sourceId: 'prefrontal-cortex',
            targetId: 'amygdala',
            strength: 0.7,
          },
        ],
      },
    }),
  },
}));

vi.mock('@/application/services/clinical/clinical.service', () => ({
  clinicalService: {
    fetchSymptomMappings: vi.fn().mockResolvedValue({
      success: true,
      value: [
        {
          symptomId: 'depression',
          affectedRegions: ['prefrontal-cortex', 'amygdala'],
          confidenceLevel: 'high',
        },
      ],
    }),
    fetchDiagnosisMappings: vi.fn().mockResolvedValue({
      success: true,
      value: [
        {
          diagnosisId: 'major-depression',
          symptomRelationships: ['depression', 'anhedonia'],
          neurologicalSignature: 'prefrontal-hypoactivity',
        },
      ],
    }),
    fetchTreatmentPredictions: vi.fn().mockResolvedValue({
      success: true,
      value: [
        {
          treatmentId: 'ssri',
          treatmentType: 'pharmacological',
          prediction: {
            responseType: 'response',
            responseProbability: 0.75,
          },
        },
      ],
    }),
  },
}));

vi.mock('@/application/services/temporal/temporal.service', () => ({
  temporalService: {
    getTemporalDynamics: vi.fn().mockResolvedValue({
      success: true,
      value: {
        id: 'temporal-patient-123',
        timestamps: [Date.now() - 86_400_000, Date.now()],
        values: {
          'prefrontal-cortex': [0.5, 0.6],
          amygdala: [0.3, 0.4],
        },
      },
    }),
  },
}));

vi.mock('@/application/services/biometric/biometric.service', () => ({
  biometricService: {
    getStreamMetadata: vi.fn().mockResolvedValue({
      success: true,
      value: [
        {
          id: 'heart-rate-stream',
          patientId: 'patient-123',
          type: 'heartRate',
          source: 'wearable',
          isActive: true,
        },
      ],
    }),
    calculateStreamCorrelations: vi.fn().mockResolvedValue({
      success: true,
      value: new Map([['stream1-stream2', 0.75]]),
    }),
  },
}));

// Imports for call-count assertions
import { brainModelService } from '@/application/services/brain/brain-model.service';
import { clinicalService } from '@/application/services/clinical/clinical.service';
import { temporalService } from '@/application/services/temporal/temporal.service';

// ──────────────────────────────────────────
// Tests
// ──────────────────────────────────────────
describe('NeuroSyncOrchestrator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exists as a module', () => {
    expect(NeuroSyncOrchestrator).toBeDefined();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useNeuroSyncOrchestrator('patient-123'));

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
    expect(result.current.state.brainModel).toBeNull();
    expect(result.current.actions.selectRegion).toBeInstanceOf(Function);
    expect(result.current.actions.setRenderMode).toBeInstanceOf(Function);
  });

  // Focus on this test first
  it.only('fetches initial data on initialization', async () => {
    const { result } = renderHook(() => useNeuroSyncOrchestrator('patient-123'));

    // initial state should be loading
    expect(result.current.state.loadingState).toBe('loading');

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve(); // flush micro-tasks
    });

    // Corrected waitFor formatting
    await waitFor(() =>
      expect(result.current.state.loadingState).toBe('loaded')
    );

    expect(result.current.state.brainModel).not.toBeNull();
    expect(result.current.state.symptomMappings.length).toBeGreaterThan(0);
    expect(result.current.state.diagnosisMappings.length).toBeGreaterThan(0);
    expect(result.current.state.treatmentPredictions.length).toBeGreaterThan(0);
    expect(result.current.state.temporalDynamics).not.toBeNull();

    // verify service calls
    expect(brainModelService.fetchBrainModel).toHaveBeenCalledTimes(1);
    expect(clinicalService.fetchSymptomMappings).toHaveBeenCalledTimes(1);
    expect(clinicalService.fetchDiagnosisMappings).toHaveBeenCalledTimes(1);
    expect(clinicalService.fetchTreatmentPredictions).toHaveBeenCalledTimes(1);
    expect(temporalService.getTemporalDynamics).toHaveBeenCalledTimes(1);
  });

  it('selects region correctly', async () => {
    const { result } = renderHook(() => useNeuroSyncOrchestrator('patient-123'));

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve();
    });
    // Corrected waitFor formatting
    await waitFor(() =>
      expect(result.current.state.loadingState).toBe('loaded')
    );

    act(() => {
      result.current.actions.selectRegion('prefrontal-cortex');
    });

    // Corrected expect formatting
    expect(result.current.state.selectedRegions).toContain('prefrontal-cortex');
  });

  it('sets render mode correctly', async () => {
    const { result } = renderHook(() => useNeuroSyncOrchestrator('patient-123'));

    await act(async () => {
      vi.runAllTimers();
      await Promise.resolve();
    });
    // Corrected waitFor formatting
    await waitFor(() =>
      expect(result.current.state.loadingState).toBe('loaded')
    );

    act(() => {
      result.current.actions.setRenderMode('heatmap');
    });

    expect(result.current.state.renderMode).toBe('heatmap');
  });
});
