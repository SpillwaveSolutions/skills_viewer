/**
 * useKeyboardShortcuts hook
 *
 * Captures global keyboard events and updates the keyboard store.
 * Handles keyboard shortcuts for:
 * - US1: Cmd/Ctrl+F (search focus)
 * - US2: Cmd/Ctrl+1-6 (tab navigation)
 * - US3: Arrow keys (list navigation)
 * - US4: ? key (help modal)
 *
 * This hook should be called once at the app root level.
 */

import { useEffect } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';
import { usePlatformModifier } from './usePlatformModifier';

/**
 * Hook to handle global keyboard shortcuts
 *
 * Attaches a keydown event listener to window that intercepts shortcuts
 * and updates the keyboard store accordingly.
 *
 * @example
 * ```tsx
 * function App() {
 *   useKeyboardShortcuts(); // Call once at root
 *   return <YourApp />;
 * }
 * ```
 */
export function useKeyboardShortcuts(): void {
  const { isMac } = usePlatformModifier();
  const setSearchFocusRequested = useKeyboardStore((state) => state.setSearchFocusRequested);
  const isHelpModalOpen = useKeyboardStore((state) => state.isHelpModalOpen);
  const setHelpModalOpen = useKeyboardStore((state) => state.setHelpModalOpen);
  const setActiveTabIndex = useKeyboardStore((state) => state.setActiveTabIndex);
  const setHighlightedSkillIndex = useKeyboardStore((state) => state.setHighlightedSkillIndex);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement;

      // Don't trigger shortcuts when typing in input fields (except for Cmd/Ctrl+F)
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // US1: Cmd/Ctrl+F - Focus search
      if (key === 'f') {
        const hasModifier = isMac ? event.metaKey : event.ctrlKey;

        if (hasModifier && !event.shiftKey) {
          event.preventDefault();
          setSearchFocusRequested(true);
          return;
        }
      }

      // US4: ? (Shift+/) - Show help modal
      if ((key === '?' || (key === '/' && event.shiftKey)) && !isInput) {
        event.preventDefault();
        setHelpModalOpen(true);
        return;
      }

      // US2: Cmd/Ctrl+1-6 - Tab navigation
      const hasModifier = isMac ? event.metaKey : event.ctrlKey;
      if (hasModifier && key >= '1' && key <= '6' && !isInput && !isHelpModalOpen) {
        event.preventDefault();
        // Convert key to 0-based tab index (1->0, 2->1, etc.)
        const tabIndex = parseInt(key, 10) - 1;
        setActiveTabIndex(tabIndex);
        return;
      }

      // US3: Arrow Keys - List navigation
      if (key === 'arrowdown' || key === 'arrowup') {
        event.preventDefault();

        // Read current state directly from store to avoid stale closure
        const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;
        const currentCount = useKeyboardStore.getState().visibleSkillCount;

        if (currentCount === 0) return;

        if (key === 'arrowdown') {
          if (currentHighlight === null) {
            setHighlightedSkillIndex(0);
          } else {
            const nextIndex = (currentHighlight + 1) % currentCount;
            setHighlightedSkillIndex(nextIndex);
          }
        } else {
          // arrowup
          if (currentHighlight === null) {
            setHighlightedSkillIndex(currentCount - 1);
          } else {
            const prevIndex = currentHighlight === 0 ? currentCount - 1 : currentHighlight - 1;
            setHighlightedSkillIndex(prevIndex);
          }
        }
        return;
      }

      // Escape - Clear highlight
      if (key === 'escape') {
        const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;
        if (currentHighlight !== null) {
          setHighlightedSkillIndex(null);
        }
        return;
      }
    }

    // Attach global keyboard listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isMac,
    setSearchFocusRequested,
    isHelpModalOpen,
    setHelpModalOpen,
    setActiveTabIndex,
    setHighlightedSkillIndex,
  ]);
}
