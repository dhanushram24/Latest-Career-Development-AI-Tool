// components/MessagesList.tsx
import React, { useRef, useEffect } from 'react';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';

interface MessagesListProps {
  messages: Message[];
  streamingText: string;
  isLoading: boolean;
  onSuggestedQuestionClick: (question: string) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  streamingText,
  isLoading,
  onSuggestedQuestionClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const suggestedQuestions = [
    "Show me top performers in our team",
    "Who needs upskilling in Power BI?",
    "Find employees with Power BI skills",
    "List employees by domain",
    "Show improvement opportunities"
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming message */}
      {streamingText && <StreamingMessage text={streamingText} />}

      {/* Loading indicator */}
      {isLoading && !streamingText && <LoadingIndicator />}

      {/* Suggested questions (only show when minimal conversation) */}
      {messages.length === 1 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onQuestionClick={onSuggestedQuestionClick}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};