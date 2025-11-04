import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnswerCard } from "@/components/AnswerCard";
import { ArrowLeft, Loader2, AlertCircle, Briefcase, MapPin, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

// Backend URL - using environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Answer {
  id: string;
  questionId: string;
  questionText: string;
  audioUrl: string;
  transcript: string | null;
  submittedAt: string;
}

interface SubmissionDetail {
  id: string;
  userId: string;
  opportunityId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  rate: string;
  status: string;
  submittedAt: string;
  durationSeconds: number;
  rating?: number;
  feedbackReason?: string;
  feedbackText?: string;
  questions: any[];
  answers: Answer[];
}

export const SubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setError("No submission ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${BACKEND_URL}/api/submissions/${submissionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Submission not found");
          }
          throw new Error(`Failed to fetch submission: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to load submission");
        }
        
        setSubmission(data.data);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError(err instanceof Error ? err.message : "Failed to load submission details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "pending_review": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
      "Pending Review": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
      "approved": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
      "Approved": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
      "rejected": "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
      "Rejected": "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
      "technical_review": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
      "Technical Review": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
    };

    return statusColors[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400";
  };

  const formatStatus = (status: string) => {
    // Convert snake_case to Title Case
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Loading Your Submission...</h2>
            <p className="text-muted-foreground">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-16 space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Submission not found"}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/talent/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/talent/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">
                  Your Audition: {submission.title}
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  {submission.company}
                </CardDescription>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {submission.location}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {submission.type}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {submission.rate}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="secondary" 
                  className={getStatusBadgeColor(submission.status)}
                >
                  {formatStatus(submission.status)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Submitted {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Your Recorded Answers
            </h2>
            <Badge variant="outline" className="text-sm">
              {submission.answers.length} {submission.answers.length === 1 ? 'Question' : 'Questions'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {submission.answers.map((answer, index) => (
              <AnswerCard
                key={answer.id}
                questionNumber={index + 1}
                questionText={answer.questionText}
                audioUrl={answer.audioUrl}
                transcript={answer.transcript}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t flex justify-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate("/talent/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailPage;
