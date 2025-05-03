// src/presentation/organisms/PatientForm.tsx
import React from 'react';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/presentation/atoms";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/atoms"; // Use index named exports
import { Input } from "@/presentation/atoms"; // Use index named exports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/atoms"; // Use index named exports
import { createPatientSchema, type CreatePatientInput } from '@domain/patients/patientSchemas';

interface PatientFormProps {
  onSubmit: (data: CreatePatientInput) => void;
  isLoading?: boolean; // To disable submit button during mutation
  defaultValues?: Partial<CreatePatientInput>; // For potential edit mode later
}

/**
 * Reusable form component for creating or editing patient data.
 * Uses React Hook Form and Zod for validation.
 */
const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultValues,
}) => {
  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: defaultValues || {
      first_name: '',
      last_name: '',
      date_of_birth: '', // Initialize as empty string or suitable default
      status: 'active', // Default status
    },
  });

  const patientStatuses = createPatientSchema.shape.status.options;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    {/* Use type="text" to avoid potential JSDOM/browser date input conflicts */}
                    <Input type="text" placeholder="YYYY-MM-DD" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please use YYYY-MM-DD format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patientStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {/* Capitalize status for display */}
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (defaultValues ? 'Update Patient' : 'Create Patient')}
        </Button>
      </form>
    </Form>
  );
};

export default PatientForm;
