// src/presentation/pages/XGBoostAnalyticsPage.tsx
import React from 'react';
import XGBoostInputForm from '@presentation/organisms/XGBoostInputForm';
import XGBoostResultsDisplay from '@presentation/organisms/XGBoostResultsDisplay';
import { useXGBoostPrediction } from '@application/hooks/useXGBoostPrediction';
import type { XGBoostInput } from '@domain/analytics/xgboostTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Assuming Shadcn path
import { Terminal } from 'lucide-react';

/**
 * Page for interacting with the XGBoost prediction model.
 */
const XGBoostAnalyticsPage: React.FC = () => {
  const {
    mutate: runPrediction,
    isPending,
    isError,
    error,
    data: predictionResult,
    reset,
  } = useXGBoostPrediction();

  const handlePredict = (inputData: XGBoostInput) => {
    // Clear previous results/errors before new prediction
    reset();
    runPrediction(inputData);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">XGBoost Predictive Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form Section */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Input Features</h2>
          <XGBoostInputForm onSubmit={handlePredict} isLoading={isPending} />
        </div>

        {/* Results Section */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
          {isPending && <p className="text-blue-600">Running prediction...</p>}
          {isError && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Prediction Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}
          {predictionResult && <XGBoostResultsDisplay result={predictionResult} />}
          {!isPending && !isError && !predictionResult && (
            <p className="text-gray-500">Submit input features to see prediction results.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default XGBoostAnalyticsPage;
