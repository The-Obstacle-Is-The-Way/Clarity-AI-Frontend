// src/domain/analytics/xgboostTypes.ts

/**
 * Defines the structure for the input data required by the XGBoost prediction API.
 * NOTE: These fields are placeholders based on common predictive scenarios.
 * The actual required fields MUST be verified with the backend API documentation.
 */
export interface XGBoostInput {
  // Example fields - replace with actual required inputs
  featureA: number;
  featureB: string; // Could be categorical, might need encoding
  featureC: boolean;
  patientId?: string; // Optional: If prediction is patient-specific
  // ... add all other required features
}

/**
 * Defines the structure for the prediction result returned by the XGBoost API.
 * NOTE: These fields are placeholders.
 * Verify the actual response structure with the backend API documentation.
 */
export interface XGBoostPrediction {
  // Example fields - replace with actual results
  prediction_score: number; // e.g., probability or raw score
  predicted_class?: string | number; // e.g., 'High Risk', 'Low Risk', 0, 1
  confidence_interval?: [number, number]; // Optional confidence
  feature_importance?: Record<string, number>; // Optional feature contribution
  prediction_id?: string; // Optional unique ID for this prediction run
  timestamp: string; // ISO 8601 timestamp of when the prediction was made
}

// Consider adding Zod schemas here later for validation
// import { z } from 'zod';
// export const XGBoostInputSchema = z.object({ ... });
// export const XGBoostPredictionSchema = z.object({ ... });
