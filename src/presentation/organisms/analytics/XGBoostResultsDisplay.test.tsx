// src/presentation/organisms/XGBoostResultsDisplay.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import XGBoostResultsDisplay from './XGBoostResultsDisplay';

// Mock the domain type if it can't be found
// Create a mock type that matches what's needed in the test
interface XGBoostPrediction {
  prediction_score: number;
  confidence: number;
  feature_importance: Record<string, number>;
  classificationReport: {
    precision: number;
    recall: number;
    'f1-score': number;
    support: number;
  };
}

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: React.PropsWithChildren) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: React.PropsWithChildren) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
}));

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <div data-testid="card-title">{children}</div>,
}));

describe('XGBoostResultsDisplay', () => {
  const mockResult: XGBoostPrediction = {
    prediction_score: 0.75,
    confidence: 0.85,
    feature_importance: {
      'Feature 1': 0.35,
      'Feature 2': 0.25,
      'Feature 3': 0.2,
      'Feature 4': 0.15,
      'Feature 5': 0.05,
    },
    classificationReport: {
      precision: 0.8,
      recall: 0.7,
      'f1-score': 0.75,
      support: 100,
    },
  };

  it('renders prediction and confidence values', () => {
    render(<XGBoostResultsDisplay result={mockResult} />);

    // Check for prediction and confidence values
    expect(screen.getByTestId('prediction-result')).toBeInTheDocument();
    expect(screen.getByTestId('prediction-value')).toHaveTextContent('75.0%');
  });

  it('renders feature importance chart', () => {
    render(<XGBoostResultsDisplay result={mockResult} />);

    // Check for feature importance visualization
    expect(screen.getByTestId('feature-importance-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders nothing when result is null', () => {
    const { container } = render(<XGBoostResultsDisplay result={null as unknown as XGBoostPrediction} />);
    expect(container).toBeEmptyDOMElement();
  });
});
