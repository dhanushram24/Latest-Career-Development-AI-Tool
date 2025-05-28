//selfupskilling/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '@/app/config/supabaseClient';
import { getCourseRecommendations } from '@/app/services/apiService';
import CourseRecommendationModal from '../components/CourseRecommendationModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

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
};

export default function SelfUpskilling() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSkills, setUserSkills] = useState<SkillEntry[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillEntry | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('my-skills');
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) {
        setFetchError('User session not found. Please login again.');
        setIsLoading(false);
        return;
      }

      try {
        const email = session.user.email;
        
        // Fetch only the current user's skills
        const { data, error } = await supabase
          .from('dhanush')
          .select('*')
          .eq('Email', email);

        if (error) {
          setFetchError(`Could not fetch your skill data: ${error.message}`);
          console.error("Supabase error:", error);
        } else if (!data || data.length === 0) {
          setFetchError('No skill data found for your profile.');
        } else {
          setFetchError(null);
          setUserSkills(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setFetchError('An unexpected error occurred while fetching your data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const fetchCourseRecommendations = async (skill: SkillEntry) => {
    setIsLoadingRecommendations(true);
    setRecommendations([]);
    
    try {
      // Use the updated API service
      const data = await getCourseRecommendations(skill);
      setRecommendations(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSkillClick = (skill: SkillEntry) => {
    setSelectedSkill(skill);
    setActiveTab('find-courses');
  };

  const handleFindCourses = () => {
    if (selectedSkill) {
      fetchCourseRecommendations(selectedSkill);
    }
  };

  const getUserName = () => {
    if (userSkills.length > 0) {
      return userSkills[0].Name;
    }
    return "User";
  };

  // Group skills by domain for better organization
  const groupedSkills = userSkills.reduce((acc: {[key: string]: SkillEntry[]}, skill) => {
    const domain = skill.Domain || 'Other';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(skill);
    return acc;
  }, {});

  // Calculate improvement opportunities based on interest > skill level
  const improvementOpportunities = [...userSkills]
    .map(skill => ({
      ...skill,
      gap: skill['Interest Rate'] - skill['Skill Rate'],
      improvementScore: (skill['Interest Rate'] / 5) * (1 - skill['Skill Rate'] / 5) * 100
    }))
    .sort((a, b) => (b.improvementScore || 0) - (a.improvementScore || 0))
    .slice(0, 5);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Personal Skill Development</h1>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">{getUserName().charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{getUserName()}</p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
      
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{fetchError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700">Loading your skill profile...</p>
        </div>
      ) : (
        <Tabs 
          defaultValue="my-skills" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b mb-6">
            <TabsList className="w-full bg-transparent justify-start h-14 p-0">
              <TabsTrigger 
                value="my-skills" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-6 h-14"
              >
                My Skills
              </TabsTrigger>
              <TabsTrigger 
                value="find-courses" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-6 h-14"
                disabled={!selectedSkill}
              >
                Find Courses
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="my-skills" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Skills Summary Card */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Skills Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Skills</span>
                      <span className="font-medium">{userSkills.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Domains</span>
                      <span className="font-medium">{Object.keys(groupedSkills).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Average Skill Level</span>
                      <span className="font-medium">
                        {(userSkills.reduce((sum, skill) => sum + skill['Skill Rate'], 0) / userSkills.length).toFixed(1)}/5
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Top Improvement Opportunities</h3>
                    {improvementOpportunities.length > 0 ? (
                      <div className="space-y-4">
                        {improvementOpportunities.map((skill) => (
                          <div 
                            key={skill.id} 
                            className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
                            onClick={() => handleSkillClick(skill)}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{skill['Sub Category']}</span>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Gap: {skill.gap}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Skill: {skill['Skill Rate']}/5</span>
                              <span>•</span>
                              <span>Interest: {skill['Interest Rate']}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No skills found in your profile.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Grid */}
              <Card className="lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">All Skills by Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(groupedSkills).map(([domain, skills]) => (
                    <div key={domain} className="mb-6 last:mb-0">
                      <div className="flex items-center mb-3">
                        <h3 className="text-md font-medium text-gray-800">{domain}</h3>
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {skills.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skills.map((skill) => (
                          <Card 
                            key={skill.id}
                            className={`cursor-pointer transition overflow-hidden hover:border-blue-300 ${
                              selectedSkill?.id === skill.id 
                                ? 'border-blue-500' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => handleSkillClick(skill)}
                          >
                            <div className="p-4">
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-900">{skill['Sub Category']}</h4>
                                <p className="text-sm text-gray-500">{skill.Category}</p>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">Skill Level</span>
                                    <span className="font-medium">{skill['Skill Rate']}/5</span>
                                  </div>
                                  <Progress value={(skill['Skill Rate'] / 5) * 100} className="h-1.5 bg-gray-100" />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">Interest Level</span>
                                    <span className="font-medium">{skill['Interest Rate']}/5</span>
                                  </div>
                                  <Progress value={(skill['Interest Rate'] / 5) * 100} className="h-1.5 bg-gray-100" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {userSkills.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 rounded-md">
                      <p className="text-gray-600">No skills found in your profile.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="find-courses" className="mt-0">
            {selectedSkill ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Skill Details */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Skill Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedSkill['Sub Category']}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-gray-50">
                          {selectedSkill.Domain}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50">
                          {selectedSkill.Category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Skill Level</h3>
                        <div className="space-y-1">
                          <Progress value={(selectedSkill['Skill Rate'] / 5) * 100} className="h-2 bg-gray-100" />
                          <div className="flex justify-between text-xs">
                            <span>Beginner</span>
                            <span className="font-medium text-blue-600">{selectedSkill['Skill Rate']}/5</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Interest Level</h3>
                        <div className="space-y-1">
                          <Progress value={(selectedSkill['Interest Rate'] / 5) * 100} className="h-2 bg-gray-100" />
                          <div className="flex justify-between text-xs">
                            <span>Low</span>
                            <span className="font-medium text-blue-600">{selectedSkill['Interest Rate']}/5</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Skill Gap Analysis</h3>
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700">Interest vs. Skill Gap</span>
                            <Badge className={`${
                              selectedSkill['Interest Rate'] > selectedSkill['Skill Rate'] 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {selectedSkill['Interest Rate'] - selectedSkill['Skill Rate']}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {selectedSkill['Interest Rate'] > selectedSkill['Skill Rate']
                              ? "Your interest level exceeds your current skill level, making this a great opportunity for growth."
                              : "Your skill level matches or exceeds your interest level in this area."}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleFindCourses}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                        disabled={isLoadingRecommendations}
                      >
                        {isLoadingRecommendations ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Finding Courses...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Recommended Courses
                          </span>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Course Recommendations Placeholder */}
                <Card className="lg:col-span-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Recommended Learning Paths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to find personalized courses?</h3>
                      <p className="text-gray-500 max-w-md mb-6">
                        Click the &quot;Find Recommended Courses&quot; button to discover tailored learning resources that will help you develop your {selectedSkill['Sub Category']} skills.
                      </p>
                      <button 
                        onClick={handleFindCourses}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        disabled={isLoadingRecommendations}
                      >
                        {isLoadingRecommendations ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Finding Courses...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Recommended Courses
                          </span>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a skill to view recommendations</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Go to the &quot;My Skills&quot; tab and select one of your skills to see personalized course recommendations that will help you improve in that area.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Course Recommendation Modal */}
      {selectedSkill && (
        <CourseRecommendationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skill={selectedSkill}
          recommendation={recommendations}
          isLoading={isLoadingRecommendations}
        />
      )}
    </div>
  );
}