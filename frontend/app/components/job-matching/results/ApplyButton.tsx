import React from 'react';

interface ApplyButtonProps {
  overallMatch: number;
}

export default function ApplyButton({ overallMatch }: ApplyButtonProps) {
  const isEligible = overallMatch >= 60;
  
  return (
    <div className="mt-8 text-center">
      <button 
        className={`py-3 px-8 rounded-md text-white font-medium text-lg
          ${isEligible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} 
          transition-colors`}
        disabled={!isEligible}
      >
        {isEligible ? 'Apply for This Position' : 'Improve Skills to Apply'}
      </button>
      
      {!isEligible && (
        <p className="mt-2 text-sm text-gray-600">
          We recommend improving your skills before applying to increase your chances.
        </p>
      )}
    </div>
  );
}