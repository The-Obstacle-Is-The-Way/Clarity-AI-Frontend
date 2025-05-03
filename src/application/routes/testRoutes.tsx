/**
 * NOVAMIND Neural Digital Twin
 * Test Routes Configuration
 *
 * This module provides dedicated routes for testing components
 * with mathematical precision and architectural elegance.
 */

import React from 'react';
import { Route } from 'react-router-dom';
import BrainVisualization from '@presentation/organisms/BrainVisualization';
import NeuralControlPanel from '@presentation/organisms/NeuralControlPanel';
import BrainModelContainer from '@presentation/organisms/BrainModelContainer';

// Sample test data
const testData = {
  brainModel: {
    id: 'test-model-123',
    patientId: 'test-patient-456',
    regions: [
      {
        id: 'region-1',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 10, z: 5 },
        color: '#FF5733',
        connections: ['region-2'],
        activityLevel: 0.8,
        activity: 0.8,
        isActive: true,
        hemisphereLocation: 'left',
        dataConfidence: 0.95,
        volume: 120.5,
      },
      {
        id: 'region-2',
        name: 'Amygdala',
        position: { x: 5, y: -5, z: 2 },
        color: '#33FF57',
        connections: ['region-1', 'region-3'],
        activityLevel: 0.5,
        activity: 0.5,
        isActive: true,
        hemisphereLocation: 'right',
        dataConfidence: 0.90,
        volume: 30.2,
      },
      {
        id: 'region-3',
        name: 'Hippocampus',
        position: { x: -3, y: -8, z: 0 },
        color: '#3357FF',
        connections: ['region-2'],
        activityLevel: 0.3,
        activity: 0.3,
        isActive: false,
        hemisphereLocation: 'left',
        dataConfidence: 0.85,
        volume: 45.0,
      },
    ],
    connections: [
      {
        id: 'pfc-amy',
        sourceId: 'prefrontal',
        targetId: 'amygdala',
        strength: 0.8,
        type: 'excitatory',
        directionality: 'unidirectional',
        dataConfidence: 0.85,
      },
      {
        id: 'pfc-hip',
        sourceId: 'prefrontal',
        targetId: 'hippocampus',
        strength: 0.7,
        type: 'excitatory',
        directionality: 'unidirectional',
        dataConfidence: 0.85,
      },
      {
        id: 'amy-hip',
        sourceId: 'amygdala',
        targetId: 'hippocampus',
        strength: 0.9,
        type: 'inhibitory',
        directionality: 'bidirectional',
        dataConfidence: 0.85,
      },
    ],
    timestamp: new Date().toISOString(),
    processingLevel: 'analyzed',
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    scan: {
      id: 'SCAN_123',
      patientId: 'DEMO_PATIENT',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: { x: 1, y: 1, z: 1 },
      metadata: { acquisitionTime: 300, sequence: 'EPI' },
      dataQualityScore: 0.95,
    },
  },
};

/**
 * Brain Visualization Test Page
 */
const BrainVisualizationTestPage = () => (
  <div className="min-h-screen bg-black flex flex-col justify-center items-center">
    <h1 className="text-white text-2xl mb-4">Brain Visualization Test</h1>
    <div className="w-full max-w-5xl aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden">
      <BrainVisualization brainModel={testData.brainModel} />
    </div>
  </div>
);

/**
 * Neural Control Panel Test Page
 */
const NeuralControlPanelTestPage = () => (
  <div className="min-h-screen bg-gray-900 p-8">
    <h1 className="text-white text-2xl mb-6">Neural Control Panel Test</h1>
    <div className="border border-gray-700 rounded-lg p-4 bg-black/50 backdrop-blur-sm">
      <NeuralControlPanel
        patientId="DEMO_PATIENT_001"
        brainModelId="DEMO_SCAN_001"
        onSettingsChange={(settings) => console.log('Settings changed:', settings)}
      />
    </div>
  </div>
);

/**
 * Brain Model Container Test Page
 */
const BrainModelContainerTestPage = () => (
  <div className="min-h-screen bg-gray-900 p-4">
    <h1 className="text-white text-2xl mb-6">Brain Model Container Test</h1>
    <div className="h-[80vh] border border-gray-700 rounded-lg overflow-hidden">
      <BrainModelContainer patientId="DEMO_PATIENT_001" />
    </div>
  </div>
);

/**
 * Test Routes Component
 * Route definitions for test pages
 */
export const TestRoutes = () => (
  <>
    <Route path="/brain-visualization/demo" element={<BrainVisualizationTestPage />} />
    <Route path="/test/neural-control-panel" element={<NeuralControlPanelTestPage />} />
    <Route path="/brain-model-container/demo" element={<BrainModelContainerTestPage />} />
  </>
);
