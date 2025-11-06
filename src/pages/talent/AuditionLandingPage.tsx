import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, Clock, Mic, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Backend URL - using environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface OpportunityData {
  id: string;
  title: string;
  company: string;
}

export const AuditionLandingPage = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're coming from demo completion
  const autoStartAudition = (location.state as any)?.autoStartAudition || false;
  const fromDemoTitle = (location.state as any)?.opportunityTitle;
  const fromDemoCompany = (location.state as any)?.opportunityCompany;

  // Debug logging
  useEffect(() => {
    console.log('🔍 AuditionLandingPage - location.state:', location.state);
    console.log('🔍 autoStartAudition:', autoStartAudition);
  }, [location.state, autoStartAudition]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!opportunityId) {
        setError("No opportunity ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all opportunities and find the one we need
        const response = await fetch(`${BACKEND_URL}/api/opportunities`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
        }
        
        const opportunities = await response.json();
        
        // Find the specific opportunity by ID
        const foundOpportunity = opportunities.find((opp: any) => opp.id === opportunityId);
        
        if (!foundOpportunity) {
          throw new Error("Opportunity not found");
        }
        
        setOpportunity({
          id: foundOpportunity.id,
          title: foundOpportunity.title,
          company: foundOpportunity.company,
        });
      } catch (err) {
        console.error("Error fetching opportunity:", err);
        setError(err instanceof Error ? err.message : "Failed to load opportunity details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId]);

  // Handle starting the real audition
  const handleStartRealAudition = () => {
    console.log('🎬🎬🎬 handleStartRealAudition CALLED!');
    
    // Navigate directly back to opportunities and trigger auto-start
    // The opportunities page will handle the system check and audition start
    navigate('/opportunities', {
      state: {
        autoStartOpportunityId: opportunityId,
        autoStartAudition: true
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Loading Audition Details...</h2>
            <p className="text-muted-foreground">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-16 space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Opportunity not found"}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/opportunities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/opportunities")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>

        {/* Main Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-4xl font-bold">
              Your Audition for {opportunity.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {opportunity.company}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Demo Disclaimer */}
            <div className="rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                    Recommendation: Complete the Demo Test First
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    We highly recommend you complete the 3-question "Demo Interview" first to ensure your system is working correctly. You can find the Demo Test on the main opportunities page.
                  </p>
                </div>
              </div>
            </div>

            {/* Audition Rules Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Audition Overview</h3>
              </div>
              <div className="rounded-lg border bg-muted/50 p-6">
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1, Column 1: 12 Questions */}
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 flex items-center justify-center text-primary mt-0.5 shrink-0 font-bold text-lg">
                      12
                    </div>
                    <div>
                      <span className="text-base font-semibold block">12 Questions</span>
                      <span className="text-sm text-muted-foreground">
                        You will answer 12 questions about this role
                      </span>
                    </div>
                  </div>

                  {/* Row 1, Column 2: 90 Seconds */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-base font-semibold block">90 Seconds per Question</span>
                      <span className="text-sm text-muted-foreground">
                        You have up to 90 seconds to record your answer for each question
                      </span>
                    </div>
                  </div>

                  {/* Row 2, Column 1: Audio-Only */}
                  <div className="flex items-start gap-3">
                    <Mic className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-base font-semibold block">Audio-Only Recording</span>
                      <span className="text-sm text-muted-foreground">
                        This audition is audio-only. No video is required.
                      </span>
                    </div>
                  </div>

                  {/* Row 2, Column 2: No Pausing */}
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 flex items-center justify-center text-primary mt-0.5 shrink-0">
                      <span className="text-xl">⏸️</span>
                    </div>
                    <div>
                      <span className="text-base font-semibold block">No Pausing or Retries</span>
                      <span className="text-sm text-muted-foreground">
                        Once you start, you cannot pause or restart the audition
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-Audition Checklist */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold">Pre-Audition Checklist</h3>
              </div>
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-6">
                <p className="text-base text-muted-foreground mb-4">
                  Before you begin, please ensure:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <span className="text-base font-medium">You are in a quiet place</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <span className="text-base font-medium">Your microphone is connected and working</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <span className="text-base font-medium">You have at least 20 minutes of uninterrupted time</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Start Button Section */}
            <div className="pt-6 space-y-4">
              {autoStartAudition ? (
                // Coming from demo - show success message and different button
                <>
                  <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20 p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-green-800 dark:text-green-400">
                          Demo Complete! System Check Passed ✓
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your microphone is working perfectly. You're ready to start the real audition.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full text-xl h-16 font-bold bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      console.log('🔴 GREEN BUTTON CLICKED!!!');
                      handleStartRealAudition();
                    }}
                  >
                    Start Real Audition Now
                  </Button>
                </>
              ) : (
                // Normal flow - show demo button
                <Button 
                  size="lg" 
                  className="w-full text-xl h-16 font-bold"
                  onClick={() => {
                    // Navigate to demo with the opportunity ID in state
                    navigate('/audition/demo', { 
                      state: { 
                        returnTo: 'audition',
                        opportunityId: opportunityId,
                        opportunityTitle: opportunity.title,
                        opportunityCompany: opportunity.company
                      } 
                    });
                  }}
                >
                  Start System Check & Demo
                </Button>
              )}
              <p className="text-sm text-muted-foreground text-center">
                By continuing, you agree to the audition terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditionLandingPage;
