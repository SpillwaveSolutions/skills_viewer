/**
 * Unit tests for keyboard utilities
 *
 * TDD Approach: These tests are written BEFORE the utility implementation.
 * They should FAIL until src/utils/keyboardUtils.ts is implemented.
 */

import { describe, it, expect } from 'vitest';
import {
  groupShortcutsByContext,
  formatKeyCombo,
  checkKeyMatch,
} from '@/utils/keyboardUtils';
import type { KeyboardShortcut } from '@/types/keyboard';

describe('keyboardUtils', () => {
  describe('groupShortcutsByContext', () => {
    it('should group shortcuts by context', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'search',
          label: 'Search',
          description: 'Focus search bar',
          key: 'f',
          requiresModifier: true,
          requiresShift: false,
          context: 'global',
        },
        {
          id: 'help',
          label: 'Help',
          description: 'Show keyboard shortcuts',
          key: '/',
          requiresModifier: false,
          requiresShift: true,
          context: 'global',
        },
        {
          id: 'down',
          label: 'Next',
          description: 'Highlight next skill',
          key: 'ArrowDown',
          requiresModifier: false,
          requiresShift: false,
          context: 'list',
        },
      ];

      const grouped = groupShortcutsByContext(shortcuts);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].title).toBe('Global');
      expect(grouped[0].shortcuts).toHaveLength(2);
      expect(grouped[1].title).toBe('List');
      expect(grouped[1].shortcuts).toHaveLength(1);
    });

    it('should handle empty shortcut list', () => {
      const grouped = groupShortcutsByContext([]);
      expect(grouped).toHaveLength(0);
    });

    it('should sort contexts consistently (global, list, detail, modal)', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          id: 'modal1',
          label: 'Close',
          description: 'Close modal',
          key: 'Escape',
          requiresModifier: false,
          requiresShift: false,
          context: 'modal',
        },
        {
          id: 'list1',
          label: 'Down',
          description: 'Move down',
          key: 'ArrowDown',
          requiresModifier: false,
          requiresShift: false,
          context: 'list',
        },
        {
          id: 'global1',
          label: 'Search',
          description: 'Search',
          key: 'f',
          requiresModifier: true,
          requiresShift: false,
          context: 'global',
        },
        {
          id: 'detail1',
          label: 'Tab',
          description: 'Switch tab',
          key: '1',
          requiresModifier: true,
          requiresShift: false,
          context: 'detail',
        },
      ];

      const grouped = groupShortcutsByContext(shortcuts);

      expect(grouped[0].title).toBe('Global');
      expect(grouped[1].title).toBe('List');
      expect(grouped[2].title).toBe('Detail');
      expect(grouped[3].title).toBe('Modal');
    });
  });

  describe('formatKeyCombo', () => {
    it('should format simple key', () => {
      const formatted = formatKeyCombo({
        key: 'f',
        requiresModifier: false,
        requiresShift: false,
        modifierSymbol: '⌘',
      });

      expect(formatted).toBe('F');
    });

    it('should format key with modifier (macOS)', () => {
      const formatted = formatKeyCombo({
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        modifierSymbol: '⌘',
      });

      expect(formatted).toBe('⌘ F');
    });

    it('should format key with modifier (Windows/Linux)', () => {
      const formatted = formatKeyCombo({
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        modifierSymbol: 'Ctrl',
      });

      expect(formatted).toBe('Ctrl F');
    });

    it('should format key with Shift', () => {
      const formatted = formatKeyCombo({
        key: '/',
        requiresModifier: false,
        requiresShift: true,
        modifierSymbol: '⌘',
      });

      expect(formatted).toBe('Shift /');
    });

    it('should format key with modifier and Shift', () => {
      const formatted = formatKeyCombo({
        key: 'a',
        requiresModifier: true,
        requiresShift: true,
        modifierSymbol: '⌘',
      });

      expect(formatted).toBe('⌘ Shift A');
    });

    it('should format special keys nicely', () => {
      expect(
        formatKeyCombo({
          key: 'ArrowDown',
          requiresModifier: false,
          requiresShift: false,
          modifierSymbol: '⌘',
        })
      ).toBe('↓');

      expect(
        formatKeyCombo({
          key: 'ArrowUp',
          requiresModifier: false,
          requiresShift: false,
          modifierSymbol: '⌘',
        })
      ).toBe('↑');

      expect(
        formatKeyCombo({
          key: 'Escape',
          requiresModifier: false,
          requiresShift: false,
          modifierSymbol: '⌘',
        })
      ).toBe('Esc');

      expect(
        formatKeyCombo({
          key: 'Enter',
          requiresModifier: false,
          requiresShift: false,
          modifierSymbol: '⌘',
        })
      ).toBe('⏎');
    });
  });

  describe('checkKeyMatch', () => {
    it('should match simple key press', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: 'f',
        requiresModifier: false,
        requiresShift: false,
        isMac: true,
      });

      expect(matches).toBe(true);
    });

    it('should match Cmd+F on macOS', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        isMac: true,
      });

      expect(matches).toBe(true);
    });

    it('should match Ctrl+F on Windows/Linux', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        isMac: false,
      });

      expect(matches).toBe(true);
    });

    it('should match Shift+/ (? key)', () => {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        metaKey: false,
        ctrlKey: false,
        shiftKey: true,
      });

      const matches = checkKeyMatch(event, {
        key: '/',
        requiresModifier: false,
        requiresShift: true,
        isMac: true,
      });

      expect(matches).toBe(true);
    });

    it('should not match when modifier is required but missing', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        isMac: true,
      });

      expect(matches).toBe(false);
    });

    it('should not match when Shift is required but missing', () => {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: '/',
        requiresModifier: false,
        requiresShift: true,
        isMac: true,
      });

      expect(matches).toBe(false);
    });

    it('should be case-insensitive for key matching', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'F',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });

      const matches = checkKeyMatch(event, {
        key: 'f',
        requiresModifier: true,
        requiresShift: false,
        isMac: true,
      });

      expect(matches).toBe(true);
    });
  });
});
