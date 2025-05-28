// import React from 'react';

// interface Skill {
//   skill: string;
//   domain: string;
//   category: string;
//   userRating: number;
// }

// interface WeakSkillsListProps {
//   skills: Skill[];
// }

// export default function WeakSkillsList({ skills }: WeakSkillsListProps) {
//   return (
//     <div>
//       <h3 className="text-lg font-semibold mb-4 flex items-center">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>

//         Skills That Need Improvement
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {skills.map((skill, index) => (
//           <div key={index} className="border rounded-lg p-4">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h4 className="font-medium">{skill.skill}</h4>
//                 <p className="text-sm text-gray-600">{skill.domain} • {skill.category}</p>
//               </div>
//               <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                 Proficiency: {skill.userRating}/5
//               </div>
//             </div>
//             <div className="mt-3">
//               <button className="text-sm text-blue-600 hover:text-blue-800">
//                 Find upskilling resources
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }