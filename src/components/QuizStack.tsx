import { useState } from "react";
import { QuizCard } from "./QuizCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizStackProps {
  questions: Question[];
  onComplete: (answers: Record<number, string>) => void;
}

export const QuizStack = ({ questions, onComplete }: QuizStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [isReviewingSkipped, setIsReviewingSkipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const isQuestionAnswered = (index: number) => {
    return answers[questions[index].id] !== undefined;
  };

  // Get the relative position in the stack for answered/skipped cards
  const getStackPosition = (index: number) => {
    if (isQuestionAnswered(index)) {
      const answeredBeforeThis = questions
        .slice(0, index)
        .filter((_, i) => isQuestionAnswered(i)).length;
      return answeredBeforeThis;
    } else if (skippedQuestions.includes(index)) {
      const skippedBeforeThis = skippedQuestions.filter(
        (i) => i < index,
      ).length;
      return skippedBeforeThis;
    }
    return 0;
  };

  const getCardStyle = (index: number) => {
    const stackPosition = getStackPosition(index);
    const baseStyles =
      "absolute top-0 left-0 right-0 transition-all duration-500";

    if (isCompleted) {
      return cn(baseStyles, "opacity-0 pointer-events-none");
    }

    if (index === currentIndex) {
      return cn(baseStyles, "translate-x-0 opacity-100 z-50");
    }

    if (isQuestionAnswered(index)) {
      // Answered cards stack to the right with slight offset
      return cn(
        baseStyles,
        "translate-x-[120%]",
        "opacity-50 pointer-events-none",
        `z-${40 - stackPosition}`,
        "rotate-3",
        stackPosition > 0 && `translate-y-[${stackPosition * 8}px]`,
      );
    }

    if (skippedQuestions.includes(index)) {
      // Skipped cards stack to the left with slight offset
      return cn(
        baseStyles,
        "-translate-x-[120%]",
        "opacity-50 pointer-events-none",
        `z-${40 - stackPosition}`,
        "-rotate-3",
        stackPosition > 0 && `translate-y-[${stackPosition * 8}px]`,
      );
    }

    // Future cards are hidden behind the current card
    return cn(
      baseStyles,
      "translate-x-0 opacity-0 pointer-events-none",
      `z-${30 - index}`,
    );
  };

  const handleSubmit = (answer: string) => {
    const currentQuestionId = questions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: answer }));

    setSkippedQuestions((prev) =>
      prev.filter((index) => index !== currentIndex),
    );

    setTimeout(() => {
      // Check if all questions are answered after this submission
      const nextAnswers = { ...answers, [currentQuestionId]: answer };
      const allAnswered = questions.every(
        (_, index) =>
          index === currentIndex ||
          nextAnswers[questions[index].id] !== undefined,
      );

      if (allAnswered) {
        setIsCompleted(true);
        onComplete(nextAnswers);
        toast.success("All questions answered successfully!");
        return;
      }

      if (isReviewingSkipped) {
        const remainingSkipped = skippedQuestions.filter(
          (index) => index !== currentIndex && !isQuestionAnswered(index),
        );

        if (remainingSkipped.length > 0) {
          setCurrentIndex(remainingSkipped[0]);
        } else {
          setIsReviewingSkipped(false);
          const nextUnanswered = questions.findIndex(
            (_, index) =>
              !isQuestionAnswered(index) && !skippedQuestions.includes(index),
          );
          if (nextUnanswered !== -1) {
            setCurrentIndex(nextUnanswered);
          }
        }
      } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex === questions.length) {
          const unansweredSkipped = skippedQuestions.filter(
            (index) => !isQuestionAnswered(index),
          );
          if (unansweredSkipped.length > 0) {
            setIsReviewingSkipped(true);
            setCurrentIndex(unansweredSkipped[0]);
            toast.info("Reviewing skipped questions...");
          }
        } else {
          setCurrentIndex(nextIndex);
        }
      }
    }, 500); // Allow time for animation
  };

  const handleSkip = () => {
    if (!skippedQuestions.includes(currentIndex)) {
      setSkippedQuestions((prev) => [...prev, currentIndex]);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex === questions.length) {
        const unansweredSkipped = skippedQuestions.filter(
          (index) => !isQuestionAnswered(index),
        );
        if (unansweredSkipped.length > 0) {
          setIsReviewingSkipped(true);
          setCurrentIndex(unansweredSkipped[0]);
          toast.info("Reviewing skipped questions...");
        }
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 500); // Allow time for animation
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevQuestionId = questions[prevIndex].id;

      const newAnswers = { ...answers };
      delete newAnswers[prevQuestionId];
      setAnswers(newAnswers);

      setSkippedQuestions((prev) =>
        prev.filter((index) => index !== prevIndex),
      );

      if (isReviewingSkipped) {
        setIsReviewingSkipped(false);
      }

      setCurrentIndex(prevIndex);
    }
  };

  return (
    <div className="relative w-full max-w-[300px] mx-auto h-[600px] perspective-1000">
      <div className="relative w-full h-full">
        {questions.map((question, index) => (
          <QuizCard
            key={question.id}
            question={question.question}
            options={question.options}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onUndo={handleUndo}
            isAnswered={isQuestionAnswered(index)}
            isActive={!isCompleted && index === currentIndex}
            isSkipped={skippedQuestions.includes(index)}
            className={getCardStyle(index)}
          />
        ))}
      </div>
    </div>
  );
};

