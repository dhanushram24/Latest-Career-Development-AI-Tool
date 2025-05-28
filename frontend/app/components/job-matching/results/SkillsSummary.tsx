// import React from 'react';

// interface SkillsSummaryProps {
//   strongSkillsCount: number;
//   weakSkillsCount: number;
//   missingSkillsCount: number;
// }

// export default function SkillsSummary({ 
//   strongSkillsCount, 
//   weakSkillsCount, 
//   missingSkillsCount 
// }: SkillsSummaryProps): React.ReactElement {
//   return (
//     <div className="grid md:grid-cols-3 gap-6 mb-8">
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <div className="flex items-center mb-3">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//           </svg>
//           <h4 className="font-semibold">Strong Skills</h4>
//         </div>
//         <p className="text-sm text-gray-600">{strongSkillsCount} skills rated 3+</p>
//       </div>
      
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <div className="flex items-center mb-3">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//           <h4 className="font-semibold">Weak Skills</h4>
//         </div>
//         <p className="text-sm text-gray-600">{weakSkillsCount} skills rated below 3</p>
//       </div>
      
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <div className="flex items-center mb-3">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//           <h4 className="font-semibold">Missing Skills</h4>
//         </div>
//         <p className="text-sm text-gray-600">{missingSkillsCount} required skills</p>
//       </div>
//     </div>
//   );
// }