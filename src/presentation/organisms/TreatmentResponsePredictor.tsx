import React, { useState } from 'react';

import { useTreatmentPrediction } from '@hooks/useTreatmentPrediction';
import type { DigitalTwinProfile } from '@domain/models/clinical/digital-twin-profile';
import { Button } from '@presentation/atoms/Button';

interface TreatmentResponsePredictorProps {
  patientId: string;
  profile: DigitalTwinProfile;
  className?: string;
}

/**
 * Treatment Response Predictor
 *
 * Interactive component for predicting patient responses to various
 * treatment options using the XGBoost service.
 */
const TreatmentResponsePredictor: React.FC<TreatmentResponsePredictorProps> = ({
  patientId,
  profile,
  className = '',
}) => {
  // Local state for clinical data inputs
  const [clinicalData, setClinicalData] = useState({
    severity: profile.currentSeverity,
    diagnosis: profile.primaryDiagnosis,
    phq9_score: profile.assessmentScores.find((s) => s.type === 'PHQ9')?.score || 0,
    gad7_score: profile.assessmentScores.find((s) => s.type === 'GAD7')?.score || 0,
  });

  // Get genetic markers from profile if available
  const geneticData = profile.biomarkers
    .filter((b) => b.name.includes('genetic') || b.name.includes('CYP'))
    .map((b) => b.name);

  // Use the treatment prediction hook
  const {
    treatmentConfig,
    predictionResult,
    featureImportance,
    isPredicting,
    // isLoadingFeatures, // Removed unused variable
    predictionError,
    updateTreatmentConfig,
    predictTreatmentResponse,
    resetPrediction,
  } = useTreatmentPrediction({
    patientId,
    initialTreatmentType: 'ssri',
    onPredictionSuccess: (data) => {
      console.log('Prediction successful:', data);
    },
    onPredictionError: (error) => {
      console.error('Prediction error:', error);
    },
  });

  // Treatment options
  const treatmentOptions = [
    { value: 'ssri', label: 'SSRI Medication' },
    { value: 'snri', label: 'SNRI Medication' },
    { value: 'tca', label: 'TCA Medication' },
    { value: 'maoi', label: 'MAOI Medication' },
    { value: 'cbt', label: 'Cognitive Behavioral Therapy' },
    { value: 'ect', label: 'Electroconvulsive Therapy' },
    { value: 'tms', label: 'Transcranial Magnetic Stimulation' },
    { value: 'combination', label: 'Combination Therapy' },
  ];

  // Handle treatment type change
  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTreatmentConfig({ treatmentType: e.target.value });
  };

  // Handle clinical data input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClinicalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle predict button click
  const handlePredict = () => {
    // Ensure severity is a string and include assessment_scores
    const requestClinicalData = {
      ...clinicalData,
      severity: String(clinicalData.severity), // Convert to string if number
      assessment_scores: {
        // Add missing assessment_scores
        phq9: clinicalData.phq9_score,
        gad7: clinicalData.gad7_score,
      },
    };
    predictTreatmentResponse({
      clinicalData: requestClinicalData,
      geneticData,
    });
  };

  // Response level colors
  const getResponseLevelColor = (level: string) => {
    switch (level) {
      case 'poor':
        return 'bg-red-500';
      case 'partial':
        return 'bg-orange-500';
      case 'good':
        return 'bg-green-500';
      case 'excellent':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Treatment Configuration Panel */}
        <div className="rounded-lg bg-background p-4 dark:bg-background-elevated">
          <h3 className="mb-4 text-lg font-medium">Treatment Options</h3>

          {/* Treatment Type Selection */}
          <div className="mb-4">
            <label
              htmlFor="treatment-type"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Treatment Type
            </label>
            <select
              id="treatment-type"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
              value={treatmentConfig.treatmentType}
              onChange={handleTreatmentChange}
            >
              {treatmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Data Inputs */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="phq9"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                PHQ-9 Score
              </label>
              <input
                id="phq9"
                name="phq9_score"
                type="number"
                min="0"
                max="27"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
                value={clinicalData.phq9_score}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="gad7"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                GAD-7 Score
              </label>
              <input
                id="gad7"
                name="gad7_score"
                type="number"
                min="0"
                max="21"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
                value={clinicalData.gad7_score}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="severity"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background-card dark:text-white"
                value={clinicalData.severity}
                onChange={handleInputChange}
              >
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          {/* Genetic Markers */}
          {geneticData.length > 0 && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Genetic Markers
              </label>
              <div className="flex flex-wrap gap-1">
                {geneticData.map((marker, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {marker}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button variant="default" onClick={handlePredict} disabled={isPredicting}>
              Predict Response
            </Button>

            <Button
              variant="outline"
              onClick={resetPrediction}
              disabled={isPredicting || !predictionResult}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Prediction Results Panel */}
        <div className="rounded-lg bg-background p-4 dark:bg-background-elevated">
          <h3 className="mb-4 text-lg font-medium">Prediction Results</h3>

          {isPredicting && (
            <div className="flex items-center justify-center p-6">
              {/* Replace with LoadingIndicator if available and preferred */}
              <p className="animate-pulse text-primary-500">Calculating response...</p>
            </div>
          )}

          {predictionError && (
            <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <p className="font-medium">Prediction Error:</p>
              <p className="text-sm">
                {predictionError.message ||
                  'An error occurred while predicting treatment response.'}
              </p>
              <Button variant="default" onClick={handlePredict} size="sm">
                Try Again
              </Button>
            </div>
          )}

          {predictionResult && !isPredicting && (
            <div className="space-y-4">
              {/* Predicted Response Level */}
              <div>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Predicted Response
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${getResponseLevelColor(predictionResult.response_level)}`}
                  ></span>
                  <span className="font-semibold capitalize">
                    {predictionResult.response_level}
                  </span>
                </div>
              </div>

              {/* Response Probability */}
              <div>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Confidence
                </span>
                <span className="block font-semibold">
                  {(predictionResult.response_probability * 100).toFixed(1)}%
                </span>
              </div>

              {/* Feature Importance (if available and successful) */}
              {featureImportance &&
                featureImportance.ok &&
                featureImportance.val.features &&
                featureImportance.val.features.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Key Factors Influencing Prediction
                    </h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {featureImportance.val.features
                        .slice(0, 5)
                        .map((feature: { name: string; importance: number }, idx: number) => (
                          <li key={idx}>
                            {feature.name}: {feature.importance.toFixed(3)}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* Placeholder when no prediction */}
          {!predictionResult && !isPredicting && !predictionError && (
            <div className="text-center text-neutral-500 dark:text-neutral-400">
              <p className="mb-2">
                Select treatment type and provide clinical data to predict patient response. 
                The model leverages clinical history, assessments, and potentially biomarker data for
                patient-specific factors.
              </p>
              <Button variant="default" onClick={handlePredict}>
                Generate Prediction
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Importance Panel (shown when available) */}
      {featureImportance && (
        <div className="mt-6 rounded-lg bg-background p-4 dark:bg-background-elevated">
          <h3 className="mb-4 text-lg font-medium">Feature Importance Analysis</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Global Importance */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Global Model Features
              </h4>

              <div className="space-y-2">
                {featureImportance.ok &&
                  featureImportance.val.features.map(
                    (
                      feature: {
                        name: string;
                        importance: number;
                        direction: 'positive' | 'negative';
                        category: string;
                      },
                      idx: number // Check ok and use val, add specific type
                    ) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {feature.name}
                        </span>
                        <div className="h-2 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className={`h-2 rounded-full ${feature.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${feature.importance * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right text-xs text-neutral-500">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                    )
                  )}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Clinical Interpretation
              </h4>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-background-card">
                <ul className="list-inside list-disc space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {featureImportance.ok &&
                    featureImportance.val.interpretation && // Check ok and use val
                    featureImportance.val.interpretation.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                </ul>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This would typically open a more detailed view or export PDF
                    alert('Detailed report would be generated here');
                  }}
                  className="text-xs"
                >
                  Generate Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentResponsePredictor;
