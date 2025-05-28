import React from 'react';
import { getJobCompatibilityStatus } from '@/app/lib/helpers';

interface MatchScoreProps {
  overallMatch: number;
}

// This type represents what we expect getJobCompatibilityStatus to return
interface CompatibilityStatus {
  status: string;
  color: string;
}

export default function MatchScore({ overallMatch }: MatchScoreProps): React.ReactElement {
  const compatibilityStatus = getJobCompatibilityStatus(overallMatch) as CompatibilityStatus;
  
  return (
    <div className="text-xl font-semibold text-black mb-8">
      <div className="flex items-center justify-between text-xl font-semibold text-black mb-4">
        <h3 className="text-xl font-semibold">Your Match Score</h3>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl font-bold ${compatibilityStatus?.color}`}>
            {overallMatch}%
          </div>
          <span className={`text-sm font-medium ${compatibilityStatus?.color}`}>
            {compatibilityStatus?.status}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            overallMatch >= 80 ? 'bg-green-500' : 
            overallMatch >= 60 ? 'bg-blue-500' : 
            overallMatch >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${overallMatch}%` }}
        ></div>
      </div>
    </div>
  );
}