/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Common Component
 * PerformanceMonitor - Quantum-level performance monitoring
 * with clinical precision frame analysis
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Stats from 'stats.js';

// Domain types
// Use relative path as alias seems problematic in tests
// Removed unused Result, success, failure imports

// Performance threshold constants
const FRAME_RATE_WARNING = 45; // fps
const FRAME_RATE_CRITICAL = 30; // fps
const MEMORY_WARNING = 500; // MB
const MEMORY_CRITICAL = 750; // MB
// Removed unused GPU constants

/**
 * Performance metrics with neural-safe typing
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  memory: number; // MB
  gpuLoad?: number; // % (may not be available in all browsers)
  lastUpdated: number; // timestamp
}

/**
 * Props with neural-safe typing
 */
interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onPerformanceWarning?: (metrics: PerformanceMetrics, level: 'warning' | 'critical') => void;
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showMemory?: boolean;
  showPanel?: boolean;
  children?: React.ReactNode;
}

/**
 * PerformanceMonitor - Common component for visualization performance monitoring
 * Implements clinical precision metrics tracking for neural visualization optimization
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetricsUpdate,
  onPerformanceWarning,
  visible = false,
  position = 'top-right',
  showMemory = true,
  showPanel = false,
  children,
}) => {
  // Stats.js instance
  const statsRef = useRef<Stats | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Performance metrics state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memory: 0,
    lastUpdated: Date.now(),
  });

  // Frame counting
  const frameCount = useRef(0);
  const lastMetricsUpdate = useRef(Date.now());
  const updateInterval = 1000; // 1 second update interval

  // Position styling
  const positionStyle = useCallback(() => {
    switch (position) {
      case 'top-left':
        return { top: '0', left: '0' };
      case 'top-right':
        return { top: '0', right: '0' };
      case 'bottom-left':
        return { bottom: '0', left: '0' };
      case 'bottom-right':
        return { bottom: '0', right: '0' };
      default:
        return { top: '0', right: '0' };
    }
  }, [position]);

  // Initialize Stats.js
  useEffect(() => {
    if (!statsRef.current && typeof window !== 'undefined') {
      statsRef.current = new Stats();

      if (showPanel) {
        // Configure panels
        statsRef.current.showPanel(0); // FPS

        if (showMemory) {
          // Add memory panel if available
          if ((performance as any).memory) {
            statsRef.current.showPanel(2);
          }
        }

        // Add to DOM if visible
        if (visible && containerRef.current) {
          containerRef.current.appendChild(statsRef.current.dom);

          // Style the stats panel
          statsRef.current.dom.style.cssText =
            'position:relative;top:0;left:0;cursor:pointer;opacity:0.9';
        }
      }
    }

    return () => {
      // Cleanup
      if (
        statsRef.current &&
        containerRef.current &&
        containerRef.current.contains(statsRef.current.dom)
      ) {
        containerRef.current.removeChild(statsRef.current.dom);
      }
      // Consider nullifying statsRef.current here if needed
    };
  }, [visible, showPanel, showMemory]);

  // Monitor performance
  useFrame(() => {
    if (statsRef.current) {
      // Begin stats monitoring
      statsRef.current.begin();

      // Update frame count
      frameCount.current++;

      // Check if it's time to update metrics (once per second)
      const now = Date.now();
      if (now - lastMetricsUpdate.current >= updateInterval) {
        // Calculate metrics
        const elapsed = now - lastMetricsUpdate.current;
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        const frameTime = elapsed / frameCount.current;

        // Reset frame count
        frameCount.current = 0;
        lastMetricsUpdate.current = now;

        // Get memory info if available
        let memory = 0;
        if ((performance as any).memory) {
          memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
        }

        // Update metrics state
        const newMetrics: PerformanceMetrics = {
          fps,
          frameTime,
          memory,
          lastUpdated: now,
          // gpuLoad would need specific browser API integration if desired
        };

        setMetrics(newMetrics);

        // Call onMetricsUpdate callback
        if (onMetricsUpdate) {
          onMetricsUpdate(newMetrics);
        }

        // Check for performance warnings
        if (onPerformanceWarning) {
          if (fps <= FRAME_RATE_CRITICAL || memory >= MEMORY_CRITICAL) {
            onPerformanceWarning(newMetrics, 'critical');
          } else if (fps <= FRAME_RATE_WARNING || memory >= MEMORY_WARNING) {
            onPerformanceWarning(newMetrics, 'warning');
          }
        }
      }

      // End stats monitoring
      statsRef.current.end();
    }
  });

  // Removed unused getPerformanceAssessment function

  return (
    <>
      {/* Stats.js container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          zIndex: 1000,
          ...positionStyle(),
        }}
      />

      {/* Optional performance info display */}
      {visible && !showPanel && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color:
              metrics.fps < FRAME_RATE_WARNING
                ? metrics.fps < FRAME_RATE_CRITICAL
                  ? '#ff4444'
                  : '#ffaa44'
                : '#44ff44',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            ...positionStyle(),
          }}
        >
          FPS: {metrics.fps} | Frame: {metrics.frameTime.toFixed(2)}ms
          {showMemory && ` | Mem: ${metrics.memory}MB`}
        </div>
      )}

      {children}
    </>
  );
};

export default PerformanceMonitor;
