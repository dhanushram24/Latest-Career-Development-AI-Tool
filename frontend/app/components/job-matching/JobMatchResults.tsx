import React from 'react';
import MatchScore from './results/MatchScore';
// import SkillsSummary from './results/SkillsSummary';
// import SkillsDetail from './results/SkillsDetail';
import UpskillRecommendation from './results/UpskillRecommendation';
import ApplyButton from './results/ApplyButton';
import { SkillGapAnalysis } from './types';

interface JobMatchResultsProps {
  jobTitle: string;
  department: string;
  skillGapAnalysis: SkillGapAnalysis | null;
}

export default function JobMatchResults({ 
  jobTitle, 
  department, 
  skillGapAnalysis 
}: JobMatchResultsProps): React.ReactElement | null {
  if (!skillGapAnalysis) return null;
  
  // Filter skills based on rating (weak skills have rating < 3)
  const weakSkills = skillGapAnalysis.matchedSkills.filter(skill => 
    skill.userRating > 0 && skill.userRating < 3
  );
  
  // All missing skills are considered for upskilling recommendations
  const missingSkills = skillGapAnalysis.missingSkills;
  
  // Only show upskill recommendations if there are weak or missing skills
  const showUpskillRecommendations = weakSkills.length > 0 || missingSkills.length > 0;
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{jobTitle}</h2>
        <p className="text-gray-600">{department}</p>
      </div>
      
      <MatchScore overallMatch={skillGapAnalysis.overallMatch} />
      
      {/* <SkillsSummary
        strongSkillsCount={skillGapAnalysis.strongSkills.length}
        weakSkillsCount={weakSkills.length}
        missingSkillsCount={missingSkills.length}
      /> */}
      
      {/* <SkillsDetail
        strongSkills={skillGapAnalysis.strongSkills}
        weakSkills={weakSkills}
        missingSkills={missingSkills}
      /> */}
      
      {showUpskillRecommendations && (
        <UpskillRecommendation 
          weakSkills={weakSkills}
          missingSkills={missingSkills}
        />
      )}
      
      <ApplyButton overallMatch={skillGapAnalysis.overallMatch} />
    </div>
  );
}