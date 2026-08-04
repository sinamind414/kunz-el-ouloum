import { useState, useCallback } from 'react';
import { validateAnswer, type ValidationContext, type ValidationResult } from '../lib/validation/ValidationEngine';

export interface UseSmartValidationOptions {
  ctx: ValidationContext;
  onResult?: (result: ValidationResult) => void;
}

export interface UseSmartValidationReturn {
  result: ValidationResult | null;
  submit: (rawAnswer: string) => ValidationResult;
  reset: () => void;
  isSubmitting: boolean;
}

export function useSmartValidation({
  ctx,
  onResult,
}: UseSmartValidationOptions): UseSmartValidationReturn {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    (rawAnswer: string): ValidationResult => {
      setIsSubmitting(true);
      try {
        const r = validateAnswer(rawAnswer, ctx);
        setResult(r);
        onResult?.(r);
        return r;
      } finally {
        setIsSubmitting(false);
      }
    },
    [ctx, onResult]
  );

  const reset = useCallback(() => {
    setResult(null);
    setIsSubmitting(false);
  }, []);

  return { result, submit, reset, isSubmitting };
}
