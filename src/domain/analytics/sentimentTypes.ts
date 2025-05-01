// src/domain/analytics/sentimentTypes.ts

/**
 * Defines the structure for the input data required by the Sentiment Analysis API.
 * NOTE: This is a basic example assuming text input.
 * Verify the actual required fields with the backend API documentation.
 */
export interface SentimentInput {
  text_content: string;
  context?: string; // Optional context for analysis
  language?: string; // Optional language hint (e.g., 'en')
}

/**
 * Defines the structure for the result returned by the Sentiment Analysis API.
 * NOTE: These fields are placeholders.
 * Verify the actual response structure with the backend API documentation.
 */
export interface SentimentResult {
  sentiment_score: number; // e.g., -1 (negative) to 1 (positive)
  sentiment_label: 'positive' | 'negative' | 'neutral'; // Classification label
  confidence?: number; // Optional confidence score for the label
  analysis_id?: string; // Optional unique ID for this analysis run
  timestamp: string; // ISO 8601 timestamp of when the analysis was done
}

// Consider adding Zod schemas here later for validation
