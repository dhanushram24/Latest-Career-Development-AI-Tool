// lib/constants.js
export const API_BASE_URL = 'http://localhost:5000/api';

// lib/types.js
/**
 * @typedef {Object} RequiredSkill
 * @property {string} Domain
 * @property {string} Category
 * @property {string} Sub-category
 * @property {string} Skill_Description
 */

/**
 * @typedef {Object} SkillEntry
 * @property {number} id
 * @property {string} Name
 * @property {string} Domain
 * @property {string} Category
 * @property {string} Sub Category
 * @property {number} Skill Rate
 * @property {number} Interest Rate
 */

/**
 * @typedef {Object} MatchedSkill
 * @property {string} skill
 * @property {string} domain
 * @property {string} category
 * @property {string} subCategory
 * @property {number} userRating
 * @property {number} interestRate
 * @property {boolean} required
 */

/**
 * @typedef {Object} SkillGapAnalysis
 * @property {MatchedSkill[]} matchedSkills
 * @property {RequiredSkill[]} missingSkills
 * @property {number} overallMatch
 * @property {MatchedSkill[]} strongSkills
 * @property {MatchedSkill[]} weakSkills
 */

// These are TypeScript-style type definitions added as JSDoc comments
// They provide type hints for editors while keeping the code as JavaScript