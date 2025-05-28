// components/StreamingMessage.tsx
import React from 'react';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  text: string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ text }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
        <Bot size={18} />
      </div>
      <div className="flex-1 max-w-4xl">
        <div className="inline-block px-6 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-md">
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {text}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      </div>
    </div>
  );
};
