// import React from 'react';
// import StrongSkillsList from './skills/StrongSkillsList';
// import WeakSkillsList from './skills/WeakSkillsList';
// import MissingSkillsList from './skills/MissingSkillsList';

// // Define a common type for skill items to match the one used in child components
// interface Skill {
//   id: string;
//   name: string;
//   skill: string;
//   domain: string;
//   category: string;
//   userRating: number;
// }

// interface SkillsDetailProps {
//   strongSkills: Skill[];
//   weakSkills: Skill[];
//   missingSkills: Skill[];
// }

// export default function SkillsDetail({ 
//   strongSkills, 
//   weakSkills, 
//   missingSkills 
// }: SkillsDetailProps): React.ReactElement {
//   return (
//     <div className="space-y-8">
//       {/* Strong Skills Section */}
//       {strongSkills.length > 0 && <StrongSkillsList skills={strongSkills} />}
      
//       {/* Weak Skills Section */}
//       {weakSkills.length > 0 && <WeakSkillsList skills={weakSkills} />}
      
//       {/* Missing Skills Section */}
//       {missingSkills.length > 0 && <MissingSkillsList skills={missingSkills} />}
//     </div>
//   );
// }