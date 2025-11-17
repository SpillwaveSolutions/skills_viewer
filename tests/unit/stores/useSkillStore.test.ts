import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSkillStore,
  getFilteredSkills,
  getAvailableTags,
  getLocationCounts,
} from '../../../src/stores/useSkillStore';
import { Skill } from '../../../src/types';

describe('useSkillStore', () => {
  const mockSkills: Skill[] = [
    {
      name: 'PDF Skill',
      description: 'Works with PDF files',
      location: 'claude',
      path: '/test/pdf-skill',
      content: 'content',
      content_clean: 'clean content',
      references: [],
      scripts: [],
      metadata: { tags: ['pdf', 'documents'] },
    },
    {
      name: 'Excel Skill',
      description: 'Works with Excel spreadsheets',
      location: 'opencode',
      path: '/test/excel-skill',
      content: 'content',
      content_clean: 'clean content',
      references: [],
      scripts: [],
      metadata: { tags: ['excel', 'spreadsheet'] },
    },
    {
      name: 'Image Skill',
      description: 'Process images',
      location: 'claude',
      path: '/test/image-skill',
      content: 'content',
      content_clean: 'clean content',
      references: [],
      scripts: [],
      metadata: {},
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSkillStore());
    act(() => {
      result.current.resetSearchFilters();
      result.current.setSkills([]);
      result.current.selectSkill(null);
      result.current.clearError();
      result.current.setLoading(false);
    });
  });

  describe('T017: Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSkillStore());

      expect(result.current.skills).toEqual([]);
      expect(result.current.selectedSkill).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.searchFilters.query).toBe('');
      expect(result.current.searchFilters.locations).toEqual(['claude', 'opencode']);
    });
  });

  describe('T018: setSkills action', () => {
    it('should update skills array', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
      });

      expect(result.current.skills).toEqual(mockSkills);
      expect(result.current.skills.length).toBe(3);
    });

    it('should replace existing skills', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSkills([mockSkills[0]]);
      });

      expect(result.current.skills.length).toBe(1);
      expect(result.current.skills[0].name).toBe('PDF Skill');
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSkills([]);
      });

      expect(result.current.skills).toEqual([]);
    });
  });

  describe('T019: selectSkill action', () => {
    it('should set selected skill', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.selectSkill(mockSkills[0]);
      });

      expect(result.current.selectedSkill).toEqual(mockSkills[0]);
      expect(result.current.selectedSkill?.name).toBe('PDF Skill');
    });

    it('should allow changing selected skill', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.selectSkill(mockSkills[0]);
        result.current.selectSkill(mockSkills[1]);
      });

      expect(result.current.selectedSkill?.name).toBe('Excel Skill');
    });

    it('should handle null selection (deselect)', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.selectSkill(mockSkills[0]);
        result.current.selectSkill(null);
      });

      expect(result.current.selectedSkill).toBeNull();
    });
  });

  describe('T020: setSearchQuery (via setSearchFilters)', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({ query: 'test query' });
      });

      expect(result.current.searchFilters.query).toBe('test query');
    });

    it('should preserve other filters when updating query', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({ locations: ['claude'] });
        result.current.setSearchFilters({ query: 'test' });
      });

      expect(result.current.searchFilters.query).toBe('test');
      expect(result.current.searchFilters.locations).toEqual(['claude']);
    });
  });

  describe('Additional Search Filter Tests', () => {
    it('should update locations filter', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({ locations: ['claude'] });
      });

      expect(result.current.searchFilters.locations).toEqual(['claude']);
    });

    it('should update tags filter', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({ tags: ['pdf', 'excel'] });
      });

      expect(result.current.searchFilters.tags).toEqual(['pdf', 'excel']);
    });

    it('should partially update filters', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({ query: 'test' });
        result.current.setSearchFilters({ locations: ['claude'] });
      });

      expect(result.current.searchFilters.query).toBe('test');
      expect(result.current.searchFilters.locations).toEqual(['claude']);
    });
  });

  describe('resetSearchFilters', () => {
    it('should reset all filters to defaults', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSearchFilters({
          query: 'test',
          locations: ['claude'],
          tags: ['pdf'],
        });
        result.current.resetSearchFilters();
      });

      expect(result.current.searchFilters.query).toBe('');
      expect(result.current.searchFilters.locations).toEqual(['claude', 'opencode']);
      expect(result.current.searchFilters.tags).toEqual([]);
    });
  });

  describe('T021: getFilteredSkills selector', () => {
    it('should return all skills when no filters applied', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(3);
    });

    it('should filter by location', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSearchFilters({ locations: ['claude'] });
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(2);
      expect(filtered.every((s) => s.location === 'claude')).toBe(true);
    });

    it('should filter by tags', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSearchFilters({ tags: ['pdf'] });
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('PDF Skill');
    });

    it('should filter by search query', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSearchFilters({ query: 'excel' });
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Excel Skill');
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSearchFilters({
          locations: ['claude'],
          tags: ['pdf'],
        });
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('PDF Skill');
    });

    it('should return empty array when no matches', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
        result.current.setSearchFilters({ query: 'nonexistent' });
      });

      const filtered = getFilteredSkills(result.current);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('T022: getAvailableTags selector', () => {
    it('should extract all unique tags', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
      });

      const tags = getAvailableTags(result.current);
      expect(tags).toContain('pdf');
      expect(tags).toContain('documents');
      expect(tags).toContain('excel');
      expect(tags).toContain('spreadsheet');
      expect(tags).toHaveLength(4);
    });

    it('should return empty array when no skills', () => {
      const { result } = renderHook(() => useSkillStore());

      const tags = getAvailableTags(result.current);
      expect(tags).toEqual([]);
    });

    it('should handle skills without tags', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills([mockSkills[2]]); // Image skill has no tags
      });

      const tags = getAvailableTags(result.current);
      expect(tags).toEqual([]);
    });

    it('should return sorted tags', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
      });

      const tags = getAvailableTags(result.current);
      const sortedTags = [...tags].sort();
      expect(tags).toEqual(sortedTags);
    });
  });

  describe('T023: getLocationCounts selector', () => {
    it('should count skills by location', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setSkills(mockSkills);
      });

      const counts = getLocationCounts(result.current);
      expect(counts.claude).toBe(2);
      expect(counts.opencode).toBe(1);
    });

    it('should return zero counts when no skills', () => {
      const { result } = renderHook(() => useSkillStore());

      const counts = getLocationCounts(result.current);
      expect(counts.claude).toBe(0);
      expect(counts.opencode).toBe(0);
    });
  });

  describe('T024: Edge Cases', () => {
    it('should handle setLoading', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle setError and clearError', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.setError('Test error message');
      });

      expect(result.current.error).toBe('Test error message');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle skills with undefined metadata', () => {
      const { result } = renderHook(() => useSkillStore());

      const skillsWithoutMetadata: Skill[] = [{ ...mockSkills[0], metadata: undefined }];

      act(() => {
        result.current.setSkills(skillsWithoutMetadata);
      });

      const tags = getAvailableTags(result.current);
      expect(tags).toEqual([]);
    });

    it('should handle empty array in all selectors', () => {
      const { result } = renderHook(() => useSkillStore());

      const filtered = getFilteredSkills(result.current);
      const tags = getAvailableTags(result.current);
      const counts = getLocationCounts(result.current);

      expect(filtered).toEqual([]);
      expect(tags).toEqual([]);
      expect(counts.claude).toBe(0);
      expect(counts.opencode).toBe(0);
    });

    it('should handle null values gracefully', () => {
      const { result } = renderHook(() => useSkillStore());

      act(() => {
        result.current.selectSkill(null);
        result.current.setError(null);
      });

      expect(result.current.selectedSkill).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
