import { create } from 'zustand';
import { LayoutMode } from '../types/layout';
import * as LocalStorage from '../utils/localStorage';

/**
 * Layout store state interface
 */
interface LayoutState {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
}

/**
 * Layout mode store
 *
 * Manages the current layout mode (standard vs compact) and persists
 * the preference to localStorage.
 *
 * Features:
 * - Initializes from localStorage on first load
 * - Persists mode changes automatically
 * - Provides toggle helper for switching modes
 */
export const useLayoutStore = create<LayoutState>((set, get) => ({
  // Initialize from localStorage, default to 'standard'
  mode: LocalStorage.get<LayoutMode>('layoutMode', 'standard'),

  /**
   * Set the layout mode and persist to localStorage
   *
   * @param mode - The layout mode to set ('standard' or 'compact')
   */
  setMode: (mode: LayoutMode) => {
    set({ mode });
    LocalStorage.set('layoutMode', mode);
  },

  /**
   * Toggle between standard and compact modes
   */
  toggleMode: () => {
    const currentMode = get().mode;
    const newMode: LayoutMode = currentMode === 'standard' ? 'compact' : 'standard';
    get().setMode(newMode);
  },
}));
