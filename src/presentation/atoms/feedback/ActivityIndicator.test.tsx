/**
 * ActivityIndicator - Test
 * Properly implemented with React.createElement instead of JSX in mocks
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../infrastructure/testing/utils/test-utils.unified';
import { ActivityIndicator } from './ActivityIndicator';
import { ActivationLevel } from '@domain/types/brain/activity';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    gl: { setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() },
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    scene: { add: vi.fn(), remove: vi.fn() },
    size: { width: 800, height: 600 },
    clock: { getElapsedTime: vi.fn(() => 0) },
  })),
  Canvas: function MockCanvas(props) {
    return React.createElement('div', { 'data-testid': 'mock-canvas' }, props.children);
  },
}));

// Mock Three.js
vi.mock('three', () => {
  class MockVector3 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set = vi.fn(() => this);
    clone = vi.fn(() => new MockVector3(this.x, this.y, this.z));
    multiplyScalar = vi.fn(() => this);
  }

  return {
    __esModule: true,
    Vector3: MockVector3,
    Color: vi.fn().mockImplementation(() => ({ set: vi.fn() })),
    ShaderMaterial: vi.fn(),
    Mesh: vi.fn(),
    SphereGeometry: vi.fn(),
    BoxGeometry: vi.fn(),
    DoubleSide: 2,
    MeshBasicMaterial: vi.fn(() => ({ dispose: vi.fn() })),
    MeshStandardMaterial: vi.fn(() => ({ dispose: vi.fn() })),
  };
});

// Mock react-spring/three
vi.mock('@react-spring/three', () => {
  return {
    useSpring: vi.fn(() => ({
      springActivity: { get: vi.fn(() => 0.5) },
    })),
    animated: new Proxy(
      {},
      {
        get: function (_target, prop) {
          // Define props type explicitly
          type MockProps = { children?: React.ReactNode; [key: string]: any };

          // Return a simple component that renders children within a div with test ID
          const MockAnimatedComponent = React.forwardRef<unknown, MockProps>(
            (props: MockProps, _ref) => {
              // Wrap children in a div with a data-testid
              return React.createElement('div', { 'data-testid': 'mock-animated-mesh' }, props.children);
            }
          );
          MockAnimatedComponent.displayName = `mockAnimated.${String(prop)}`;
          return MockAnimatedComponent;
        },
      }
    ),
  };
});

// Import after mocks
import { Vector3 } from 'three';

describe('ActivityIndicator', () => {
  it('renders the mock mesh when activity is low', () => {
    render(
      <ActivityIndicator
        position={new Vector3(0, 0, 0)}
        scale={1}
        activationLevel={ActivationLevel.LOW}
        rawActivity={0.2}
      />
    );
    expect(screen.getByTestId('mock-animated-mesh')).toBeInTheDocument();
  });

  it('does not render when activity is NONE', () => {
    const { container } = render(
      <ActivityIndicator
        position={new Vector3(0, 0, 0)}
        scale={1}
        activationLevel={ActivationLevel.NONE}
        rawActivity={0.0}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
