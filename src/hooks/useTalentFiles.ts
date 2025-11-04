import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";

export interface TalentFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: "resume" | "portfolio" | "certificate" | "other";
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export function useTalentFiles() {
  const { currentUser } = useCurrentUser();

  const { data: files, isLoading, error } = useQuery({
    queryKey: ["talent-files", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("talent_files")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TalentFile[];
    },
    enabled: !!currentUser?.id,
  });

  const resume = files?.find((file) => file.file_type === "resume");
  const portfolios = files?.filter((file) => file.file_type === "portfolio") || [];
  const certificates = files?.filter((file) => file.file_type === "certificate") || [];

  return {
    files: files || [],
    resume,
    portfolios,
    certificates,
    isLoading,
    error,
  };
}
