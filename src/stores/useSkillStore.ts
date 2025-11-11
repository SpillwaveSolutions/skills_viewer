import { create } from 'zustand';
import { Skill } from '../types';

interface SkillStore {
  // State
  skills: Skill[];
  selectedSkill: Skill | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSkillStore = create<SkillStore>((set) => ({
  // Initial state
  skills: [],
  selectedSkill: null,
  isLoading: false,
  error: null,

  // Actions
  setSkills: (skills) => set({ skills }),
  selectSkill: (skill) => set({ selectedSkill: skill }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
