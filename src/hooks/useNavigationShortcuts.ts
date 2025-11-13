/**
 * Navigation keyboard shortcuts hook
 *
 * Implements navigation-specific keyboard shortcuts:
 * - Alt+Left: Go back in history
 * - Alt+Right: Go forward in history
 * - Cmd/Ctrl+B: Toggle breadcrumbs (future enhancement)
 *
 * These shortcuts work globally and integrate with the navigation store.
 */

import { useEffect } from 'react';
import { useNavigationStore } from '../stores/navigationStore';
import { useSkillStore } from '../stores';

/**
 * Hook to enable navigation keyboard shortcuts
 */
export const useNavigationShortcuts = () => {
  const { canGoBack, canGoForward, goBack, goForward, history, currentIndex } =
    useNavigationStore();
  const selectSkill = useSkillStore((state) => state.selectSkill);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Alt+Left: Go back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();

        if (canGoBack) {
          goBack();

          // Update skill selection based on new current entry
          const newIndex = currentIndex - 1;
          const entry = history[newIndex];
          if (entry?.skill) {
            selectSkill(entry.skill);
          } else {
            selectSkill(null);
          }
        }
        return;
      }

      // Alt+Right: Go forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();

        if (canGoForward) {
          goForward();

          // Update skill selection based on new current entry
          const newIndex = currentIndex + 1;
          const entry = history[newIndex];
          if (entry?.skill) {
            selectSkill(entry.skill);
          } else {
            selectSkill(null);
          }
        }
        return;
      }
    };

    // Register global keyboard listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canGoBack, canGoForward, goBack, goForward, history, currentIndex, selectSkill]);
};
