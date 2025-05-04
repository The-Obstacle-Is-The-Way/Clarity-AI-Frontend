// src/presentation/organisms/XGBoostResultsDisplay.tsx
import React, { memo } from 'react';
import type { XGBoostPrediction } from '@domain/analytics/xgboostTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Shadcn path
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface XGBoostResultsDisplayProps {
  result: XGBoostPrediction;
}

/**
 * Displays XGBoost prediction results in a visually informative way.
 * Shows the prediction value, confidence, and feature importance.
 */
const XGBoostResultsDisplay: React.FC<XGBoostResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  // Format feature importance data for chart
  const featureImportanceData = Object.entries(result.feature_importance || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Calculate percentage based on prediction_score
  const predictionPercentage = (result.prediction_score * 100).toFixed(1);

  const predictionColor =
    result.prediction_score > 0.7
      ? 'text-destructive'
      : result.prediction_score > 0.4
        ? 'text-warning'
        : 'text-success';

  return (
    <div className="space-y-6" data-testid="prediction-result">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>XGBoost Prediction Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="text-lg font-semibold">Prediction</div>
              <div className="text-3xl font-bold text-primary" data-testid="prediction-value">
                <div className="text-sm text-muted-foreground">Prediction Score</div>
                <div className={`text-3xl font-bold ${predictionColor}`}>
                  {predictionPercentage}%
                </div>
                {/* Display Confidence Interval if available and needed */}
                {result.confidence_interval && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence Interval: [{result.confidence_interval[0].toFixed(2)},{' '}
                    {result.confidence_interval[1].toFixed(2)}]
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Importance Chart */}
          <div className="mt-8" data-testid="feature-importance-chart">
            <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={featureImportanceData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {featureImportanceData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`#${Math.floor(index * 30 + 100).toString(16)}84d8`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export with memo for better performance with complex visualization
export default memo(XGBoostResultsDisplay);
