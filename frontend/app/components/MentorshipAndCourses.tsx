import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import CourseRecommendationModal from './CourseRecommendationModal';
import { getCourseRecommendations } from '../services/apiService';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type MentorMatch = {
  name: string;
  skillName: string;
  domain: string;
  category: string;
  mentorSkillRate: number;
  matchScore: number;
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

type TopCourseRecommendation = CourseRecommendation & {
  skillName: string;
  domain: string;
  category: string;
  skillRate: number;
  interestRate: number;
};

export const MentorshipAndCourses = () => {
  const [employeeSkills, setEmployeeSkills] = useState<SkillEntry[]>([]);
  const [allEmployees, setAllEmployees] = useState<SkillEntry[]>([]);
  const [mentorRecommendations, setMentorRecommendations] = useState<MentorMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillEntry | null>(null);
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [weakSkills, setWeakSkills] = useState<SkillEntry[]>([]);
  const [topCourseRecommendations, setTopCourseRecommendations] = useState<TopCourseRecommendation[]>([]);
  const [isLoadingTopCourses, setIsLoadingTopCourses] = useState<boolean>(false);
  
  const { employeeId } = useParams<{ employeeId: string }>();
  const employeeName = decodeURIComponent(employeeId || '');
  
  // Fetch employee data and all other employees for mentor matching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: empData, error: empError } = await supabase
          .from('dhanush')
          .select('*')
          .eq('Name', employeeName);
          
        if (empError) {
          throw new Error(`Could not fetch employee data: ${empError.message}`);
        }
        
        if (!empData || empData.length === 0) {
          throw new Error('Employee not found');
        }
        
        // Sort employee skills by Skill Rate (ascending) and Interest Rate (descending)
        const sortedSkills = [...empData].sort((a, b) => {
          // First sort by Skill Rate (ascending)
          if (a['Skill Rate'] !== b['Skill Rate']) {
            return a['Skill Rate'] - b['Skill Rate'];
          }
          // If Skill Rate is the same, sort by Interest Rate (descending)
          return b['Interest Rate'] - a['Interest Rate'];
        });
        
        setEmployeeSkills(sortedSkills);
        
        // Identify weak skills that need improvement (skill rate <= 3)
        const identifiedWeakSkills = findWeakSkills(sortedSkills, 3);
        setWeakSkills(identifiedWeakSkills);
        
        // Fetch all employees for mentor matching
        const { data: allData, error: allError } = await supabase
          .from('dhanush')
          .select('*');
          
        if (allError) {
          throw new Error(`Could not fetch all employees: ${allError.message}`);
        }
        
        setAllEmployees(allData);
        
        // Once we have both sets of data, find mentor matches
        if (sortedSkills && allData) {
          const mentors = findTopMentors(sortedSkills, allData, employeeName);
          setMentorRecommendations(mentors);
          
          // Fetch top 3 course recommendations for the weakest skills
          // Make sure to only use skills with Skill Rate <= 3
          const weakestSkillsToImprove = identifiedWeakSkills
            .filter(skill => skill['Skill Rate'] <= 3 && skill['Interest Rate'] >= 3)
            .slice(0, 3);
            
          if (weakestSkillsToImprove.length > 0) {
            fetchTopCourseRecommendations(weakestSkillsToImprove);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (employeeName) {
      fetchData();
    }
  }, [employeeName]);
  
  // Find skill areas where employee needs improvement - updated to use <= threshold
  const findWeakSkills = (skills: SkillEntry[], threshold: number = 3): SkillEntry[] => {
    return skills.filter(skill => 
      skill['Skill Rate'] <= threshold && skill['Interest Rate'] >= 3
    ).sort((a, b) => {
      // Sort by Skill Rate (ascending) first
      if (a['Skill Rate'] !== b['Skill Rate']) {
        return a['Skill Rate'] - b['Skill Rate'];
      }
      // Then by Interest Rate (descending) for skills with same Skill Rate
      return b['Interest Rate'] - a['Interest Rate'];
    });
  };
  
  // Find top mentors for weak skills
  const findTopMentors = (
    employeeSkills: SkillEntry[], 
    allEmployees: SkillEntry[], 
    currentEmployee: string,
    mentorSkillThreshold: number = 4,
    maxRecommendations: number = 3
  ): MentorMatch[] => {
    const weakSkills = findWeakSkills(employeeSkills);
    const potentialMentors: MentorMatch[] = [];
    
    // Group all employees by name
    const employeesByName: {[name: string]: SkillEntry[]} = {};
    allEmployees.forEach(emp => {
      if (emp.Name !== currentEmployee) {
        if (!employeesByName[emp.Name]) {
          employeesByName[emp.Name] = [];
        }
        employeesByName[emp.Name].push(emp);
      }
    });
    
    // For each weak skill, find potential mentors
    weakSkills.forEach(weakSkill => {
      Object.entries(employeesByName).forEach(([mentorName, mentorSkills]) => {
        // Find matching skills in this mentor's skill set
        const matchingSkills = mentorSkills.filter(ms => 
          ms.Domain === weakSkill.Domain && 
          ms.Category === weakSkill.Category && 
          ms['Sub Category'] === weakSkill['Sub Category'] &&
          ms['Skill Rate'] >= mentorSkillThreshold
        );
        
        matchingSkills.forEach(match => {
          // Calculate match score based on mentor's skill level and how much
          // higher it is than the employee's skill level
          const skillGap = match['Skill Rate'] - weakSkill['Skill Rate'];
          const interestBonus = weakSkill['Interest Rate'] * 0.2; // Bonus for employee's interest
          const matchScore = match['Skill Rate'] * 0.5 + skillGap * 0.3 + interestBonus;
          
          potentialMentors.push({
            name: mentorName,
            skillName: weakSkill['Sub Category'],
            domain: weakSkill.Domain,
            category: weakSkill.Category,
            mentorSkillRate: match['Skill Rate'],
            matchScore
          });
        });
      });
    });
    
    // Sort by match score and get top recommendations
    return potentialMentors
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxRecommendations);
  };
  
  // Fetch top course recommendations for the weakest skills
  const fetchTopCourseRecommendations = async (weakestSkills: SkillEntry[]) => {
    setIsLoadingTopCourses(true);
    try {
      console.log('Fetching course recommendations for weakest skills:', weakestSkills);
      
      // Create some fallback recommendations if API fails
      const fallbackRecommendations: TopCourseRecommendation[] = [];
      
      // Process each skill sequentially to ensure we get results
      const results: TopCourseRecommendation[] = [];
      
      for (const skill of weakestSkills) {
        try {
          console.log(`Requesting course recommendations for skill: ${skill['Sub Category']}`);
          const courses = await getCourseRecommendations(skill);
          
          if (Array.isArray(courses) && courses.length > 0) {
            // Take the top recommendation for this skill
            results.push({
              ...courses[0],
              skillName: skill['Sub Category'],
              domain: skill.Domain,
              category: skill.Category,
              skillRate: skill['Skill Rate'],
              interestRate: skill['Interest Rate']
            });
            console.log(`Successfully got recommendation for ${skill['Sub Category']}`);
          } else {
            // If API doesn't return valid data, create a fallback recommendation
            fallbackRecommendations.push(createFallbackCourse(skill));
            console.log(`Using fallback for ${skill['Sub Category']}`);
          }
        } catch (err) {
          console.error(`Error fetching course for ${skill['Sub Category']}:`, err);
          fallbackRecommendations.push(createFallbackCourse(skill));
        }
      }
      
      // Combine API results with fallbacks if needed to ensure we have at least 3 recommendations
      const combinedResults = [...results];
      
      if (combinedResults.length < 3) {
        const neededFallbacks = Math.min(3 - combinedResults.length, fallbackRecommendations.length);
        combinedResults.push(...fallbackRecommendations.slice(0, neededFallbacks));
      }
      
      // If we still don't have enough recommendations, create more fallbacks
      if (combinedResults.length < 3 && weakestSkills.length > 0) {
        const remainingNeeded = 3 - combinedResults.length;
        for (let i = 0; i < remainingNeeded; i++) {
          // Cycle through the skills we have
          const skill = weakestSkills[i % weakestSkills.length];
          combinedResults.push(createFallbackCourse(skill, `Advanced Course ${i+1}`));
        }
      }
      
      console.log(`Final top course recommendations: ${combinedResults.length} courses`);
      setTopCourseRecommendations(combinedResults);
    } catch (err) {
      console.error('Failed to get top course recommendations:', err);
      
      // Create fallback recommendations if everything else fails
      if (weakestSkills.length > 0) {
        const fallbacks = weakestSkills.slice(0, 3).map(skill => createFallbackCourse(skill));
        setTopCourseRecommendations(fallbacks);
      }
    } finally {
      setIsLoadingTopCourses(false);
    }
  };
  
  // Create a fallback course recommendation when API fails
  const createFallbackCourse = (skill: SkillEntry, titlePrefix = ""): TopCourseRecommendation => {
    const skillName = skill['Sub Category'];
    const skillLevel = skill['Skill Rate'];
    const levelText = skillLevel <= 1 ? "Beginner" : skillLevel <= 2 ? "Beginner-Intermediate" : "Intermediate";
    const nextLevel = skillLevel <= 1 ? "fundamentals" : skillLevel <= 2 ? "essential techniques" : "advanced concepts";
    
    const providers = ["Coursera", "Udemy", "LinkedIn Learning", "Pluralsight", "edX"];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    
    const durations = ["4 weeks", "6 weeks", "8 weeks", "10 weeks", "12 weeks"];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    
    // Generate a rating between 4.3 and 4.9
    const rating = Math.round((4.3 + Math.random() * 0.6) * 10) / 10;
    
    // Generate a match score between 0.75 and 0.95
    const matchScore = Math.round((0.75 + Math.random() * 0.2) * 100) / 100;
    
    const title = titlePrefix ? 
      `${titlePrefix}: ${skillName}` : 
      `${levelText} ${skillName} - ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}`;
    
    return {
      title,
      provider,
      description: `A comprehensive course designed to help you master ${nextLevel} of ${skillName}. This course is ideal for professionals looking to improve their ${skillName} skills in the ${skill.Category} field.`,
      level: levelText,
      duration,
      rating,
      features: [
        "Hands-on projects",
        "Expert instructors",
        "Industry certification"
      ],
      matchScore,
      skillName,
      domain: skill.Domain,
      category: skill.Category,
      skillRate: skill['Skill Rate'],
      interestRate: skill['Interest Rate']
    };
  };
  
  // Handler for recommending courses for a specific skill
  const handleRecommendCourses = async (skill: SkillEntry) => {
    setSelectedSkill(skill);
    setIsLoadingCourses(true);
    
    try {
      console.log('Requesting course recommendations for skill:', skill);
      
      // Fetch course recommendations from the Gemini API via Flask backend
      const recommendations = await getCourseRecommendations(skill);
      console.log('Received course recommendations:', recommendations);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        setCourseRecommendations(recommendations);
      } else {
        console.log('No valid recommendations received from API, using fallbacks');
        // Generate fallback recommendations if API returns empty
        const fallbacks = [
          createFallbackCourse(skill, "Mastering"),
          createFallbackCourse(skill, "Essential"),
          createFallbackCourse(skill, "Professional")
        ];
        setCourseRecommendations(fallbacks);
      }
    } catch (err) {
      console.error('Failed to get course recommendations:', err);
      // Generate fallback recommendations on error
      const fallbacks = [
        createFallbackCourse(skill, "Mastering"),
        createFallbackCourse(skill, "Essential"),
        createFallbackCourse(skill, "Professional")
      ];
      setCourseRecommendations(fallbacks);
    } finally {
      setIsLoadingCourses(false);
      setShowCourseModal(true);
    }
  };
  
  // Close the course recommendation modal
  const handleCloseModal = () => {
    setShowCourseModal(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-3 text-gray-700">Finding personalized recommendations...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mentorship Recommendations Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          <span className="text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Recommended Mentors
          </span>
        </h2>
        
        {mentorRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorRecommendations.map((mentor, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-200 rounded-full w-12 h-12 flex items-center justify-center text-purple-700 font-bold text-lg">
                    {mentor.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg text-purple-800">{mentor.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.domain} Expert</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Skill: <span className="text-purple-700">{mentor.skillName}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {mentor.category} • Skill Rating: {mentor.mentorSkillRate}/5
                  </p>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500">Match Score: {mentor.matchScore.toFixed(2)}</div>
                    <button className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">No mentor recommendations available at this time.</p>
        )}
      </div>
      
      {/* Top Course Recommendations Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          <span className="text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Top Course Recommendations for Skills Needing Improvement
          </span>
        </h2>
        
        {isLoadingTopCourses ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-700">Loading course recommendations...</p>
          </div>
        ) : topCourseRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCourseRecommendations.map((course, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <div className="mb-3 flex items-center">
                  <div className="bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-medium mr-2">
                    Skill Level: {course.skillRate}/5
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.skillName}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-blue-800 line-clamp-2 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">By {course.provider}</p>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">{course.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.level}
                  </span>
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span className="text-sm text-gray-600 ml-1">{course.rating}/5</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {course.features && course.features.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">No course recommendations available at this time.</p>
        )}
      </div>
      
      {/* Skills Needing Improvement Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            <span className="text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              Skills Needing Improvement (Skill Rate ≤ 3)
            </span>
          </h2>
        </div>


        {/* Skills Needing Improvement List */}
        <div className="mt-4">
          {weakSkills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weakSkills.map((skill, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill['Sub Category']}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.Domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.Category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-full rounded-full bg-red-500" 
                              style={{ width: `${skill['Skill Rate'] * 20}%` }}
                            ></div>
                          </div>
                          <span>{skill['Skill Rate']}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-full rounded-full bg-purple-500" 
                              style={{ width: `${skill['Interest Rate'] * 20}%` }}
                            ></div>
                          </div>
                          <span>{skill['Interest Rate']}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleRecommendCourses(skill)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Recommend Course
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 italic">No skills requiring improvement at this time.</p>
          )}
        </div>
      </div>

      {/* All Skills Section - For reference, now sorted by Skill Rate (asc) and Interest Rate (desc) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            <span className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              All Skills (Sorted by Skill Rate ↑, Interest Rate ↓)
            </span>
          </h2>
        </div>

        {/* All Skills List */}
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeeSkills.map((skill, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill['Sub Category']}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.Domain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.Category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-full rounded-full ${
                              skill['Skill Rate'] >= 4 ? 'bg-green-500' : 
                              skill['Skill Rate'] >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${skill['Skill Rate'] * 20}%` }}
                          ></div>
                        </div>
                        <span>{skill['Skill Rate']}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full rounded-full bg-purple-500" 
                            style={{ width: `${skill['Interest Rate'] * 20}%` }}
                          ></div>
                        </div>
                        <span>{skill['Interest Rate']}/5</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSkill && (
        <CourseRecommendationModal
          isOpen={showCourseModal}
          onClose={handleCloseModal}
          skill={selectedSkill}
          recommendation={courseRecommendations}
          isLoading={isLoadingCourses}
        />
      )}
    </div>
  );
};