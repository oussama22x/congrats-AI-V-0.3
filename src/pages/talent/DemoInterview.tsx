import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuditionQuestionScreen } from "@/components/AuditionQuestionScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Question {
  id: string;
  text: string;
  duration: number;
}

export const DemoInterview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoStarted, setDemoStarted] = useState(false);
  
  // Camera stream state (for demo, we'll just pass null)
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Fetch demo questions
  useEffect(() => {
    const fetchDemoQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/audition/demo`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch demo questions');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load demo questions');
        }
        
        // Transform questions to frontend format
        const transformedQuestions = data.questions.map((q: any) => ({
          id: q.id,
          text: q.question_text,
          duration: q.time_limit_seconds
        }));
        
        setQuestions(transformedQuestions);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load demo questions';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemoQuestions();
  }, [toast]);

  const handleStartDemo = () => {
    setDemoStarted(true);
  };

  const handleDemoComplete = () => {
    console.log('✅ Demo interview completed');
    toast({
      title: "Demo Complete!",
      description: "Great job! You can now try a real audition.",
    });
    // Navigate back to opportunities page
    navigate('/opportunities');
  };

  // If demo is in progress, show the question screen
  if (demoStarted && questions.length > 0) {
    return (
      <AuditionQuestionScreen
        questions={questions}
        opportunityId="demo"
        userId="demo-user"
        submissionId={undefined}
        cameraStream={cameraStreamRef.current}
        onComplete={handleDemoComplete}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Loading Demo Interview...</h2>
            <p className="text-muted-foreground">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">Error Loading Demo</h2>
            <p className="text-muted-foreground text-center">{error}</p>
            <Button onClick={() => navigate('/opportunities')}>
              Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardContent className="py-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🎬</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold">Demo Interview</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our interview process with 3 practice questions
            </p>
          </div>

          <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">What to expect:</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span className="text-sm">3 simple questions to answer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span className="text-sm">90 seconds per question</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span className="text-sm">Audio recording only (no video required for demo)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span className="text-sm">Your answers will NOT be saved or submitted</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="w-full max-w-md h-14 text-lg font-semibold"
              onClick={handleStartDemo}
            >
              Start Demo Interview
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/opportunities')}
            >
              Back to Opportunities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoInterview;
