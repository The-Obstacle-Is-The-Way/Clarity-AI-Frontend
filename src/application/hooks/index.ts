/**
 * Application hooks exports
 *
 * This module exports all custom hooks from the application layer.
 * Each hook should be imported specifically to minimize bundle size.
 */

// Auth hooks
export { useAuth } from './auth/useAuth';
export { useSecureAuth } from './auth/useSecureAuth';

// Brain model hooks
export { useBrainModel } from './brain/useBrainModel';
export { useBrainVisualization } from './brain/useBrainVisualization';

// Clinical hooks
export { useClinicalContext } from './clinical/useClinicalContext';
export { usePatientData } from './clinical/usePatientData';
export { useTreatmentPrediction } from './clinical/useTreatmentPrediction';
export { usePatients } from './clinical/usePatients';
export { usePatientDetail } from './clinical/usePatientDetail';
export { useCreatePatient } from './clinical/useCreatePatient';
export { useUpdatePatient } from './clinical/useUpdatePatient';
export { useDeletePatient } from './clinical/useDeletePatient';
export { useClinicalRecords } from './clinical/useClinicalRecords';
export { useML } from './clinical/useML';
export { useSentimentAnalysis } from './clinical/useSentimentAnalysis';
export { useXGBoostPrediction } from './clinical/useXGBoostPrediction';

// UI related hooks
export { useBlockingTransition } from './ui/useBlockingTransition';
export { useTheme } from './ui/useTheme';
export { useVisualSettings } from './ui/useVisualSettings';

// Utility hooks
export { useSearchParams } from './utils/useSearchParams';
export { useAuditLog } from './utils/useAuditLog';
