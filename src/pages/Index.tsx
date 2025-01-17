import { QuizStack } from "@/components/QuizStack";
import { QuizTimer } from "@/components/QuizTimer";
import { useState } from "react";
import { toast } from "sonner";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
  },
  {
    id: 3,
    question: "What is the largest mammal?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "White Rhinoceros"],
  },
];

const Index = () => {
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTimeout = () => {
    setIsActive(false);
    setIsCompleted(true);
    toast.error("Time's up! Quiz ended.");
  };

  const handleComplete = (answers: Record<number, string>) => {
    setIsActive(false);
    setIsCompleted(true);
    toast.success("Quiz completed! All questions answered successfully!");
    console.log("Answers:", answers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <QuizTimer 
        duration={300} 
        onTimeout={handleTimeout} 
        isActive={isActive} 
        isCompleted={isCompleted} 
      />
      <div className="pt-16">
        <QuizStack questions={QUIZ_QUESTIONS} onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default Index;