// src/presentation/organisms/XGBoostResultsDisplay.tsx
import React from 'react';
import type { XGBoostPrediction } from '@domain/analytics/xgboostTypes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Shadcn path

interface XGBoostResultsDisplayProps {
  result: XGBoostPrediction;
}

/**
 * Displays the results of an XGBoost prediction.
 * NOTE: The displayed fields are placeholders and MUST be updated based on the verified API response.
 */
const XGBoostResultsDisplay: React.FC<XGBoostResultsDisplayProps> = ({ result }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Prediction Outcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Example Result Field: Prediction Score */}
        <div>
          <span className="font-semibold">Prediction Score:</span>
          <span className="ml-2 font-mono text-lg text-blue-700">{result.prediction_score.toFixed(4)}</span>
        </div>

        {/* Example Result Field: Predicted Class (Optional) */}
        {result.predicted_class !== undefined && (
          <div>
            <span className="font-semibold">Predicted Class:</span>
            <span className="ml-2 font-bold">{result.predicted_class}</span>
          </div>
        )}
        
        {/* Example Result Field: Confidence Interval (Optional) */}
        {result.confidence_interval && (
            <div>
                <span className="font-semibold">Confidence Interval:</span>
                <span className="ml-2">[{result.confidence_interval[0].toFixed(3)}, {result.confidence_interval[1].toFixed(3)}]</span>
            </div>
        )}
        
        {/* Example Result Field: Timestamp */}
        <div>
          <span className="font-semibold">Prediction Timestamp:</span>
          <span className="ml-2 text-sm text-gray-600">{new Date(result.timestamp).toLocaleString()}</span>
        </div>
        
        {/* Example Result Field: Feature Importance (Optional) */}
        {result.feature_importance && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Feature Importance:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    {Object.entries(result.feature_importance)
                        .sort(([, a], [, b]) => b - a) // Sort by importance desc
                        .map(([feature, importance]) => (
                            <li key={feature}> 
                                {feature}: {importance.toFixed(3)}
                            </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Add display logic for other fields in XGBoostPrediction */}
      </CardContent>
    </Card>
  );
};

export default XGBoostResultsDisplay;
