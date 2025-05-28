//components/STAButton.tsx
import React from 'react';

interface STAButtonProps {
  skillName?: string;
  onClick: () => void;
  disabled?: boolean;
}

const STAButton: React.FC<STAButtonProps> = ({ 
  skillName, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full px-4 py-2 mt-2 mb-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center"
    >
      <span className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
          />
        </svg>
        STA (Short Term Assignments)
        {skillName && ` for ${skillName}`}
      </span>
    </button>
  );
};

export default STAButton;