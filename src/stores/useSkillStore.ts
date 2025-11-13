import { create } from 'zustand';
import { Skill } from '../types';
import { parseSearchQuery, matchSkillAgainstQuery } from '../utils/searchOperators';

export interface SearchFilters {
  query: string;
  locations: ('claude' | 'opencode')[];
  tags: string[];
  includeArchived: boolean;
}

interface SkillStore {
  // State
  skills: Skill[];
  selectedSkill: Skill | null;
  isLoading: boolean;
  error: string | null;
  searchFilters: SearchFilters;

  // Actions
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
}

// Selector functions (to be used outside the store)
export const getFilteredSkills = (state: SkillStore): Skill[] => {
  let filtered = [...state.skills];

  // Filter by location
  if (state.searchFilters.locations.length > 0 && state.searchFilters.locations.length < 2) {
    filtered = filtered.filter((skill) =>
      state.searchFilters.locations.includes(skill.location as 'claude' | 'opencode')
    );
  }

  // Filter by tags (if tags exist in metadata)
  if (state.searchFilters.tags.length > 0) {
    filtered = filtered.filter((skill) => {
      const skillTags = skill.metadata?.tags as string[] | undefined;
      if (!skillTags || !Array.isArray(skillTags)) return false;
      return state.searchFilters.tags.some((tag) => skillTags.includes(tag));
    });
  }

  // Filter by search query with operators support
  if (state.searchFilters.query.trim()) {
    const parsedQuery = parseSearchQuery(state.searchFilters.query);
    filtered = filtered.filter((skill) => matchSkillAgainstQuery(skill, parsedQuery));
  }

  return filtered;
};

export const getAvailableTags = (state: SkillStore): string[] => {
  const tagSet = new Set<string>();

  state.skills.forEach((skill) => {
    const tags = skill.metadata?.tags as string[] | undefined;
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag) => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
};

export const getLocationCounts = (state: SkillStore): Record<string, number> => {
  const counts: Record<string, number> = {
    claude: 0,
    opencode: 0,
  };

  state.skills.forEach((skill) => {
    if (skill.location === 'claude') {
      counts.claude++;
    } else if (skill.location === 'opencode') {
      counts.opencode++;
    }
  });

  return counts;
};

const defaultSearchFilters: SearchFilters = {
  query: '',
  locations: ['claude', 'opencode'],
  tags: [],
  includeArchived: true,
};

export const useSkillStore = create<SkillStore>((set) => ({
  // Initial state
  skills: [],
  selectedSkill: null,
  isLoading: false,
  error: null,
  searchFilters: defaultSearchFilters,

  // Actions
  setSkills: (skills) => set({ skills }),
  selectSkill: (skill) => set({ selectedSkill: skill }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),
  resetSearchFilters: () => set({ searchFilters: defaultSearchFilters }),
}));
