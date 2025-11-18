import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSkillStore,
  getFilteredSkills,
  getAvailableTags,
  getLocationCounts,
} from '@/stores/useSkillStore';
import type { Skill } from '@/types/skill';

const createMockSkill = (name: string, location: 'claude' | 'opencode'): Skill => ({
  name,
  location,
  path: `/test/${name}`,
  content: `# ${name}`,
  content_clean: `# ${name}`,
  references: [],
  scripts: [],
  metadata: { tags: ['test'] },
});

const mockSkills = [
  createMockSkill('skill1', 'claude'),
  createMockSkill('skill2', 'opencode'),
  createMockSkill('skill3', 'claude'),
];

describe('useSkillStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSkillStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should initialize with null selectedSkill', () => {
    const { result } = renderHook(() => useSkillStore());
    expect(result.current.selectedSkill).toBeNull();
  });

  it('should initialize with empty skills array', () => {
    const { result } = renderHook(() => useSkillStore());
    expect(result.current.skills).toEqual([]);
  });

  it('should initialize with default search filters', () => {
    const { result } = renderHook(() => useSkillStore());
    expect(result.current.searchFilters).toEqual({
      query: '',
      locations: ['claude', 'opencode'],
      tags: [],
      includeArchived: true,
    });
  });

  it('should update selectedSkill when selectSkill is called', () => {
    const { result } = renderHook(() => useSkillStore());
    const testSkill = mockSkills[0];

    act(() => {
      result.current.selectSkill(testSkill);
    });

    expect(result.current.selectedSkill).toEqual(testSkill);
  });

  it('should clear selectedSkill when selectSkill is called with null', () => {
    const { result } = renderHook(() => useSkillStore());
    const testSkill = mockSkills[0];

    act(() => {
      result.current.selectSkill(testSkill);
    });

    act(() => {
      result.current.selectSkill(null);
    });
    expect(result.current.selectedSkill).toBeNull();
  });

  it('should replace skills array when setSkills is called', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills(mockSkills);
    });

    expect(result.current.skills.length).toBe(mockSkills.length);
  });

  it('should merge partial filters', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSearchFilters({ query: 'test' });
    });

    expect(result.current.searchFilters.query).toBe('test');
  });

  it('should create new array reference (immutability)', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills(mockSkills);
    });

    const firstRef = result.current.skills;

    act(() => {
      result.current.setSkills([...mockSkills]);
    });

    expect(result.current.skills).not.toBe(firstRef);
  });

  it('should filter by location', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills(mockSkills);
      result.current.setSearchFilters({ locations: ['claude'] });
    });

    const filtered = getFilteredSkills(result.current);
    expect(filtered.every((s) => s.location === 'claude')).toBe(true);
  });

  it('should count by location', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills(mockSkills);
    });

    const counts = getLocationCounts(result.current);
    expect(counts.claude).toBe(2);
    expect(counts.opencode).toBe(1);
  });

  it('should reset all state', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills(mockSkills);
      result.current.selectSkill(mockSkills[0]);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.skills).toEqual([]);
    expect(result.current.selectedSkill).toBeNull();
  });
});
