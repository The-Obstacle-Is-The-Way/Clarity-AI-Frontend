/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * BiometricStreamController testing with focused, incremental tests.
 */

import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBiometricStreamController } from "./biometric-stream.controller";
import * as BiometricController from './biometric-stream.controller';

// Minimal mocks for dependencies
vi.mock('@application/services/biometric/biometric.service', () => ({
  biometricService: {
    getStreamMetadata: vi.fn().mockResolvedValue({
      success: true,
      value: [
        {
          id: 'stream1',
          patientId: 'patient123',
          type: 'heartRate',
          source: 'wearable',
          name: 'Heart Rate',
          unit: 'bpm',
          isActive: true,
          lastDataPointTimestamp: new Date(),
        }
      ],
    }),
    calculateStreamCorrelations: vi.fn().mockResolvedValue({
      success: true,
      value: new Map([['stream1-stream2', 0.75]]),
    }),
  },
}));

describe("useBiometricStreamController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with safe default state", () => {
    const { result } = renderHook(() => useBiometricStreamController("patient123"));

    expect(result.current).toBeDefined();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams).toBeInstanceOf(Map);
    expect(result.current.activeStreams.size).toBe(0);
    expect(result.current.latestAlerts).toBeInstanceOf(Array);
    expect(result.current.latestAlerts.length).toBe(0);
  });

  it("connects to streams with quantum precision", async () => {
    const { result } = renderHook(() => useBiometricStreamController("patient123"));
    
    let connectResult;
    await act(async () => {
      connectResult = await result.current.connectStreams(["stream1"]);
    });
    
    expect(connectResult).toBeDefined();
    expect(connectResult.success).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.activeStreams.size).toBe(1);
  });

  it("handles disconnection properly", async () => {
    const { result } = renderHook(() => useBiometricStreamController("patient123"));
    
    await act(async () => {
      await result.current.connectStreams(["stream1"]);
    });
    
    expect(result.current.isConnected).toBe(true);
    
    let disconnectResult;
    act(() => {
      disconnectResult = result.current.disconnectStreams();
    });
    
    expect(disconnectResult).toBeDefined();
    expect(disconnectResult.success).toBe(true);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams.size).toBe(0);
  });

  it("calculates correlations with mathematical precision", async () => {
    const { result } = renderHook(() => useBiometricStreamController("patient123"));
    
    await act(async () => {
      await result.current.connectStreams(["stream1", "stream2"]);
    });
    
    let correlationsResult;
    await act(async () => {
      correlationsResult = await result.current.calculateCorrelations();
    });
    
    expect(correlationsResult).toBeDefined();
    expect(correlationsResult.success).toBe(true);
    expect(correlationsResult.value).toBeInstanceOf(Map);
    expect(correlationsResult.value.size).toBeGreaterThan(0);
  });
});

// This test can be enabled now
describe('BiometricStreamController', () => {
  it('exists as a module', () => {
    expect(BiometricController).toBeDefined();
  });
});
