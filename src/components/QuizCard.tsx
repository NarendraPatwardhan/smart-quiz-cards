import { cn } from "@/lib/utils";
import { useState } from "react";
import { Play, RotateCcw, CircleSlash } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  onUndo: () => void;
  className?: string;
  isAnswered?: boolean;
  isActive?: boolean;
  isSkipped?: boolean;
}

export const QuizCard = ({
  question,
  options,
  onSubmit,
  onSkip,
  onUndo,
  className,
  isAnswered = false,
  isActive = true,
}: QuizCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Simplified interaction check - we now rely solely on isActive
  const isInteractive = isActive;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto",
        // Increase transition duration to match stack animation
        "transition-all duration-500",
        // Remove conditional opacity since it's handled by parent
        className,
      )}
    >
      <h3 className="text-xl font-semibold mb-6">{question}</h3>
      <div className="space-y-4 mb-8">
        {options.map((option) => (
          <button
            key={option}
            onClick={() =>
              isInteractive && !isAnswered && setSelectedOption(option)
            }
            disabled={!isInteractive || isAnswered}
            className={cn(
              "w-full p-4 text-left rounded-lg border-2",
              "transition-all duration-300",
              // Improve visual feedback
              selectedOption === option
                ? "border-quiz-proceed bg-quiz-proceed/10"
                : "border-gray-200",
              isInteractive &&
                !isAnswered &&
                selectedOption !== option &&
                "hover:border-gray-300 hover:bg-gray-50",
              (!isInteractive || isAnswered) &&
                "opacity-50 cursor-not-allowed select-none",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-6">
        <button
          onClick={onUndo}
          // Only enable undo for active card
          disabled={!isInteractive}
          className={cn(
            "p-4 rounded-full bg-quiz-undo text-white",
            "transition-opacity duration-300",
            "hover:opacity-90 active:opacity-80",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={onSkip}
          // Disable skip if answered or not interactive
          disabled={!isInteractive || isAnswered}
          className={cn(
            "p-4 rounded-full bg-quiz-skip text-white",
            "transition-opacity duration-300",
            "hover:opacity-90 active:opacity-80",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <CircleSlash className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            selectedOption && isInteractive && onSubmit(selectedOption)
          }
          disabled={!selectedOption || !isInteractive || isAnswered}
          className={cn(
            "p-4 rounded-full bg-quiz-proceed text-white",
            "transition-opacity duration-300",
            "hover:opacity-90 active:opacity-80",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <Play className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

