// src/components/SkillMatrix.tsx
import { renderSkillLevel, renderInterestLevel } from './SkillRenderer';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type SkillMatrixProps = {
  domains: { [key: string]: { [key: string]: SkillEntry[] } };
  handleRecommendCourse: (skill: SkillEntry) => void;
};

export default function SkillMatrix({ domains, handleRecommendCourse }: SkillMatrixProps) {
  return (
    <div className="space-y-8">
      {Object.keys(domains).map(domain => (
        <div key={domain} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
          <h3 className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 font-semibold text-lg text-gray-800 border-b border-gray-200">
            {domain}
          </h3>
          
          <div className="divide-y divide-gray-200">
            {Object.keys(domains[domain]).map(category => (
              <div key={category} className="p-6">
                <h4 className="font-medium text-blue-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {category}
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {domains[domain][category].map(skill => (
                    <div key={skill.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-start">
                        <div className="w-3/4">
                          <h5 className="font-medium text-gray-800 mb-3">{skill['Sub Category']}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skill Level</p>
                              {renderSkillLevel(skill['Skill Rate'])}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest Level</p>
                              {renderInterestLevel(skill['Interest Rate'])}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRecommendCourse(skill)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition shadow-sm hover:shadow flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          Recommend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}