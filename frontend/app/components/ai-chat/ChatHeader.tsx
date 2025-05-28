// components/ChatHeader.tsx
import React from 'react';
import { ChatSession } from './types';

interface ChatHeaderProps {
  currentSession: ChatSession | undefined;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ currentSession }) => {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-lg font-semibold text-gray-800">
            {currentSession?.title || 'AI Career Assistant'}
          </span>
        </div>
      </div>
    </div>
  );
};