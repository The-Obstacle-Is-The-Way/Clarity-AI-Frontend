/**
 * WebGL Test Setup
 *
 * Provides mocks for WebGL required in tests
 */

// Mock canvas and webgl context for tests
class MockCanvas {
  getContext() {
    return {
      createShader: jest.fn(),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn().mockReturnValue(true),
      getProgramParameter: jest.fn().mockReturnValue(true),
      getShaderInfoLog: jest.fn(),
      getProgramInfoLog: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      getAttribLocation: jest.fn(),
      vertexAttribPointer: jest.fn(),
      getUniformLocation: jest.fn(),
      uniform1f: jest.fn(),
      uniform2f: jest.fn(),
      uniform3f: jest.fn(),
      uniform4f: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      drawArrays: jest.fn(),
      drawElements: jest.fn(),
      viewport: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
    };
  }
}

// Mock Three.js
jest.mock('three', () => {
  return {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      shadowMap: {},
      outputEncoding: 0,
      setPixelRatio: jest.fn(),
      domElement: document.createElement('canvas'),
      dispose: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      background: null,
      children: [],
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    })),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
    })),
    Color: jest.fn(),
    Vector3: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      copy: jest.fn(),
      add: jest.fn(),
      sub: jest.fn(),
      multiplyScalar: jest.fn(),
      normalize: jest.fn(),
      clone: jest.fn(),
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      children: [],
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
    })),
    Box3: jest.fn().mockImplementation(() => ({
      setFromObject: jest.fn(),
      getSize: jest.fn().mockReturnValue({ x: 1, y: 1, z: 1 }),
      getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    })),
    Object3D: {
      DefaultUp: { set: jest.fn() },
    },
    Clock: jest.fn().mockImplementation(() => ({
      getDelta: jest.fn().mockReturnValue(0.01),
      elapsedTime: 0,
    })),
    Raycaster: jest.fn().mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn().mockReturnValue([]),
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