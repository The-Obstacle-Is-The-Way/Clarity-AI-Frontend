/**
 * NOVAMIND Neural Test Suite
 * Molecules index export testing
 */

import { describe, it, expect } from 'vitest';
import * as MoleculeExports from './index';

describe('Molecules index exports', () => {
  it('exports visualization components', () => {
    expect(MoleculeExports.BrainModelVisualization).toBeDefined();
    expect(MoleculeExports.Chart).toBeDefined();
    expect(MoleculeExports.VisualizationControls).toBeDefined();
  });

  it('exports timeline components', () => {
    expect(MoleculeExports.TimelineEvent).toBeDefined();
    expect(MoleculeExports.TherapeuticTimelineVisualizer).toBeDefined();
  });

  it('exports dialog components', () => {
    expect(MoleculeExports.ConfirmDialog).toBeDefined();
    expect(MoleculeExports.SessionWarningModal).toBeDefined();
  });

  it('exports clinical components', () => {
    expect(MoleculeExports.PatientHeader).toBeDefined();
    expect(MoleculeExports.ClinicalDataOverlay).toBeDefined();
    expect(MoleculeExports.ClinicalMetricsCard).toBeDefined();
  });

  it('exports navigation components', () => {
    expect(MoleculeExports.Header).toBeDefined();
    expect(MoleculeExports.LoadingFallback).toBeDefined();
  });

  it('exports selection components', () => {
    expect(MoleculeExports.BrainRegionSelector).toBeDefined();
    expect(MoleculeExports.RegionSelectionPanel).toBeDefined();
    expect(MoleculeExports.BrainRegionDetails).toBeDefined();
  });
});
