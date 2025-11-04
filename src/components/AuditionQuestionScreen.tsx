import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Clock, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useToast } from "@/hooks/use-toast";
import { BackgroundCamera } from "@/components/BackgroundCamera";
import "./AuditionQuestionScreen.css";

interface Question {
  id: string;
  text: string;
  duration: number; // in seconds
  question_text?: string; // Support backend format
  time_limit_seconds?: number; // Support backend format
}

interface AuditionQuestionScreenProps {
  questions: Question[];
  opportunityId: string;
  userId: string;
  submissionId?: string; // NEW: Submission ID from backend
  cameraStream?: MediaStream | null;
  onComplete: () => void;
}

export const AuditionQuestionScreen = ({ 
  questions,
  opportunityId,
  userId,
  submissionId, // NEW: Receive submissionId as prop
  cameraStream,
  onComplete 
}: AuditionQuestionScreenProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false); // NEW: Overtime warning state
  const { toast } = useToast();
  
  // Audio recording hook
  const {
    recordingStatus,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  // Master Clock: 30-minute exam timer (1800 seconds)
  const { 
    timer: masterTimer, 
    isTimeUp: isMasterTimeUp, 
    startTimer: startMasterTimer 
  } = useCountdownTimer(1800);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle both frontend and backend question formats
  const questionText = currentQuestion.text || currentQuestion.question_text || 'Question';
  const officialTime = 90; // Official time is now 90 seconds (matches hard limit)
  const hardLimit = 90; // Hard limit changed to 90 seconds
  
  // Per-Question Timer: Countdown from 90 seconds (hard limit)
  const { 
    timer: questionTimer,
    rawTimer: currentTimeInSeconds, // Get raw seconds value
    isTimeUp: isQuestionTimeUp, 
    startTimer: startQuestionTimer,
    stopTimer: stopQuestionTimer,
    resetTimer: resetQuestionTimer 
  } = useCountdownTimer(hardLimit); // Now starts at 90 seconds

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Start master clock on component mount
  useEffect(() => {
    startMasterTimer();
  }, []);

  // Check for overtime when timer reaches 30 seconds or less
  useEffect(() => {
    // Timer turns red when 30 seconds or less remaining
    if (currentTimeInSeconds <= 30 && currentTimeInSeconds > 0) {
      if (!isOvertime) {
        setIsOvertime(true);
        console.log(`⚠️ Timer warning! ${currentTimeInSeconds}s remaining`);
      }
    } else {
      if (isOvertime) {
        setIsOvertime(false);
      }
    }
  }, [currentTimeInSeconds, isOvertime]);

  // Reset overtime flag and timer when question changes + AUTO-START RECORDING
  useEffect(() => {
    console.log(`🔄 Question changed to ${currentQuestionIndex + 1}, resetting overtime state`);
    setIsOvertime(false);
    resetQuestionTimer();
    
    // Auto-start recording when question appears
    console.log('🎤 Auto-starting recording for new question...');
    startRecording();
    startQuestionTimer();
  }, [currentQuestionIndex]);

  // Auto-advance when question timer expires
  useEffect(() => {
    if (isQuestionTimeUp) {
      console.log('⏰ Time is up! Automatically submitting and advancing...');
      
      // If currently recording, handleUploadAndAdvance will stop it and upload
      if (recordingStatus === "recording") {
        console.log('📹 Still recording, uploading current answer...');
        handleUploadAndAdvance();
      }
      // If user already recorded and stopped, upload the recorded answer
      else if (recordingStatus === "recorded") {
        console.log('✅ Already recorded, uploading answer...');
        handleUploadAndAdvance();
      }
      // If user never started recording (idle), skip this question
      else {
        console.log('⏭️ No recording detected, skipping to next question...');
        
        // Advance to next question or complete
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          resetRecording();
          resetQuestionTimer();
        } else {
          console.log('🎉 All questions completed - navigating to survey');
          onComplete();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuestionTimeUp, recordingStatus]);

  // Master clock expired - navigate to survey
  useEffect(() => {
    if (isMasterTimeUp) {
      console.log("⏰ Master clock expired - navigating to survey");
      toast({
        title: "Time's Up!",
        description: "The 30-minute exam has ended. Please complete the survey.",
        variant: "destructive",
      });
      onComplete();
    }
  }, [isMasterTimeUp]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopRecording = () => {
    stopRecording();
    stopQuestionTimer();
  };

  // NEW: Core upload and advance function
  const handleUploadAndAdvance = async () => {
    try {
      setIsUploading(true);

      // 1. Stop recording if still active
      if (recordingStatus === "recording") {
        stopRecording();
        stopQuestionTimer();
        // Wait a bit for blob to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 2. Check if we have audio blob
      if (!audioBlob) {
        toast({
          title: "No Recording",
          description: "Please record your answer before advancing.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // 3. Create FormData
      const formData = new FormData();
      formData.append('audio_file', audioBlob, `answer_${currentQuestion.id}.webm`);
      formData.append('userId', userId);
      formData.append('opportunityId', opportunityId);
      formData.append('questionId', currentQuestion.id);
      formData.append('questionText', questionText);
      
      // NEW: Include submissionId if available
      if (submissionId) {
        formData.append('submissionId', submissionId);
        console.log('📝 Including submission ID:', submissionId);
      }

      console.log('📤 Uploading answer for question:', currentQuestion.id);

      // 4. Send to backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audition/submit-answer`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit answer');
      }

      console.log('✅ Answer uploaded successfully:', result);

      toast({
        title: "Answer Submitted",
        description: `Question ${currentQuestionIndex + 1} recorded successfully!`,
      });

      // Advance to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetRecording();
        resetQuestionTimer();
      } else {
        // Last question - navigate to survey
        console.log('🎉 All questions completed - navigating to survey');
        onComplete();
      }

    } catch (error) {
      console.error('❌ Error uploading answer:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Camera Feed */}
      {cameraStream && (
        <BackgroundCamera 
          stream={cameraStream} 
          position="top-right"
          size="sm"
          showIndicator={true}
        />
      )}

      {/* Main Question Screen */}
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-4">
          {/* Master Clock Display */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold">Exam Time Remaining:</span>
            </div>
            <span className="text-2xl font-mono font-bold text-primary">
              {masterTimer}
            </span>
          </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <span className="text-sm text-muted-foreground font-medium">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Question Text */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold leading-relaxed">
                {questionText}
              </h2>
            </div>

            {/* Per-Question Timer - Countdown with Overtime Glow */}
            <div className="flex justify-center">
              <div className={`rounded-lg px-8 py-4 ${
                recordingStatus === "recording" 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted"
              }`}>
                <p className={`text-4xl font-mono font-bold tabular-nums ${
                  isOvertime ? 'timer-overtime' : 'timer-normal'
                }`}>
                  {questionTimer}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {recordingStatus === "recording" ? "Time Remaining" : "Question Time"}
                </p>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="space-y-4">
              {recordingStatus === "recording" && (
                <>
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-24 w-24 rounded-full animate-pulse"
                      onClick={handleStopRecording}
                      disabled={isUploading}
                    >
                      <Square className="h-12 w-12 fill-current" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Recording in progress... Click to stop
                  </p>
                </>
              )}

              {recordingStatus === "recorded" && (
                <>
                  <div className="flex justify-center">
                    <p className="text-center text-lg text-success font-medium">
                      ✓ Answer recorded successfully
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                onClick={handleUploadAndAdvance}
                disabled={recordingStatus !== "recorded" || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  "End Recording & Move to Next Question"
                ) : (
                  "Submit Final Answer & Complete"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {recordingStatus !== "recorded" 
                  ? "Record your answer to continue"
                  : currentQuestionIndex < questions.length - 1
                    ? `${questions.length - currentQuestionIndex - 1} question${
                        questions.length - currentQuestionIndex - 1 !== 1 ? "s" : ""
                      } remaining`
                    : "This is your final question"}
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};
