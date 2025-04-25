// src/components/TabNavigation.tsx
import { Link } from 'react-router-dom';

type TabNavigationProps = {
  employeeId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function TabNavigation({ employeeId, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex mb-8 bg-white rounded-lg shadow p-1 flex-wrap">
      <Link
        to={`/employee/${employeeId}/skills`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange('skills');
        }}
        className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition duration-200 ${
          activeTab === 'skills' 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Skill Matrix
        </div>
      </Link>
      <Link
        to={`/employee/${employeeId}/top-skills`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange('top-skills');
        }}
        className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition duration-200 ${
          activeTab === 'top-skills' 
            ? 'bg-green-600 text-white shadow-lg' 
            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
        }`}
      >
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          Top Skills
        </div>
      </Link>
      <Link
        to={`/employee/${employeeId}/improvement-areas`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange('improvement-areas');
        }}
        className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition duration-200 ${
          activeTab === 'improvement-areas' 
            ? 'bg-amber-600 text-white shadow-lg' 
            : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
        }`}
      >
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
          </svg>
          Improvement Areas
        </div>
      </Link>
      <Link
        to={`/employee/${employeeId}/development`}
        onClick={(e) => {
          e.preventDefault();
          onTabChange('development');
        }}
        className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition duration-200 ${
          activeTab === 'development' 
            ? 'bg-purple-600 text-white shadow-lg' 
            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
        }`}
      >
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          MentorshipAndCourses
        </div>
      </Link>
    </div>
  );
}