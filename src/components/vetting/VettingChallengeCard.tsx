import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Trophy, Zap } from "lucide-react";

interface VettingChallengeCardProps {
  progress: number;
  wizardProgress: number;
  vettingProgress: number;
  hasCompleted: boolean;
  onStartChallenge: () => void;
  isLoading: boolean;
}

export const VettingChallengeCard = ({
  progress,
  wizardProgress,
  vettingProgress,
  hasCompleted,
  onStartChallenge,
  isLoading,
}: VettingChallengeCardProps) => {
  // Don't show if wizard isn't complete yet
  if (wizardProgress < 60) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent rounded-full blur-2xl" />
        </div>

        <CardContent className="pt-6 relative">
          {hasCompleted ? (
            /* Completed State */
            <div className="text-center space-y-4 py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">🎉 100% Complete!</h3>
                <p className="text-muted-foreground">
                  Your profile is fully verified and ready to shine
                </p>
              </div>
            </div>
          ) : (
            /* Active State */
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm font-medium text-primary">
                  <Zap className="h-4 w-4" />
                  {progress}% Complete
                </div>
                <h3 className="text-xl font-bold">Almost there! 🚀</h3>
                <p className="text-sm text-muted-foreground">
                  One quick challenge to unlock full access
                </p>
              </div>

              {/* Visual Progress */}
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Setup: {wizardProgress}%</span>
                  <span>Challenge: {vettingProgress}%</span>
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 p-5 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-1">+40 Points</div>
                  <p className="text-sm text-muted-foreground">
                    🎤 2-minute voice challenge
                  </p>
                </div>
                
                <Button 
                  onClick={onStartChallenge} 
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Start Challenge
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  ✨ Takes less than 2 minutes
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
