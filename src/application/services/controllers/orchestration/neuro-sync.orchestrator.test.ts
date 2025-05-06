/**
 * NOVAMIND Neural Test Suite – Fixed Version
 * NeuroSyncOrchestrator testing with memory leak prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNeuroSyncOrchestrator } from './neuro-sync.orchestrator';
import { renderHook, act } from '@testing-library/react';
import type {
  BrainModel,
  BrainRegion,
  NeuralConnection,
  BrainScan,
} from '@/domain/types/brain/models'; // Import necessary types
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  NeuralActivationPattern,
} from '@/domain/models/brain/mapping/brain-mapping';
import type {
  TreatmentResponsePrediction,
  TreatmentType,
} from '@/domain/types/clinical/treatment';
import type { TemporalDynamics } from '@/domain/types/temporal/dynamics';
import type { Vector3 } from '@/domain/types/shared/common';

// Just mark paths for mocking, implementations will be in beforeEach
vi.mock('@/application/services/brain/brain-model.service');
vi.mock('@/application/services/clinical/clinical.service');
vi.mock('@/application/services/temporal/temporal.service');

// Import services AFTER vi.mock calls
import { brainModelService } from '@/application/services/brain/brain-model.service';
import { clinicalService } from '@/application/services/clinical/clinical.service';
import { temporalService } from '@/application/services/temporal/temporal.service';

// --- Mock Data Definitions ---
const mockPosition: Vector3 = { x: 0, y: 0, z: 0 };

const mockBrainScan: BrainScan = {
  id: 'scan-123',
  patientId: 'patient-123',
  scanDate: new Date().toISOString(),
  scanType: 'fMRI',
  resolution: mockPosition,
  metadata: { test: 'data' },
  dataQualityScore: 0.9,
};

const mockBrainRegion: BrainRegion = {
  id: 'r1',
  name: 'Region 1',
  position: mockPosition,
  color: '#FF0000',
  connections: ['c1'],
  activityLevel: 0.5,
  isActive: true,
  hemisphereLocation: 'left',
  dataConfidence: 0.95,
  volume: 1500,
  activity: 0.5,
};

const mockNeuralConnection: NeuralConnection = {
  id: 'c1',
  sourceId: 'r1',
  targetId: 'r1',
  strength: 0.7,
  type: 'excitatory',
  directionality: 'unidirectional',
  activityLevel: 0.6,
  dataConfidence: 0.9,
};

const mockBrainModel: BrainModel = {
  id: 'mock-brain-123',
  patientId: 'patient-123',
  regions: [mockBrainRegion],
  connections: [mockNeuralConnection],
  scan: mockBrainScan,
  timestamp: new Date().toISOString(),
  version: '1.0',
  processingLevel: 'analyzed',
  lastUpdated: new Date().toISOString(),
};

const mockActivationPattern: NeuralActivationPattern = {
  regionIds: ['r1'],
  intensity: 0.8,
  confidence: 0.9,
  timeScale: 'acute',
  connectivity: { increasedPathways: [], decreasedPathways: [] },
};

const mockSymptomMapping: SymptomNeuralMapping = {
  symptomId: 's1-test',
  symptomName: 'Test Anxiety',
  category: 'Emotional',
  evidenceQuality: 'established',
  contributingFactors: ['stress'],
  activationPatterns: [mockActivationPattern],
};

const mockDiagnosisMapping: DiagnosisNeuralMapping = {
  diagnosisId: 'd1-test',
  diagnosisName: 'Test MDD',
  codingSystem: 'ICD-10',
  evidenceQuality: 'established',
  activationPatterns: [mockActivationPattern],
};

const mockTreatmentPrediction: TreatmentResponsePrediction = {
  requestId: 'req-123',
  patientId: 'patient-123',
  treatmentId: 'treat-123',
  treatmentType: 'psychotherapy' as TreatmentType,
  timestamp: new Date().toISOString(),
  algorithm: { name: 'test-algo', version: '1.0', confidence: 0.9 },
  prediction: {
    responseType: 'response',
    responseProbability: 0.75,
    confidenceInterval: [0.6, 0.9],
    timeToEffect: { expected: 14, range: [7, 21] },
    durability: { expected: 6, probability: 0.8 },
  },
  symptomSpecificPredictions: [
    { symptom: 'anxiety', improvementProbability: 0.8, expectedImprovement: 50 },
  ],
  sideEffectRisks: [
    {
      effect: 'headache',
      probability: 0.1,
      severity: 'mild',
      timeline: 'acute',
      mitigationPossible: true,
    },
  ],
  neurobiologicalMechanisms: [
    {
      pathwayName: 'serotonin',
      impactDescription: 'modulation',
      confidenceLevel: 'probable',
      relevantRegions: ['r1'],
    },
  ],
  personalizationFactors: [
    { factor: 'genetic', impact: 'positive', strength: 'moderate', evidenceQuality: 'low' },
  ],
  limitations: ['sample size'],
  alternatives: [
    {
      treatmentType: 'pharmacological' as TreatmentType,
      treatmentName: 'Test SSRI',
      predictedResponseProbability: 0.6,
      rationale: 'alternative',
    },
  ],
  dataQualityAssessment: {
    overallQuality: 'high',
    missingDataImpact: 'minimal',
    biasRiskLevel: 'low',
  },
};

const mockTemporalDynamics: TemporalDynamics = {
  id: 'temporal-123',
  timestamps: [Date.now() - 1000, Date.now()],
  values: { r1_activity: [0.5, 0.6] }, // Keep as identifier if type allows
  metadata: {
    description: 'Mock temporal data',
    timeScale: 'realtime',
    patientId: 'patient-123',
  },
};

describe('NeuroSyncOrchestrator', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.useFakeTimers();
    vi.clearAllMocks();

    vi.mocked(brainModelService.fetchBrainModel).mockImplementation(
      async (pId) => {
        if (!pId) {
          return Promise.resolve({
            success: false,
            error: new Error('Mock: pId undefined for brain model'),
          });
        }
        return Promise.resolve({
          success: true,
          value: { ...mockBrainModel, patientId: pId, id: `brain-${pId}` },
        });
      }
    );

    vi.mocked(clinicalService.fetchSymptomMappings).mockImplementation(
      async () => {
        return Promise.resolve({ success: true, value: [mockSymptomMapping] });
      }
    );
    vi.mocked(clinicalService.fetchDiagnosisMappings).mockImplementation(
      async () => {
        return Promise.resolve({ success: true, value: [mockDiagnosisMapping] });
      }
    );
    vi.mocked(clinicalService.fetchTreatmentPredictions).mockImplementation(
      async (patientId) => {
        if (!patientId) {
          return Promise.resolve({
            success: false,
            error: new Error('Mock: No patientId for treatment predictions'),
          });
        }
        return Promise.resolve({
          success: true,
          value: [{ ...mockTreatmentPrediction, patientId }],
        });
      }
    );

    vi.mocked(temporalService.getTemporalDynamics).mockImplementation(
      async (patientId, timeScale) => {
        if (!patientId || !timeScale) {
          return Promise.resolve({
            success: false,
            error: new Error('Mock: Missing params for temporal dynamics'),
          });
        }
        return Promise.resolve({
          success: true,
          value: {
            ...mockTemporalDynamics,
            id: `temporal-${patientId}-${timeScale}`,
            metadata: {
              ...mockTemporalDynamics.metadata,
              patientId,
              timeScale,
            },
          },
        });
      }
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('exists as a module', () => {
    expect(useNeuroSyncOrchestrator).toBeDefined();
    expect(typeof useNeuroSyncOrchestrator).toBe('function');
  });

  it('loads initial data and sets up refresh intervals', async () => {
    const patientId = 'test-patient-123';
    const initialConfig = {
      brainModelRefreshInterval: 5000,
      biometricRefreshInterval: 1000,
      temporalRefreshInterval: 10000,
      performanceMonitorInterval: 500,
      dataCorrelationInterval: 2000,
    };

    const mockedBrainService = vi.mocked(brainModelService);
    const mockedClinicalService = vi.mocked(clinicalService);
    const mockedTemporalService = vi.mocked(temporalService);

    const { result, rerender } = renderHook(
      ({ pId, config }) => useNeuroSyncOrchestrator(pId, config),
      {
        initialProps: { pId: patientId, config: initialConfig },
      }
    );

    await act(async () => {
      vi.runAllTicks();
    });
    expect(result.current.state.loadingState).toBe('loaded');

    expect(mockedBrainService.fetchBrainModel).not.toHaveBeenCalled();

    expect(mockedClinicalService.fetchSymptomMappings).toHaveBeenCalled();
    expect(mockedClinicalService.fetchDiagnosisMappings).toHaveBeenCalled();
    expect(mockedClinicalService.fetchTreatmentPredictions).toHaveBeenCalledWith(
      patientId
    );
    expect(mockedTemporalService.getTemporalDynamics).toHaveBeenCalledWith(
      patientId,
      'realtime'
    );

    await act(async () => {
      vi.advanceTimersByTime(initialConfig.brainModelRefreshInterval);
      await vi.runAllTicks();
    });
    expect(mockedBrainService.fetchBrainModel).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(
        initialConfig.temporalRefreshInterval -
          initialConfig.brainModelRefreshInterval
      );
      await vi.runAllTicks();
    });
    expect(mockedTemporalService.getTemporalDynamics).toHaveBeenCalledTimes(2);

    const newPatientId = 'new-patient-456';
    act(() => {
      rerender({ pId: newPatientId, config: initialConfig });
    });

    await act(async () => {
      vi.runAllTicks();
    });

    expect(mockedBrainService.fetchBrainModel).not.toHaveBeenCalled();
    expect(
      mockedClinicalService.fetchTreatmentPredictions
    ).toHaveBeenCalledWith(newPatientId);
    expect(
      mockedClinicalService.fetchTreatmentPredictions
    ).toHaveBeenCalledTimes(2);
    expect(mockedTemporalService.getTemporalDynamics).toHaveBeenCalledWith(
      newPatientId,
      'realtime'
    );
    expect(mockedTemporalService.getTemporalDynamics).toHaveBeenCalledTimes(3);
  });
});