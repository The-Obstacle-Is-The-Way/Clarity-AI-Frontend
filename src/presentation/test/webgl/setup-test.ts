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

// Track objects for memory leak detection
let allocatedObjects: Record<string, unknown[]> = {};

/**
 * Sets up WebGL mocks for testing
 * @param options Configuration options
 * @returns Setup success indicator
 */
export function setupWebGLMocks(options: { monitorMemory?: boolean; debugMode?: boolean } = {}): boolean {
  // Reset mocks
  Object.values(mockWebGLContext).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });

  // Setup canvas mock
  window.HTMLCanvasElement.prototype.getContext = function(contextId: string) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return mockWebGLContext;
    }
    return null;
  };

  // Set up ResizeObserver mock
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (options.monitorMemory) {
    // Reset tracking
    allocatedObjects = {};
    
    // Start tracking allocations for memory leak detection
    const originalCreateBuffer = mockWebGLContext.createBuffer;
    mockWebGLContext.createBuffer = vi.fn(() => {
      const buffer = { id: `buffer-${Math.random()}` };
      if (!allocatedObjects.buffers) allocatedObjects.buffers = [];
      allocatedObjects.buffers.push(buffer);
      if (options.debugMode) console.log(`[WebGL] Created buffer: ${buffer.id}`);
      return buffer;
    });
    
    // Track other resources as needed
  }

  return true;
}

/**
 * Cleans up WebGL mocks after tests
 * @returns Memory report if monitoring was enabled
 */
export function cleanupWebGLMocks(): { leakedObjectCount?: number; details?: Record<string, unknown> } | undefined {
  // Reset mocks
  Object.values(mockWebGLContext).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      mock.mockReset();
    }
  });

  // Check for memory leaks
  if (Object.keys(allocatedObjects).length > 0) {
    const totalObjects = Object.values(allocatedObjects).reduce(
      (sum, arr) => sum + arr.length, 
      0
    );
    
    // Return memory report
    return {
      leakedObjectCount: totalObjects,
      details: allocatedObjects
    };
  }
  
  return undefined;
}

export default setupWebGLMocks; 