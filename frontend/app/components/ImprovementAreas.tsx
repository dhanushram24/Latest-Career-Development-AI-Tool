// src/components/ImprovementAreas.tsx
import { convertToPercentage } from './SkillRenderer';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
  improvementScore?: number; // Added from our calculation
  gap?: number; // Added from our calculation
};

type ImprovementAreasProps = {
  improvementAreas: SkillEntry[];
  employeeName: string;
  handleRecommendCourse: (skill: SkillEntry) => void;
};

export default function ImprovementAreas({ 
  improvementAreas, 
  employeeName, 
  handleRecommendCourse 
}: ImprovementAreasProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <h3 className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 font-semibold text-lg text-gray-800 border-b border-gray-200">
        Top Improvement Opportunities
      </h3>
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          These skills have been prioritized based on {employeeName}&#39;s high interest levels combined with skill improvement potential.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {improvementAreas.map(skill => {
            const skillPercent = convertToPercentage(skill['Skill Rate']);
            const interestPercent = convertToPercentage(skill['Interest Rate']);
            const gap = interestPercent - skillPercent;
            
            return (
              <div key={skill.id} className="bg-amber-50 border border-amber-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-800">{skill['Sub Category']}</h4>
                    <p className="text-sm text-gray-600 mt-1">{skill.Domain} &bull; {skill.Category}</p>
                  </div>
                  {gap > 0 && (
                    <div className="bg-amber-200 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      +{gap}% potential
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Current Skill</p>
                    <span className="text-sm font-medium text-gray-700">{skillPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${skillPercent}%` }}></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Interest Level</p>
                    <span className="text-sm font-medium text-gray-700">{interestPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${interestPercent}%` }}></div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRecommendCourse(skill)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 px-4 rounded-lg transition shadow-sm hover:shadow flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Find Learning Resources
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-amber-50 inline-block py-3 px-4 rounded-lg">
            <p className="text-amber-800 text-sm">
              These recommendations are based on {employeeName}&#39;s self-reported interest and current skill levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}