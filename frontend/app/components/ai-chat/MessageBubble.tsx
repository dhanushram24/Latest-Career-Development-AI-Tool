// components/MessageBubble.tsx
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from './types';
import { EmployeeDataCard } from './EmployeeDataCard';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex items-start space-x-4 ${
        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        message.type === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {message.type === 'user' ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div className={`flex-1 max-w-5xl ${
        message.type === 'user' ? 'text-right' : ''
      }`}>
        <div className={`inline-block px-6 py-3 rounded-2xl ${
          message.type === 'user'
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        
        {/* Enhanced data display with visualizations */}
        {message.data && (
          <div className="mt-4">
            <EmployeeDataCard 
              data={message.data} 
              visualizations={message.visualizations}
            />
          </div>
        )}
        
        <div className={`text-xs text-gray-500 mt-2 ${
          message.type === 'user' ? 'text-right' : 'text-left'
        }`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};