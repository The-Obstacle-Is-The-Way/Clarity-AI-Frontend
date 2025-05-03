/**
 * NOVAMIND Neural-Safe Clinical Type System
 * Comprehensive clinical data type exports with quantum-level type safety
 */

// Export all clinical domain types
export * from './patient';
export * from './risk';
export * from './treatment';
export * from './events'; // Add export for events

// Re-export common types that are directly related to clinical visualization
export {
  Vector3,
  SafeArray,
  Result,
  success,
  failure,
  NeuralError,
  VisualizationState,
} from '../shared/common'; // Corrected path to explicitly point to common.ts
