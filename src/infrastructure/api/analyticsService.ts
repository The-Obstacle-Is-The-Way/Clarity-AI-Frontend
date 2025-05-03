// src/infrastructure/api/analyticsService.ts
import { apiClient } from './ApiGateway';
import type { XGBoostInput, XGBoostPrediction } from '@domain/analytics/xgboostTypes';
import type { SentimentInput, SentimentResult } from '@domain/analytics/sentimentTypes';

/**
 * Runs an XGBoost prediction via the API.
 * NOTE: Endpoint and request/response structure need verification.
 *
 * @param {XGBoostInput} inputData - The input data for the prediction.
 * @returns {Promise<XGBoostPrediction>} A promise resolving to the prediction result.
 */
export const runXGBoostPrediction = async (inputData: XGBoostInput): Promise<XGBoostPrediction> => {
  // --- VERIFY THIS ENDPOINT ---
  const endpoint = '/analytics/xgboost/predict';
  console.warn(
    `Running XGBoost prediction using assumed endpoint: ${endpoint}. Verify endpoint and schemas.`
  );

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

/**
 * Runs Sentiment Analysis via the API.
 * NOTE: Endpoint and request/response structure need verification.
 *
 * @param {SentimentInput} inputData - The input data (e.g., text) for analysis.
 * @returns {Promise<SentimentResult>} A promise resolving to the sentiment analysis result.
 */
export const runSentimentAnalysis = async (inputData: SentimentInput): Promise<SentimentResult> => {
  // --- VERIFY THIS ENDPOINT ---
  const endpoint = '/analytics/sentiment';
  console.warn(
    `Running Sentiment Analysis using assumed endpoint: ${endpoint}. Verify endpoint and schemas.`
  );

  try {
    const response = await apiClient.post<SentimentResult>(endpoint, inputData);
    return response;
  } catch (error) {
    console.error('Sentiment Analysis failed:', error);
    throw error;
  }
};

// Add functions for other analytics models (e.g., Sentiment Analysis) here later
