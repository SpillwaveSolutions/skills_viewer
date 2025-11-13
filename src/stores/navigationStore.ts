/**
 * Zustand store for navigation state
 *
 * This store manages navigation history, breadcrumbs, and navigation actions including:
 * - History stack with current position
 * - Back/Forward navigation
 * - Breadcrumb generation
 * - Navigation to arbitrary entries
 *
 * All state is ephemeral (not persisted).
 */

import { create } from 'zustand';
import type { NavigationEntry, Breadcrumb } from '../types/navigation';

/**
 * Maximum number of history entries to keep
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Navigation state interface
 */
export interface NavigationState {
  // History stack and current position
  history: NavigationEntry[];
  currentIndex: number;

  // Computed state
  canGoBack: boolean;
  canGoForward: boolean;
  breadcrumbs: Breadcrumb[];

  // Actions
  goBack: () => void;
  goForward: () => void;
  navigateTo: (entry: NavigationEntry) => void;
  clearHistory: () => void;

  // Internal helpers
  updateComputedState: () => void;
}

/**
 * Generate breadcrumbs from current navigation entry
 */
const generateBreadcrumbs = (entry: NavigationEntry | null): Breadcrumb[] => {
  if (!entry) {
    return [{ label: 'Home', entry: null, isActive: true }];
  }

  const crumbs: Breadcrumb[] = [{ label: 'Home', entry: null, isActive: false }];

  // Add skill breadcrumb
  if (entry.skill) {
    crumbs.push({
      label: entry.skill.name,
      entry: { ...entry, type: 'skill', tab: 'content' },
      isActive: entry.type === 'skill' && !entry.referenceIndex && !entry.scriptIndex,
    });

    // Add reference breadcrumb if applicable
    if (entry.type === 'reference' && entry.referencePath) {
      const refName = entry.referencePath.split('/').pop() || 'Reference';
      crumbs.push({
        label: refName,
        entry,
        isActive: true,
      });
    }

    // Add script breadcrumb if applicable
    if (entry.type === 'script' && entry.scriptIndex !== undefined) {
      crumbs.push({
        label: `Script ${entry.scriptIndex + 1}`,
        entry,
        isActive: true,
      });
    }

    // Add tab breadcrumb if not on default tab
    if (entry.type === 'skill' && entry.tab && entry.tab !== 'content') {
      crumbs.push({
        label: entry.tab.charAt(0).toUpperCase() + entry.tab.slice(1),
        entry,
        isActive: true,
      });
    }
  }

  return crumbs;
};

/**
 * Zustand navigation store
 *
 * Default state:
 * - history: [] (empty history)
 * - currentIndex: -1 (no current entry)
 * - canGoBack: false
 * - canGoForward: false
 * - breadcrumbs: [{ label: 'Home', entry: null, isActive: true }]
 */
export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Default state
  history: [],
  currentIndex: -1,
  canGoBack: false,
  canGoForward: false,
  breadcrumbs: [{ label: 'Home', entry: null, isActive: true }],

  /**
   * Update computed state based on current history and index
   */
  updateComputedState: () => {
    const state = get();
    const canGoBack = state.currentIndex > 0;
    const canGoForward = state.currentIndex < state.history.length - 1;
    const currentEntry = state.history[state.currentIndex] || null;
    const breadcrumbs = generateBreadcrumbs(currentEntry);

    set({
      canGoBack,
      canGoForward,
      breadcrumbs,
    });
  },

  /**
   * Navigate back in history
   */
  goBack: () => {
    const state = get();
    if (state.canGoBack) {
      set({ currentIndex: state.currentIndex - 1 });
      state.updateComputedState();
    }
  },

  /**
   * Navigate forward in history
   */
  goForward: () => {
    const state = get();
    if (state.canGoForward) {
      set({ currentIndex: state.currentIndex + 1 });
      state.updateComputedState();
    }
  },

  /**
   * Navigate to a new entry
   * - Adds entry to history
   * - Clears forward history if navigating from middle of stack
   * - Limits history size to MAX_HISTORY_SIZE
   */
  navigateTo: (entry: NavigationEntry) => {
    const state = get();

    // Create new history by removing forward entries and adding new entry
    let newHistory = state.history.slice(0, state.currentIndex + 1);
    newHistory.push(entry);

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
    }

    set({
      history: newHistory,
      currentIndex: newHistory.length - 1,
    });

    state.updateComputedState();
  },

  /**
   * Clear all navigation history
   */
  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
    });
    get().updateComputedState();
  },
}));
