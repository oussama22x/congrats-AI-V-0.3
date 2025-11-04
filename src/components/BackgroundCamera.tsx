import { useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";

interface BackgroundCameraProps {
  stream: MediaStream | null;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "sm" | "md" | "lg";
  showIndicator?: boolean;
}

export const BackgroundCamera = ({ 
  stream, 
  position = "top-right",
  size = "sm",
  showIndicator = true 
}: BackgroundCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!stream) {
      console.log("⚠️ BackgroundCamera: No stream provided");
      return;
    }
    
    if (!videoRef.current) {
      console.log("⚠️ BackgroundCamera: Video element not ready");
      return;
    }

    console.log("🎥 BackgroundCamera: Attaching stream to video element");
    console.log("Stream tracks:", stream.getTracks());
    console.log("Stream active:", stream.active);
    
    const videoElement = videoRef.current;
    videoElement.srcObject = stream;

    // Play the video
    videoElement.play()
      .then(() => {
        console.log("✅ BackgroundCamera: Video playing successfully");
      })
      .catch((error) => {
        console.error("❌ BackgroundCamera: Error playing video:", error);
      });

    return () => {
      console.log("🧹 BackgroundCamera: Cleaning up video element (component unmount)");
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) {
    return null;
  }

  // Position classes
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  // Size classes
  const sizeClasses = {
    sm: "w-32 h-24",
    md: "w-48 h-36",
    lg: "w-64 h-48",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed ${positionClasses[position]} ${sizeClasses[size]} z-50`}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-primary/30 shadow-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        
        {/* Live Indicator */}
        {showIndicator && (
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white font-medium">LIVE</span>
            </div>
          </div>
        )}

        {/* Camera Icon Overlay (appears on hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};
