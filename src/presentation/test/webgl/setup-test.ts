/**
 * WebGL Test Setup
 *
 * Sets up WebGL mocks for tests
 */
import { vi } from 'vitest';

// WebGL mocks
const mockWebGLContext = {
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

// Setup mock canvas
class MockHTMLCanvasElement extends HTMLCanvasElement {
  getContext(contextId: string) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return mockWebGLContext;
    }
    return null;
  }
}

// Mock canvas
window.HTMLCanvasElement.prototype.getContext = function(contextId: string) {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return mockWebGLContext;
  }
  return null;
};

// Required for React Three Fiber
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Setup function
export function setupWebGLMocks() {
  // Additional setup if needed
  return true;
}

export default setupWebGLMocks; 