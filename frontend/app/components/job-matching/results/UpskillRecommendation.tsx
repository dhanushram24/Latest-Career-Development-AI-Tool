import React, { useState } from 'react';
import { Skill } from '../types';
import CourseRecommendationModal from '../../CourseRecommendationModal';

interface UpskillRecommendationProps {
  weakSkills: Skill[];  // Skills with rating < 3
  missingSkills: Skill[]; // Skills user doesn't have at all
}

export default function UpskillRecommendation({ 
  weakSkills, 
  missingSkills 
}: UpskillRecommendationProps): React.ReactElement {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  // Combine all skills that need upskilling
  const allUpskillNeeds = [
    ...weakSkills.map(skill => ({
      ...skill,
      type: 'weak',
      priority: skill.required ? 'high' : 'medium'
    })),
    ...missingSkills.map(skill => ({
      ...skill,
      type: 'missing',
      priority: 'high'
    }))
  ];
  
  // Sort by priority (high first) and then by skill name
  const sortedUpskillNeeds = allUpskillNeeds.sort((a, b) => {
    if (a.priority === b.priority) {
      return a.name.localeCompare(b.name);
    }
    return a.priority === 'high' ? -1 : 1;
  });
  
  // Group skills by domain to make recommendations more organized
  const skillsByDomain = sortedUpskillNeeds.reduce((acc, skill) => {
    const domain = skill.domain || 'General';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(skill);
    return acc;
  }, {} as Record<string, typeof sortedUpskillNeeds>);
  
  // Handle skill selection for course recommendations
  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(selectedSkill && selectedSkill.name === skill.name ? null : skill);
  };

  return (
    <div className="mt-8 border border-orange-200 rounded-lg bg-orange-50 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-orange-700">Upskill Recommendations</h3>
          <p className="text-sm text-orange-600">
            Improve your job match score by focusing on these {sortedUpskillNeeds.length} skills
          </p>
        </div>
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-orange-600 hover:text-orange-800 underline text-sm flex items-center"
        >
          {showDetail ? 'Hide Details' : 'Show Details'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${showDetail ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Summary section - always visible */}
      <div className="flex flex-wrap gap-2 mb-4">
        {weakSkills.length > 0 && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {weakSkills.length} Weak Skills (Rating &lt; 3)
          </div>
        )}
        {missingSkills.length > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {missingSkills.length} Missing Skills
          </div>
        )}
      </div>
      
      {/* Upskill recommendations by domain - visible when expanded */}
      {showDetail && (
        <div className="mt-4 space-y-6 animate-fadeIn">
          {Object.entries(skillsByDomain).map(([domain, skills]) => (
            <div key={domain} className="border-b border-orange-200 pb-4 last:border-b-0">
              <h4 className="font-semibold text-orange-800 mb-2">{domain}</h4>
              <ul className="space-y-3">
                {skills.map((skill, index) => (
                  <li key={index}>
                    <div className="flex items-start">
                      <span className={`flex-shrink-0 rounded-full h-5 w-5 flex items-center justify-center mt-0.5 mr-2 ${
                        skill.type === 'missing' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                      }`}>
                        {skill.type === 'missing' ? '!' : '↑'}
                      </span>
                      <div className="w-full">
                        <div className="flex justify-between items-center w-full">
                          <p className="font-medium text-gray-800">{skill.name}</p>
                          <button 
                            onClick={() => handleSkillSelect(skill)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {selectedSkill && selectedSkill.name === skill.name ? 'Hide Courses' : 'View Courses'}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-3 w-3 ml-1 transition-transform ${selectedSkill && selectedSkill.name === skill.name ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {skill.category}
                          </span>
                          {skill.type === 'weak' && (
                            <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded text-yellow-700">
                              Current Rating: {skill.userRating}/5
                            </span>
                          )}
                          {skill.priority === 'high' && (
                            <span className="text-xs bg-orange-100 px-2 py-0.5 rounded text-orange-700">
                              High Priority
                            </span>
                          )}
                        </div>
                        
                        {/* Personalized learning recommendations */}
                        <p className="text-xs text-gray-600 mt-1">
                          {skill.type === 'missing' 
                            ? `Consider learning ${skill.name.toLowerCase()} to improve job match.` 
                            : `Improve your ${skill.name.toLowerCase()} skills to reach at least rating 3.`
                          }
                        </p>
                        
                        {/* Course recommendations for the selected skill */}
                        {selectedSkill && selectedSkill.name === skill.name && (
                          <div className="mt-3 ml-1 border-l-2 border-blue-200 pl-3">
                            <CourseRecommendationModal skill={skill} />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Learning resources section */}
          <div className="mt-6 bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Learning Resources</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>Internal Learning Portal: <a href="#" className="text-blue-600 hover:underline">learning.company.com</a></span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Request training from your manager through the T&D portal</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Join relevant Slack channels: #learning, #upskilling, #mentorship</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Apply/Save button */}
      <div className="mt-6 flex justify-center">
        <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Create Upskilling Plan
        </button>
      </div>
    </div>
  );
}