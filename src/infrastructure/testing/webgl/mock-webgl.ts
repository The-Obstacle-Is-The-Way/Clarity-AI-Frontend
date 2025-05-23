/* eslint-disable */
/**
 * WebGL/Three.js Mock for Testing Environment
 *
 * This module provides comprehensive mocks for WebGL and Three.js objects
 * to prevent test hangs and memory issues when testing Three.js components.
 *
 * It addresses multiple issues:
 * 1. JSDOM doesn't support WebGL - Mock implementation prevents errors
 * 2. Memory management - Proper dispose() methods to prevent memory leaks
 * 3. Animation frame handling - Deterministic animation for testing
 */

// Type for mock functions - compatible with test frameworks but not dependent on them
// Define the generic mock function type with proper typing
// Use a more specific function type constraint
type AnyFunction = (...args: any[]) => any;
type MockFunction<T extends AnyFunction> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
    results: { type: 'return' | 'throw'; value: unknown }[];
  };
};

// Create a minimal mock function implementation
 
function createMockFunction<T extends AnyFunction>(implementation?: T): MockFunction<T> {
  const mockCalls: Parameters<T>[][] = [];
  const mockResults: { type: 'return' | 'throw'; value: unknown }[] = [];

  // Default implementation that returns undefined
   
  const defaultImplementation = (...args: Parameters<T>): ReturnType<T> => {
    return undefined as unknown as ReturnType<T>;
  };

  // Create the main mock function
   
  const mockFn = (...args: Parameters<T>): ReturnType<T> => {
    mockCalls.push([...args]);
    try {
      const result = (currentImplementation || defaultImplementation)(...args);
      mockResults.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      mockResults.push({ type: 'throw', value: error });
      throw error;
    }
  };

  // Current implementation (can be changed via mockImplementation)
  let currentImplementation = implementation;

  // Add required mock properties and methods
   
  mockFn.mockImplementation = (fn: T): MockFunction<T> => {
    currentImplementation = fn;
    return mockFn as MockFunction<T>;
  };

   
  mockFn.mockReturnValue = (value: ReturnType<T>): MockFunction<T> => {
    currentImplementation = (() => value) as unknown as T;
    return mockFn as MockFunction<T>;
  };

   
  mockFn.mockReset = (): void => {
    mockCalls.length = 0;
    mockResults.length = 0;
    currentImplementation = implementation;
  };

  // Add mock property for tracking calls and results
  mockFn.mock = {
    calls: mockCalls,
    results: mockResults,
  };

  return mockFn as MockFunction<T>;
}

// WebGL constants
export const WebGLConstants = {
  DEPTH_TEST: 2929,
  DEPTH_FUNC: 2932,
  LEQUAL: 515,
  BLEND: 3042,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  STATIC_DRAW: 35044,
  DYNAMIC_DRAW: 35048,
  FRAGMENT_SHADER: 35632,
  VERTEX_SHADER: 35633,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  TRIANGLES: 4,
  VERSION: 0x1f02,
};

// Mock WebGL context implementation
export class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement | null = null;
  drawingBufferWidth = 800;
  drawingBufferHeight = 600;

  // Include WebGL constants
  DEPTH_TEST = WebGLConstants.DEPTH_TEST;
  DEPTH_FUNC = WebGLConstants.DEPTH_FUNC;
  LEQUAL = WebGLConstants.LEQUAL;
  BLEND = WebGLConstants.BLEND;
  SRC_ALPHA = WebGLConstants.SRC_ALPHA;
  ONE_MINUS_SRC_ALPHA = WebGLConstants.ONE_MINUS_SRC_ALPHA;
  ARRAY_BUFFER = WebGLConstants.ARRAY_BUFFER;
  ELEMENT_ARRAY_BUFFER = WebGLConstants.ELEMENT_ARRAY_BUFFER;
  STATIC_DRAW = WebGLConstants.STATIC_DRAW;
  DYNAMIC_DRAW = WebGLConstants.DYNAMIC_DRAW;
  FRAGMENT_SHADER = WebGLConstants.FRAGMENT_SHADER;
  VERTEX_SHADER = WebGLConstants.VERTEX_SHADER;
  COMPILE_STATUS = WebGLConstants.COMPILE_STATUS;
  LINK_STATUS = WebGLConstants.LINK_STATUS;
  COLOR_BUFFER_BIT = WebGLConstants.COLOR_BUFFER_BIT;
  DEPTH_BUFFER_BIT = WebGLConstants.DEPTH_BUFFER_BIT;
  TRIANGLES = WebGLConstants.TRIANGLES;
  VERSION = WebGLConstants.VERSION;

  // Mock resources - allow tracking for memory tests
  private buffers: Record<string, unknown>[] = [];
  private shaders: Record<string, unknown>[] = [];
  private programs: Record<string, unknown>[] = [];
  private textures: Record<string, unknown>[] = [];
  private framebuffers: Record<string, unknown>[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Return WebGL context attributes
  getContextAttributes(): WebGLContextAttributes {
    return {
      alpha: true,
      antialias: true,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: true,
      desynchronized: false,
    };
  }

  // Mock method implementation with tracking
  getExtension(extensionName: string): unknown {
    // Add mock getExtension
    if (extensionName === 'WEBGL_lose_context') {
      return {
        loseContext: createMockFunction(),
        restoreContext: createMockFunction(),
      };
    }
    // Add other common extensions if needed by tests
    // e.g., OES_texture_float, ANGLE_instanced_arrays
    return null; // Return null for unmocked extensions
  }

  // Core WebGL methods with consistent return values
  getParameter(paramName: number): unknown {
    // Handle specific parameters needed by Three.js or tests
    if (paramName === 37445) {
      // MAX_TEXTURE_SIZE
      return 16384;
    }
    if (paramName === 34930) {
      // MAX_CUBE_MAP_TEXTURE_SIZE
      return 16384;
    }
    if (paramName === 3379) {
      // MAX_RENDERBUFFER_SIZE
      return 16384;
    }
    if (paramName === 34076) {
      // TEXTURE_BINDING_2D
      return null; // Or return a mock texture if needed
    }
    if (paramName === 32873) {
      // TEXTURE_BINDING_CUBE_MAP
      return null;
    }
    if (paramName === this.VERSION) {
      // Handle VERSION request
      return 'WebGL 2.0'; // Return a valid version string
    }
    // Default return for unhandled parameters
    return {};
  }

  getShaderPrecisionFormat(): { precision: number; rangeMin: number; rangeMax: number } {
    return { precision: 1, rangeMin: 1, rangeMax: 1 };
  }

  // Buffer methods
   
  createBuffer(): Record<string, unknown> {
    const buffer = {};
    this.buffers.push(buffer);
    return buffer;
  }

  bindBuffer(): void {}
  bufferData(): void {}

  // Shader methods
   
  createShader(): Record<string, unknown> {
    const shader = {};
    this.shaders.push(shader);
    return shader;
  }

  shaderSource(): void {}
  compileShader(): void {}
  getShaderParameter(): boolean {
    return true;
  }

  // Program methods
   
  createProgram(): Record<string, unknown> {
    const program = {};
    this.programs.push(program);
    return program;
  }

  attachShader(): void {}
  linkProgram(): void {}
  getProgramParameter(): boolean {
    return true;
  }
  useProgram(): void {}

  // Texture methods
   
  createTexture(): Record<string, unknown> {
    const texture = {};
    this.textures.push(texture);
    return texture;
  }

  // Framebuffer methods
   
  createFramebuffer(): Record<string, unknown> {
    const framebuffer = {};
    this.framebuffers.push(framebuffer);
    return framebuffer;
  }

  bindTexture(): void {}
  texImage2D(): void {}
  texParameteri(): void {}
  texImage3D(): void {}
  activeTexture(): void {}
  generateMipmap(): void {}

  // Uniform methods
   
  getUniformLocation(): Record<string, unknown> {
    return {};
  }
  uniform1f(): void {}
  uniform2f(): void {}
  uniform3f(): void {}
  uniform4f(): void {}
  uniformMatrix4fv(): void {}

  // Attribute methods
  getAttribLocation(): number {
    return 0;
  }
  enableVertexAttribArray(): void {}
  vertexAttribPointer(): void {}

  // Draw methods
  drawArrays(): void {}
  drawElements(): void {}
  clear(): void {}
  clearColor(): void {}
  clearDepth(): void {}
  clearStencil(stencil: number): void {}
  frontFace(): void {}
  cullFace(): void {}
  disable(): void {}
  enable(): void {}
  blendFunc(): void {}
  depthFunc(): void {}
  viewport(): void {}

  // WebGL2 methods
   
  createVertexArray(): Record<string, unknown> {
    return {};
  }
  bindVertexArray(): void {}
   
  createQuery(): Record<string, unknown> {
    return {};
  }
  beginQuery(): void {}
  endQuery(): void {}
}

// Store original method to restore later
const originalGetContext = HTMLCanvasElement.prototype.getContext;

// Install mock globally
 
export function setupWebGLMocks(): void {
  // Define the mock implementation function
  const mockGetContextImplementation = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: any // Keep options generic for simplicity
  ): RenderingContext | null {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
      // Return our mock WebGL context
      return new MockWebGLRenderingContext(this) as unknown as WebGLRenderingContext;
    }
    // Call the original method for other contexts like '2d'
    // Use Reflect.apply to correctly handle `this` and arguments
    return Reflect.apply(originalGetContext, this, [contextId, options]);
  };

  // Assign the mock implementation using 'as any' to bypass complex overload typing
  HTMLCanvasElement.prototype.getContext = mockGetContextImplementation as any;

  // Mock requestAnimationFrame for deterministic testing
  let frameId = 0;
   
  global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    frameId += 1;
    setTimeout(() => callback(performance.now()), 0);
    return frameId;
  };

   
  global.cancelAnimationFrame = (): void => {
    // No-op implementation
  };
}

// Clean up mocks (restore original functions)
 
export function cleanupWebGLMocks(): void {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  // @ts-ignore - We know this exists in test environments
  delete global.requestAnimationFrame;
  // @ts-ignore - We know this exists in test environments
  delete global.cancelAnimationFrame;
}

// Mock Three.js classes for WebGL-dependent tests
export class MockWebGLRenderer {
  domElement: HTMLCanvasElement;

  constructor() {
    this.domElement = document.createElement('canvas');
  }

  shadowMap = { enabled: false };

  setSize(): void {}
  setPixelRatio(): void {}
  render(): void {}
  dispose(): void {}
}

export class MockWebGLTexture {
  dispose(): void {}
}

export class MockWebGLGeometry {
  dispose(): void {}
}

export class MockWebGLMaterial {
  dispose(): void {}
}

// Export a function to create mock objects for Three.js
 
export function createThreeMock() {
  return {
    WebGLRenderer: MockWebGLRenderer,
    Texture: MockWebGLTexture,
    BufferGeometry: MockWebGLGeometry,
    Material: MockWebGLMaterial,
    // Add more Three.js classes as needed
  };
}
// Expose mock classes under Three.js names for test aliasing
export { MockWebGLRenderer as WebGLRenderer };
export { MockWebGLTexture as Texture };
export { MockWebGLGeometry as BufferGeometry };
export { MockWebGLMaterial as MeshBasicMaterial };
export class Scene {}
export class PerspectiveCamera {}
