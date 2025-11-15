/**
 * Unit tests for useBreadcrumbSegments hook
 *
 * Tests cover:
 * - Returns correct segments for skill list (only "Home")
 * - Returns correct segments for skill selected ("Home › Skill › Tab")
 * - Updates segments when tab changes
 * - Active segment is NOT clickable
 * - Previous segments ARE clickable with correct navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreadcrumbSegments } from '../../../src/hooks/useBreadcrumbSegments';
import { useSkillStore } from '../../../src/stores/useSkillStore';
import { useKeyboardStore } from '../../../src/stores/keyboardStore';
import { Skill } from '../../../src/types';
import { TABS } from '../../../src/types/layout';

// Mock stores
vi.mock('../../../src/stores/useSkillStore');
vi.mock('../../../src/stores/keyboardStore');

describe('useBreadcrumbSegments', () => {
  const mockSkill: Skill = {
    id: 'test-skill',
    name: 'Test Skill Name',
    location: 'claude',
    description: 'Test description',
    content: 'Test content',
    content_clean: 'Test content',
    references: [],
    scripts: [],
    metadata: {},
    path: '/test/path',
    icon: '🧪',
  };

  let mockSelectSkill: ReturnType<typeof vi.fn>;
  let mockSetActiveTabIndex: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSelectSkill = vi.fn();
    mockSetActiveTabIndex = vi.fn();

    // Default mock: no skill selected, tab index 0
    // Zustand stores are functions that take a selector
    vi.mocked(useSkillStore).mockImplementation((selector: any) => {
      const state = {
        selectedSkill: null,
        selectSkill: mockSelectSkill,
        skills: [],
        isLoading: false,
        error: null,
        searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
        setSkills: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        clearError: vi.fn(),
        setSearchFilters: vi.fn(),
        resetSearchFilters: vi.fn(),
      };
      return selector(state);
    });

    vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
      const state = {
        activeTabIndex: 0,
        setActiveTabIndex: mockSetActiveTabIndex,
        searchFocusRequested: false,
        setSearchFocusRequested: vi.fn(),
        highlightedSkillIndex: null,
        setHighlightedSkillIndex: vi.fn(),
        visibleSkillCount: 0,
        setVisibleSkillCount: vi.fn(),
        isHelpModalOpen: false,
        setHelpModalOpen: vi.fn(),
        platform: 'darwin',
        modifierKey: 'Meta',
        modifierSymbol: '⌘',
        detectPlatform: vi.fn(),
        reset: vi.fn(),
      };
      return selector(state);
    });
  });

  describe('No Skill Selected', () => {
    it('should return only "Home" segment when no skill is selected', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toEqual({
        id: 'home',
        label: 'Home',
        clickable: false,
        ariaLabel: 'Home',
      });
    });

    it('should have "Home" segment as not clickable when on home screen', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      const homeSegment = result.current[0];
      expect(homeSegment.clickable).toBe(false);
      expect(homeSegment.onClick).toBeUndefined();
    });
  });

  describe('Skill Selected', () => {
    beforeEach(() => {
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          selectedSkill: mockSkill,
          selectSkill: mockSelectSkill,
          skills: [],
          isLoading: false,
          error: null,
          searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
          setSkills: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          clearError: vi.fn(),
          setSearchFilters: vi.fn(),
          resetSearchFilters: vi.fn(),
        };
        return selector(state);
      });
    });

    it('should return "Home › Skill › Tab" when skill is selected', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      expect(result.current).toHaveLength(3);
      expect(result.current[0].label).toBe('Home');
      expect(result.current[1].label).toBe('Test Skill Name');
      expect(result.current[2].label).toBe('Overview'); // activeTabIndex is 0 by default
    });

    it('should make "Home" segment clickable when skill is selected', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      const homeSegment = result.current[0];
      expect(homeSegment.clickable).toBe(true);
      expect(homeSegment.ariaLabel).toBe('Navigate to Home');
      expect(homeSegment.onClick).toBeDefined();
    });

    it('should navigate to home when clicking "Home" segment', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      const homeSegment = result.current[0];
      act(() => {
        homeSegment.onClick?.();
      });

      expect(mockSelectSkill).toHaveBeenCalledWith(null);
    });

    it('should make skill segment clickable and navigate to first tab', () => {
      vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
        const state = {
          activeTabIndex: 2, // Different from default tab
          setActiveTabIndex: mockSetActiveTabIndex,
          searchFocusRequested: false,
          setSearchFocusRequested: vi.fn(),
          highlightedSkillIndex: null,
          setHighlightedSkillIndex: vi.fn(),
          visibleSkillCount: 0,
          setVisibleSkillCount: vi.fn(),
          isHelpModalOpen: false,
          setHelpModalOpen: vi.fn(),
          platform: 'darwin',
          modifierKey: 'Meta',
          modifierSymbol: '⌘',
          detectPlatform: vi.fn(),
          reset: vi.fn(),
        };
        return selector(state);
      });

      const { result } = renderHook(() => useBreadcrumbSegments());

      const skillSegment = result.current[1];
      expect(skillSegment.clickable).toBe(true);
      expect(skillSegment.ariaLabel).toBe('Navigate to Test Skill Name');
      expect(skillSegment.onClick).toBeDefined();

      act(() => {
        skillSegment.onClick?.();
      });

      expect(mockSetActiveTabIndex).toHaveBeenCalledWith(0);
    });

    it('should make active tab segment NOT clickable', () => {
      const { result } = renderHook(() => useBreadcrumbSegments());

      const tabSegment = result.current[2];
      expect(tabSegment.clickable).toBe(false);
      expect(tabSegment.onClick).toBeUndefined();
    });

    it('should update tab label when activeTabIndex changes', () => {
      const { result, rerender } = renderHook(() => useBreadcrumbSegments());

      // Initially tab index 0 (Overview)
      expect(result.current[2].label).toBe('Overview');

      // Change to tab index 3 (Diagram)
      vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
        const state = {
          activeTabIndex: 3,
          setActiveTabIndex: mockSetActiveTabIndex,
          searchFocusRequested: false,
          setSearchFocusRequested: vi.fn(),
          highlightedSkillIndex: null,
          setHighlightedSkillIndex: vi.fn(),
          visibleSkillCount: 0,
          setVisibleSkillCount: vi.fn(),
          isHelpModalOpen: false,
          setHelpModalOpen: vi.fn(),
          platform: 'darwin',
          modifierKey: 'Meta',
          modifierSymbol: '⌘',
          detectPlatform: vi.fn(),
          reset: vi.fn(),
        };
        return selector(state);
      });

      rerender();

      expect(result.current[2].label).toBe('Diagram');
      expect(result.current[2].id).toBe('tab');
    });

    it('should handle all 6 tab indices correctly', () => {
      TABS.forEach((tab, index) => {
        vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
          const state = {
            activeTabIndex: index,
            setActiveTabIndex: mockSetActiveTabIndex,
            searchFocusRequested: false,
            setSearchFocusRequested: vi.fn(),
            highlightedSkillIndex: null,
            setHighlightedSkillIndex: vi.fn(),
            visibleSkillCount: 0,
            setVisibleSkillCount: vi.fn(),
            isHelpModalOpen: false,
            setHelpModalOpen: vi.fn(),
            platform: 'darwin',
            modifierKey: 'Meta',
            modifierSymbol: '⌘',
            detectPlatform: vi.fn(),
            reset: vi.fn(),
          };
          return selector(state);
        });

        const { result } = renderHook(() => useBreadcrumbSegments());

        expect(result.current[2].label).toBe(tab.label);
        expect(result.current[2].ariaLabel).toBe(tab.label);
      });
    });
  });

  describe('Long Skill Names', () => {
    it('should truncate skill names longer than 40 characters', () => {
      const longNameSkill: Skill = {
        ...mockSkill,
        name: 'This is a very long skill name that should be truncated for breadcrumbs',
      };

      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          selectedSkill: longNameSkill,
          selectSkill: mockSelectSkill,
          skills: [],
          isLoading: false,
          error: null,
          searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
          setSkills: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          clearError: vi.fn(),
          setSearchFilters: vi.fn(),
          resetSearchFilters: vi.fn(),
        };
        return selector(state);
      });

      const { result } = renderHook(() => useBreadcrumbSegments());

      const skillSegment = result.current[1];
      expect(skillSegment.label.length).toBeLessThanOrEqual(43); // 40 + '...'
      expect(skillSegment.label).toContain('...');
    });

    it('should NOT truncate skill names 40 characters or less', () => {
      const normalNameSkill: Skill = {
        ...mockSkill,
        name: 'Normal Length Skill Name',
      };

      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          selectedSkill: normalNameSkill,
          selectSkill: mockSelectSkill,
          skills: [],
          isLoading: false,
          error: null,
          searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
          setSkills: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          clearError: vi.fn(),
          setSearchFilters: vi.fn(),
          resetSearchFilters: vi.fn(),
        };
        return selector(state);
      });

      const { result } = renderHook(() => useBreadcrumbSegments());

      const skillSegment = result.current[1];
      expect(skillSegment.label).toBe('Normal Length Skill Name');
      expect(skillSegment.label).not.toContain('...');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null activeTabIndex gracefully', () => {
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          selectedSkill: mockSkill,
          selectSkill: mockSelectSkill,
          skills: [],
          isLoading: false,
          error: null,
          searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
          setSkills: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          clearError: vi.fn(),
          setSearchFilters: vi.fn(),
          resetSearchFilters: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
        const state = {
          activeTabIndex: null,
          setActiveTabIndex: mockSetActiveTabIndex,
          searchFocusRequested: false,
          setSearchFocusRequested: vi.fn(),
          highlightedSkillIndex: null,
          setHighlightedSkillIndex: vi.fn(),
          visibleSkillCount: 0,
          setVisibleSkillCount: vi.fn(),
          isHelpModalOpen: false,
          setHelpModalOpen: vi.fn(),
          platform: 'darwin',
          modifierKey: 'Meta',
          modifierSymbol: '⌘',
          detectPlatform: vi.fn(),
          reset: vi.fn(),
        };
        return selector(state);
      });

      const { result } = renderHook(() => useBreadcrumbSegments());

      // Should default to first tab (Overview)
      expect(result.current[2].label).toBe('Overview');
    });

    it('should handle out-of-range tabIndex gracefully', () => {
      vi.mocked(useSkillStore).mockImplementation((selector: any) => {
        const state = {
          selectedSkill: mockSkill,
          selectSkill: mockSelectSkill,
          skills: [],
          isLoading: false,
          error: null,
          searchFilters: { query: '', locations: [], tags: [], includeArchived: true },
          setSkills: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          clearError: vi.fn(),
          setSearchFilters: vi.fn(),
          resetSearchFilters: vi.fn(),
        };
        return selector(state);
      });

      vi.mocked(useKeyboardStore).mockImplementation((selector: any) => {
        const state = {
          activeTabIndex: 999, // Out of range
          setActiveTabIndex: mockSetActiveTabIndex,
          searchFocusRequested: false,
          setSearchFocusRequested: vi.fn(),
          highlightedSkillIndex: null,
          setHighlightedSkillIndex: vi.fn(),
          visibleSkillCount: 0,
          setVisibleSkillCount: vi.fn(),
          isHelpModalOpen: false,
          setHelpModalOpen: vi.fn(),
          platform: 'darwin',
          modifierKey: 'Meta',
          modifierSymbol: '⌘',
          detectPlatform: vi.fn(),
          reset: vi.fn(),
        };
        return selector(state);
      });

      const { result } = renderHook(() => useBreadcrumbSegments());

      // Should default to first tab (Overview)
      expect(result.current[2].label).toBe('Overview');
    });
  });
});
