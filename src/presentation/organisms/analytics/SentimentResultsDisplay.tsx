// src/presentation/organisms/SentimentResultsDisplay.tsx
import React from 'react';
import type { SentimentResult } from '@domain/analytics/sentimentTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils'; // Assuming Shadcn utility for class merging

interface SentimentResultsDisplayProps {
  result: SentimentResult;
}

/**
 * Displays the results of Sentiment Analysis.
 * NOTE: Needs verification based on actual API response.
 */
const SentimentResultsDisplay: React.FC<SentimentResultsDisplayProps> = ({ result }) => {
  const getSentimentColor = (label: string): string => {
    switch (label) {
      case 'positive':
        return 'text-green-700';
      case 'negative':
        return 'text-red-700';
      case 'neutral':
      default:
        return 'text-gray-700';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Analysis Outcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-semibold">Overall Sentiment:</span>
          <span className={cn('ml-2 font-bold text-lg', getSentimentColor(result.sentiment_label))}>
            {result.sentiment_label.toUpperCase()}
          </span>
        </div>
        <div>
          <span className="font-semibold">Sentiment Score:</span>
          <span className="ml-2 font-mono">{result.sentiment_score.toFixed(3)}</span>
        </div>
        {result.confidence !== undefined && (
          <div>
            <span className="font-semibold">Confidence:</span>
            <span className="ml-2">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
        )}
        <div>
          <span className="font-semibold">Analysis Timestamp:</span>
          <span className="ml-2 text-sm text-gray-600">
            {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentResultsDisplay;
