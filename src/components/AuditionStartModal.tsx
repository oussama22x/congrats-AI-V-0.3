import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Clock, Mic, AlertCircle, CheckCircle2 } from "lucide-react";
import { SystemCheckStep } from "./SystemCheckStep";

interface AuditionStartModalProps {
  opportunity: {
    title: string;
    company: string;
  };
  onClose: () => void;
  onStart: (cameraStream: MediaStream | null) => void;
  isStarting?: boolean;
}

export const AuditionStartModal = ({ opportunity, onClose, onStart, isStarting = false }: AuditionStartModalProps) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-3xl font-bold pr-8">
            {step === 1 ? "Start Your Audition" : "System Check"}
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            You are about to start the audition for{" "}
            <span className="font-semibold text-foreground">{opportunity.title}</span>
            {" "}at{" "}
            <span className="font-semibold text-foreground">{opportunity.company}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Rules & Checklist */}
          {step === 1 && (
            <>
          {/* Rules Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Audition Rules</h3>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>Estimated Duration:</strong> This audition will take approximately 10 minutes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>Audio Only:</strong> This audition will be audio-only. No video is required.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm">
                    <strong>One at a Time:</strong> You must answer one question at a time
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                    <span className="text-lg">⏸️</span>
                  </div>
                  <span className="text-sm">
                    <strong>No Pausing:</strong> You cannot pause or restart the audition once started
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Checklist Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Pre-Audition Checklist</h3>
            </div>
            <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Before you begin, please ensure:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm font-medium">Are you in a quiet place?</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm font-medium">Is your microphone connected and working?</span>
                </li>
              </ul>
            </div>
          </div>

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

          {/* Start Button */}
          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full text-lg h-14 font-semibold"
              onClick={() => setStep(2)}
            >
              Next: System Check
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              By continuing, you agree to the audition terms and conditions
            </p>
          </div>
            </>
          )}

          {/* Step 2: System Check */}
          {step === 2 && (
            <SystemCheckStep 
              onStart={onStart}
              onClose={onClose}
              onBack={() => setStep(1)}
              isStarting={isStarting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
