/**
 * Unit tests for navigationStore (Zustand store)
 *
 * Tests navigation history, breadcrumbs, and navigation actions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationStore } from '@/stores/navigationStore';
import type { NavigationEntry } from '@/types/navigation';

// Mock skill for testing
const mockSkill = {
  name: 'Test Skill',
  path: '/test/skill.md',
  content: 'Test content',
  content_clean: 'Test content',
  description: 'Test description',
  location: 'user' as const,
  references: [],
  scripts: [],
  metadata: {},
};

describe('navigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.clearHistory();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.history).toEqual([]);
    });

    it('should initialize with currentIndex as -1', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.currentIndex).toBe(-1);
    });

    it('should initialize with canGoBack as false', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.canGoBack).toBe(false);
    });

    it('should initialize with canGoForward as false', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.canGoForward).toBe(false);
    });

    it('should initialize with Home breadcrumb', () => {
      const { result } = renderHook(() => useNavigationStore());
      expect(result.current.breadcrumbs).toEqual([{ label: 'Home', entry: null, isActive: true }]);
    });
  });

  describe('navigateTo', () => {
    it('should add entry to history', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Test Skill',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0]).toEqual(entry);
      expect(result.current.currentIndex).toBe(0);
    });

    it('should update breadcrumbs when navigating to skill', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Test Skill',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('Test Skill');
    });

    it('should enable going back after adding entry', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 2' },
        timestamp: Date.now(),
        label: 'Skill 2',
      };

      act(() => {
        result.current.navigateTo(entry1);
      });

      expect(result.current.canGoBack).toBe(false);

      act(() => {
        result.current.navigateTo(entry2);
      });

      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(false);
    });

    it('should clear forward history when navigating from middle', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 2' },
        timestamp: Date.now(),
        label: 'Skill 2',
      };

      const entry3: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 3' },
        timestamp: Date.now(),
        label: 'Skill 3',
      };

      // Add 3 entries
      act(() => {
        result.current.navigateTo(entry1);
        result.current.navigateTo(entry2);
        result.current.navigateTo(entry3);
      });

      expect(result.current.history).toHaveLength(3);

      // Go back twice
      act(() => {
        result.current.goBack();
        result.current.goBack();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canGoForward).toBe(true);

      // Navigate to new entry (should clear forward history)
      const newEntry: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'New Skill' },
        timestamp: Date.now(),
        label: 'New Skill',
      };

      act(() => {
        result.current.navigateTo(newEntry);
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.canGoForward).toBe(false);
      expect(result.current.history[1].label).toBe('New Skill');
    });

    it('should limit history to MAX_HISTORY_SIZE', () => {
      const { result } = renderHook(() => useNavigationStore());

      // Add 60 entries (max is 50)
      act(() => {
        for (let i = 0; i < 60; i++) {
          const entry: NavigationEntry = {
            type: 'skill',
            skill: { ...mockSkill, name: `Skill ${i}` },
            timestamp: Date.now(),
            label: `Skill ${i}`,
          };
          result.current.navigateTo(entry);
        }
      });

      expect(result.current.history).toHaveLength(50);
      // Should keep the most recent entries
      expect(result.current.history[49].label).toBe('Skill 59');
    });
  });

  describe('goBack', () => {
    it('should navigate back in history', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 2' },
        timestamp: Date.now(),
        label: 'Skill 2',
      };

      act(() => {
        result.current.navigateTo(entry1);
        result.current.navigateTo(entry2);
      });

      expect(result.current.currentIndex).toBe(1);

      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.canGoForward).toBe(true);
    });

    it('should not go back if at beginning', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Test Skill',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.goBack();
      });

      // Should not go below 0
      expect(result.current.currentIndex).toBe(0);
    });

    it('should update breadcrumbs when going back', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'reference',
        skill: mockSkill,
        referenceIndex: 0,
        referencePath: '/test/ref.md',
        timestamp: Date.now(),
        label: 'ref.md',
      };

      act(() => {
        result.current.navigateTo(entry1);
        result.current.navigateTo(entry2);
      });

      expect(result.current.breadcrumbs).toHaveLength(3); // Home, Skill, Reference

      act(() => {
        result.current.goBack();
      });

      expect(result.current.breadcrumbs).toHaveLength(2); // Home, Skill
    });
  });

  describe('goForward', () => {
    it('should navigate forward in history', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 2' },
        timestamp: Date.now(),
        label: 'Skill 2',
      };

      act(() => {
        result.current.navigateTo(entry1);
        result.current.navigateTo(entry2);
        result.current.goBack();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canGoForward).toBe(true);

      act(() => {
        result.current.goForward();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canGoForward).toBe(false);
    });

    it('should not go forward if at end', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Test Skill',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canGoForward).toBe(false);

      act(() => {
        result.current.goForward();
      });

      // Should remain at end
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history and reset state', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry1: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        timestamp: Date.now(),
        label: 'Skill 1',
      };

      const entry2: NavigationEntry = {
        type: 'skill',
        skill: { ...mockSkill, name: 'Skill 2' },
        timestamp: Date.now(),
        label: 'Skill 2',
      };

      act(() => {
        result.current.navigateTo(entry1);
        result.current.navigateTo(entry2);
      });

      expect(result.current.history).toHaveLength(2);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.canGoForward).toBe(false);
      expect(result.current.breadcrumbs).toEqual([{ label: 'Home', entry: null, isActive: true }]);
    });
  });

  describe('Breadcrumb Generation', () => {
    it('should generate correct breadcrumbs for reference navigation', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'reference',
        skill: mockSkill,
        referenceIndex: 0,
        referencePath: '/test/path/reference.md',
        timestamp: Date.now(),
        label: 'reference.md',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('Test Skill');
      expect(result.current.breadcrumbs[2].label).toBe('reference.md');
      expect(result.current.breadcrumbs[2].isActive).toBe(true);
    });

    it('should generate correct breadcrumbs for script navigation', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'script',
        skill: mockSkill,
        scriptIndex: 2,
        timestamp: Date.now(),
        label: 'Script 3',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('Test Skill');
      expect(result.current.breadcrumbs[2].label).toBe('Script 3');
    });

    it('should generate correct breadcrumbs for tab navigation', () => {
      const { result } = renderHook(() => useNavigationStore());

      const entry: NavigationEntry = {
        type: 'skill',
        skill: mockSkill,
        tab: 'triggers',
        timestamp: Date.now(),
        label: 'Test Skill',
      };

      act(() => {
        result.current.navigateTo(entry);
      });

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('Test Skill');
      expect(result.current.breadcrumbs[2].label).toBe('Triggers');
    });
  });
});
