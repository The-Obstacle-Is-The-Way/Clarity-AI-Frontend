import React, { useState, Suspense } from 'react';
import { Card } from '@/presentation/atoms';
import { QuantumNeuralVisualization } from '@presentation/organisms/QuantumNeuralVisualization';
import { RenderMode } from '@domain/types/brain/visualization';
import type { BrainModel } from '@domain/types/brain/models';
import type { VisualizationSettings } from '@domain/types/brain/visualization';

// Placeholder data 
const placeholderBrainModel: BrainModel = {
  id: 'demo-model-1',
  patientId: 'demo-patient-1',
  scan: { id: 'scan-1', type: 'fMRI', date: new Date().toISOString() },
  timestamp: new Date().toISOString(),
  version: 1,
  metadata: { source: 'demo' },
  qualityScore: 0.95,
  regions: [
    { id: 'region-1', name: 'Prefrontal Cortex', position: { x: -2, y: 2, z: 1 }, color: '#ff0000', connections: ['conn-1', 'conn-2'], activityLevel: 0.6, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.85, volume: 1500, activity: 0.6 },
    { id: 'region-2', name: 'Amygdala', position: { x: 1, y: -1, z: -1 }, color: '#00ff00', connections: ['conn-1', 'conn-3'], activityLevel: 0.9, isActive: true, hemisphereLocation: 'right', dataConfidence: 0.9, volume: 800, activity: 0.9 },
    { id: 'region-3', name: 'Hippocampus', position: { x: -1, y: -0.5, z: -1.5 }, color: '#0000ff', connections: ['conn-2', 'conn-3'], activityLevel: 0.4, isActive: false, hemisphereLocation: 'left', dataConfidence: 0.8, volume: 1200, activity: 0.4 },
  ],
  connections: [
    { id: 'conn-1', sourceId: 'region-1', targetId: 'region-2', strength: 0.8, activityLevel: 0.7, type: 'excitatory', directionality: 'unidirectional', dataConfidence: 0.9 },
    { id: 'conn-2', sourceId: 'region-1', targetId: 'region-3', strength: 0.6, activityLevel: 0.4, type: 'inhibitory', directionality: 'unidirectional', dataConfidence: 0.8 },
    { id: 'conn-3', sourceId: 'region-2', targetId: 'region-3', strength: 0.9, activityLevel: 0.9, type: 'excitatory', directionality: 'bidirectional', dataConfidence: 0.95 },
  ],
};
const placeholderVisSettings: VisualizationSettings = {
  connectionBaseColor: '#888888',
  regionBaseColor: '#cccccc',
  highlightColor: '#ffdd55',
  activityColorScale: ['#0000ff', '#00ff00', '#ffff00', '#ff0000'],
  showConnections: true,
  connectionThickness: 1.0,
  connectionOpacity: 0.8,
  regionSize: 1.0,
};

/**
 * DigitalTwin Demo Page
 * Demonstrates the brain visualization component with controls
 */
const DigitalTwinDemo: React.FC = () => {
  const [currentRenderMode, setCurrentRenderMode] = useState<RenderMode>(
    RenderMode.ANATOMICAL
  );

  const handleRenderModeChange = (newMode: RenderMode) => {
    setCurrentRenderMode(newMode);
  };

  if (!placeholderBrainModel) {
    return <div>Error loading demo data.</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-md z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Digital Twin Demo</h1>
        <div className="mt-2">
          <label className="mr-2">Render Mode:</label>
          <select 
            value={currentRenderMode} 
            onChange={(e) => handleRenderModeChange(e.target.value as RenderMode)}
            className="p-1 rounded border bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value={RenderMode.ANATOMICAL}>Anatomical</option>
            <option value={RenderMode.ACTIVITY}>Activity</option>
          </select>
        </div>
      </header>

      <main className="flex-grow relative">
        <Card className="absolute inset-0">
          <Suspense fallback={<div>Loading Visualization...</div>}>
            <QuantumNeuralVisualization 
              initialModel={placeholderBrainModel}
              visualizationSettings={placeholderVisSettings}
            />
          </Suspense>
        </Card>
      </main>

      <footer className="p-4 bg-white dark:bg-gray-800 shadow-md z-10 mt-auto">
        <h2 className="text-lg font-semibold mb-2">Legend</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-yellow-400"></div>
            <span>Selected Region</span>
          </div>
          {currentRenderMode === RenderMode.ACTIVITY && (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-red-500"></div>
              <span>Activity Level (Blue: Low, Red: High)</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DigitalTwinDemo;
