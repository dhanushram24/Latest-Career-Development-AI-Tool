// Type definitions for skills and skill gap analysis

export interface Skill {
  id: string;       // Unique identifier for the skill
  name: string;     // Display name of the skill
  domain: string;   // The domain this skill belongs to (e.g., "Cloud Computing")
  category: string; // Category within the domain (e.g., "Practice and Technologies")
  subCategory: string; // Sub-category or specific skill name
  userRating: number; // User's self-rated proficiency (1-5)
  interestRate: number; // User's interest level in this skill (1-5)
  required: boolean; // Whether this skill is required for the job
  matchConfidence?: number; // Confidence of the match (0.0-1.0)
}

export interface RequiredSkill {
  Skill_Description: string;
  Domain: string;
  Category: string;
  'Sub-category': string;
}

export interface SkillGapAnalysis {
  overallMatch: number;     // Overall match percentage (0-100)
  strongSkills: Skill[];    // Skills with rating ≥ 3
  weakSkills: Skill[];      // Skills with rating < 3
  missingSkills: Skill[];   // Skills required but not found in user profile
  matchedSkills?: Skill[];  // All matched skills (for backward compatibility)
}

export interface MatchResult {
  name: string;           // User's name
  id: string;             // User's ID
  matchedSkills: Skill[]; // Skills that match and meet minimum rating
  weakSkills: Skill[];    // Skills that match but have low rating
  missingSkills: string[]; // Skills that are missing
  overallMatch: number;   // Overall match percentage
}

// Skill rating classifications
export const SKILL_RATING = {
  NOVICE: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5
};

// Skill match confidence levels
export const MATCH_CONFIDENCE = {
  LOW: 0.3,
  MEDIUM: 0.7,
  HIGH: 1.0
};

// Skill priority levels for upskilling recommendations
export enum SkillPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Helper function to determine skill priority based on various factors
export function determineSkillPriority(
  skill: Skill, 
  isRequired: boolean = true,
  jobCriticalSkills: string[] = []
): SkillPriority {
  // Missing skills that are required have high priority
  if (skill.userRating === 0 && isRequired) {
    return SkillPriority.HIGH;
  }
  
  // Check if this is a critical skill for the job
  if (jobCriticalSkills.includes(skill.name)) {
    return SkillPriority.HIGH;
  }
  
  // Weak skills (rating < 3) that are required have medium priority
  if (skill.userRating < 3 && isRequired) {
    return SkillPriority.MEDIUM;
  }
  
  // Default to low priority for other skills
  return SkillPriority.LOW;
}