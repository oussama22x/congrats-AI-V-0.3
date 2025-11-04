import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useResumeUpload() {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadResume = useMutation({
    mutationFn: async (file: File) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      // Validate file
      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are allowed");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Upload to storage
      const fileExt = "pdf";
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("talent-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("talent-files")
        .getPublicUrl(fileName);

      // Save metadata to talent_files table
      const { data, error: dbError } = await supabase
        .from("talent_files")
        .insert({
          user_id: currentUser.id,
          file_name: file.name,
          file_type: "resume",
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return data;
    },
    onSuccess: (data) => {
      // Optimistically update cache
      if (currentUser?.id) {
        queryClient.setQueryData(["talent-files", currentUser.id], (old: any) => [data, ...(old ?? [])]);
      }
      queryClient.invalidateQueries({ queryKey: ["talent-files"] });
      toast.success("Resume uploaded successfully");
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload resume");
      setUploadProgress(0);
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (fileId: string) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from("talent_files")
        .select("file_url")
        .eq("id", fileId)
        .eq("user_id", currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const url = new URL(fileData.file_url);
      const pathParts = url.pathname.split("/");
      const filePath = pathParts.slice(-2).join("/"); // Gets "user-id/timestamp.pdf"

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("talent-files")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("talent_files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", currentUser.id);

      if (dbError) throw dbError;
      
      return fileId;
    },
    onSuccess: (fileId) => {
      // Optimistically update cache
      if (currentUser?.id) {
        queryClient.setQueryData(["talent-files", currentUser.id], (old: any) => 
          (old ?? []).filter((f: any) => f.id !== fileId)
        );
      }
      queryClient.invalidateQueries({ queryKey: ["talent-files"] });
      toast.success("Resume deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete resume");
    },
  });

  return {
    uploadResume: uploadResume.mutate,
    deleteResume: deleteResume.mutate,
    isUploading: uploadResume.isPending,
    isDeleting: deleteResume.isPending,
    uploadProgress,
  };
}
