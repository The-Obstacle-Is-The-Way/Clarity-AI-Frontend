/**
 * CLARITY-AI Neural Test Suite
 * BrainModelViewer testing with quantum precision
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrainModelViewer from './BrainModelViewer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define enum here since the import is problematic
enum RenderMode {
  ANATOMICAL = 'anatomical',
  FUNCTIONAL = 'functional',
  CONNECTIVITY = 'connectivity',
}

// Mock hooks used by the component
vi.mock('@application/hooks/ui/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark', // Provide a default theme
    isDarkMode: true,
  }),
}));

vi.mock('@application/hooks/brain/useBrainVisualization', () => ({
  useBrainVisualization: vi.fn(() => ({
    brainModel: {
      // Provide minimal mock data
      id: 'test-model',
      name: 'Test Brain',
      regions: [
        {
          id: 'r1',
          name: 'Region 1',
          position: [0, 0, 0],
          scale: 1,
          data: { activity: 0.5 },
          significance: 0.5,
          connections: [],
          description: '',
          color: '',
          coordinates: [0, 0, 0],
          functions: [],
          size: 1,
          volume: 1,
        },
      ],
      pathways: [],
      metadata: { modelVersion: '1.0' },
    },
    isLoading: false,
    error: null,
    activeRegions: [],
    viewState: { highlightedRegions: [], renderMode: RenderMode.ANATOMICAL },
    highlightRegion: vi.fn(),
    focusOnRegion: vi.fn(),
    setRenderMode: vi.fn(),
    visibleRegions: [],
    visiblePathways: [],
    resetVisualization: vi.fn(),
  })),
}));

// Mock presentation components used by BrainModelViewer
vi.mock('@presentation/atoms/Button', () => ({
  Button: (props: React.ComponentProps<'button'>) => <button {...props}>{props.children}</button>,
}));

vi.mock('@presentation/atoms/Slider', () => ({
  Slider: (props: React.ComponentProps<'input'>) => <input type="range" {...props} />,
}));

vi.mock('@presentation/atoms/Popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}));

vi.mock('@presentation/atoms/Checkbox', () => ({
  Checkbox: (props: React.ComponentProps<'input'>) => <input type="checkbox" {...props} />,
}));

vi.mock('@presentation/atoms/Label', () => ({
  Label: ({ children, ...props }: React.ComponentProps<'label'>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock('@presentation/organisms/BrainVisualization', () => ({
  default: () => <div data-testid="brain-visualization-mock" />,
}));

// Mock R3F and Drei components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Environment: () => <div data-testid="mock-environment" />,
  AdaptiveDpr: () => <div data-testid="mock-adaptive-dpr" />,
  PerformanceMonitor: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-perf-monitor">{children}</div>
  ),
}));

// Mock potentially problematic dependencies
vi.mock('@presentation/organisms/BrainModelContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-brain-model-container">{children}</div>
  ),
}));

vi.mock('@presentation/common/VisualizationErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-error-boundary">{children}</div>
  ),
}));

vi.mock('@presentation/atoms/LoadingIndicator', () => ({
  LoadingIndicator: () => <div data-testid="mock-loading-indicator">Loading...</div>,
}));

describe('BrainModelViewer', () => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders the component', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrainModelViewer patientId="patient-123" />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Interactive Brain Model/i)).toBeInTheDocument();
  });

  it('contains visualization container', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrainModelViewer patientId="patient-123" />
      </QueryClientProvider>
    );
    // Check for the placeholder text that's actually in the component
    const placeholderText = screen.getByText(/Three\.js component would render here/i);
    expect(placeholderText).toBeInTheDocument();
  });
});
