// src/presentation/pages/SentimentAnalyticsPage.tsx
import React from 'react';
import SentimentInputForm from '@presentation/organisms/SentimentInputForm';
import SentimentResultsDisplay from '@presentation/organisms/SentimentResultsDisplay';
import { useSentimentAnalysis } from '@/application/hooks/useSentimentAnalysis';
import type { SentimentInput } from '@domain/analytics/sentimentTypes';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/atoms/feedback/alert';
import { Terminal } from 'lucide-react';

/**
 * Page for interacting with the Sentiment Analysis model.
 */
const SentimentAnalyticsPage: React.FC = () => {
  const {
    mutate: runAnalysis,
    isPending,
    isError,
    error,
    data: analysisResult,
    reset,
  } = useSentimentAnalysis();

  const handleAnalyze = (inputData: SentimentInput) => {
    reset();
    runAnalysis(inputData);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Sentiment Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form Section */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Input Text</h2>
          <SentimentInputForm onSubmit={handleAnalyze} isLoading={isPending} />
        </div>

        {/* Results Section */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          {isPending && <p className="text-blue-600">Running analysis...</p>}
          {isError && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}
          {analysisResult && <SentimentResultsDisplay result={analysisResult} />}
          {!isPending && !isError && !analysisResult && (
            <p className="text-gray-500">Submit text for analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalyticsPage;
