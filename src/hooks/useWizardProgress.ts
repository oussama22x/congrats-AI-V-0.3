import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WizardProgress {
  incompleteSteps: number[];
  completedSteps: number[];
  totalSteps: number;
  progress: number;
  wizardProgress: number;
  vettingProgress: number;
  hasCompletedVetting: boolean;
  isLoading: boolean;
  error: Error | null;
}

const fetchWizardProgress = async (): Promise<Omit<WizardProgress, 'isLoading' | 'error'>> => {
  const { data, error } = await supabase.functions.invoke('get-incomplete-steps', {
    body: {},
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch wizard progress');
  }

  return {
    incompleteSteps: data.incompleteSteps || [],
    completedSteps: data.completedSteps || [],
    totalSteps: data.totalSteps || 9,
    progress: (data.wizardProgress || 0) + (data.vettingProgress || 0),
    wizardProgress: data.wizardProgress || 0,
    vettingProgress: data.vettingProgress || 0,
    hasCompletedVetting: data.hasCompletedVetting || false,
  };
};

export const useWizardProgress = (): WizardProgress => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wizard-progress'],
    queryFn: fetchWizardProgress,
    staleTime: 30000, // 30 seconds
  });

  return {
    incompleteSteps: data?.incompleteSteps || [],
    completedSteps: data?.completedSteps || [],
    totalSteps: data?.totalSteps || 9,
    progress: data?.progress || 0,
    wizardProgress: data?.wizardProgress || 0,
    vettingProgress: data?.vettingProgress || 0,
    hasCompletedVetting: data?.hasCompletedVetting || false,
    isLoading,
    error: error as Error | null,
  };
};
