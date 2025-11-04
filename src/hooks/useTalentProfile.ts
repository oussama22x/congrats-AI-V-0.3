import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "sonner";

export interface TalentProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
  desired_roles: string[] | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  availability_date: string | null;
  is_profile_complete: boolean;
  onboarding_completed: boolean;
  wizard_step: number;
  experience_level: string | null;
  work_arrangements: string[] | null;
  location_preferences: string[] | null;
  current_city: string | null;
  current_country: string | null;
  start_timing: string | null;
  created_at: string;
  updated_at: string;
}

export function useTalentProfile() {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["talent-profile", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      // Auto-create stub profile if none exists
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from("talent_profiles")
          .insert({ user_id: currentUser.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile as TalentProfile;
      }

      return data as TalentProfile;
    },
    enabled: !!currentUser?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<TalentProfile>) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("talent_profiles")
        .update(updates)
        .eq("user_id", currentUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error(error);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
}
