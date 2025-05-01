// src/application/hooks/useSentimentAnalysis.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import {
  runSentimentAnalysis as runSentimentAnalysisApi,
} from '@infrastructure/api/analyticsService';
import type {
  SentimentInput,
  SentimentResult,
} from '@domain/analytics/sentimentTypes';

/**
 * Hook for running Sentiment Analysis.
 * Provides mutation function, loading state, and handles success/error cases.
 *
 * @returns {object} Mutation object from TanStack Query.
 */
export const useSentimentAnalysis = () => {
  return useMutation<SentimentResult, Error, SentimentInput>({
    mutationFn: (inputData: SentimentInput) => runSentimentAnalysisApi(inputData),
    onSuccess: (data) => {
      toast.success('Sentiment analysis successful!');
      console.log('Sentiment Result:', data);
    },
    onError: (error) => {
      console.error('Sentiment analysis mutation failed:', error);
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Analysis failed: ${message}`);
    },
  });
};
