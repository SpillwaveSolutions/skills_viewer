/**
 * Unit tests for useKeyboardShortcuts hook
 *
 * TDD Approach: These tests are written BEFORE the hook implementation.
 * They should FAIL until src/hooks/useKeyboardShortcuts.ts is implemented.
 *
 * This hook captures keyboard events globally and updates the keyboard store.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset store before each test
    useKeyboardStore.getState().reset();
  });

  afterEach(() => {
    // Clean up event listeners
    vi.restoreAllMocks();
  });

  describe('Cmd/Ctrl+F Detection (US1)', () => {
    it('should set searchFocusRequested to true on Meta+F (macOS)', () => {
      // Set platform to macOS
      vi.stubGlobal('navigator', { ...navigator, platform: 'MacIntel' });

      renderHook(() => useKeyboardShortcuts());

      // Simulate Cmd+F on macOS
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.searchFocusRequested).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should set searchFocusRequested to true on Ctrl+F (Windows/Linux)', () => {
      // Set platform to Windows
      vi.stubGlobal('navigator', { ...navigator, platform: 'Win32' });

      renderHook(() => useKeyboardShortcuts());

      // Simulate Ctrl+F on Windows/Linux
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.searchFocusRequested).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should call preventDefault on Cmd/Ctrl+F', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trigger on F key without modifier', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.searchFocusRequested).toBe(false);
    });

    it('should be case-insensitive (F or f both work)', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: 'F', // Uppercase
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.searchFocusRequested).toBe(true);
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('Multiple Shortcuts', () => {
    it('should not interfere with other keys', () => {
      renderHook(() => useKeyboardShortcuts());

      // Press some other key
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.searchFocusRequested).toBe(false);
    });
  });

  describe('? Key Detection (US4)', () => {
    it('should set isHelpModalOpen to true on ? key', () => {
      renderHook(() => useKeyboardShortcuts());

      // ? key is typically Shift+/
      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.isHelpModalOpen).toBe(true);
    });

    it('should handle / with Shift (alternative for ?)', () => {
      renderHook(() => useKeyboardShortcuts());

      // Some keyboards might report this as /
      const event = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.isHelpModalOpen).toBe(true);
    });

    it('should call preventDefault on ? key', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trigger on / without Shift', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: false,
        metaKey: false,
        ctrlKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.isHelpModalOpen).toBe(false);
    });

    it('should not trigger on ? when input is focused', () => {
      renderHook(() => useKeyboardShortcuts());

      // Create and focus an input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
        bubbles: true,
      });

      input.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      // Should not open help modal when typing in input
      expect(state.isHelpModalOpen).toBe(false);

      document.body.removeChild(input);
    });
  });

  describe('Tab Navigation (US2): Cmd/Ctrl+1-6', () => {
    it('should set activeTabIndex to 0 on Cmd/Ctrl+1 (Overview)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(0);
    });

    it('should set activeTabIndex to 1 on Cmd/Ctrl+2 (Content)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '2',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(1);
    });

    it('should set activeTabIndex to 2 on Cmd/Ctrl+3 (Triggers)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '3',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(2);
    });

    it('should set activeTabIndex to 3 on Cmd/Ctrl+4 (Diagram)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '4',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(3);
    });

    it('should set activeTabIndex to 4 on Cmd/Ctrl+5 (References)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '5',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(4);
    });

    it('should set activeTabIndex to 5 on Cmd/Ctrl+6 (Scripts)', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '6',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.activeTabIndex).toBe(5);
    });

    it('should call preventDefault on tab shortcut keys', () => {
      const { platform } = useKeyboardStore.getState();
      const isMac = platform === 'mac';

      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: '1',
        metaKey: isMac,
        ctrlKey: !isMac,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trigger on number without modifier key', () => {
      renderHook(() => useKeyboardShortcuts());

      // Reset to default
      useKeyboardStore.getState().setActiveTabIndex(0);

      const event = new KeyboardEvent('keydown', {
        key: '3',
        metaKey: false,
        ctrlKey: false,
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      // Should remain at default (0)
      expect(state.activeTabIndex).toBe(0);
    });
  });

  describe('List Navigation (US3): Arrow Keys', () => {
    beforeEach(() => {
      // Mock having 10 visible skills for testing
      useKeyboardStore.getState().setVisibleSkillCount(10);
    });

    it('should highlight first skill (index 0) on Down arrow when no highlight', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start with no highlight
      useKeyboardStore.getState().setHighlightedSkillIndex(null);

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.highlightedSkillIndex).toBe(0);
    });

    it('should move highlight to next skill on Down arrow', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start at index 1
      useKeyboardStore.getState().setHighlightedSkillIndex(1);

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.highlightedSkillIndex).toBe(2);
    });

    it('should move highlight to previous skill on Up arrow', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start at index 2
      useKeyboardStore.getState().setHighlightedSkillIndex(2);

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.highlightedSkillIndex).toBe(1);
    });

    it('should wrap to first when Down from last skill', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start at last skill (index 9 for count of 10)
      useKeyboardStore.getState().setHighlightedSkillIndex(9);

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      // Should wrap to first (0)
      expect(state.highlightedSkillIndex).toBe(0);
    });

    it('should wrap to last when Up from first skill', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start at first (0)
      useKeyboardStore.getState().setHighlightedSkillIndex(0);

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      // Should wrap to last (9 for count of 10)
      expect(state.highlightedSkillIndex).toBe(9);
    });

    it('should clear highlight on Escape', () => {
      renderHook(() => useKeyboardShortcuts());

      // Start with highlight
      useKeyboardStore.getState().setHighlightedSkillIndex(2);

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
      });

      window.dispatchEvent(event);

      const state = useKeyboardStore.getState();
      expect(state.highlightedSkillIndex).toBe(null);
    });

    it('should call preventDefault on arrow keys', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
