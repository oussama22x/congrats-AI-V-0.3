import { useState, useEffect, useRef } from "react";

export const useCountdownTimer = (initialDuration: number) => {
  const [timer, setTimer] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            stopTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timer]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(initialDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Format timer as MM:SS
  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isTimeUp = timer === 0;

  return {
    timer: formatTimer(),
    rawTimer: timer, // Return raw timer value for overtime checking
    isTimeUp,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
