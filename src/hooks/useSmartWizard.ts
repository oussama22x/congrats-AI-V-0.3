import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SmartWizardState {
  incompleteSteps: number[];
  completedSteps: number[];
  currentStepIndex: number;
  currentWizardStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalIncomplete: number;
  totalSteps: number;
  progress: number;
  goToNext: () => void;
  goToPrevious: () => void;
  markStepComplete: (step: number) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useSmartWizard = (): SmartWizardState => {
  const [incompleteSteps, setIncompleteSteps] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [totalSteps, setTotalSteps] = useState(9);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncompleteSteps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: apiError } = await supabase.functions.invoke(
        'get-incomplete-steps',
        {
          body: {},
        }
      );

      if (apiError) {
        throw new Error(apiError.message || 'Failed to fetch incomplete steps');
      }

      if (data) {
        setIncompleteSteps(data.incompleteSteps || []);
        setCompletedSteps(data.completedSteps || []);
        setTotalSteps(data.totalSteps || 9);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      console.error('Error fetching incomplete steps:', err);
      toast.error('Failed to load wizard progress');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncompleteSteps();
  }, []);

  const currentWizardStep = incompleteSteps[currentStepIndex] || 1;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === incompleteSteps.length - 1;
  const totalIncomplete = incompleteSteps.length;
  
  // Calculate progress: steps completed / total steps
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  const goToNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
    
    setIncompleteSteps((prev) => prev.filter((s) => s !== step));
  };

  return {
    incompleteSteps,
    completedSteps,
    currentStepIndex,
    currentWizardStep,
    isFirstStep,
    isLastStep,
    totalIncomplete,
    totalSteps,
    progress,
    goToNext,
    goToPrevious,
    markStepComplete,
    isLoading,
    error,
  };
};
