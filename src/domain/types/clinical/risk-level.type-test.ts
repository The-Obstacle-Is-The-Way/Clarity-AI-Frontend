/**
 * NOVAMIND Type Testing Framework
 * Risk Level Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import type { RiskLevel } from '@domain/types/clinical/risk-level';
import { getRiskLevelColor } from '@domain/types/clinical/risk-level';

describe('RiskLevel type definitions', () => {
  it('RiskLevel has correct literal union types', () => {
    expectTypeOf<RiskLevel>().toEqualTypeOf<
      | 'minimal'
      | 'low'
      | 'moderate'
      | 'high'
      | 'critical'
      | 'Minimal'
      | 'Low'
      | 'Moderate'
      | 'High'
      | 'Critical'
      | 'Medium' // Legacy value
    >();
  });

  it('getRiskLevelColor has correct function signature', () => {
    expectTypeOf(getRiskLevelColor).parameter(0).toEqualTypeOf<RiskLevel>();
    expectTypeOf(getRiskLevelColor).returns.toEqualTypeOf<string>();
  });
});
