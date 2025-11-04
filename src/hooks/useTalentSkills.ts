import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: string | null;
  years_of_experience: number | null;
  created_at: string;
}

export const useTalentSkills = () => {
  const { data: skills, isLoading, error, refetch } = useQuery({
    queryKey: ["talent-skills"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("talent_skills")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as TalentSkill[];
    },
  });

  return {
    skills: skills || [],
    isLoading,
    error,
    refetch,
  };
};
