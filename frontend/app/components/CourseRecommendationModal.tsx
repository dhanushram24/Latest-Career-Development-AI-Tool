// CourseRecommendationModal.tsx - Updated version
import { useEffect, useState } from 'react';

// Type definitions
type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
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
};

type CourseRecommendationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillEntry;
  recommendation?: CourseRecommendation[];
  isLoading: boolean;
};

export default function CourseRecommendationModal({ 
  isOpen, 
  onClose, 
  skill, 
  recommendation,
  isLoading 
}: CourseRecommendationModalProps) {
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [isUsingGemini, setIsUsingGemini] = useState<boolean>(false);

  useEffect(() => {
    // Only set courses when recommendations are available
    if (recommendation && recommendation.length > 0) {
      setCourses(recommendation);
      setIsUsingGemini(true);
    }
  }, [recommendation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg p-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              Recommended Courses for {skill['Sub Category']}
            </h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Skill Context */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              Your current <span className="font-medium text-blue-600">{skill['Sub Category']}</span> skill level is <span className="font-medium">{skill['Skill Rate']}/5</span> with an interest level of <span className="font-medium text-purple-600">{skill['Interest Rate']}/5</span>. Here are personalized recommendations to help you improve.
            </p>
            {isUsingGemini && (
              <p className="text-sm mt-2 text-gray-500">
                These recommendations are powered by Google&#39;s Gemini AI model.
              </p>
            )}
          </div>
          
          {/* Course Recommendations */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-700">Finding the perfect courses for you...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-6">
              {courses.map((course, index) => (
                <div 
                  key={index} 
                  className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                    index === 0 ? 'border-green-300 ring-1 ring-green-300' : 'border-gray-200'
                  }`}
                >
                  {index === 0 && (
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
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                        {course.level}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {course.features.map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-5 flex flex-wrap justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm ml-1">{course.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{course.duration}</span>
                      </div>
                      
                      <div className="mt-3 sm:mt-0">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors mr-2">
                          Enroll
                        </button>
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md text-sm transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-600">No course recommendations available at this time.</p>
              <p className="mt-2 text-gray-500 text-sm">Please try again later or try a different skill.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}