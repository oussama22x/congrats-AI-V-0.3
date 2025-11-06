import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OpportunityCard } from "@/components/OpportunityCard";
import { AuditionStartModal } from "@/components/AuditionStartModal";
import { AuditionQuestionScreen } from "@/components/AuditionQuestionScreen";
import { AuditionCompleteScreen } from "@/components/AuditionCompleteScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Backend URL - now using environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Question type with duration
interface Question {
  id: string;
  text: string;
  duration: number; // in seconds
}

// Opportunity type
interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  rate: string;
  skills: string[];
  questions: Question[]; // Updated to use Question type
}

const Opportunities = () => {
  // Get current user
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get URL params for auto-start
  const searchParams = new URLSearchParams(location.search);
  const autoStartOpportunityId = searchParams.get('autoStart');
  
  // State for opportunities data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State to track user's submissions (prevent duplicate applications)
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  
  // State for loading indicator when starting audition
  const [isStarting, setIsStarting] = useState(false);
  
  // State for modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  // State for audition flow
  const [auditionInProgress, setAuditionInProgress] = useState(false);
  const [auditionComplete, setAuditionComplete] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  // Camera stream state
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/opportunities`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        
        const data = await response.json();
        
        // Transform questions from backend format to frontend format
        const transformedData = data.map((opp: any) => ({
          ...opp,
          questions: (opp.questions || []).map((q: any, index: number) => ({
            id: `q${index + 1}`,
            text: q.question_text || q.text || q, // Support both formats
            duration: q.time_limit_seconds || q.duration || 120, // Use backend time_limit or default
          })),
        }));
        
        setOpportunities(transformedData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load opportunities';
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

    fetchOpportunities();
  }, [toast]);

  // Fetch user's submissions to check for duplicates
  useEffect(() => {
    const fetchUserSubmissions = async () => {
      if (!currentUser?.id) {
        setSubmissionsLoading(false);
        return;
      }

      try {
        setSubmissionsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/submissions?userId=${currentUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user submissions');
        }
        
        const result = await response.json();
        const submissions = result.data || result;
        
        // Create a Set of opportunity IDs the user has already applied to
        const appliedOpportunityIds = new Set<string>(
          submissions.map((sub: any) => sub.opportunityId || sub.opportunity_id as string)
        );
        
        console.log('✅ User has applied to opportunities:', Array.from(appliedOpportunityIds));
        console.log(`📊 Total applications: ${appliedOpportunityIds.size}`);
        setUserSubmissions(appliedOpportunityIds);
      } catch (err) {
        console.error('❌ Error fetching user submissions:', err);
        // Don't show error to user, just log it
        // Users can still see opportunities even if this fails
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [currentUser?.id]);

  // Auto-start audition after demo completion
  useEffect(() => {
    console.log('🔍 Checking auto-start:', { autoStartOpportunityId, opportunitiesLoaded: opportunities.length, isLoading });
    
    if (autoStartOpportunityId && opportunities.length > 0 && !isLoading) {
      console.log('🎬 Auto-starting audition for opportunity:', autoStartOpportunityId);
      
      // Find the opportunity
      const opportunity = opportunities.find(opp => opp.id === autoStartOpportunityId);
      
      if (opportunity) {
        console.log('✅ Found opportunity, starting audition:', opportunity.title);
        // Clear the URL param to prevent re-triggering
        navigate('/opportunities', { replace: true });
        
        // Start the audition
        handleStartAudition(opportunity);
      } else {
        console.log('❌ Opportunity not found:', autoStartOpportunityId);
      }
    }
  }, [autoStartOpportunityId, opportunities, isLoading, navigate]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        console.log("🧹 Cleaning up camera stream (component unmount)");
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  // Handler functions
  const handleStartAudition = (opportunity: Opportunity) => {
    console.log('🎯 handleStartAudition called for:', opportunity.id, opportunity.title);
    console.log('🎯 submissionsLoading:', submissionsLoading);
    console.log('🎯 userSubmissions:', Array.from(userSubmissions));
    console.log('🎯 Has already applied?', userSubmissions.has(opportunity.id));
    
    // Wait until submissions are loaded before allowing start
    if (submissionsLoading) {
      console.log("⚠️ Still checking submission status, please wait...");
      toast({
        title: "Please Wait",
        description: "Checking your application status...",
        variant: "default",
      });
      return;
    }
    
    // Check if user has already applied to this opportunity
    if (userSubmissions.has(opportunity.id)) {
      console.log("❌ Already applied to:", opportunity.title);
      toast({
        title: "Already Applied",
        description: "You have already submitted an audition for this opportunity.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ All checks passed, opening modal for:', opportunity.title);
    setSelectedOpportunity(opportunity);
  };

  const handleCloseModal = () => {
    setSelectedOpportunity(null);
    // Clean up camera if modal is closed without starting audition
    if (cameraStreamRef.current) {
      console.log("🧹 Cleaning up camera stream (modal closed)");
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
  };

  const handleBeginAudition = async (cameraStream: MediaStream | null) => {
    console.log("🎬 Beginning audition with camera stream:", cameraStream);
    if (cameraStream) {
      console.log("Stream active:", cameraStream.active);
      console.log("Stream tracks:", cameraStream.getTracks());
      console.log("Video tracks:", cameraStream.getVideoTracks().map(t => ({
        id: t.id,
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })));
    }
    cameraStreamRef.current = cameraStream;
    
    // Call the new /api/audition/start endpoint
    if (!selectedOpportunity || !currentUser?.id) {
      console.error('❌ Missing opportunity or user ID');
      toast({
        title: "Error",
        description: "Unable to start audition. Missing required information.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsStarting(true);
      console.log('🚀 Calling /api/audition/start endpoint...');
      console.log('👤 User ID:', currentUser.id);
      console.log('🎯 Opportunity ID:', selectedOpportunity.id);
      
      const response = await fetch(`${BACKEND_URL}/api/audition/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          opportunityId: selectedOpportunity.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to start audition');
      }

      console.log('✅ Audition started successfully');
      console.log('📝 Submission ID:', result.submissionId);
      console.log('📋 Questions received:', result.questions.length);
      
      // Save submissionId and questions to state
      setSubmissionId(result.submissionId);
      
      // Transform questions from backend format to frontend format
      const transformedQuestions = result.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        text: q.prompt || q.text,
        duration: q.time_limit_seconds || 90,
      }));
      
      // Update selected opportunity with real questions
      setSelectedOpportunity({
        ...selectedOpportunity,
        questions: transformedQuestions,
      });
      
      // Start the audition
      setAuditionInProgress(true);
      
    } catch (error) {
      console.error('❌ Error starting audition:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start audition. Please try again.",
        variant: "destructive",
      });
      
      // Clean up camera stream on error
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      cameraStreamRef.current = null;
    } finally {
      setIsStarting(false);
    }
  };

  // NEW: Handler when all questions are completed
  const handleQuestionsComplete = async () => {
    console.log('✅ All questions completed - creating submission record');
    
    // Clean up camera stream
    if (cameraStreamRef.current) {
      console.log("🧹 Cleaning up camera stream (audition complete)");
      cameraStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped camera track:", track.label);
      });
      cameraStreamRef.current = null;
    }
    
    if (!selectedOpportunity || !currentUser?.id) {
      console.error('❌ Missing opportunity or user ID');
      return;
    }
    
    try {
      console.log('📝 Calling create-submission endpoint...');
      console.log('👤 User ID:', currentUser.id);
      console.log('🎯 Opportunity ID:', selectedOpportunity.id);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audition/create-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          opportunityId: selectedOpportunity.id,
          questions: selectedOpportunity.questions.map(q => ({
            question_text: q.text,
            time_limit_seconds: q.duration
          })),
          totalDuration: selectedOpportunity.questions.reduce((sum, q) => sum + q.duration, 0)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create submission');
      }

      const submissionId = result.data.submissionId;
      console.log('✅ Submission created with ID:', submissionId);
      console.log('✅ Submission saved to database - will appear in "My Applications"');
      setSubmissionId(submissionId);
      
      // Add this opportunity to the user's submissions set IMMEDIATELY
      if (selectedOpportunity?.id) {
        const opportunityId = selectedOpportunity.id;
        setUserSubmissions(prev => {
          const newSet = new Set([...prev, opportunityId]);
          console.log('📝 Updated applied list:', Array.from(newSet));
          console.log('🔍 Has this opportunity now?', newSet.has(opportunityId));
          return newSet;
        });
      }
      
      // Go directly to AuditionCompleteScreen (which has the survey built-in)
      setAuditionInProgress(false);
      setAuditionComplete(true);
      
    } catch (error) {
      console.error('❌ Error creating submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to proceed to survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  // REMOVED: handleSurveyComplete - no longer needed since we skip AuditionSurveyScreen

  // OLD: Remove this function - no longer needed with per-question submission
  const handleCompleteAudition = async (answers: Blob[]) => {
    // This function is deprecated - keeping for reference only
    // New flow: Each answer is submitted individually via handleUploadAndAdvance
  };

  const handleReturnToDashboard = () => {
    // Clean up camera if still running
    if (cameraStreamRef.current) {
      console.log("🧹 Cleaning up camera stream (return to dashboard)");
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    
    setAuditionComplete(false);
    setSelectedOpportunity(null);
  };

  // If audition is complete, show completion screen (with built-in survey)
  if (auditionComplete) {
    return (
      <AuditionCompleteScreen 
        onReturnToDashboard={handleReturnToDashboard}
        submissionId={submissionId || undefined}
      />
    );
  }

  // If audition is in progress, show the question screen
  if (auditionInProgress && selectedOpportunity && currentUser?.id) {
    return (
      <AuditionQuestionScreen
        questions={selectedOpportunity.questions}
        opportunityId={selectedOpportunity.id}
        userId={currentUser.id}
        submissionId={submissionId || undefined} // NEW: Pass submissionId
        cameraStream={cameraStreamRef.current}
        onComplete={handleQuestionsComplete}
      />
    );
  }

  // Otherwise, show the opportunities list
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Available Auditions</h1>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <h2 className="text-2xl text-muted-foreground">Loading opportunities...</h2>
          </div>
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <h2 className="text-2xl text-destructive">Failed to load opportunities</h2>
            <p className="text-muted-foreground">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Opportunities Grid */}
        {!isLoading && !error && opportunities.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunityId={opportunity.id}
                title={opportunity.title}
                company={opportunity.company}
                location={opportunity.location}
                type={opportunity.type}
                rate={opportunity.rate}
                skills={opportunity.skills}
                hasApplied={userSubmissions.has(opportunity.id)}
                isCheckingStatus={submissionsLoading}
              />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && opportunities.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <h2 className="text-2xl text-muted-foreground">No opportunities available at the moment</h2>
          </div>
        )}
      </div>

      {/* Audition Start Modal */}
      {selectedOpportunity && (
        <AuditionStartModal
          opportunity={selectedOpportunity}
          onClose={handleCloseModal}
          onStart={handleBeginAudition}
          isStarting={isStarting}
        />
      )}
    </div>
  );
};

export default Opportunities;
