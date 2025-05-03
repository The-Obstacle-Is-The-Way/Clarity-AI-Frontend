import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/presentation/atoms";
import { useBrainVisualization } from '@hooks/useBrainVisualization';
import { RenderMode } from '@domain/types/brain/visualization';
import BrainVisualization from '@presentation/organisms/BrainVisualization';
import BiometricMonitorPanel from "@presentation/organisms/BiometricMonitorPanel";
import ClinicalTimelinePanel from "@presentation/organisms/ClinicalTimelinePanel";
import { useParams, useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';

/**
 * DigitalTwin Demo Page
 * Demonstrates the brain visualization component with controls
 */
const DigitalTwinDemo: React.FC = () => {
  const [currentPatientId] = useState<string>('demo-patient');
  const [renderMode] = useState<RenderMode>(RenderMode.ANATOMICAL);

  const {
    brainModel,
    isLoading,
    error,
  } = useBrainVisualization({
    patientId: currentPatientId,
    highlightActiveRegions: true,
    autoRotate: false,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Digital Twin Visualization
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <Card className="h-[calc(100vh-200px)] min-h-[500px]">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  Loading visualization...
                </div>
              }
            >
              <BrainVisualization />
            </Suspense>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Digital Twin Details</h2>
            {isLoading ? (
              <p>Loading patient data...</p>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-3 text-red-700">
                <h3 className="font-medium">Error Loading Data</h3>
                <p className="text-sm">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient ID</h3>
                  <p className="font-mono">{currentPatientId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Model Version</h3>
                  <p>{brainModel?.version || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Regions</h3>
                  <p>{brainModel?.regions?.length || 0} regions available</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Neural Pathways</h3>
                  <p>{brainModel?.connections?.length || 0} connections mapped</p>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Visualization Legend</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                <span>Active Region</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-gray-500"></div>
                <span>Inactive Region</span>
              </div>
              {renderMode === RenderMode.FUNCTIONAL && (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-blue-500"></div>
                  <span>Activity Level</span>
                </div>
              )}
              {renderMode === RenderMode.FUNCTIONAL && (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                  <span>Functional Area</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinDemo;
