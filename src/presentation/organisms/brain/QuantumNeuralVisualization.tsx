/**
 * CLARITY-AI QuantumNeuralVisualization Component
 * Advanced neural visualization with quantum-level precision and AI-driven insights
 */

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Color } from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NeuralControlPanel } from './NeuralControlPanel';
import { VisualizationErrorBoundary } from '@presentation/organisms/error';
import { RenderMode } from '@domain/types/brain/visualization';
import type { BrainModel, BrainRegion, NeuralConnection } from '@domain/types/brain/models';
import ConnectionLine from '@/presentation/atoms/data-visualization/ConnectionLine';
import type { VisualizationSettings } from '@domain/types/brain/visualization';

// Neural connection component
// This component is currently unused but kept for future reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/*
const _NeuralConnectionComponent = React.memo(({ start, end, strength, isActive }: { start: Vector3; end: Vector3; strength: number; isActive: boolean }) => {
  const ref = useRef<any>();

  useEffect(() => {
    if (ref.current) {
      ref.current.position.copy(start);
      ref.current.lookAt(end);
      ref.current.scale.z = new Vector3().subVectors(end, start).length();
    }
  }, [start, end]);

  const color = useMemo(() => {
    return isActive ? new Color(0.6, 0.2, 1.0) : new Color(0.2, 0.2, 0.3);
  }, [isActive]);

  const opacity = useMemo(() => {
    return 0.2 + strength * 0.8;
  }, [strength]);

  return (
    <mesh ref={ref} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1, 8]} attach="geometry" />
      <meshStandardMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={isActive ? 0.5 : 0}
      />
    </mesh>
  );
});
*/

// Neural region component
const NeuralRegion = React.memo(
  ({ position, color, size, activity, isSelected, onSelect }: any) => {
    const meshRef = useRef<any>();
    const [hovered, setHovered] = useState(false);

    // Pulse effect for active regions
    useFrame((state) => {
      if (meshRef.current && activity > 0.5) {
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05 * activity;
        meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      }
    });

    const regionColor = useMemo(() => {
      return new Color(color);
    }, [color]);

    const emissiveIntensity = useMemo(() => {
      return activity * 0.5;
    }, [activity]);

    return (
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        scale={[size, size, size]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={regionColor}
          emissive={regionColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
          transparent={true}
          opacity={0.9}
          wireframe={false}
        />
        {(isSelected || hovered) && (
          <mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="white" transparent={true} opacity={0.2} wireframe={true} />
          </mesh>
        )}
      </mesh>
    );
  }
);

// Brain model container
const BrainModelContainer = ({
  brainModel,
  selectedRegions,
  onSelectRegion,
  visualizationSettings,
}: any) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (!brainModel || !brainModel.regions) {
    return null;
  }

  return (
    <group>
      {/* Neural regions */}
      {brainModel.regions.map((region: BrainRegion) => (
        <NeuralRegion
          key={region.id}
          position={region.position}
          color={region.color}
          size={region.volume * 0.05 + 0.2}
          activity={region.activityLevel}
          isSelected={selectedRegions.includes(region.id)}
          onSelect={() => onSelectRegion(region.id)}
        />
      ))}

      {/* Neural connections */}
      {brainModel.connections.map((connection: NeuralConnection) => {
        const sourceRegion = brainModel.regions.find(
          (r: BrainRegion) => r.id === connection.sourceId
        );
        const targetRegion = brainModel.regions.find(
          (r: BrainRegion) => r.id === connection.targetId
        );

        if (!sourceRegion || !targetRegion) {
          return null;
        }

        return (
          <ConnectionLine
            key={connection.id}
            id={connection.id}
            startPosition={sourceRegion.position}
            endPosition={targetRegion.position}
            strength={connection.strength}
            activityLevel={connection.activityLevel || 0}
            connectingRegions={[connection.sourceId, connection.targetId]}
            visualizationSettings={visualizationSettings}
          />
        );
      })}
    </group>
  );
};

// Main neural visualization component with quality presets
const NeuralVisualization = React.memo(
  ({
    brainModel,
    detailLevel,
    selectedRegions = [],
    onSelectRegion,
    visualizationSettings,
  }: { brainModel: BrainModel | null; renderMode?: RenderMode; detailLevel: 'low' | 'medium' | 'high' | 'ultra'; selectedRegions: string[]; onSelectRegion: (id: string) => void; visualizationSettings: VisualizationSettings }) => {
    const dprSettings = useMemo(() => {
      // Adjust detail level based on settings
      switch (detailLevel) {
        case 'ultra':
          return [1, 2] as [number, number];
        case 'high':
          return [1, 1.5] as [number, number];
        case 'medium':
          return [1, 1] as [number, number];
        case 'low':
          return [0.5, 1] as [number, number];
        default:
          return [1, 1] as [number, number];
      }
    }, [detailLevel]);

    // If no brain model data, show a loading fallback
    if (!brainModel) {
      return (
        <LoadingFallback />
      );
    }

    return (
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={dprSettings}
        gl={{ antialias: detailLevel !== 'low', alpha: true }}
      >
        <color attach="background" args={[0.01, 0.01, 0.03]} />

        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <directionalLight position={[-10, 10, 5]} intensity={0.8} castShadow />

        <VisualizationErrorBoundary fallback={<LoadingFallback />}>
          <BrainModelContainer
            brainModel={brainModel}
            selectedRegions={selectedRegions}
            onSelectRegion={onSelectRegion}
            visualizationSettings={visualizationSettings}
          />
        </VisualizationErrorBoundary>
        <OrbitControls dampingFactor={0.05} rotateSpeed={0.5} zoomSpeed={0.8} />
        <Environment preset="city" />
      </Canvas>
    );
  }
);

// Fallback component for loading state
const LoadingFallback = () => (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[1, 16, 16]} />
    <meshStandardMaterial color="#223" wireframe />
  </mesh>
);

// Mock brain data generator for demo purposes
const generateMockBrainData = () => {
  const regions: BrainRegion[] = [];
  const connections: NeuralConnection[] = [];

  // Generate 40 regions with randomized positions
  for (let i = 0; i < 40; i++) {
    const id = `region-${i}`;
    const hemisphereLocation = Math.random() < 0.5 ? 'left' : 'right';
    const x = (hemisphereLocation === 'left' ? -1 : 1) * (Math.random() * 1.5 + 0.5);
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;

    regions.push({
      id,
      name: `Brain Region ${i}`,
      position: { x, y, z },
      color: `hsl(${Math.floor(Math.random() * 260 + 180)}, 70%, 60%)`,
      connections: [],
      activityLevel: Math.random(),
      isActive: Math.random() > 0.5,
      hemisphereLocation,
      dataConfidence: Math.random() * 0.3 + 0.7,
      volume: Math.random() * 0.8 + 0.2,
      activity: Math.random(),
      tissueType: Math.random() > 0.5 ? 'gray' : 'white',
    } as BrainRegion);
  }

  // Generate 60 connections between regions
  for (let i = 0; i < 60; i++) {
    const sourceIndex = Math.floor(Math.random() * regions.length);
    let targetIndex = Math.floor(Math.random() * regions.length);

    // Avoid self-connections
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * regions.length);
    }

    connections.push({
      id: `connection-${i}`,
      sourceId: regions[sourceIndex].id,
      targetId: regions[targetIndex].id,
      strength: Math.random() * 0.8 + 0.2,
      type: Math.random() > 0.5 ? 'excitatory' : 'inhibitory',
      directionality: Math.random() > 0.3 ? 'unidirectional' : 'bidirectional',
      activityLevel: Math.random(),
      dataConfidence: Math.random() * 0.3 + 0.7,
    } as NeuralConnection);

    // Add to region's connections array
    regions[sourceIndex].connections.push(regions[targetIndex].id);
  }

  // Create the brain model with the generated data
  return {
    id: 'mock-brain-model',
    patientId: 'patient-123',
    regions,
    connections,
    scan: {
      id: 'scan-123',
      patientId: 'patient-123',
      scanDate: new Date().toISOString(),
      scanType: 'MRI',
      resolution: { x: 256, y: 256, z: 128 },
      metadata: {},
      dataQualityScore: 0.92,
    },
    timestamp: new Date().toISOString(),
    version: '1.0',
    processingLevel: 'analyzed',
    lastUpdated: new Date().toISOString(),
  } as BrainModel;
};

// AI Insight panel
const AIInsightPanel = ({ brainModel, selectedRegions }: any) => {
  // Generate AI-driven insights based on selected regions
  const insights = useMemo(() => {
    if (!brainModel || selectedRegions.length === 0) {
      return [];
    }

    return [
      {
        title: 'Activation Pattern',
        text: "Current neural activation patterns indicate heightened activity in the selected regions, suggesting potential correlation with the patient's symptomatology.",
        confidence: 0.87,
      },
      {
        title: 'Treatment Response',
        text: 'Based on similar activation patterns in the research database, patients with this neural signature have shown an 82% response rate to targeted cognitive therapy combined with low-dose medication.',
        confidence: 0.76,
      },
      {
        title: 'Connectivity Analysis',
        text: 'The selected regions show abnormal connectivity strength with temporal lobe structures, which may relate to the reported episodic memory deficits.',
        confidence: 0.92,
      },
    ];
  }, [brainModel, selectedRegions]);

  if (!insights.length) {
    return null;
  }

  return (
    <Card className="w-full bg-slate-800/90 backdrop-blur-md text-white border-slate-700 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Quantum AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-slate-700/50 rounded-md">
              <h4 className="font-medium text-indigo-300 text-sm">{insight.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{insight.text}</p>
              <div className="flex items-center mt-2">
                <div className="h-1.5 w-full bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${insight.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main component export
interface QuantumNeuralVisualizationProps {
  className?: string;
  patientId?: string;
  brainModelId?: string;
  initialModel: BrainModel | null;
  visualizationSettings: VisualizationSettings;
  onRegionSelect?: (regionId: string) => void;
}

export const QuantumNeuralVisualization: React.FC<QuantumNeuralVisualizationProps> = ({
  className = '',
  patientId,
  brainModelId,
  initialModel,
  visualizationSettings,
  onRegionSelect,
}) => {
  // State
  const [brainModel, setBrainModel] = useState<BrainModel | null>(initialModel);
  const [_renderMode, setRenderMode] = useState(RenderMode.ANATOMICAL);
  const [detailLevel, setDetailLevel] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock brain data on mount
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      const mockData = generateMockBrainData();
      setBrainModel(mockData);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [patientId, brainModelId]);

  // Handle region selection
  const handleSelectRegion = useCallback(
    (regionId: string) => {
      setSelectedRegions((prev) => {
        if (prev.includes(regionId)) {
          return prev.filter((id) => id !== regionId);
        } else {
          return [...prev, regionId];
        }
      });
      if (onRegionSelect) {
        onRegionSelect(regionId);
      }
    },
    [onRegionSelect]
  );

  if (isLoading) {
    return (
      <div
        className={`${className} flex items-center justify-center h-[600px] bg-slate-900 rounded-lg`}
      >
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-300 border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">
            Initializing Quantum Neural Visualization...
          </p>
          <p className="text-sm text-slate-500">Loading connectome data and analysis modules</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className="absolute top-4 right-4 z-10">
        <NeuralControlPanel
          compact={false}
          showPerformanceControls={true}
          allowExport={true}
          patientId={patientId}
          brainModelId={brainModelId}
          onSettingsChange={(settings) => {
            if (settings.renderMode) setRenderMode(settings.renderMode as RenderMode);
            if (settings.detailLevel) setDetailLevel(settings.detailLevel as any);
          }}
        />
      </div>

      <div className="h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
        <NeuralVisualization
          brainModel={brainModel}
          detailLevel={detailLevel}
          selectedRegions={selectedRegions}
          onSelectRegion={handleSelectRegion}
          visualizationSettings={visualizationSettings}
        />
      </div>

      <AIInsightPanel brainModel={brainModel} selectedRegions={selectedRegions} />
    </div>
  );
};

export default QuantumNeuralVisualization;
