/**
 * Unit tests for keyboardStore (Zustand store)
 *
 * TDD Approach: These tests are written BEFORE the store implementation.
 * They should FAIL until src/stores/keyboardStore.ts is implemented.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('keyboardStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useKeyboardStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should initialize with searchFocusRequested as false', () => {
      const { result } = renderHook(() => useKeyboardStore());
      expect(result.current.searchFocusRequested).toBe(false);
    });

    it('should initialize with highlightedSkillIndex as null', () => {
      const { result } = renderHook(() => useKeyboardStore());
      expect(result.current.highlightedSkillIndex).toBeNull();
    });

    it('should initialize with activeTabIndex as 0', () => {
      const { result } = renderHook(() => useKeyboardStore());
      expect(result.current.activeTabIndex).toBe(0);
    });

    it('should initialize with isHelpModalOpen as false', () => {
      const { result } = renderHook(() => useKeyboardStore());
      expect(result.current.isHelpModalOpen).toBe(false);
    });

    it('should initialize with default platform as mac', () => {
      const { result } = renderHook(() => useKeyboardStore());
      expect(result.current.platform).toBe('mac');
      expect(result.current.modifierKey).toBe('Cmd');
      expect(result.current.modifierSymbol).toBe('⌘');
    });
  });

  describe('setSearchFocusRequested', () => {
    it('should update searchFocusRequested to true', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setSearchFocusRequested(true);
      });

      expect(result.current.searchFocusRequested).toBe(true);
    });

    it('should update searchFocusRequested to false', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setSearchFocusRequested(true);
      });

      act(() => {
        result.current.setSearchFocusRequested(false);
      });

      expect(result.current.searchFocusRequested).toBe(false);
    });
  });

  describe('setHighlightedSkillIndex', () => {
    it('should update highlightedSkillIndex to 0', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setHighlightedSkillIndex(0);
      });

      expect(result.current.highlightedSkillIndex).toBe(0);
    });

    it('should update highlightedSkillIndex to 5', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setHighlightedSkillIndex(5);
      });

      expect(result.current.highlightedSkillIndex).toBe(5);
    });

    it('should clear highlightedSkillIndex with null', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setHighlightedSkillIndex(3);
      });

      act(() => {
        result.current.setHighlightedSkillIndex(null);
      });

      expect(result.current.highlightedSkillIndex).toBeNull();
    });
  });

  describe('setActiveTabIndex', () => {
    it('should update activeTabIndex to 1', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setActiveTabIndex(1);
      });

      expect(result.current.activeTabIndex).toBe(1);
    });

    it('should update activeTabIndex to 5', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setActiveTabIndex(5);
      });

      expect(result.current.activeTabIndex).toBe(5);
    });

    it('should handle setting activeTabIndex to null', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setActiveTabIndex(null);
      });

      expect(result.current.activeTabIndex).toBeNull();
    });
  });

  describe('setHelpModalOpen', () => {
    it('should update isHelpModalOpen to true', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setHelpModalOpen(true);
      });

      expect(result.current.isHelpModalOpen).toBe(true);
    });

    it('should update isHelpModalOpen to false', () => {
      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.setHelpModalOpen(true);
      });

      act(() => {
        result.current.setHelpModalOpen(false);
      });

      expect(result.current.isHelpModalOpen).toBe(false);
    });
  });

  describe('detectPlatform', () => {
    it('should detect macOS platform', () => {
      // Use vi.stubGlobal to mock navigator
      const originalPlatform = navigator.platform;
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacIntel' });

      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.detectPlatform();
      });

      expect(result.current.platform).toBe('mac');
      expect(result.current.modifierKey).toBe('Cmd');
      expect(result.current.modifierSymbol).toBe('⌘');

      // Restore original platform
      vi.stubGlobal('navigator', { ...navigator, platform: originalPlatform });
    });

    it('should detect Windows platform', () => {
      const originalPlatform = navigator.platform;
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win32' });

      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.detectPlatform();
      });

      expect(result.current.platform).toBe('windows');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.stubGlobal('navigator', { ...navigator, platform: originalPlatform });
    });

    it('should detect Linux platform', () => {
      const originalPlatform = navigator.platform;
      vi.stubGlobal('navigator', { ...navigator, platform: 'Linux x86_64' });

      const { result } = renderHook(() => useKeyboardStore());

      act(() => {
        result.current.detectPlatform();
      });

      expect(result.current.platform).toBe('linux');
      expect(result.current.modifierKey).toBe('Ctrl');
      expect(result.current.modifierSymbol).toBe('Ctrl');

      vi.stubGlobal('navigator', { ...navigator, platform: originalPlatform });
    });
  });

  describe('reset', () => {
    it('should reset all keyboard state to initial values', () => {
      const { result } = renderHook(() => useKeyboardStore());

      // Set all state to non-default values
      act(() => {
        result.current.setSearchFocusRequested(true);
        result.current.setHighlightedSkillIndex(3);
        result.current.setActiveTabIndex(2);
        result.current.setHelpModalOpen(true);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all state is back to initial values
      expect(result.current.searchFocusRequested).toBe(false);
      expect(result.current.highlightedSkillIndex).toBeNull();
      expect(result.current.activeTabIndex).toBe(0);
      expect(result.current.isHelpModalOpen).toBe(false);
    });

    it('should not reset platform detection state', () => {
      const { result } = renderHook(() => useKeyboardStore());

      // Detect platform
      act(() => {
        result.current.detectPlatform();
      });

      const platformBefore = result.current.platform;

      // Reset
      act(() => {
        result.current.reset();
      });

      // Platform should remain unchanged
      expect(result.current.platform).toBe(platformBefore);
    });
  });
});
