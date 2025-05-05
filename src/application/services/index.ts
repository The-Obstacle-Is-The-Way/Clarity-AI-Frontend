/**
 * Application services exports
 *
 * This module exports services that implement domain interfaces.
 */

// Export controllers
export * from './controllers';

// Export specific services from subdirectories
export * from './biometric'; // Biometric services
export * from './brain'; // Brain services
export * from './clinical'; // Clinical services
export * from './temporal'; // Temporal services

/**
 * NOVAMIND Application Services
 *
 * Centralized exports for all application services
 * with domain-specific organization
 */

// Brain domain services - re-export with legacy names for backward compatibility
export { brainModelService } from './brain/brain-model.service';

// Clinical domain services - re-export with legacy names for backward compatibility
export { clinicalService } from './clinical/clinical.service';
export { RiskAssessmentService } from './clinical/risk-assessment.service';

// Re-export types if needed by consumers
// This allows clean imports like: import { brainModelService, BrainModel } from '@application/services';
export type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
export type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
  TreatmentNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping';
export type { RiskAssessment } from '@domain/types/clinical/risk';
export type {
  TreatmentResponsePrediction,
  TreatmentEfficacy,
} from '@domain/types/clinical/treatment';
export type { Symptom, Diagnosis, Treatment } from '@domain/types/clinical/patient';
export type { RiskLevel } from '@domain/types/clinical/risk';
