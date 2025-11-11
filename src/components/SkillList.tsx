import React, { useState, useMemo } from 'react';
import { useSkills } from '../hooks';
import { useSkillStore } from '../stores';
import { Skill } from '../types';
import { SearchBar } from './SearchBar';

export const SkillList: React.FC = () => {
  const { skills, isLoading, error, reload } = useSkills();
  const { selectedSkill, selectSkill } = useSkillStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter skills based on search query
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;

    const query = searchQuery.toLowerCase();
    return skills.filter(skill =>
      skill.name.toLowerCase().includes(query) ||
      skill.description?.toLowerCase().includes(query) ||
      skill.location.toLowerCase().includes(query)
    );
  }, [skills, searchQuery]);

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={reload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading skills...</p>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 mb-2">No skills found</p>
        <p className="text-sm text-gray-500">
          Skills should be in ~/.claude/skills or ~/.config/opencode/skills
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredSkills.length} of {skills.length} skills
          </span>
          <button
            onClick={reload}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredSkills.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600">No skills match "{searchQuery}"</p>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <SkillListItem
              key={skill.path}
              skill={skill}
              isSelected={selectedSkill?.path === skill.path}
              onClick={() => selectSkill(skill)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface SkillListItemProps {
  skill: Skill;
  isSelected: boolean;
  onClick: () => void;
}

const SkillListItem: React.FC<SkillListItemProps> = ({ skill, isSelected, onClick }) => {
  return (
    <div
      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 text-sm">{skill.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${
          skill.location === 'claude'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {skill.location}
        </span>
      </div>
    </div>
  );
};
