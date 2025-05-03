// src/presentation/organisms/XGBoostInputForm.tsx
import React, { memo } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Assuming zod is used
import { z } from 'zod'; // Assuming zod is used
import type { XGBoostInput } from '@domain/analytics/xgboostTypes';
import { Button } from '@/components/ui/button'; // Assuming Shadcn path
import { Input } from '@/components/ui/input'; // Assuming Shadcn path
import { Label } from '@/components/ui/label'; // Assuming Shadcn path
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Shadcn path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming Shadcn path

// --- VERIFY THIS SCHEMA ---
// Define a Zod schema matching the verified XGBoostInput structure
const formSchema = z.object({
  featureA: z.number({ required_error: 'Feature A is required' }).positive('Must be positive'),
  featureB: z.enum(['Category1', 'Category2', 'Category3'], {
    required_error: 'Feature B is required',
  }),
  featureC: z.boolean().optional(),
  patientId: z.string().optional(),
  // Add validation for all other fields based on XGBoostInput type
});

type FormValues = z.infer<typeof formSchema>;

interface XGBoostInputFormProps {
  onSubmit: (data: XGBoostInput) => void;
  isLoading: boolean;
}

/**
 * Form for entering input features for XGBoost prediction.
 * Uses React Hook Form and Zod for validation.
 * NOTE: Form fields are placeholders and MUST be updated based on the verified API schema.
 */
const XGBoostInputForm: React.FC<XGBoostInputFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control, // Needed for Select/Checkbox components from Shadcn
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // defaultValues: { featureC: false } // Set defaults if needed
  });

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    // Map/transform data if needed before calling onSubmit
    onSubmit(data as XGBoostInput); // Cast might be needed if Zod schema doesn't perfectly match domain type initially
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      data-testid="xgboost-form"
    >
      {/* Example Field: Feature A (Number) */}
      <div>
        <Label htmlFor="featureA">Feature A (Number)</Label>
        <Input
          id="featureA"
          type="number"
          {...register('featureA', { valueAsNumber: true })}
          disabled={isLoading}
          className={errors.featureA ? 'border-red-500' : ''}
        />
        {errors.featureA && <p className="text-red-500 text-sm mt-1">{errors.featureA.message}</p>}
      </div>

      {/* Example Field: Feature B (Select/Categorical) */}
      <div>
        <Label htmlFor="featureB">Feature B (Category)</Label>
        {/* Need to use Controller for Shadcn Select with RHF */}
        {/* Simplified example - requires Controller setup */}
        <Select
          onValueChange={(value) => {
            /* RHF field set logic */
          }}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.featureB ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Category1">Category 1</SelectItem>
            <SelectItem value="Category2">Category 2</SelectItem>
            <SelectItem value="Category3">Category 3</SelectItem>
          </SelectContent>
        </Select>
        {errors.featureB && <p className="text-red-500 text-sm mt-1">{errors.featureB.message}</p>}
      </div>

      {/* Example Field: Feature C (Boolean/Checkbox) */}
      <div className="flex items-center space-x-2">
        {/* Need to use Controller for Shadcn Checkbox with RHF */}
        {/* Simplified example - requires Controller setup */}
        <Checkbox id="featureC" disabled={isLoading} />
        <Label htmlFor="featureC">Feature C (Boolean)</Label>
        {errors.featureC && <p className="text-red-500 text-sm mt-1">{errors.featureC.message}</p>}
      </div>

      {/* Example Field: Patient ID (Optional String) */}
      <div>
        <Label htmlFor="patientId">Patient ID (Optional)</Label>
        <Input
          id="patientId"
          {...register('patientId')}
          disabled={isLoading}
          className={errors.patientId ? 'border-red-500' : ''}
        />
        {errors.patientId && (
          <p className="text-red-500 text-sm mt-1">{errors.patientId.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} data-testid="xgboost-submit-button">
        {isLoading ? 'Running Prediction...' : 'Run XGBoost Prediction'}
      </Button>
    </form>
  );
};

// Export with memo for better performance since this is a complex form component
export default memo(XGBoostInputForm);
