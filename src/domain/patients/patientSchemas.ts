// src/domain/patients/patientSchemas.ts
import { z } from 'zod';

// Define the possible patient statuses based on patientTypes.ts
const patientStatuses = ['active', 'inactive', 'pending_assessment', 'discharged'] as const; // Use 'as const' for literal types

/**
 * Zod schema for validating data when creating a new patient.
 * Ensures frontend validation aligns with expected data structure.
 */
export const createPatientSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }).max(100),
  last_name: z.string().min(1, { message: 'Last name is required' }).max(100),
  date_of_birth: z
    .union([
      z.string().length(0), // Allow empty string
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Date of Birth must be in YYYY-MM-DD format',
      }),
    ])
    .refine((value) => value.length > 0, { message: 'Date of Birth is required' }), // Add required check
  status: z.enum(patientStatuses, { message: 'Invalid patient status' }),
  // Add validation for other required fields here
});

// Type inferred from the schema for use with React Hook Form
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

/**
 * Zod schema for validating data when updating a patient.
 * Allows partial updates by making all fields optional.
 */
export const updatePatientSchema = createPatientSchema.partial();

// Type inferred from the partial schema for update operations.
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
