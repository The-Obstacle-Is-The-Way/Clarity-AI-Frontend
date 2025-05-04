import { vi } from 'vitest';
import { Vector3, Color } from 'three';

/**
 * Mock THREE.js components for testing
 * This avoids WebGL context issues in test environments
 */
export const ThreeMocks = {
  /**
   * Mock for WebGLRenderer
   */
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: document.createElement('canvas'),
    info: {
      render: {
        triangles: 0,
        calls: 0
      }
    }
  })),

  /**
   * Mock for Scene
   */
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    traverse: vi.fn(callback => {
      // No-op in mock
    })
  })),

  /**
   * Mock for PerspectiveCamera
   */
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: new Vector3(),
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn()
  })),

  /**
   * Mock for OrbitControls
   */
  OrbitControls: vi.fn().mockImplementation(() => ({
    update: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispose: vi.fn(),
    enabled: true
  })),

  /**
   * Mock for DirectionalLight
   */
  DirectionalLight: vi.fn().mockImplementation(() => ({
    position: new Vector3(),
    intensity: 1,
    color: new Color()
  })),

  /**
   * Mock for AmbientLight
   */
  AmbientLight: vi.fn().mockImplementation(() => ({
    intensity: 1,
    color: new Color()
  })),

  /**
   * Mock for Mesh
   */
  Mesh: vi.fn().mockImplementation(() => ({
    position: new Vector3(),
    rotation: { x: 0, y: 0, z: 0 },
    scale: new Vector3(1, 1, 1),
    material: null,
    geometry: null,
    visible: true
  })),

  /**
   * Mock for Group
   */
  Group: vi.fn().mockImplementation(() => ({
    position: new Vector3(),
    rotation: { x: 0, y: 0, z: 0 },
    scale: new Vector3(1, 1, 1),
    add: vi.fn(),
    remove: vi.fn(),
    children: []
  }))
};

/**
 * Utilities for testing Three.js components
 */
export const ThreeTestUtils = {
  /**
   * Setup THREE.js mocking
   */
  setupThreeMocking() {
    // Mock the entire three module
    vi.mock('three', async () => {
      const actual = await vi.importActual('three');
      return {
        ...actual as object,
        WebGLRenderer: ThreeMocks.WebGLRenderer,
        Scene: ThreeMocks.Scene,
        PerspectiveCamera: ThreeMocks.PerspectiveCamera,
        DirectionalLight: ThreeMocks.DirectionalLight,
        AmbientLight: ThreeMocks.AmbientLight,
        Mesh: ThreeMocks.Mesh,
        Group: ThreeMocks.Group
      };
    });

    // Mock OrbitControls separately since it's a submodule
    vi.mock('@react-three/drei', async () => {
      const actual = await vi.importActual('@react-three/drei');
      return {
        ...actual as object,
        OrbitControls: ThreeMocks.OrbitControls
      };
    });
  },

  /**
   * Create a test wrapper for a Three.js component that only tests its logic
   * @param useHookFn - The hook function that contains the component's logic
   * @param initialProps - Initial props to pass to the hook
   * @returns A test wrapper for the logic
   */
  createLogicTestWrapper<T, P>(useHookFn: (props: P) => T, initialProps: P) {
    return {
      renderHook: (props = initialProps) => {
        return useHookFn(props);
      }
    };
  },

  /**
   * Mock canvas used by R3F
   */
  mockCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    // Mock canvas context
    canvas.getContext = vi.fn().mockImplementation((contextId) => {
      if (contextId === 'webgl' || contextId === 'webgl2') {
        return {
          canvas,
          viewport: vi.fn(),
          clearColor: vi.fn(),
          enable: vi.fn(),
          clear: vi.fn(),
          drawArrays: vi.fn(),
          useProgram: vi.fn(),
          createBuffer: vi.fn(),
          bindBuffer: vi.fn(),
          bufferData: vi.fn()
        };
      }
      return null;
    });
    
    return canvas;
  },
  
  /**
   * Calculate normalized vector data from brain region coordinates
   * This logic can be tested without using actual Three.js rendering
   */
  calculateRegionNormalizedData(regions: Array<{ position: Vector3, scale: Vector3 }>) {
    return regions.map(region => {
      const pos = region.position;
      // Normalize coordinates to 0-1 range
      return {
        normalizedX: (pos.x + 100) / 200, // Assuming -100 to 100 range
        normalizedY: (pos.y + 100) / 200,
        normalizedZ: (pos.z + 100) / 200,
        scale: region.scale.length()
      };
    });
  }
}; 