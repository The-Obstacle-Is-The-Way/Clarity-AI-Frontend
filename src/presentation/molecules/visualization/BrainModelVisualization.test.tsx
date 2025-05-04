/**
 * @vitest-environment jsdom
 */
// Mock modules - these must be at the top before imports
// Mock three.js
vi.mock('three');

// Mock react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="r3f-canvas">{children}</div>,
  useThree: vi.fn(() => ({
    gl: {
      domElement: document.createElement('canvas'),
      setSize: vi.fn(),
    },
    scene: { add: vi.fn(), remove: vi.fn() },
    camera: { position: { set: vi.fn() } },
    size: { width: 800, height: 600 },
  })),
  useFrame: vi.fn((callback) => {
    // Call the callback once to simulate a frame
    callback({ scene: {}, camera: {} }, 0);
  }),
}));

// Mock react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: ({ children }) => <div data-testid="orbit-controls">{children}</div>,
  Html: ({ children }) => <div data-testid="drei-html">{children}</div>,
  useHelper: vi.fn(),
  PerspectiveCamera: () => <div data-testid="perspective-camera"></div>,
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrainModelVisualization } from './BrainModelVisualization';

// Create a simplified mock of the necessary context providers
const MockBrainModelProvider = ({ children }) => {
  return <div data-testid="mock-brain-model-provider">{children}</div>;
};

const MockThemeProvider = ({ children }) => {
  return <div data-testid="mock-theme-provider">{children}</div>;
};

// Simple render function that mimics the provider structure
function renderComponent(ui) {
  return render(
    <MockThemeProvider>
      <MockBrainModelProvider>{ui}</MockBrainModelProvider>
    </MockThemeProvider>
  );
}

/**
 * BrainModelVisualization Component Tests
 * 
 * These tests focus on the component's logic and behavior rather than
 * the actual WebGL rendering. We use mocks to simulate the Three.js
 * environment and test how the component responds to different states
 * and user interactions.
 */
describe('BrainModelVisualization Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock window.requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Mock window.cancelAnimationFrame
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('(prefers-color-scheme: dark)'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Suppress console errors for WebGL errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  it('renders without crashing', () => {
    renderComponent(
      <BrainModelVisualization />
    );
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
    
    // Check for the no-data message instead of the canvas
    expect(screen.getByText(/No brain model data available/i)).toBeInTheDocument();
  });

  it('displays loading state when data is being fetched', () => {
    renderComponent(<BrainModelVisualization isLoading={true} />);
    expect(screen.getByTestId('brain-model-loading')).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    renderComponent(
      <BrainModelVisualization error={new Error("Failed to load brain model")} />
    );
    expect(screen.getByText(/Failed to load brain model/i)).toBeInTheDocument();
  });

  it('renders brain regions when data is provided', async () => {
    // Create mock brain region data
    const mockRegions = [
      { id: 'region1', name: 'Frontal Lobe', position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'region2', name: 'Parietal Lobe', position: { x: 2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
    ];
    
    renderComponent(
      <BrainModelVisualization regionData={mockRegions} />
    );
    
    // Verify the component renders with the provided data
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
    
    // Should not show the no-data message when regions are provided
    expect(screen.queryByText(/No brain model data available/i)).not.toBeInTheDocument();
    
    // There should be no loading or error states
    expect(screen.queryByTestId('brain-model-loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('brain-model-error')).not.toBeInTheDocument();
  });
});
