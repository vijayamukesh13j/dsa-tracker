import { useEffect, useState } from 'react';

export function useStopwatch() {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const toggle = () => setIsRunning((prev) => !prev);
  const reset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const minutesFloat = Math.max(1, Math.round(seconds / 60));

  const formatTime = (): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return {
    seconds,
    isRunning,
    start,
    pause,
    toggle,
    reset,
    formattedTime: formatTime(),
    elapsedMinutes: minutesFloat,
  };
}
