// components/CourseRecommendationModal.tsx
import { useEffect, useState } from 'react';
import { Badge } from "../components/ui/badge";

// Type definitions
type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
  Email?: string;
  improvementScore?: number;
  gap?: number;
};

type CourseRecommendation = {
  title: string;
  provider: string;
  description: string;
  level: string;
  duration: string;
  rating: number;
  features: string[];
  matchScore: number;
  url?: string;
};

interface CourseRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillEntry;
  recommendation: CourseRecommendation[] | undefined;
  isLoading: boolean;
  aiProvider?: string;
}

export default function CourseRecommendationModal({
  isOpen,
  onClose,
  skill,
  recommendation = [],
  isLoading,
  aiProvider = "AI"
}: CourseRecommendationModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  
  useEffect(() => {
    if (recommendation && recommendation.length > 0) {
      const sortedCourses = [...recommendation].sort((a, b) => b.matchScore - a.matchScore);
      setCourses(sortedCourses);
    } else {
      setCourses([]);
    }
  }, [recommendation]);
  
  // Filter courses based on active tab
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    const level = course.level.toLowerCase();
    return level.includes(activeTab);
  });

  if (!isOpen) return null;

  // Function to determine badge color based on match score
  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Recommended Courses for {skill['Sub Category']}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Skill context info */}
        <div className="px-6 pt-5 pb-2">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1">
                <p className="text-gray-700">
                  Your current <span className="font-medium text-blue-600">{skill['Sub Category']}</span> skill level is <span className="font-medium">{skill['Skill Rate']}/5</span> with an interest level of <span className="font-medium text-purple-600">{skill['Interest Rate']}/5</span>.
                </p>
                {skill.gap !== undefined && (
                  <p className="text-sm mt-1 text-gray-600">
                    Improvement opportunity: <span className="font-medium">{skill.gap.toFixed(1)} points</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{aiProvider} Powered</span>
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for filtering */}
        {!isLoading && courses.length > 0 && (
          <div className="px-6 pt-2 pb-0">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'all' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Courses
              </button>
              <button 
                onClick={() => setActiveTab('beginner')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'beginner' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Beginner
              </button>
              <button 
                onClick={() => setActiveTab('intermediate')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'intermediate' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Intermediate
              </button>
              <button 
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'advanced' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
        )}
        
        {/* Content area with scrollable container */}
        <div className="flex-1 overflow-auto p-6 pt-3">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-700">Finding the best courses for you...</p>
              <p className="mt-1 text-sm text-gray-500">This may take a moment as we personalize recommendations</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="space-y-6">
              {filteredCourses.map((course, index) => (
                <div 
                  key={index} 
                  className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    index === 0 && activeTab === 'all' ? 'border-green-300 ring-1 ring-green-300' : 'border-gray-200'
                  }`}
                >
                  {index === 0 && activeTab === 'all' && (
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1">
                      TOP RECOMMENDATION
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{course.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">by {course.provider}</p>
                      </div>
                      <Badge className={getMatchScoreColor(course.matchScore)}>
                        {course.matchScore}% Match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mt-3">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="outline" className="bg-gray-50">{course.level}</Badge>
                      <Badge variant="outline" className="bg-gray-50">{course.duration}</Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {course.rating}/5
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-gray-700">Key Features:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-5 flex flex-wrap justify-end items-center gap-2">
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md text-sm transition-colors">
                        Learn More
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">No courses found</h3>
              <p className="mt-2 text-gray-500">
                {activeTab !== 'all' 
                  ? `No ${activeTab} level courses are available for this skill.` 
                  : "No course recommendations available at this time."}
              </p>
              <button 
                onClick={() => setActiveTab('all')} 
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {activeTab !== 'all' ? 'Show all courses' : 'Try a different skill'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}