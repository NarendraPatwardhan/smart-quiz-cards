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
  // Add action history to track what was done
  const [actionHistory, setActionHistory] = useState<
    Array<{
      type: "answer" | "skip";
      index: number;
      answerId?: number;
      answer?: string;
    }>
  >([]);

  const isQuestionAnswered = (index: number) => {
    return answers[questions[index].id] !== undefined;
  };

  // Rest of the existing helper functions remain the same...
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
      return cn(
        baseStyles,
        "-translate-x-[120%]",
        "opacity-50 pointer-events-none",
        `z-${40 - stackPosition}`,
        "-rotate-3",
        stackPosition > 0 && `translate-y-[${stackPosition * 8}px]`,
      );
    }

    return cn(
      baseStyles,
      "translate-x-0 opacity-0 pointer-events-none",
      `z-${30 - index}`,
    );
  };

  const handleSubmit = (answer: string) => {
    const currentQuestionId = questions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: answer }));

    // Add to action history
    setActionHistory((prev) => [
      ...prev,
      {
        type: "answer",
        index: currentIndex,
        answerId: currentQuestionId,
        answer,
      },
    ]);

    setSkippedQuestions((prev) =>
      prev.filter((index) => index !== currentIndex),
    );

    setTimeout(() => {
      // Rest of the submit logic remains the same...
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
    }, 500);
  };

  const handleSkip = () => {
    // Add to action history
    setActionHistory((prev) => [
      ...prev,
      { type: "skip", index: currentIndex },
    ]);

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
    }, 500);
  };

  const handleUndo = () => {
    // Get last action from history
    const lastAction = actionHistory[actionHistory.length - 1];

    if (!lastAction) return;

    // Remove the last action from history
    setActionHistory((prev) => prev.slice(0, -1));

    if (lastAction.type === "answer") {
      // Remove the answer
      const newAnswers = { ...answers };
      if (lastAction.answerId) {
        delete newAnswers[lastAction.answerId];
      }
      setAnswers(newAnswers);
    } else if (lastAction.type === "skip") {
      // Remove from skipped questions
      setSkippedQuestions((prev) =>
        prev.filter((index) => index !== lastAction.index),
      );
    }

    // Go back to the question that was last acted upon
    setCurrentIndex(lastAction.index);

    if (isReviewingSkipped) {
      setIsReviewingSkipped(false);
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

