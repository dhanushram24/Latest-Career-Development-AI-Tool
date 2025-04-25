// src/components/StatsSummary.tsx
type SkillEntry = {
    id: number;
    Name: string;
    Domain: string;
    Category: string;
    'Sub Category': string;
    'Skill Rate': number;
    'Interest Rate': number;
  };
  
  type StatsSummaryProps = {
    skills: SkillEntry[];
    domains: { [key: string]: { [key: string]: SkillEntry[] } };
  };
  
  export default function StatsSummary({ skills, domains }: StatsSummaryProps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200 relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-blue-700 font-medium">Total Skills</p>
          <p className="text-4xl font-bold text-blue-600 mt-1">{skills.length}</p>
          <div className="mt-4 text-xs text-blue-600">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Across {Object.keys(domains).length} domains
            </span>
          </div>
        </div>
  
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200 relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-700" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p className="text-sm text-green-700 font-medium">Avg Skill Rating</p>
          <p className="text-4xl font-bold text-green-600 mt-1">
            {(skills.reduce((sum, skill) => sum + skill['Skill Rate'], 0) / skills.length).toFixed(1)}
          </p>
          <div className="mt-4 text-xs text-green-600">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
              Out of 5.0 maximum
            </span>
          </div>
        </div>
  
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200 relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-purple-700 font-medium">Avg Interest Rating</p>
          <p className="text-4xl font-bold text-purple-600 mt-1">
            {Math.round(skills.reduce((sum, skill) => sum + skill['Interest Rate'], 0) / skills.length * 20)}
          </p>
          <div className="mt-4 text-xs text-purple-600">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Based on self-assessment
            </span>
          </div>
        </div>
      </div>
    );
  }