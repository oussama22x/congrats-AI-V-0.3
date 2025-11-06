import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Clock, Loader2, Volume2 } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  const [hasRecorded, setHasRecorded] = useState(false); // Track if recording is finished
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

  // Reset overtime flag and timer when question changes + AUTO-START
  useEffect(() => {
    console.log(`🔄 Question changed to ${currentQuestionIndex + 1}, resetting state`);
    setIsOvertime(false);
    setHasRecorded(false); // Reset recorded flag for new question
    resetRecording();
    
    // AUTO-START: Start recording and timer immediately
    console.log('🎤 Auto-starting recording and timer for new question...');
    startRecording();
    startQuestionTimer();
    setIsRecording(true);
  }, [currentQuestionIndex]);

  // Auto-advance when question timer expires
  useEffect(() => {
    if (isQuestionTimeUp && !isUploading) {
      console.log('⏰ Time is up! Automatically submitting and advancing...');
      
      // If currently recording, stop recording
      if (isRecording) {
        console.log('📹 Still recording, stopping...');
        handleStopRecording();
      }
      // If user already stopped recording, upload the answer
      else if (audioBlob && hasRecorded) {
        console.log('✅ Recording available, uploading answer...');
        handleUploadAndAdvance();
      }
      // If user never started recording, skip this question
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
  }, [isQuestionTimeUp, isRecording]);

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

  // Handle stopping the recording (does NOT upload)
  const handleStopRecording = () => {
    console.log('🛑 Stop button clicked - stopping recording');
    
    // Stop the timer
    stopQuestionTimer();
    
    // Stop recording
    stopRecording();
    
    // Update states
    setIsRecording(false);
    setHasRecorded(true);
  };

  // Read question aloud using browser's Speech Synthesis API
  const handleReadQuestion = (text: string) => {
    try {
      // Check if Speech Synthesis is supported
      if (!window.speechSynthesis) {
        toast({
          title: "Not Supported",
          description: "Text-to-speech is not supported in your browser.",
          variant: "destructive",
        });
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optional: Configure voice properties
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Speak the text
      window.speechSynthesis.speak(utterance);

      console.log('🔊 Reading question aloud:', text);
    } catch (error) {
      console.error('❌ Error reading question:', error);
      toast({
        title: "Error",
        description: "Failed to read question aloud.",
        variant: "destructive",
      });
    }
  };

  // NEW: Core upload and advance function
  const handleUploadAndAdvance = async () => {
    try {
      console.log('📤 handleUploadAndAdvance called');
      console.log('🎵 audioBlob:', audioBlob);
      console.log('📊 recordingStatus:', recordingStatus);
      
      setIsUploading(true);

      // 1. Check if we have audio blob
      if (!audioBlob) {
        console.error('❌ No audio blob available!');
        toast({
          title: "No Recording",
          description: "Please record your answer before advancing.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      console.log('✅ Audio blob exists, size:', audioBlob.size);

      // 2. Create FormData
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

      // 3. Send to backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/audition/submit-answer`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);

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
        console.log('➡️ Moving to next question...');
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
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
              <div className="flex items-start justify-center gap-4">
                <h2 className="text-3xl font-bold leading-relaxed text-center flex-1">
                  {questionText}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 hover:bg-primary/10"
                  onClick={() => handleReadQuestion(questionText)}
                  title="Read question aloud"
                >
                  <Volume2 className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>

            {/* Per-Question Timer - Countdown with Overtime Glow */}
            <div className="flex justify-center">
              <div className={`rounded-lg px-8 py-4 ${
                isRecording 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted"
              }`}>
                <p className={`text-4xl font-mono font-bold tabular-nums ${
                  isOvertime ? 'timer-overtime' : 'timer-normal'
                }`}>
                  {questionTimer}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {isRecording ? "Time Remaining" : "Question Time"}
                </p>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="space-y-4">
              {/* Red Stop Button - Only visible when recording and NOT uploading */}
              {isRecording && !isUploading && (
                <>
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-24 w-24 rounded-full animate-pulse"
                      onClick={handleStopRecording}
                    >
                      <Square className="h-12 w-12 fill-current" />
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Recording in progress... Click to stop
                  </p>
                </>
              )}

              {/* "Move to Next Question" Button - Always visible, disabled until hasRecorded */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="h-16 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUploadAndAdvance}
                  disabled={!hasRecorded || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Move to Next Question"
                  )}
                </Button>
              </div>
              {!hasRecorded && !isUploading && (
                <p className="text-center text-xs text-muted-foreground">
                  Complete your recording to enable
                </p>
              )}
            </div>

            {/* Loading and Helper Text Section */}
            <div className="pt-4">
              {/* Helper text */}
              {!isUploading && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 font-medium">
                  ⚠️ You cannot pause. You can only stop and move on to the next question.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};
