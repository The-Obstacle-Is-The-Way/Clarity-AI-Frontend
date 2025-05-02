/**
 * THREE.js test utilities for Novamind tests
 * Provides mocks and test helpers for THREE.js component testing
 */

import { vi } from 'vitest';

// Mock THREE context
export const mockThreeContext = {
  camera: {
    position: { x: 0, y: 0, z: 10 },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  },
  gl: {
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
    setClearColor: vi.fn(),
  },
  scene: {
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  },
  size: { width: 800, height: 600 },
  viewport: { width: 800, height: 600 },
  events: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  get: vi.fn(),
  invalidate: vi.fn(),
  advance: vi.fn(),
  setSize: vi.fn(),
  onPointerMissed: vi.fn(),
  pointer: { x: 0, y: 0 },
};

// Mock for useThree hook
export const mockUseThree = () => mockThreeContext;

// Mock for useFrame hook
export const mockUseFrame = vi.fn((callback) => {
  callback(mockThreeContext, 0);
  return undefined;
});

// Create mock Vector3 implementation
export const mockVector3 = {
  x: 0,
  y: 0,
  z: 0,
  set: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  sub: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  divide: vi.fn().mockReturnThis(),
  length: vi.fn().mockReturnValue(0),
  normalize: vi.fn().mockReturnThis(),
  clone: vi.fn().mockReturnThis(),
  applyQuaternion: vi.fn().mockReturnThis(),
};

// Create mock brain regions for testing
export const createMockBrainRegions = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `region-${index}`,
    name: `Brain Region ${index}`,
    position: { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, z: Math.random() * 10 - 5 },
    color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
    size: Math.random() * 2 + 0.5,
    activity: Math.random(),
    connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, cIndex) => ({
      target: `region-${(index + cIndex + 1) % count}`,
      strength: Math.random() * 0.8 + 0.2,
    })),
    clinicalData: {
      associatedConditions: ['Anxiety', 'Depression'].slice(0, Math.floor(Math.random() * 2) + 1),
      normalActivity: Math.random() * 0.5 + 0.5,
      significance: Math.random(),
    },
  }));
};

// Mock for THREE.Object3D
export const mockObject3D = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  visible: true,
  parent: null,
  children: [],
  add: vi.fn(),
  remove: vi.fn(),
  updateMatrix: vi.fn(),
  updateMatrixWorld: vi.fn(),
  lookAt: vi.fn(),
  traverse: vi.fn(),
};

// Export a common mock for r3f tests
export const createR3fTestProps = () => ({
  gl: {
    domElement: document.createElement('canvas'),
    setSize: vi.fn(),
    render: vi.fn(),
  },
  size: { width: 800, height: 600 },
  camera: {
    position: { x: 0, y: 0, z: 10 },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn(),
  },
  scene: {
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  },
});
