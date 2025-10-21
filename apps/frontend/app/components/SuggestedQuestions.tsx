'use client';

import { Lightbulb } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  isLoading?: boolean;
}

export const SuggestedQuestions = ({
  questions,
  onQuestionClick,
  isLoading = false
}: SuggestedQuestionsProps) => {
  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 text-zinc-400 mb-4">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Generating suggestions...</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-64 bg-zinc-800/50 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        <Lightbulb className="w-4 h-4" />
        <span className="text-sm font-medium">Related Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="px-4 py-2.5 rounded-full border border-zinc-700 hover:border-cyan-500 hover:bg-cyan-500/10 text-sm text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer text-left"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
