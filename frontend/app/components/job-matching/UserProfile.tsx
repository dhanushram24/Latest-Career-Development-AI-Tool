import React from 'react';
import { Mail } from 'lucide-react';

interface UserProfileProps {
  userName: string;
  userEmail: string;
  skillCount: number;
}

export default function UserProfile({ 
  userName, 
  userEmail, 
}: UserProfileProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-5">
        <div className="bg-blue-100 rounded-full p-4 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
          <div className="flex items-center text-gray-600 mt-1">
            <Mail size={16} className="mr-2" />
            <span>{userEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}