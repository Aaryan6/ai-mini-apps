"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  score: number;
  showResults: boolean;
  selectedAnswer: number | null;
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    score: 0,
    showResults: false,
    selectedAnswer: null,
  });

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/internet-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.theverge.com/2025/1/9/24339817/vlc-player-automatic-ai-subtitling-translation",
        }),
      });

      const data = await response.json();

      console.log({ data });
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid quiz data received");
      }

      setQuizState({
        questions: data.questions,
        currentQuestion: 0,
        score: 0,
        showResults: false,
        selectedAnswer: null,
      });
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizState.questions[quizState.currentQuestion]) return;

    const currentQuestion = quizState.questions[quizState.currentQuestion];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));

    setTimeout(() => {
      if (quizState.currentQuestion < quizState.questions.length - 1) {
        setQuizState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          selectedAnswer: null,
        }));
      } else {
        setQuizState((prev) => ({
          ...prev,
          showResults: true,
        }));
      }
    }, 1000);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-muted/30 bg-muted">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => {
              setError(null);
              handleStartQuiz();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-muted/30 bg-muted">
      {quizState.questions.length === 0 ? (
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleStartQuiz}
          disabled={loading}
        >
          {loading ? "Generating Quiz..." : "Start Daily News Quiz"}
        </button>
      ) : quizState.showResults ? (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="text-xl">
            Your Score: {quizState.score} / {quizState.questions.length}
          </p>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleStartQuiz}
          >
            Try Another Quiz
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Question {quizState.currentQuestion + 1} of{" "}
              {quizState.questions.length}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">
              {quizState.questions[quizState.currentQuestion]?.question}
            </h2>

            <div className="space-y-3">
              {quizState.questions[quizState.currentQuestion]?.options.map(
                (option, index) => (
                  <button
                    key={index}
                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                      quizState.selectedAnswer === index
                        ? index ===
                          quizState.questions[quizState.currentQuestion]
                            .correctAnswer
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900"
                        : "bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={quizState.selectedAnswer !== null}
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
