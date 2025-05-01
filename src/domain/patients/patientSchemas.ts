// src/domain/patients/patientSchemas.ts
import { z } from 'zod';

// Define the possible patient statuses based on patientTypes.ts
const patientStatuses = [
    'active',
    'inactive',
    'pending_assessment',
    'discharged'
] as const; // Use 'as const' for literal types

/**
 * Zod schema for validating data when creating a new patient.
 * Ensures frontend validation aligns with expected data structure.
 */
export const createPatientSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }).max(100),
  last_name: z.string().min(1, { message: "Last name is required" }).max(100),
  // Validate as string, specific date format validation can be complex,
  // rely on backend or use a library like date-fns if needed here.
  // Basic YYYY-MM-DD format check:
  date_of_birth: z.string()
    .min(10, { message: "Date of Birth is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date of Birth must be in YYYY-MM-DD format" }),
  status: z.enum(patientStatuses, { message: "Invalid patient status" }),
  // Add validation for other required fields here
});

// Type inferred from the schema for use with React Hook Form
export type CreatePatientInput = z.infer<typeof createPatientSchema>;

// Potential schema for updating (might allow partial updates)
// export const updatePatientSchema = createPatientSchema.partial();
// export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
