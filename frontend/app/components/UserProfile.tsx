//components/Userprofiele.tsx

'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '@/app/config/supabaseClient';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
  Email?: string;
};

export default function UserProfile() {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSkills, setUserSkills] = useState<SkillEntry[]>([]);
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

  // Group skills by domain for better organization
  const groupedSkills = userSkills.reduce((acc: {[key: string]: SkillEntry[]}, skill) => {
    const domain = skill.Domain || 'Other';
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(skill);
    return acc;
  }, {});

  const getUserName = () => {
    if (userSkills.length > 0) {
      return userSkills[0].Name;
    }
    return "User";
  };

  // Calculate skill statistics
  const calculateSkillStats = () => {
    if (userSkills.length === 0) return { avgSkill: 0, avgInterest: 0, topSkill: null };
    
    let totalSkill = 0;
    let totalInterest = 0;
    let topSkill: SkillEntry | null = null;
    
    userSkills.forEach(skill => {
      totalSkill += skill['Skill Rate'];
      totalInterest += skill['Interest Rate'];
      
      if (!topSkill || skill['Skill Rate'] > topSkill['Skill Rate']) {
        topSkill = skill;
      }
    });
    
    return {
      avgSkill: parseFloat((totalSkill / userSkills.length).toFixed(1)),
      avgInterest: parseFloat((totalInterest / userSkills.length).toFixed(1)),
      topSkill: topSkill
    };
  };
  
  const stats = calculateSkillStats();
  
  // Count skills by proficiency level
  const skillLevels = {
    beginner: userSkills.filter(s => s['Skill Rate'] <= 2).length,
    intermediate: userSkills.filter(s => s['Skill Rate'] > 2 && s['Skill Rate'] < 4).length,
    advanced: userSkills.filter(s => s['Skill Rate'] >= 4).length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">User Profile</h1>
      
      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{fetchError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700">Loading your profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 flex items-end p-6">
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-4xl font-bold text-blue-600">{getUserName().charAt(0)}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800">{getUserName()}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
              
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Skills Overview</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{userSkills.length}</p>
                      <p className="text-xs text-gray-600">Total Skills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.avgSkill}</p>
                      <p className="text-xs text-gray-600">Avg. Skill</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stats.avgInterest}</p>
                      <p className="text-xs text-gray-600">Avg. Interest</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Skill Levels</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Beginner</span>
                        <span>{skillLevels.beginner}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-300 h-2 rounded-full" style={{ width: `${(skillLevels.beginner / userSkills.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Intermediate</span>
                        <span>{skillLevels.intermediate}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(skillLevels.intermediate / userSkills.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Advanced</span>
                        <span>{skillLevels.advanced}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-700 h-2 rounded-full" style={{ width: `${(skillLevels.advanced / userSkills.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {stats.topSkill && (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Top Skill</h3>
                    <p className="font-medium text-gray-800">{stats.topSkill['Sub Category']}</p>
                    <p className="text-xs text-gray-600">{stats.topSkill.Domain} • {stats.topSkill.Category}</p>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.topSkill['Skill Rate'] / 5) * 100}%` }}></div>
                      </div>
                      <span className="ml-2 text-sm font-bold">{stats.topSkill['Skill Rate']}/5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Skills List */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">My Skills</h3>
            
            {Object.entries(groupedSkills).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedSkills).map(([domain, skills]) => (
                  <div key={domain}>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">{domain}</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {skills.map((skill) => (
                        <div 
                          key={skill.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{skill['Sub Category']}</h5>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {skill.Category}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mt-3">
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Skill Level</span>
                                <span>{skill['Skill Rate']}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(skill['Skill Rate'] / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Interest Level</span>
                                <span>{skill['Interest Rate']}/5</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${(skill['Interest Rate'] / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-xl text-gray-600">No skills found in your profile.</p>
                <p className="text-gray-500 mt-2">Add skills to track your progress and get personalized recommendations.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}