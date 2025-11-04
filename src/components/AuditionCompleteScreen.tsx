import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AuditionCompleteScreenProps {
  onReturnToDashboard: () => void;
  submissionId?: string;
}

export const AuditionCompleteScreen = ({ 
  onReturnToDashboard,
  submissionId = "temp-submission-id" // TODO: Pass actual submission ID from parent
}: AuditionCompleteScreenProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Check if rating is low (1 or 2 stars)
  const isLowRating = rating === 1 || rating === 2;
  
  // Check if reason requires text feedback
  const needsTextFeedback = reason === "technical" || reason === "other";

  const handleStarClick = (value: number) => {
    setRating(value);
    // Reset reason and feedback if rating changes from low to high
    if (value > 2) {
      setReason("");
      setFeedbackText("");
    }
  };

  const handleSubmitSurvey = async () => {
    // Validation
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    // If low rating, ensure reason is selected
    if (isLowRating && !reason) {
      toast({
        title: "Reason Required",
        description: "Please tell us what went wrong.",
        variant: "destructive",
      });
      return;
    }

    // If technical or other reason selected, ensure feedback text is provided
    if (isLowRating && needsTextFeedback && !feedbackText.trim()) {
      toast({
        title: "Details Required",
        description: "Please provide more details about the issue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('📊 Submitting survey:', {
        submissionId,
        rating,
        reason,
        feedbackText,
      });

      // Send to backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audition/submit-survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          rating,
          reason: reason || null,
          feedbackText: feedbackText || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey');
      }

      console.log('✅ Survey submitted successfully:', result);

      toast({
        title: "Thank You!",
        description: "Your feedback has been recorded successfully.",
      });

      setIsComplete(true);

      // Return to dashboard after 2 seconds
      setTimeout(() => {
        onReturnToDashboard();
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting survey:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Completion Success Screen */}
      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
              <CheckCircle2 className="h-24 w-24 text-success animate-bounce" />
              <h2 className="text-3xl font-bold text-center">Audition Complete!</h2>
              <p className="text-muted-foreground text-center text-lg">
                Thank you for your feedback. Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Survey Form */
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-center">How Was Your Experience?</CardTitle>
            <CardDescription className="text-center text-lg">
              Please rate your audition experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Star Rating Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Rate Your Experience</Label>
              <div className="flex justify-center items-center gap-4 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-16 w-16 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between px-4 text-sm text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Conditional: Show issue options if rating is 1 or 2 */}
            {isLowRating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-4 border-t pt-6"
              >
                <Label className="text-base font-semibold">What was the main issue?</Label>
                <RadioGroup value={reason} onValueChange={setReason}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical" className="flex-1 cursor-pointer">
                      I had a technical issue (e.g., bug, audio failed)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="questions" id="questions" />
                    <Label htmlFor="questions" className="flex-1 cursor-pointer">
                      The questions were unclear or too difficult
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex-1 cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Conditional: Show textarea for ALL ratings once selected */}
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-4 border-t pt-6"
              >
                <Label htmlFor="feedback" className="text-base font-semibold">
                  {isLowRating && needsTextFeedback
                    ? "Please provide more details"
                    : isLowRating
                      ? "Additional feedback (optional)"
                      : "Tell us more about your experience (optional)"}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={isLowRating ? "Tell us what happened..." : "Share your thoughts..."}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[120px]"
                  disabled={isSubmitting}
                />
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                onClick={handleSubmitSurvey}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback & Finish"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {rating === 0
                  ? "Please select a rating to continue"
                  : isLowRating && !reason
                    ? "Please tell us what went wrong"
                    : needsTextFeedback && !feedbackText.trim()
                      ? "Please provide more details"
                      : "Click to submit your feedback"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
