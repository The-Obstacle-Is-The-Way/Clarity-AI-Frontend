/**
 * WebGL Test Setup Entry Point
 * 
 * This file initializes the WebGL mock environment
 * and re-exports testing utilities for WebGL components.
 */

import { vi } from 'vitest';
import './index';

// Prepare global Three.js/WebGL mocks for testing
beforeEach(() => {
  // Reset WebGL/Three.js mocks before each test
  vi.clearAllMocks();
});

// Export testing utilities from base WebGL test module
export * from './index'; 