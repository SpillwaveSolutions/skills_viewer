/**
 * Keyboard utility functions
 *
 * Provides helper functions for:
 * - Grouping shortcuts by context for help modal display
 * - Formatting key combinations for display
 * - Checking if keyboard events match shortcut definitions
 */

import type {
  KeyboardShortcut,
  ShortcutGroup,
  ShortcutContext,
  ModifierSymbol,
} from '../types/keyboard';

/**
 * Context order for grouping (Global → List → Detail → Modal)
 */
const CONTEXT_ORDER: ShortcutContext[] = ['global', 'list', 'detail', 'modal'];

/**
 * Context title mapping
 */
const CONTEXT_TITLES: Record<ShortcutContext, string> = {
  global: 'Global',
  list: 'List',
  detail: 'Detail',
  modal: 'Modal',
};

/**
 * Group shortcuts by context for help modal display
 *
 * @param shortcuts - Array of keyboard shortcuts to group
 * @returns Array of shortcut groups sorted by context order
 *
 * @example
 * ```tsx
 * const shortcuts = getAllShortcuts();
 * const grouped = groupShortcutsByContext(shortcuts);
 * // Returns: [{ title: 'Global', shortcuts: [...] }, { title: 'List', shortcuts: [...] }]
 * ```
 */
export function groupShortcutsByContext(shortcuts: KeyboardShortcut[]): ShortcutGroup[] {
  if (shortcuts.length === 0) {
    return [];
  }

  // Group shortcuts by context
  const groupedMap = shortcuts.reduce(
    (acc, shortcut) => {
      const context = shortcut.context;
      if (!acc[context]) {
        acc[context] = [];
      }
      acc[context].push(shortcut);
      return acc;
    },
    {} as Record<ShortcutContext, KeyboardShortcut[]>
  );

  // Convert to ShortcutGroup array in correct order
  return CONTEXT_ORDER.filter((context) => groupedMap[context]).map((context) => ({
    title: CONTEXT_TITLES[context],
    shortcuts: groupedMap[context],
  }));
}

/**
 * Special key display mapping
 */
const SPECIAL_KEY_DISPLAY: Record<string, string> = {
  ArrowDown: '↓',
  ArrowUp: '↑',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
  Enter: '⏎',
  ' ': 'Space',
};

/**
 * Format a key combination for display
 *
 * @param options - Key combination options
 * @param options.key - The key code (e.g., 'f', 'ArrowDown', 'Escape')
 * @param options.requiresModifier - Whether Cmd/Ctrl is required
 * @param options.requiresShift - Whether Shift is required
 * @param options.modifierSymbol - The modifier symbol to use ('⌘' or 'Ctrl')
 * @returns Formatted key combination string
 *
 * @example
 * ```tsx
 * formatKeyCombo({ key: 'f', requiresModifier: true, requiresShift: false, modifierSymbol: '⌘' })
 * // Returns: '⌘ F'
 * ```
 */
export function formatKeyCombo(options: {
  key: string;
  requiresModifier: boolean;
  requiresShift: boolean;
  modifierSymbol: ModifierSymbol;
}): string {
  const { key, requiresModifier, requiresShift, modifierSymbol } = options;

  const parts: string[] = [];

  // Add modifier key if required
  if (requiresModifier) {
    parts.push(modifierSymbol);
  }

  // Add Shift if required
  if (requiresShift) {
    parts.push('Shift');
  }

  // Add the key itself (with special formatting for certain keys)
  const displayKey = SPECIAL_KEY_DISPLAY[key] ?? key.toUpperCase();
  parts.push(displayKey);

  return parts.join(' ');
}

/**
 * Check if a keyboard event matches a shortcut definition
 *
 * @param event - The keyboard event to check
 * @param shortcut - The shortcut definition
 * @param shortcut.key - The key code to match
 * @param shortcut.requiresModifier - Whether Cmd (macOS) or Ctrl (Windows/Linux) is required
 * @param shortcut.requiresShift - Whether Shift is required
 * @param shortcut.isMac - Whether the user is on macOS
 * @returns True if the event matches the shortcut definition
 *
 * @example
 * ```tsx
 * const event = new KeyboardEvent('keydown', { key: 'f', metaKey: true });
 * checkKeyMatch(event, { key: 'f', requiresModifier: true, requiresShift: false, isMac: true })
 * // Returns: true
 * ```
 */
export function checkKeyMatch(
  event: KeyboardEvent,
  shortcut: {
    key: string;
    requiresModifier: boolean;
    requiresShift: boolean;
    isMac: boolean;
  }
): boolean {
  // Check key match (case-insensitive)
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }

  // Check modifier key
  const hasModifier = shortcut.isMac ? event.metaKey : event.ctrlKey;
  if (shortcut.requiresModifier && !hasModifier) {
    return false;
  }
  if (!shortcut.requiresModifier && hasModifier) {
    return false;
  }

  // Check Shift key
  if (shortcut.requiresShift && !event.shiftKey) {
    return false;
  }
  if (!shortcut.requiresShift && event.shiftKey) {
    return false;
  }

  return true;
}
