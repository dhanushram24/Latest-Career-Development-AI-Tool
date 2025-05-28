// Main AIChatBot.tsx
import React, { useState } from 'react';
import { Message, ChatSession, AIChatBotProps } from './types';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { ChatInput } from './ChatInput';

export default function AIChatBot({ userRole, userEmail }: AIChatBotProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Career Assistant Chat',
      messages: [
        {
          id: '1',
          content: "Hello! I'm your AI Career Assistant. I can help you with employee skills analysis, find top performers, suggest upskilling opportunities, and answer questions about your team's capabilities. What would you like to know?",
          type: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }
  ]);
  
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const currentSession = chatSessions.find(session => session.id === currentSessionId);
  const currentMessages = currentSession?.messages || [];

  const simulateStreaming = (text: string, callback: (finalText: string) => void) => {
    let currentText = '';
    let index = 0;
    
    const streamInterval = setInterval(() => {
      if (index < text.length) {
        const charsToAdd = Math.random() > 0.8 ? 2 : 1;
        currentText += text.slice(index, index + charsToAdd);
        index += charsToAdd;
        setStreamingText(currentText);
      } else {
        clearInterval(streamInterval);
        setStreamingText('');
        callback(text);
      }
    }, 20 + Math.random() * 30);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          id: '1',
          content: "Hello! I'm your AI Career Assistant. I can help you with employee skills analysis, find top performers, suggest upskilling opportunities, and answer questions about your team's capabilities. What would you like to know?",
          type: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const updateSessionTitle = (sessionId: string, firstUserMessage: string) => {
    const title = firstUserMessage.length > 30 
      ? firstUserMessage.substring(0, 30) + '...' 
      : firstUserMessage;
    
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title } 
          : session
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      type: 'user',
      timestamp: new Date()
    };

    setChatSessions(prev => 
      prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );

    const userMessages = currentSession.messages.filter(msg => msg.type === 'user');
    if (userMessages.length === 0) {
      updateSessionTitle(currentSessionId, inputValue.trim());
    }

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          userRole: userRole,
          userEmail: userEmail
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data); // Debug log
      
      simulateStreaming(data.response, (finalText) => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: finalText,
          type: 'assistant',
          timestamp: new Date(),
          data: data.data,
          visualizations: data.visualizations // Include visualizations from backend
        };

        setChatSessions(prev => 
          prev.map(session => 
            session.id === currentSessionId 
              ? { ...session, messages: [...session.messages, assistantMessage] }
              : session
          )
        );
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please check if the backend server is running and try again.",
        type: 'assistant',
        timestamp: new Date()
      };
      
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteChat = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      if (sessionId === currentSessionId && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <div className="flex h-full bg-white">
      <ChatSidebar
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader currentSession={currentSession} />
        
        <MessagesList
          messages={currentMessages}
          streamingText={streamingText}
          isLoading={isLoading}
          onSuggestedQuestionClick={setInputValue}
        />

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}