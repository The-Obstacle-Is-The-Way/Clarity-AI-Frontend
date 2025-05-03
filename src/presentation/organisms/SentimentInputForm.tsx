// src/presentation/organisms/SentimentInputForm.tsx
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SentimentInput } from '@domain/analytics/sentimentTypes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming Shadcn path
import { Label } from '@/components/ui/label';

// --- VERIFY THIS SCHEMA ---
const formSchema = z.object({
  text_content: z
    .string()
    .min(10, 'Please enter at least 10 characters.')
    .max(5000, 'Text cannot exceed 5000 characters.'),
  // Add validation for context, language if used
});

type FormValues = z.infer<typeof formSchema>;

interface SentimentInputFormProps {
  onSubmit: (data: SentimentInput) => void;
  isLoading: boolean;
}

/**
 * Form for entering text for Sentiment Analysis.
 * NOTE: Needs verification based on actual API requirements.
 */
const SentimentInputForm: React.FC<SentimentInputFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="text_content">Text to Analyze</Label>
        <Textarea
          id="text_content"
          rows={8}
          {...register('text_content')}
          disabled={isLoading}
          placeholder="Enter text here..."
          className={errors.text_content ? 'border-red-500' : ''}
        />
        {errors.text_content && (
          <p className="text-red-500 text-sm mt-1">{errors.text_content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
      </Button>
    </form>
  );
};

export default SentimentInputForm;
