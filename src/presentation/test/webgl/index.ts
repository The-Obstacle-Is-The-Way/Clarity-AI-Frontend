/**
 * WebGL Test Setup
 *
 * Provides mocks for WebGL required in tests
 */
import { vi } from 'vitest';

// Mock canvas and webgl context for tests
class MockCanvas {
  getContext() {
    return {
      createShader: vi.fn(),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn().mockReturnValue(true),
      getProgramParameter: vi.fn().mockReturnValue(true),
      getShaderInfoLog: vi.fn(),
      getProgramInfoLog: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      getAttribLocation: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
    };
  }
}

// Mock Three.js
vi.mock('three', () => {
  return {
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      shadowMap: {},
      outputEncoding: 0,
      setPixelRatio: vi.fn(),
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      background: null,
      children: [],
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    })),
    BoxGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    MeshBasicMaterial: vi.fn(),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
    })),
    Color: vi.fn(),
    Vector3: vi.fn().mockImplementation(() => ({
      set: vi.fn(),
      copy: vi.fn(),
      add: vi.fn(),
      sub: vi.fn(),
      multiplyScalar: vi.fn(),
      normalize: vi.fn(),
      clone: vi.fn(),
    })),
    Group: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      children: [],
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
    })),
    Box3: vi.fn().mockImplementation(() => ({
      setFromObject: vi.fn(),
      getSize: vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 }),
      getCenter: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    })),
    Object3D: {
      DefaultUp: { set: vi.fn() },
    },
    Clock: vi.fn().mockImplementation(() => ({
      getDelta: vi.fn().mockReturnValue(0.01),
      elapsedTime: 0,
    })),
    Raycaster: vi.fn().mockImplementation(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn().mockReturnValue([]),
    })),
  };
});

// Setup mock canvas
global.HTMLCanvasElement.prototype.getContext = function () {
  return new MockCanvas().getContext();
};

// Required for React Three Fiber
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Export a dummy function to import in tests
export const mockWebGL = () => {
  // This function is just a marker to ensure the mocks are loaded
  return true;
};

export default mockWebGL; 