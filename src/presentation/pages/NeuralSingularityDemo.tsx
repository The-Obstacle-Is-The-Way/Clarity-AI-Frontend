/**
 * CLARITY-AI Neural Singularity Demo
 * Showcase of advanced neural visualization capabilities
 */

import React from 'react';
import QuantumNeuralVisualization from '@presentation/organisms/QuantumNeuralVisualization';
import type { BrainModel } from '@domain/types/brain/models';
import type { VisualizationSettings } from '@domain/types/brain/visualization';

// Remove empty interface if no props are needed, or add expected props.
// Assuming no props for now:
// interface NeuralSingularityDemoProps {}

const placeholderBrainModel: BrainModel = {
  id: 'demo-model-1',
  regions: [
    { id: 'region-1', name: 'Prefrontal Cortex', position: [-2, 2, 1] },
    { id: 'region-2', name: 'Amygdala', position: [1, -1, -1] },
    { id: 'region-3', name: 'Hippocampus', position: [-1, -0.5, -1.5] },
  ],
  connections: [
    { id: 'conn-1', source: 'region-1', target: 'region-2', strength: 0.8, activityLevel: 0.7 },
    { id: 'conn-2', source: 'region-1', target: 'region-3', strength: 0.6, activityLevel: 0.4 },
    { id: 'conn-3', source: 'region-2', target: 'region-3', strength: 0.9, activityLevel: 0.9 },
  ],
};

const placeholderVisSettings: VisualizationSettings = {
  connectionBaseColor: '#888888',
  regionBaseColor: '#cccccc',
  highlightColor: '#ffdd55',
  activityColorMap: 'viridis',
  showConnections: true,
  showRegions: true,
  connectionThicknessFactor: 1.0,
  connectionOpacityFactor: 0.8,
  regionSizeFactor: 1.0,
};

export const NeuralSingularityDemo: React.FC<NeuralSingularityDemoProps> = () => {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
          Neural Singularity Demonstration
        </h1>
        <p className="text-slate-500 mt-2">
          Quantum-level neural visualization with AI-driven insights
        </p>
      </header>

      <main>
        <div className="bg-slate-900 rounded-xl p-6 shadow-xl h-[70vh]">
          <QuantumNeuralVisualization
            initialModel={placeholderBrainModel}
            visualizationSettings={placeholderVisSettings}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-indigo-500"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              About This Demonstration
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              The Neural Singularity visualization demonstrates advanced brain mapping with
              quantum-level precision. This technology enables psychiatrists to visualize neural
              pathways, analyze connectivity patterns, and identify regions associated with specific
              mental health conditions.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2">
              The interactive 3D model allows for direct manipulation, region selection, and
              real-time analysis of neural activity patterns, providing unprecedented insights into
              brain function and potential treatment approaches.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-indigo-500"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13 13.5V19"></path>
                <path d="M16 16H7"></path>
              </svg>
              Clinical Applications
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>Precision diagnostics for complex psychiatric conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>Personalized treatment planning based on neural connectivity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>Tracking treatment efficacy through longitudinal neural changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>
                  Early detection of neurological patterns associated with psychiatric risk factors
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>AI-augmented clinical decision support for complex cases</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>CLARITY-AI Neural Digital Twin Platform • Psychiatry Quantum Visualization System</p>
        <p className="mt-1">
          This demonstration showcases the latest in neural visualization technology and AI
          integration.
        </p>
      </footer>
    </div>
  );
};

export default NeuralSingularityDemo;
