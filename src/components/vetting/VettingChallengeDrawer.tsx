import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "./VoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

interface VettingChallengeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHALLENGE_QUESTION = "Tell us about a project you're proud of. What was your role, what challenges did you face, and what was the outcome?";
const MAX_DURATION_SECONDS = 120; // 2 minutes

export const VettingChallengeDrawer = ({ isOpen, onClose }: VettingChallengeDrawerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (audioBlob: Blob, durationSeconds: number) => {
    try {
      setIsSubmitting(true);

      // Convert blob to base64
      const audioBase64 = await convertBlobToBase64(audioBlob);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('upload-vetting-audio', {
        body: {
          audioBase64,
          questionText: CHALLENGE_QUESTION,
          durationSeconds,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to upload recording');
      }

      // Success!
      toast({
        title: "🎉 Submission successful!",
        description: "Your challenge response has been submitted. Profile now 100% complete!",
      });

      // Invalidate wizard progress query to refresh dashboard
      await queryClient.invalidateQueries({ queryKey: ['wizard-progress'] });

      // Close drawer
      onClose();
    } catch (error) {
      console.error('Error submitting vetting audio:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to upload your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle className="text-2xl mb-1">🎤 Proof of Work Challenge</DrawerTitle>
              <DrawerDescription className="text-base">
                Complete this to unlock the final 40 points
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 py-6 space-y-6 overflow-y-auto">
          {/* Challenge Question */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/20 p-6">
            <p className="text-sm font-medium text-primary mb-2">Your Challenge:</p>
            <p className="text-base leading-relaxed font-medium">{CHALLENGE_QUESTION}</p>
          </div>

          {/* Pro Tips */}
          <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-4">
            <p className="font-medium mb-2">💡 Pro Tips:</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>• Speak naturally, like you're on a video call</li>
              <li>• Share specific details and outcomes</li>
              <li>• You have up to 2 minutes</li>
            </ul>
          </div>

          {/* Voice Recorder */}
          <VoiceRecorder
            onSubmit={handleSubmit}
            maxDurationSeconds={MAX_DURATION_SECONDS}
            isSubmitting={isSubmitting}
          />
        </div>

        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
