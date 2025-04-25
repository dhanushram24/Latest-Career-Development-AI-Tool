// src/components/EmployeeDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatsSummary from './StatsSummary';
import SkillMatrix from './SkillMatrix';
import TopSkills from './TopSkills';
import ImprovementAreas from './ImprovementAreas';
import CareerDevelopment from './MentorshipAndCourses';
import CourseRecommendationModal, { generateCourseRecommendation } from './CourseRecommendationModal';
import TabNavigation from './TabNavigation';
import supabase from '../config/supabaseClient';

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

type EmployeeDetailProps = {
  skills?: SkillEntry[];
  defaultTab?: string;
};

// Helper function to convert skill rate to percentage (assuming it's on a scale of 0-1)
const convertToPercentage = (rate: number): number => {
  return Math.round(rate * 100);
};

// Function to identify improvement areas based on interest vs skill gap
const identifyImprovementAreas = (skills: SkillEntry[], limit: number = 10): SkillEntry[] => {
  if (!skills || skills.length === 0) {
    return [];
  }
  
  // Calculate improvement score: prioritize high interest with lower skill levels
  const scoredSkills = skills.map(skill => {
    // Convert rates to percentages for more intuitive calculations
    const interestPercentage = convertToPercentage(skill['Interest Rate']);
    const skillPercentage = convertToPercentage(skill['Skill Rate']);
    
    // Calculate the gap between interest and skill (prioritize where interest > skill)
    const gap = Math.max(0, interestPercentage - skillPercentage);
    
    // Create an improvement score that prioritizes:
    // 1. High interest (employee wants to learn)
    // 2. Significant gap between interest and current skill
    // 3. Reasonable current skill level (not starting from zero)
    const improvementScore = (interestPercentage * 0.6) + (gap * 0.3) + (skillPercentage * 0.1);
    
    return {
      ...skill,
      improvementScore,
      gap
    };
  });
  
  // Sort by improvement score (highest first) and limit to requested number
  return scoredSkills
    .sort((a, b) => b.improvementScore! - a.improvementScore!)
    .slice(0, limit);
};

export default function EmployeeDetail({ skills: propSkills, defaultTab = "skills" }: EmployeeDetailProps) {
  const [recommendModalOpen, setRecommendModalOpen] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillEntry | null>(null);
  const [skills, setSkills] = useState<SkillEntry[]>(propSkills || []);
  const [isLoading, setIsLoading] = useState<boolean>(!propSkills);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  
  // React Router hooks
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  
  // Employee name
  const employeeName = skills.length > 0 ? skills[0].Name : 'Employee';

  // Fetch employee data if not provided via props
  useEffect(() => {
    if (propSkills) {
      return; // Skip fetch if data is provided via props
    }
    
    const fetchEmployeeData = async () => {
      setIsLoading(true);
      try {
        const decodedEmployeeId = decodeURIComponent(employeeId || '');
    
        const { data, error } = await supabase
          .from('dhanush')
          .select('*')
          .eq('Name', decodedEmployeeId);
    
        if (error) {
          setFetchError(`Could not fetch the data: ${error.message}`);
          console.error("Supabase error:", error);
        } else if (!data || data.length === 0) {
          setFetchError('Employee not found');
        } else {
          setSkills(data as SkillEntry[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setFetchError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId, propSkills]);

  // Group skills by domain and category
  const domains: { [key: string]: { [key: string]: SkillEntry[] } } = {};
  
  skills.forEach(skill => {
    if (!domains[skill.Domain]) {
      domains[skill.Domain] = {};
    }
    
    if (!domains[skill.Domain][skill.Category]) {
      domains[skill.Domain][skill.Category] = [];
    }
    
    domains[skill.Domain][skill.Category].push(skill);
  });

  // Sort skills by skill rate for top skills
  const topSkills = [...skills]
    .sort((a, b) => b['Skill Rate'] - a['Skill Rate'])
    .slice(0, 10);

  // Find improvement areas by prioritizing high interest with skill gaps
  const improvementAreas = identifyImprovementAreas(skills);

  const handleRecommendCourse = (skill: SkillEntry) => {
    setSelectedSkill(skill);
    setRecommendModalOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/employee/${employeeId}/${tab}`);
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'top-skills':
        return <TopSkills topSkills={topSkills} employeeName={employeeName} />;
      case 'improvement-areas':
        return (
          <ImprovementAreas 
            improvementAreas={improvementAreas} 
            employeeName={employeeName} 
            handleRecommendCourse={handleRecommendCourse}
          />
        );
      case 'development':
        return <CareerDevelopment skills={skills} employeeName={employeeName} />;
      case 'skills':
      default:
        return (
          <>
            <StatsSummary skills={skills} domains={domains} />
            <SkillMatrix 
              domains={domains} 
              handleRecommendCourse={handleRecommendCourse} 
            />
          </>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-700">Loading employee data...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{fetchError}</p>
        </div>
      ) : (
        <>
          {/* Header with employee name */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{employeeName}&#39;s Profile</h1>
            <p className="text-gray-500 mt-2">Skills assessment and career development dashboard</p>
          </div>
          
          {/* Tabs */}
          <TabNavigation 
            employeeId={employeeId || '1'} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />

          {/* Tab Content */}
          {renderTabContent()}

          {/* Course Recommendation Modal */}
          {recommendModalOpen && selectedSkill && (
            <CourseRecommendationModal 
              isOpen={recommendModalOpen}
              onClose={() => setRecommendModalOpen(false)}
              skill={selectedSkill}
              recommendation={generateCourseRecommendation(selectedSkill)}
            />
          )}
        </>
      )}
    </div>
  );
}