// src/application/hooks/useXGBoostPrediction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast

import {
  runXGBoostPrediction as runXGBoostPredictionApi,
} from '@infrastructure/api/analyticsService';
import type {
  XGBoostInput,
  XGBoostPrediction,
} from '@domain/analytics/xgboostTypes';
// import { ANALYTICS_QUERY_KEY_PREFIX } from '@application/queries/queryKeys'; // Define if needed for invalidation

/**
 * Hook for running an XGBoost prediction.
 * Provides mutation function, loading state, and handles success/error cases.
 *
 * @returns {object} Mutation object from TanStack Query including `mutate`, `isPending`, `data`, etc.
 */
export const useXGBoostPrediction = () => {
  // const queryClient = useQueryClient(); // Uncomment if invalidation is needed

  return useMutation<XGBoostPrediction, Error, XGBoostInput>({
    mutationFn: (inputData: XGBoostInput) => runXGBoostPredictionApi(inputData),
    onSuccess: (data) => {
      toast.success('XGBoost prediction successful!');
      console.log('Prediction Result:', data);
      // Example: Invalidate related queries if prediction affects other data
      // queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY_PREFIX] });
    },
    onError: (error) => {
      console.error('XGBoost prediction mutation failed:', error);
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Prediction failed: ${message}`);
    },
  });
};
