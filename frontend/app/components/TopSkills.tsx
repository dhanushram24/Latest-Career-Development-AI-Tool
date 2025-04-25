// src/components/TopSkills.tsx
import React from 'react';
import { convertToPercentage } from './SkillRenderer';

type SkillEntry = {
  id: number;
  Name: string;
  Domain: string;
  Category: string;
  'Sub Category': string;
  'Skill Rate': number;
  'Interest Rate': number;
};

type TopSkillsProps = {
  topSkills: SkillEntry[];
  employeeName: string;
};

export default function TopSkills({ topSkills, employeeName }: TopSkillsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <h3 className="bg-gradient-to-r from-green-100 to-green-50 px-6 py-4 font-semibold text-lg text-gray-800 border-b border-gray-200">
        Top 10 Skills
      </h3>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topSkills.map(skill => (
            <div key={skill.id} className="bg-green-50 border border-green-100 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-800">{skill['Sub Category']}</h4>
                  <p className="text-sm text-gray-600 mt-1">{skill.Domain} &bull; {skill.Category}</p>
                </div>
                <div className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {convertToPercentage(skill['Skill Rate'])}%
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Skill Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${convertToPercentage(skill['Skill Rate'])}%` }}></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest</p>
                  <p className="text-sm font-semibold text-gray-700">{convertToPercentage(skill['Interest Rate'])}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-green-50 inline-block py-3 px-4 rounded-lg">
            <p className="text-green-800 text-sm">
              <span className="font-medium">{employeeName}</span> shows exceptional proficiency in these areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}