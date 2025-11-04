import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditionSurveyScreenProps {
  opportunityId: string;
  userId: string;
  submissionId?: string;
  onComplete: () => void;
}

export const AuditionSurveyScreen = ({ 
  opportunityId, 
  userId,
  submissionId,
  onComplete 
}: AuditionSurveyScreenProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitSurvey = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('📊 Submitting survey:', {
        submissionId,
        opportunityId,
        userId,
        rating,
      });

      // Send rating to backend
      const response = await fetch('http://localhost:4000/api/audition/submit-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionId || 'temp-submission-id',
          rating,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey');
      }

      console.log('✅ Survey submitted successfully:', result);

      setIsSubmitted(true);

      toast({
        title: "Thank You!",
        description: "Your feedback has been recorded successfully.",
      });

      // Wait 2 seconds before calling onComplete
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting survey:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <CheckCircle2 className="h-24 w-24 text-success animate-bounce" />
            <h2 className="text-3xl font-bold text-center">Audition Complete!</h2>
            <p className="text-muted-foreground text-center text-lg">
              Thank you for your participation. We'll review your submission and get back to you soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl text-center">How Was Your Experience?</CardTitle>
          <CardDescription className="text-center text-lg">
            Please rate your audition experience from 1 to 5 stars
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Star Rating */}
          <div className="flex justify-center items-center gap-4 py-8">
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

          {/* Rating Labels */}
          <div className="flex justify-between px-4 text-sm text-muted-foreground">
            <span>Poor</span>
            <span>Excellent</span>
          </div>

          {/* Selected Rating Display */}
          {rating > 0 && (
            <div className="text-center">
              <p className="text-lg font-semibold">
                You selected: {rating} {rating === 1 ? "star" : "stars"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {rating === 1 && "We appreciate your feedback and will work to improve."}
                {rating === 2 && "Thank you for your feedback. We'll strive to do better."}
                {rating === 3 && "Thanks for your feedback. We're always improving!"}
                {rating === 4 && "Great! We're glad you had a good experience."}
                {rating === 5 && "Excellent! We're thrilled you had such a great experience!"}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              onClick={handleSubmitSurvey}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating & Finish"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
