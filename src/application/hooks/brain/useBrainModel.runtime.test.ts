/**
 * @fileoverview Tests for runtime validation functions in useBrainModel.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import { validateBrainModelData } from './useBrainModel.runtime';

describe('useBrainModel Runtime Validation', () => {
  describe('validateBrainModelData', () => {
    it('should return Ok for a valid BrainModel object', () => {
      // Create a valid BrainModel object based on the interface requirements
      const validBrainModel = {
        id: 'model-valid-1',
        name: 'Valid Brain Model',
        regions: [
          {
            id: 'region-1',
            name: 'Frontal Lobe',
            position: { x: 10, y: 20, z: 30 },
            color: '#FF5733',
            connections: ['region-2'],
            activityLevel: 0.8,
            isActive: true,
            hemisphereLocation: 'left',
            volumeMl: 120,
            riskFactor: 0.1,
          },
          {
            id: 'region-2',
            name: 'Temporal Lobe',
            position: { x: 30, y: 10, z: 20 },
            color: '#33FF57',
            connections: ['region-1'],
            activityLevel: 0.6,
            isActive: true,
            hemisphereLocation: 'right',
            volumeMl: 100,
            riskFactor: 0.2,
          },
        ],
        connections: [
          {
            id: 'conn-1',
            sourceId: 'region-1',
            targetId: 'region-2',
            strength: 0.75,
            type: 'excitatory',
            isActive: true,
            color: '#AAAAAA',
          },
        ],
      };

      const result = validateBrainModelData(validBrainModel);
      
      // Verify that the validation returns an Ok result
      expect(result.ok).toBe(true);
      expect(result.err).toBe(false);
      
      // Verify the model was returned correctly
      if (result.ok) {
        expect(result.val).toEqual(validBrainModel);
        expect(result.val.id).toBe('model-valid-1');
        expect(result.val.regions.length).toBe(2);
        expect(result.val.connections.length).toBe(1);
      }
    });

    it('should return Err for non-object input', () => {
      const invalidData = 'not an object';
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for an empty object', () => {
      const invalidData = {};
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for data missing required fields (e.g., id)', () => {
      const invalidData = {
        name: 'Incomplete Model',
        regions: [],
        connections: [],
      }; // Missing 'id'
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for data missing required fields (e.g., regions)', () => {
      const invalidData = {
        id: 'model-incomplete-regions',
        name: 'Incomplete Model',
        connections: [],
      }; // Missing 'regions'
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for data with incorrect field types (e.g., regions is not an array)', () => {
      const invalidData = {
        id: 'model-wrong-type',
        name: 'Wrong Type Model',
        regions: 'should be array',
        connections: [],
      };
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });

    it('should return Err for data with invalid nested BrainRegion structure', () => {
      const invalidData = {
        id: 'model-invalid-region',
        name: 'Invalid Region Model',
        regions: [{ id: 'r1', name: 'Region 1' }], // Missing required fields in BrainRegion
        connections: [],
      };
      const result = validateBrainModelData(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      // The isBrainModel guard checks nested structures implicitly
      expect((result.val as Error).message).toContain(
        'Invalid BrainModelData: Data does not conform to the BrainModel structure.'
      );
    });
  });
});
