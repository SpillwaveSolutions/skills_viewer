/**
 * TypeScript types for keyboard shortcuts feature
 *
 * These types define the structure for keyboard shortcuts, platform detection,
 * and shortcut grouping for the help modal display.
 */

/**
 * Platform modifier key types
 */
export type PlatformType = 'mac' | 'windows' | 'linux';
export type ModifierKey = 'Cmd' | 'Ctrl';
export type ModifierSymbol = '⌘' | 'Ctrl';

/**
 * Keyboard shortcut context (where the shortcut is active)
 */
export type ShortcutContext =
  | 'global' // Active everywhere in the app
  | 'list' // Active when skill list has focus
  | 'detail' // Active when viewing skill details
  | 'modal'; // Active when modal is open

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;

  /** Human-readable label (e.g., "Search", "Next Tab") */
  label: string;

  /** Description of what the shortcut does */
  description: string;

  /** Key code (e.g., "f", "1", "ArrowDown", "Escape") */
  key: string;

  /** Whether Cmd (macOS) or Ctrl (Windows/Linux) is required */
  requiresModifier: boolean;

  /** Whether Shift is required */
  requiresShift: boolean;

  /** Context where this shortcut is active */
  context: ShortcutContext;
}

/**
 * Shortcut group for help modal display
 */
export interface ShortcutGroup {
  /** Group title (e.g., "Search", "Navigation", "Tabs") */
  title: string;

  /** Shortcuts in this group */
  shortcuts: KeyboardShortcut[];
}

/**
 * Platform modifier information for displaying shortcuts
 */
export interface PlatformModifier {
  /** Detected platform */
  platform: PlatformType;

  /** Whether user is on macOS */
  isMac: boolean;

  /** Modifier key name (Cmd or Ctrl) */
  modifierKey: ModifierKey;

  /** Modifier key symbol for display */
  modifierSymbol: ModifierSymbol;
}
