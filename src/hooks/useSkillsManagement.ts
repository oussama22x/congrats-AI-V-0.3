import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "sonner";

export function useSkillsManagement() {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const addSkill = useMutation({
    mutationFn: async (skillName: string) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("talent_skills")
        .insert({
          user_id: currentUser.id,
          skill_name: skillName,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-skills"] });
      toast.success("Skill added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add skill");
    },
  });

  const removeSkill = useMutation({
    mutationFn: async (skillId: string) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("talent_skills")
        .delete()
        .eq("id", skillId)
        .eq("user_id", currentUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-skills"] });
      toast.success("Skill removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove skill");
    },
  });

  return {
    addSkill: addSkill.mutate,
    removeSkill: removeSkill.mutate,
    isAddingSkill: addSkill.isPending,
    isRemovingSkill: removeSkill.isPending,
  };
}
