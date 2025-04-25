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

type MentorshipProps = {
  skills: SkillEntry[];
  employeeName: string;
};

type Mentor = {
  name: string;
  title: string;
  domains: string[];
  skill_level: number;
  compatibility: number;
};

type Course = {
  title: string;
  platform: string;
  description: string;
};

export default function MentorshipAndCourses({ skills, employeeName }: MentorshipProps) {
  const [recommendation, setRecommendation] = useState<{ bio: string; courses: Course[] } | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch mentors on component mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Convert skills to the format expected by the backend
        const employeeDomains = Array.from(new Set(skills.map(s => s.Domain)));
        const employeeSkills: Record<string, number> = {};
        
        skills.forEach(skill => {
          employeeSkills[skill['Sub Category']] = skill['Skill Rate'];
        });

        const response = await fetch('http://localhost:8000/recommend/mentors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeName,
            employeeDomains,
            employeeSkills
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch mentor recommendations');
        }

        const data = await response.json();
        setMentors(data.mentors);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        // Don't show error to user - just fall back to the default mentor
      }
    };

    if (skills.length > 0) {
      fetchMentors();
    }
  }, [skills, employeeName]);

  const handleCourseRecommendation = async () => {
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      // Transform skill data to format expected by backend
      const transformedSkills = skills.map(skill => ({
        id: skill.id,
        Name: skill.Name,
        Domain: skill.Domain,
        Category: skill.Category,
        Sub_Category: skill['Sub Category'],
        Skill_Rate: skill['Skill Rate'],
        Interest_Rate: skill['Interest Rate']
      }));

      // Call the backend API
      const response = await fetch('http://localhost:8000/recommend/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          skills: transformedSkills
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get course recommendations');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to retrieve recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <h3 className="bg-gradient-to-r from-indigo-100 to-blue-50 px-6 py-4 font-semibold text-lg text-gray-800 border-b border-gray-200">
        Mentorship & Learning Opportunities
      </h3>
      <div className="p-6 space-y-6">
        
        {/* Top Mentors Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 text-lg">Suggested Mentors</h4>
          
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mentors.map((mentor, index) => (
                <div 
                  key={index}
                  className={`${index === 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} border rounded-lg p-4`}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium text-gray-900">{mentor.name}</h5>
                      <p className="text-sm text-gray-600">{mentor.title}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="mb-1"><span className="font-medium">Expertise:</span> {mentor.domains.join(', ')}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs font-medium text-gray-500">Match Score:</span>
                      <div className="ml-2 bg-gray-200 rounded-full h-2 w-full">
                        <div 
                          className={`h-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(100, mentor.compatibility * 20)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h4 className="font-medium text-blue-800 mb-3">Suggested Mentor</h4>
              <p className="text-gray-700 text-sm">
                Based on domain and skill overlap, <strong>Ravi Kumar</strong> (Principal Engineer) could be a great mentor for {employeeName}.
              </p>
            </div>
          )}
        </div>

        {/* Recommend Courses Button */}
        <div className="text-center py-4">
          <button
            onClick={handleCourseRecommendation}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Recommend Courses'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Recommendation Output */}
        {recommendation && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow space-y-4">
            <div>
              <h5 className="text-md font-semibold text-gray-800 mb-2">Professional Bio</h5>
              <p className="text-gray-700">{recommendation.bio}</p>
            </div>
            
            <div>
              <h5 className="text-md font-semibold text-gray-800 mb-3">Recommended Courses</h5>
              <div className="space-y-3">
                {recommendation.courses.map((course, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h6 className="font-medium text-gray-900">{course.title}</h6>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                          {course.platform}
                        </span>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800">Enroll</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}