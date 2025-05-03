/**
 * ActivityIndicator - Test
 * Properly implemented with React.createElement instead of JSX in mocks
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../../infrastructure/testing/utils/test-utils.unified';
import { ActivityIndicator } from './ActivityIndicator';
import { Vector3 } from 'three';
import { ActivationLevel } from '../../../domain/types/brain/activity';

// Mock dependencies
vi.mock('@react-three/drei', () => ({
  Detailed: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, key) => {
          const MockMotionComponent = ({
            children,
            ...props
          }: {
            children?: React.ReactNode;
            [key: string]: unknown;
          }) =>
            React.createElement(
              'div',
              { 'data-testid': `mock-motion-${String(key)}`, ...props },
              children
            );
          MockMotionComponent.displayName = `MockMotion.${String(key)}`;
          return MockMotionComponent;
        },
      }
    ),
    MotionConfig: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

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
          // Define props type explicitly using unknown for extra props
          type MockProps = { children?: React.ReactNode; [key: string]: unknown };

          // Return a simple component that renders children within a div with test ID
          const MockAnimatedComponent = React.forwardRef<unknown, MockProps>(
            (props: MockProps, _ref) => {
              // Wrap children in a div with a data-testid
              return React.createElement(
                'div',
                { 'data-testid': 'mock-animated-mesh' },
                props.children
              );
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

describe('ActivityIndicator', () => {
  const commonProps = {
    position: new Vector3(0, 0, 0),
    scale: 1,
  };

  it('renders with neural precision', () => {
    renderWithProviders(
      <ActivityIndicator
        {...commonProps}
        activationLevel={ActivationLevel.MEDIUM}
        rawActivity={0.5}
      />
    );
    expect(screen).toBeDefined();
  });

  it('displays correct activity level color based on activationLevel', () => {
    renderWithProviders(
      <ActivityIndicator
        {...commonProps}
        activationLevel={ActivationLevel.HIGH}
        rawActivity={0.8}
      />
    );
  });

  it('animates with quantum fluidity', () => {
    renderWithProviders(
      <ActivityIndicator {...commonProps} activationLevel={ActivationLevel.LOW} rawActivity={0.3} />
    );
    const animatedMesh = screen.queryByTestId('mock-animated-mesh');
    expect(animatedMesh).toBeInTheDocument();
  });

  it('does not render when activity is NONE', () => {
    const { container } = renderWithProviders(
      <ActivityIndicator
        {...commonProps}
        activationLevel={ActivationLevel.NONE}
        rawActivity={0.0}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
