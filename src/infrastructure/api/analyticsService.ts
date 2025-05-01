// src/infrastructure/api/analyticsService.ts
import { apiClient } from './apiClient';
import type {
  XGBoostInput,
  XGBoostPrediction,
} from '@domain/analytics/xgboostTypes';

/**
 * Runs an XGBoost prediction via the API.
 * NOTE: Endpoint and request/response structure need verification.
 *
 * @param {XGBoostInput} inputData - The input data for the prediction.
 * @returns {Promise<XGBoostPrediction>} A promise resolving to the prediction result.
 */
export const runXGBoostPrediction = async (
  inputData: XGBoostInput,
): Promise<XGBoostPrediction> => {
  // --- VERIFY THIS ENDPOINT --- 
  const endpoint = '/analytics/xgboost/predict';
  console.warn(`Running XGBoost prediction using assumed endpoint: ${endpoint}. Verify endpoint and schemas.`);

  try {
    // Use POST method, sending inputData as the request body
    const response = await apiClient.post<XGBoostPrediction>(endpoint, inputData);
    return response;
  } catch (error) {
    console.error('XGBoost prediction failed:', error);
    // Consider more specific error handling based on API responses
    throw error;
  }
};

// Add functions for other analytics models (e.g., Sentiment Analysis) here later
