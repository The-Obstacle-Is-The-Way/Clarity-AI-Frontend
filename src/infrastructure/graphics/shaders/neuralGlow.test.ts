/**
 * NOVAMIND Neural Test Suite
 * createNeuralGlowUniforms testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { Color } from 'three';
import { createNeuralGlowUniforms } from '@infrastructure/graphics/shaders/neuralGlow'; // Use alias

describe('createNeuralGlowUniforms', () => {
  it('processes data with mathematical precision', () => {
    // Arrange test data - proper parameters for the function
    const color = new Color(0x4287f5);
    const intensity = 1.2;
    const pulseFactor = 0.8;

    // Act
    const result = createNeuralGlowUniforms({
      color,
      intensity,
      pulseFactor,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.color.value).toEqual(color);
    expect(result.intensity.value).toEqual(intensity);
    expect(result.pulseFactor.value).toBe(pulseFactor);
    expect(result.time.value).toEqual(0);
  });

  it('handles edge cases with clinical precision', () => {
    // Test edge cases - zero intensity
    const color = new Color(0x000000);
    const intensity = 0;
    const pulseFactor = 0.01;

    // Act
    const result = createNeuralGlowUniforms({
      color,
      intensity,
      pulseFactor,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.color.value).toEqual(color);
    expect(result.intensity.value).toEqual(0);
    expect(result.pulseFactor.value).toBe(0.01);
  });

  // Add more utility-specific tests
});
