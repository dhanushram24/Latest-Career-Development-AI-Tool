// src/components/SkillRenderer.tsx

export const convertToPercentage = (rating: number) => Math.round((rating / 5) * 100);

export const renderSkillLevel = (level: number) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={`text-lg ${i < level ? 'text-yellow-500' : 'text-gray-300'}`}>
        ★
      </span>
    );
  }
  return <div className="flex space-x-1">{stars}</div>;
};

export const renderInterestLevel = (level: number) => {
  // Convert to percentage (0-100)
  const percentage = convertToPercentage(level);
  
  return (
    <div className="flex items-center space-x-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-red-500 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-700">{percentage}%</span>
    </div>
  );
};