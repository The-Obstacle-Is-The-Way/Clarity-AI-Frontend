/**
 * NOVAMIND Neural Test Suite – Rebuilt
 * NeuroSyncOrchestrator testing with focused, incremental tests.
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNeuroSyncOrchestrator } from './neuro-sync.orchestrator';

// Create minimal mocks
vi.mock('../../infrastructure/api/brain-model.service', () => ({
  brainModelService: {
    fetchBrainModel: vi.fn().mockResolvedValue({
      success: true,
      value: { id: 'brain-model-123' },
    }),
  },
}));

vi.mock('../../infrastructure/api/clinical.service', () => ({
  clinicalService: {
    fetchSymptomMappings: vi.fn().mockResolvedValue({
      success: true,
      value: [{ symptomId: 'depression' }],
    }),
    fetchDiagnosisMappings: vi.fn().mockResolvedValue({
      success: true,
      value: [{ diagnosisId: 'major-depression' }],
    }),
    fetchTreatmentPredictions: vi.fn().mockResolvedValue({
      success: true,
      value: [{ treatmentId: 'ssri' }],
    }),
  },
}));

vi.mock('../../infrastructure/api/temporal.service', () => ({
  temporalService: {
    getTemporalDynamics: vi.fn().mockResolvedValue({
      success: true,
      value: { id: 'temporal-patient-123' },
    }),
  },
}));

describe('NeuroSyncOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
  });

  it('exists as a module', () => {
    expect(useNeuroSyncOrchestrator).toBeDefined();
  });

  it('initializes correctly and sets initial loading state', () => {
    const { result, unmount } = renderHook(() =>
      useNeuroSyncOrchestrator('patient-123', {
        brainModelRefreshInterval: 60000,
        biometricRefreshInterval: 30000,
        temporalRefreshInterval: 60000,
        performanceMonitorInterval: 10000,
        dataCorrelationInterval: 120000,
      })
    );

    expect(result.current.state.loadingState).toBe('loading');
    expect(result.current.state).toBeDefined();
    
    unmount();
  });
});
