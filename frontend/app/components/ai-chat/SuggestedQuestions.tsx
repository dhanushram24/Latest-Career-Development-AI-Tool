// components/SuggestedQuestions.tsx
import React from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionClick
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">Try asking:</p>
      <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
