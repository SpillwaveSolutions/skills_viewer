import React from 'react';
import { Skill } from '../types';

interface DescriptionSectionProps {
  skill: Skill;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ skill }) => {
  // Get description from YAML metadata or skill.description
  const description = skill.metadata?.description || skill.description;

  if (!description) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">📝 Description</h2>
      <p className="text-base text-gray-800 leading-relaxed">{description}</p>
    </div>
  );
};
