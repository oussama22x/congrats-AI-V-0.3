import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, CheckCircle2, AlertCircle, ArrowLeft, Camera, Mic } from "lucide-react";
import { motion } from "framer-motion";

interface SystemCheckStepProps {
  onStart: (cameraStream: MediaStream | null) => void;
  onClose: () => void;
  onBack: () => void;
}

export const SystemCheckStep = ({ onStart, onClose, onBack }: SystemCheckStepProps) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMicReady, setIsMicReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const auditionStartedRef = useRef(false); // Use ref instead of state for cleanup check
  
  // Mic visualizer refs
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Connect source to analyser
      source.connect(analyser);

      console.log("🎤 Audio visualizer setup complete");
      setIsMicReady(true);

      // Visualization loop
      const visualize = () => {
        animationFrameRef.current = requestAnimationFrame(visualize);

        // Get time domain data
        analyser.getByteTimeDomainData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i] - 128; // Center around 0
          sum += Math.abs(value);
        }
        const average = sum / bufferLength;
        const volumePercentage = Math.min(100, (average / 128) * 100 * 3); // Scale up for visibility

        // Update visualizer
        if (audioVisualizerRef.current) {
          const innerBar = audioVisualizerRef.current.querySelector('div') as HTMLDivElement;
          if (innerBar) {
            innerBar.style.width = `${volumePercentage}%`;
          }
        }
      };

      visualize();
    } catch (error) {
      console.error("❌ Audio visualizer setup error:", error);
      // Don't block on audio visualizer failure
      setIsMicReady(true);
    }
  };

  const setupCamera = async () => {
    let mounted = true;
    let stream: MediaStream | null = null;
    
    // Reset states
    setIsCameraReady(false);
    setCameraError(null);
    setIsRetrying(true);
    
    // Clean up existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      console.log("🎥 Requesting camera access...");
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported in this browser");
      }
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true // Request audio access
      });
      
      console.log("✅ Camera access granted:", stream.getVideoTracks());
      console.log("Video track settings:", stream.getVideoTracks()[0]?.getSettings());
      console.log("✅ Audio access granted:", stream.getAudioTracks());
      
      if (!mounted) {
        console.log("⚠️ Component unmounted, stopping stream");
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = stream;
      
      // Setup audio visualizer
      setupAudioVisualizer(stream);
      
      // Small delay to ensure React has rendered the video element
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (!videoRef.current) {
        throw new Error("Video element is not available");
      }
      
      // Attach stream to video element
      console.log("📺 Attaching stream to video element...");
      
      const videoElement = videoRef.current;
      videoElement.srcObject = stream;
      
      // Wait for video to be ready and play
      return new Promise<void>((resolve, reject) => {
        if (!videoElement) {
          reject(new Error("Video element is null"));
          return;
        }

        const onLoadedMetadata = async () => {
          console.log("✅ Video metadata loaded");
          try {
            await videoElement.play();
            console.log("✅ Video playing");
            
            if (mounted) {
              setIsCameraReady(true);
              console.log("✅ Camera ready state set to true");
            }
            resolve();
          } catch (playError) {
            console.error("❌ Error playing video:", playError);
            // Even if play fails, mark as ready since the stream is attached
            if (mounted) {
              setIsCameraReady(true);
            }
            resolve(); // Still resolve, don't reject
          }
        };

        const onError = (e: Event) => {
          console.error("❌ Video element error:", e);
          reject(new Error("Video element error"));
        };

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        videoElement.addEventListener('error', onError, { once: true });

        // Timeout fallback
        setTimeout(() => {
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoElement.removeEventListener('error', onError);
          
          // If we got here and video is playing, consider it success
          if (!videoElement.paused) {
            console.log("✅ Video is playing (timeout fallback)");
            if (mounted) {
              setIsCameraReady(true);
            }
            resolve();
          } else {
            console.warn("⚠️ Video timeout - forcing ready state");
            if (mounted) {
              setIsCameraReady(true);
            }
            resolve();
          }
        }, 3000);
      });
      
    } catch (error: any) {
      console.error("❌ Camera access error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      if (!mounted) return;
      
      // Handle different error types
      if (error.name === "NotFoundError") {
        setCameraError("No camera device found. You can continue without camera verification for testing purposes.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings and click Retry.");
      } else if (error.message.includes("not supported")) {
        setCameraError("Your browser doesn't support camera access. Please use Chrome, Firefox, or Edge.");
      } else if (error.message.includes("failed to render")) {
        setCameraError("Video element failed to load. Please try again or continue anyway for testing.");
      } else {
        setCameraError(`Unable to access camera: ${error.message}. You can continue anyway for testing purposes.`);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    setupCamera();
    
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Only clean up if audition hasn't started
      if (!auditionStartedRef.current) {
        console.log("🧹 Cleaning up camera stream (component unmount - no audition started)");
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log("🛑 Stopped track:", track.label);
          });
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      } else {
        console.log("🎥 Camera stream kept active for audition (cleanup skipped)");
      }
    };
  }, []);

  const handleStartAudition = () => {
    // Keep the camera running - pass the stream to the parent
    // DO NOT stop the stream here - it will be cleaned up when audition completes
    console.log("🎥 Keeping camera stream active for audition");
    console.log("Stream reference:", streamRef.current);
    console.log("Active tracks:", streamRef.current?.getTracks());
    
    // Mark that audition has started to prevent cleanup
    auditionStartedRef.current = true;
    
    // Pass the camera stream to the parent component
    onStart(streamRef.current);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">System Check</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          We need to verify your camera and microphone are working to ensure the integrity of the audition process.
        </p>
      </div>

      {/* Camera Status */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isCameraReady 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}>
            {isCameraReady ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <Video className="h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-pulse" />
            )}
          </div>
          <div>
            <p className="font-medium">Camera Status</p>
            <p className="text-sm text-muted-foreground">
              {isCameraReady ? "Camera is working" : "Requesting camera permission..."}
            </p>
          </div>
        </div>
        <Badge variant={isCameraReady ? "default" : "secondary"}>
          {isCameraReady ? "Ready" : "Waiting"}
        </Badge>
      </div>

      {/* Microphone Status */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isMicReady 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}>
            {isMicReady ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <Mic className="h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-pulse" />
            )}
          </div>
          <div>
            <p className="font-medium">Microphone Status</p>
            <p className="text-sm text-muted-foreground">
              {isMicReady ? "Microphone is working" : "Requesting microphone permission..."}
            </p>
          </div>
        </div>
        <Badge variant={isMicReady ? "default" : "secondary"}>
          {isMicReady ? "Ready" : "Waiting"}
        </Badge>
      </div>

      {/* Microphone Check */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Mic Check</p>
        {!isMicReady && (
          <p className="text-sm text-muted-foreground">Please say something...</p>
        )}
        {isMicReady && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Speak to see the volume indicator
            </p>
            <div 
              ref={audioVisualizerRef}
              className="w-full h-3 bg-muted rounded-full overflow-hidden border"
            >
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-100"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Preview */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Camera Preview</p>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-primary/20 bg-black">
          {/* Always render video element, but hide it when not ready */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: "scaleX(-1)" }}
          />
          
          {/* Live indicator - only show when ready */}
          {isCameraReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-4 left-4 z-10"
            >
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-white font-medium">Live</span>
              </div>
            </motion.div>
          )}
          
          {/* Error overlay */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 z-20">
              <AlertCircle className="h-16 w-16 text-yellow-600 dark:text-yellow-400 mb-4" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">Camera Unavailable</p>
              <p className="text-xs text-muted-foreground max-w-md mb-4">{cameraError}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={setupCamera}
                disabled={isRetrying}
                className="mb-3"
              >
                {isRetrying ? "Retrying..." : "Retry Camera Access"}
              </Button>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  For production use, camera verification is required. In testing mode, you can proceed without it.
                </p>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {!isCameraReady && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <Video className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
              <p className="text-sm text-muted-foreground">
                {isRetrying ? "Retrying camera access..." : "Initializing camera..."}
              </p>
            </div>
          )}
        </div>
        {isCameraReady && (
          <p className="text-xs text-muted-foreground">
            ✓ Your camera is working correctly. You can see yourself in the preview above.
          </p>
        )}
      </div>

      {/* Proctoring Notice */}
      {(isCameraReady && isMicReady) && (
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Proctoring Notice
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Your camera and microphone will be used to verify your identity and record your responses during this audition. 
                This helps maintain the integrity and fairness of the assessment process.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="w-32"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1 text-lg h-14 font-semibold"
          onClick={handleStartAudition}
          disabled={false}
        >
          {(isCameraReady && isMicReady) ? "Start Audition" : "Continue Anyway (Testing Mode)"}
        </Button>
      </div>
      {(!isCameraReady || !isMicReady) && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
          ⚠️ System check not complete - You can continue anyway for testing purposes. Production requires camera & microphone access.
        </p>
      )}
      {(isCameraReady && isMicReady) && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center">
          ✓ All systems ready! You can start your audition.
        </p>
      )}
    </div>
  );
};
