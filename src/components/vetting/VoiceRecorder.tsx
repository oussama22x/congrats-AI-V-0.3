import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSubmit: (audioBlob: Blob, durationSeconds: number) => Promise<void>;
  maxDurationSeconds: number;
  isSubmitting: boolean;
}

export const VoiceRecorder = ({ onSubmit, maxDurationSeconds, isSubmitting }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDurationSeconds) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }

        setHasRecording(true);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setPermissionDenied(false);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setHasRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const handleSubmit = async () => {
    if (audioChunksRef.current.length === 0) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    await onSubmit(audioBlob, recordingTime);
  };

  // Handle audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <div className="space-y-6">
      <audio ref={audioRef} className="hidden" />

      {/* Timer Display */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "text-6xl font-bold tabular-nums transition-colors",
          isRecording && "text-destructive animate-pulse"
        )}>
          {formatTime(recordingTime)}
        </div>
        <div className="text-muted-foreground ml-2 text-sm">
          / {formatTime(maxDurationSeconds)}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {!hasRecording ? (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSubmitting}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className="gap-2 min-w-[140px]"
          >
            {isRecording ? (
              <>
                <Square className="h-5 w-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Record
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={togglePlayback}
              disabled={isSubmitting}
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={resetRecording}
              disabled={isSubmitting}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="gap-2 min-w-[140px]"
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </Button>
          </>
        )}
      </div>

      {/* Permission Denied Message */}
      {permissionDenied && (
        <div className="text-sm text-destructive text-center">
          Microphone access denied. Please enable microphone permissions to record.
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground text-center">
        {!hasRecording ? (
          isRecording ? (
            "Click Stop when you're finished recording"
          ) : (
            "Click Record to start your response"
          )
        ) : (
          "Preview your recording before submitting"
        )}
      </div>
    </div>
  );
};
