/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * ClinicalPredictionController testing with focused, incremental tests.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the clinical service - this is hoisted to the top of the file
vi.mock('@application/services/clinical/clinical.service', () => ({
  clinicalService: {
    fetchTreatmentPredictions: vi.fn(),
    predictSymptomTrajectory: vi.fn()
  }
}));

// Import after mocks
import { useClinicalPredictionController } from './clinical-prediction.controller';
import * as ClinicalPredictionController from './clinical-prediction.controller';
import { clinicalService } from '@application/services/clinical/clinical.service';

describe('ClinicalPredictionController', () => {
  beforeEach(() => {
    // Setup our mock returns for this test run
    clinicalService.fetchTreatmentPredictions.mockReturnValue({
      success: true,
      value: [
        {
          treatmentId: 'treatment-1',
          outcomeScore: 0.75,
          confidenceInterval: [0.65, 0.85],
          predictedResponseTime: 14,
        },
        {
          treatmentId: 'treatment-2',
          outcomeScore: 0.45,
          confidenceInterval: [0.35, 0.55],
          predictedResponseTime: 21,
        },
      ],
    });

    clinicalService.predictSymptomTrajectory.mockReturnValue({
      success: true,
      value: {
        baseline: [0.8, 0.75, 0.7],
        predicted: [0.65, 0.55, 0.45],
        timestamps: ['2025-01-01', '2025-01-15', '2025-01-30'],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exists as a module', () => {
    expect(ClinicalPredictionController).toBeDefined();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useClinicalPredictionController('patient-123'));
    
    expect(result.current).toBeDefined();
    expect(result.current.predictTreatmentOutcomes).toBeInstanceOf(Function);
    expect(result.current.predictSymptomTrajectories).toBeInstanceOf(Function);
  });

  it('predicts treatment outcomes correctly', async () => {
    const { result } = renderHook(() => useClinicalPredictionController('patient-123'));
    
    let predictionResult;
    await act(async () => {
      predictionResult = await result.current.predictTreatmentOutcomes(['treatment-1', 'treatment-2']);
    });
    
    // Verify the mock was called
    expect(clinicalService.fetchTreatmentPredictions).toHaveBeenCalledTimes(1);
    expect(clinicalService.fetchTreatmentPredictions).toHaveBeenCalledWith('patient-123');
    
    // Check the results
    expect(predictionResult).toBeDefined();
    expect(predictionResult.success).toBe(true);
    expect(predictionResult.value).toBeInstanceOf(Map);
    expect(predictionResult.value.size).toBe(2);
    expect(predictionResult.value.get('treatment-1')).toBeDefined();
    expect(predictionResult.value.get('treatment-2')).toBeDefined();
  });

  it('predicts symptom trajectories correctly', async () => {
    const { result } = renderHook(() => useClinicalPredictionController('patient-123'));
    
    let trajectoryResult;
    await act(async () => {
      trajectoryResult = await result.current.predictSymptomTrajectories(['depression'], 30);
    });
    
    expect(trajectoryResult).toBeDefined();
    expect(trajectoryResult.success).toBe(true);
    expect(trajectoryResult.value).toBeInstanceOf(Map);
    expect(trajectoryResult.value.get('depression')).toBeDefined();
  });
}); 