/**
 * WebGL Test Environment Setup
 *
 * This file provides WebGL mocking and testing utilities for components that use Three.js
 */

import { vi } from 'vitest';

// Define types for memory tracking
interface TrackedObject {
  id?: string;
  type?: string;
  [key: string]: unknown;
}

interface WebGLMemoryTracking {
  allocatedObjects: Set<TrackedObject>;
  disposedObjects: Set<TrackedObject>;
  trackObject: (obj: TrackedObject) => void;
  untrackObject: (obj: TrackedObject) => void;
  objectTypes: Record<string, number>;
}

type GlobalWithTracking = typeof globalThis & {
  __WEBGL_MEMORY_TRACKING__?: WebGLMemoryTracking;
};

// Mock WebGL context
class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement;
  drawingBufferWidth: number;
  drawingBufferHeight: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.drawingBufferWidth = canvas.width;
    this.drawingBufferHeight = canvas.height;
  }

  // Add minimal WebGL methods needed for tests
  viewport() {}
  clearColor() {}
  clearDepth() {}
  clearStencil() {}
  clear() {}
  getExtension(name: string) {
    return {
      drawBuffersWEBGL: vi.fn(),
      createVertexArrayOES: vi.fn(),
      bindVertexArrayOES: vi.fn(),
    };
  }
}

// Mock all required THREE elements for testing
vi.mock('three', async () => {
  const originalModule = await vi.importActual('three');

  return {
    ...(originalModule as any),
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      domElement: document.createElement('canvas'),
      render: vi.fn(),
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      setClearColor: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      info: {
        reset: vi.fn(),
      },
      shadowMap: {
        enabled: false,
        type: 1,
      },
      outputEncoding: 'sRGBEncoding',
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
      traverse: vi.fn(),
      background: null,
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 5, set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
      aspect: 1,
    })),
    Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z, set: vi.fn() })),
    Color: vi.fn().mockImplementation(() => ({
      r: 1,
      g: 1,
      b: 1,
      set: vi.fn(),
      copy: vi.fn(),
    })),
    Box3: vi.fn().mockImplementation(() => ({
      min: { x: -1, y: -1, z: -1 },
      max: { x: 1, y: 1, z: 1 },
      setFromObject: vi.fn(),
    })),
    Object3D: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0, set: vi.fn() },
      rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
      scale: { x: 1, y: 1, z: 1, set: vi.fn() },
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    })),
    Group: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0, set: vi.fn() },
      rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
      scale: { x: 1, y: 1, z: 1, set: vi.fn() },
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    })),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0, set: vi.fn() },
      rotation: { x: 0, y: 0, z: 0, set: vi.fn() },
      scale: { x: 1, y: 1, z: 1, set: vi.fn() },
      material: null,
      geometry: null,
      visible: true,
    })),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({
      color: { r: 1, g: 1, b: 1, set: vi.fn() },
      opacity: 1,
      transparent: false,
      wireframe: false,
      dispose: vi.fn(),
    })),
    SphereGeometry: vi.fn().mockImplementation(() => ({
      dispose: vi.fn(),
    })),
    BoxGeometry: vi.fn().mockImplementation(() => ({
      dispose: vi.fn(),
    })),
    BufferGeometry: vi.fn().mockImplementation(() => ({
      dispose: vi.fn(),
      setAttribute: vi.fn(),
    })),
    OrbitControls: vi.fn().mockImplementation(() => ({
      update: vi.fn(),
      enabled: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});

// Setup global WebGL mocks
beforeAll(() => {
  // Mock canvas methods
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (
      contextType === 'webgl' ||
      contextType === 'webgl2' ||
      contextType === 'experimental-webgl'
    ) {
      return new MockWebGLRenderingContext(this);
    }
    return null;
  };

  // Add window.ResizeObserver mock
  if (!window.ResizeObserver) {
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }
});

/**
 * Setup WebGL Mocks with memory tracking capabilities
 *
 * @param options Configuration options for WebGL mocks
 * @returns The mock WebGL context
 */
export function setupWebGLMocks(options = { monitorMemory: false, debugMode: false }) {
  // Initialize memory tracking if enabled
  if (options.monitorMemory) {
    // Define the structure for memory tracking on globalThis
    const global = globalThis as GlobalWithTracking;
    global.__WEBGL_MEMORY_TRACKING__ = {
      allocatedObjects: new Set<TrackedObject>(),
      disposedObjects: new Set<TrackedObject>(),
      trackObject: (obj: TrackedObject) => {
        const memTrack = (globalThis as GlobalWithTracking).__WEBGL_MEMORY_TRACKING__;
        memTrack?.allocatedObjects.add(obj);
      },
      untrackObject: (obj: TrackedObject) => {
        const memTrack = (globalThis as GlobalWithTracking).__WEBGL_MEMORY_TRACKING__;
        if (memTrack) {
          memTrack.allocatedObjects.delete(obj);
          memTrack.disposedObjects.add(obj);
        }
      },
      objectTypes: {},
    };
  }

  // Clear any existing mocks
  vi.clearAllMocks();

  return new MockWebGLRenderingContext(document.createElement('canvas'));
}

/**
 * Cleanup WebGL mocks and return memory tracking report
 *
 * @returns Memory tracking report if monitoring was enabled
 */
export function cleanupWebGLMocks() {
  // Reset all mocks
  vi.clearAllMocks();

  // Return memory tracking report if enabled
  const global = globalThis as GlobalWithTracking;
  const trackingData = global.__WEBGL_MEMORY_TRACKING__;
  if (trackingData) {
    const report = {
      leakedObjectCount: trackingData.allocatedObjects.size,
      disposedObjectCount: trackingData.disposedObjects.size,
      leakedObjects: Array.from(trackingData.allocatedObjects),
      leakedObjectTypes: trackingData.objectTypes,
    };

    // Clean up tracking
    delete global.__WEBGL_MEMORY_TRACKING__;

    return report;
  }

  return null;
}

// Export WebGL test helpers
export const createMockCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
};

export const resetMocks = () => {
  vi.clearAllMocks();
};
