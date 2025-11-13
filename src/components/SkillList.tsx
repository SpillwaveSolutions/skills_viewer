import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSkills } from '../hooks';
import { useSkillStore, getFilteredSkills } from '../stores';
import { useKeyboardStore } from '../stores/keyboardStore';
import { useListNavigation } from '../hooks/useListNavigation';
import { Skill } from '../types';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './filters/FilterPanel';
import { Filter } from 'lucide-react';
import { highlightMatches } from '../utils/searchOperators';

export const SkillList: React.FC = () => {
  const { skills, isLoading, error, reload } = useSkills();
  const { selectedSkill, selectSkill, setSearchFilters, searchFilters } = useSkillStore();
  const highlightedSkillIndex = useKeyboardStore((state) => state.highlightedSkillIndex);
  const setVisibleSkillCount = useKeyboardStore((state) => state.setVisibleSkillCount);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Get filtered skills using selector
  const filteredSkills = useMemo(() => {
    return getFilteredSkills(useSkillStore.getState());
    // We intentionally include both skills and searchFilters as dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills, searchFilters]);

  // Update visible skill count for keyboard navigation
  useEffect(() => {
    setVisibleSkillCount(filteredSkills.length);
  }, [filteredSkills.length, setVisibleSkillCount]);

  // Enable keyboard list navigation
  useListNavigation({
    skillCount: filteredSkills.length,
    onSelectSkill: (index) => {
      if (filteredSkills[index]) {
        selectSkill(filteredSkills[index]);
      }
    },
  });

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
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} />

      <div className="mt-2">
        <SearchBar value={searchFilters.query} onChange={(query) => setSearchFilters({ query })} />
      </div>

      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open filter panel"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              Filters
            </button>
            <span className="text-sm text-gray-600" role="status" aria-live="polite">
              {filteredSkills.length} of {skills.length} skills
            </span>
          </div>
          <button
            onClick={reload}
            className="text-sm text-blue-500 hover:text-blue-600"
            aria-label="Refresh skill list"
          >
            Refresh
          </button>
        </div>
      </div>

      <div
        data-testid="skill-list"
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Available skills"
        tabIndex={0}
        aria-activedescendant={
          highlightedSkillIndex !== null &&
          highlightedSkillIndex >= 0 &&
          highlightedSkillIndex < filteredSkills.length
            ? `skill-item-${highlightedSkillIndex}`
            : undefined
        }
      >
        {filteredSkills.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600">No skills match your search criteria</p>
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <SkillListItem
              key={skill.path}
              skill={skill}
              index={index}
              isSelected={selectedSkill?.path === skill.path}
              isHighlighted={highlightedSkillIndex === index}
              onClick={() => selectSkill(skill)}
              searchQuery={searchFilters.query}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface SkillListItemProps {
  skill: Skill;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  searchQuery: string;
}

const SkillListItem: React.FC<SkillListItemProps> = ({
  skill,
  index,
  isSelected,
  isHighlighted,
  onClick,
  searchQuery,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isHighlighted]);

  // Determine background styling based on selection and highlight state
  const getBackgroundClass = () => {
    if (isSelected) {
      return 'bg-blue-50 border-l-4 border-l-blue-500 pl-3.5';
    }
    if (isHighlighted) {
      return 'bg-amber-50 border-l-2 border-l-amber-400';
    }
    return '';
  };

  // Highlight matching text
  const highlightedName = searchQuery.trim()
    ? highlightMatches(skill.name, searchQuery).map((match, i) =>
        match.isMatch ? (
          <mark key={i} className="bg-yellow-200 text-gray-900">
            {match.text}
          </mark>
        ) : (
          match.text
        )
      )
    : skill.name;

  const highlightedDescription =
    searchQuery.trim() && skill.description
      ? highlightMatches(skill.description, searchQuery).map((match, i) =>
          match.isMatch ? (
            <mark key={i} className="bg-yellow-200 text-gray-900">
              {match.text}
            </mark>
          ) : (
            match.text
          )
        )
      : skill.description;

  return (
    <div
      ref={ref}
      id={`skill-item-${index}`}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      data-testid="skill-item"
      data-highlighted={isHighlighted}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${getBackgroundClass()}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm mr-2 truncate" title={skill.name}>
            {highlightedName}
          </h3>
          {skill.description && (
            <p className="text-xs text-gray-600 truncate mt-0.5">{highlightedDescription}</p>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
            skill.location === 'claude'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {skill.location}
        </span>
      </div>
    </div>
  );
};
