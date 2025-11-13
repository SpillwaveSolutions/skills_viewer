/**
 * Zustand store for keyboard shortcuts state
 *
 * This store manages all keyboard-related UI state including:
 * - Search focus requests (US1: Cmd/Ctrl+F)
 * - List navigation highlight (US3: Arrow keys)
 * - Tab navigation active index (US2: Cmd/Ctrl+1-6)
 * - Help modal visibility (US4: ? key)
 * - Platform detection (macOS vs Windows/Linux)
 *
 * All state is ephemeral (not persisted).
 */

import { create } from 'zustand';
import type { PlatformType, ModifierKey, ModifierSymbol } from '../types/keyboard';

/**
 * Keyboard state interface
 */
export interface KeyboardState {
  // Focus state (US1: Search focus)
  searchFocusRequested: boolean;
  setSearchFocusRequested: (requested: boolean) => void;

  // List navigation state (US3: Arrow keys)
  highlightedSkillIndex: number | null;
  setHighlightedSkillIndex: (index: number | null) => void;
  visibleSkillCount: number;
  setVisibleSkillCount: (count: number) => void;

  // Tab navigation state (US2: Cmd/Ctrl+1-6)
  activeTabIndex: number | null;
  setActiveTabIndex: (index: number | null) => void;

  // Help modal state (US4: ? key)
  isHelpModalOpen: boolean;
  setHelpModalOpen: (open: boolean) => void;

  // Platform detection
  platform: PlatformType;
  modifierKey: ModifierKey;
  modifierSymbol: ModifierSymbol;
  detectPlatform: () => void;

  // Reset all keyboard state
  reset: () => void;
}

/**
 * Zustand keyboard store
 *
 * Default state:
 * - searchFocusRequested: false
 * - highlightedSkillIndex: null (no highlight)
 * - activeTabIndex: 0 (Overview tab when skill selected)
 * - isHelpModalOpen: false
 * - platform: 'mac' (detected on first mount)
 * - modifierKey: 'Cmd' (for macOS)
 * - modifierSymbol: '⌘' (for macOS)
 */
export const useKeyboardStore = create<KeyboardState>((set) => ({
  // Default state
  searchFocusRequested: false,
  highlightedSkillIndex: null,
  visibleSkillCount: 0,
  activeTabIndex: 0,
  isHelpModalOpen: false,
  platform: 'mac',
  modifierKey: 'Cmd',
  modifierSymbol: '⌘',

  // Actions
  setSearchFocusRequested: (requested) => set({ searchFocusRequested: requested }),

  setHighlightedSkillIndex: (index) => set({ highlightedSkillIndex: index }),

  setVisibleSkillCount: (count) => set({ visibleSkillCount: count }),

  setActiveTabIndex: (index) => set({ activeTabIndex: index }),

  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),

  /**
   * Detect platform and set appropriate modifier key
   * - macOS: Cmd (⌘)
   * - Windows: Ctrl
   * - Linux: Ctrl
   */
  detectPlatform: () => {
    const platformString = navigator.platform.toUpperCase();
    const isMac = platformString.indexOf('MAC') >= 0;
    const isWindows = platformString.indexOf('WIN') >= 0;

    const platform: PlatformType = isMac ? 'mac' : isWindows ? 'windows' : 'linux';
    const modifierKey: ModifierKey = isMac ? 'Cmd' : 'Ctrl';
    const modifierSymbol: ModifierSymbol = isMac ? '⌘' : 'Ctrl';

    set({
      platform,
      modifierKey,
      modifierSymbol,
    });
  },

  /**
   * Reset all keyboard state to initial values
   * (platform detection state is NOT reset)
   */
  reset: () =>
    set({
      searchFocusRequested: false,
      highlightedSkillIndex: null,
      activeTabIndex: 0,
      isHelpModalOpen: false,
    }),
}));
