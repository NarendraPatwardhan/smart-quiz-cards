import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizTimerProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
  isCompleted?: boolean;
}

export const QuizTimer = ({ duration, onTimeout, isActive, isCompleted }: QuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, isActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 text-lg font-semibold ${isCompleted ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150' : 'fixed top-4 right-4'} transition-all duration-500`}>
      <Timer className="w-6 h-6 animate-blink text-quiz-skip" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};