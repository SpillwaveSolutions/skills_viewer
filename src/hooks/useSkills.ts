import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSkillStore } from '../stores';
import { Skill } from '../types';

export function useSkills() {
  const { skills, isLoading, error, setSkills, setLoading, setError } = useSkillStore();

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Skill[]>('scan_skills');
      setSkills(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    skills,
    isLoading,
    error,
    reload: loadSkills,
  };
}
