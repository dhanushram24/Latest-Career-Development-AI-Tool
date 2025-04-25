import { useState, useEffect } from 'react';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type Course = {
  title: string;
  platform: string;
  description: string;
};

type CourseRecommendationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillEntry;
  recommendation?: string;
};

// Retry function for API calls
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // If response is not ok, wait before retry
      const errorText = await response.text();
      lastError = new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, etc.
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying API call, attempt ${attempt + 2}/${maxRetries}`);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Wait before retrying on network errors
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying API call after network error, attempt ${attempt + 2}/${maxRetries}`);
      }
    }
  }
  
  throw lastError || new Error('Failed after multiple retry attempts');
};

// Generate fallback course recommendations
const generateFallbackRecommendations = (skill: SkillEntry): Course[] => {
  const domain = skill.Domain.toLowerCase();
  
  // Basic courses by domain
  if (domain.includes('engineering') || domain.includes('development')) {
    return [
      {
        title: `${skill['Sub Category']} Fundamentals`,
        platform: "Coursera",
        description: `A comprehensive introduction to ${skill['Sub Category']} for software professionals.`
      },
      {
        title: `Advanced ${skill['Sub Category']}`,
        platform: "Udemy",
        description: `Deepen your knowledge of ${skill['Sub Category']} with practical examples.`
      }
    ];
  } else if (domain.includes('data') || domain.includes('analytics')) {
    return [
      {
        title: `Data Analysis with ${skill['Sub Category']}`,
        platform: "edX",
        description: `Learn how to leverage ${skill['Sub Category']} for effective data analysis.`
      },
      {
        title: `${skill['Sub Category']} for Data Science`,
        platform: "Coursera",
        description: `Apply ${skill['Sub Category']} techniques to data science problems.`
      }
    ];
  } else if (domain.includes('design') || domain.includes('ux') || domain.includes('ui')) {
    return [
      {
        title: `${skill['Sub Category']} in Modern Design`,
        platform: "LinkedIn Learning",
        description: `Master ${skill['Sub Category']} techniques for better design outcomes.`
      },
      {
        title: `${skill['Sub Category']} Workshop`,
        platform: "Udemy",
        description: `Hands-on projects to improve your ${skill['Sub Category']} skills.`
      }
    ];
  } else {
    return [
      {
        title: `${skill['Sub Category']} Essentials`,
        platform: "Coursera",
        description: `Core principles and practices of ${skill['Sub Category']}.`
      },
      {
        title: `${skill['Sub Category']}: From Beginner to Pro`,
        platform: "Udemy",
        description: `Comprehensive training in ${skill['Sub Category']}.`
      }
    ];
  }
};

export const generateCourseRecommendation = (skill: SkillEntry): string => {
  return `Learning "${skill['Sub Category']}" will enhance your expertise in ${skill.Domain}.`;
};

export default function CourseRecommendationModal({
  isOpen,
  onClose,
  skill,
  recommendation,
}: CourseRecommendationModalProps) {
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchAIRecommendation();
    } else {
      // Reset state when modal closes
      setAiRecommendation(null);
      setError(null);
      setRetryCount(0);
    }
  }, [isOpen, skill]);

  const fetchAIRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the retry mechanism for better reliability
      const response = await fetchWithRetry(
        'http://localhost:8000/recommend/courses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeName: skill.Name,
            skills: [{
              id: skill.id,
              Name: skill.Name,
              Domain: skill.Domain,
              Category: skill.Category,
              Sub_Category: skill['Sub Category'],
              Skill_Rate: skill['Skill Rate'],
              Interest_Rate: skill['Interest Rate']
            }]
          }),
        }
      );

      const data = await response.json();
      
      // Validate response structure
      if (!data || !data.courses || !Array.isArray(data.courses)) {
        console.error('Invalid API response format:', data);
        throw new Error('Received invalid response format from API');
      }
      
      setAiRecommendation(data.courses);
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      
      // Set error message but also provide fallback recommendations
      setError(`We couldn't reach our recommendation service. Showing general recommendations for ${skill['Sub Category']}.`);
      
      // Generate fallback recommendations based on the skill domain
      const fallbackCourses = generateFallbackRecommendations(skill);
      setAiRecommendation(fallbackCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    fetchAIRecommendation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            Skill Development: {skill['Sub Category']}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Skill Context */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Skill Level</p>
                <div className="flex items-center mt-1">
                  <div className="bg-gray-200 h-2 w-24 rounded-full">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${skill['Skill Rate'] * 20}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {skill['Skill Rate']}/5
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Interest Level</p>
                <div className="flex items-center mt-1">
                  <div className="bg-gray-200 h-2 w-24 rounded-full">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${skill['Interest Rate'] * 20}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {skill['Interest Rate']}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Domain Context */}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Domain</h4>
            <p className="text-gray-800">{skill.Domain} / {skill.Category}</p>
          </div>
          
          {/* Manual Recommendation */}
          {recommendation && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Development Path</h4>
              <p className="text-gray-800">{recommendation}</p>
            </div>
          )}
          
          {/* AI Generated Recommendations */}
          <div>
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Recommended Courses</h4>
              {error && retryCount < 2 && (
                <button 
                  onClick={handleRetry}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              )}
            </div>
            
            {loading && (
              <div className="py-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md mt-2 text-sm">
                {error}
              </div>
            )}
            
            {!loading && aiRecommendation && (
              <div className="space-y-3 mt-3">
                {aiRecommendation.map((course, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{course.title}</h5>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mt-1">
                          {course.platform}
                        </span>
                      </div>
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        Enroll
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}