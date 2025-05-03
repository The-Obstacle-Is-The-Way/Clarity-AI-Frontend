/**
 * digitalTwinService.ts
 *
 * Provides wrappers around Digital Twin API endpoints defined in the backend.
 * Currently only supports fetching the 3-D brain visualization payload.
 *
 * The backend contract (see docs/E2E/Backend_API_Verification_Phase1.md):
 *   GET /api/v1/digital-twins/{patient_id}/visualization?visualization_type=brain_model_3d
 *   – Returns Dict<string, any> with geometry, regions etc.
 *
 * The response schema is not stable, so we validate with a Zod passthrough
 * schema that only checks basic required keys but allows unknown properties.
 */

import { apiClient } from './ApiGateway';
import { z } from 'zod';

/** Zod schema (very loose) */
export const brainVisualizationSchema = z
  .object({
    mesh: z.record(z.any()).optional(),
    regions: z.array(z.record(z.any())).optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();

export type BrainVisualization = z.infer<typeof brainVisualizationSchema>;

/**
 * Fetch the 3-D brain visualization for a given patient.
 *
 * @param patientId UUID string for the target patient
 * @param visualizationType Optional query param (defaults to brain_model_3d)
 * @returns Parsed visualization payload
 */
export async function getVisualization(
  patientId: string,
  visualizationType = 'brain_model_3d'
): Promise<BrainVisualization> {
  if (!patientId) {
    throw new Error('patientId is required to fetch digital-twin visualization');
  }

  const endpoint = `/api/v1/digital-twins/${patientId}/visualization`;
  const params = visualizationType ? { visualization_type: visualizationType } : undefined;

  const raw = await apiClient.get<unknown>(endpoint, { params });
  const parsed = brainVisualizationSchema.parse(raw);
  return parsed;
}

export const digitalTwinService = {
  getVisualization,
};

export default digitalTwinService;