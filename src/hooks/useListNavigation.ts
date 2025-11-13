import { useEffect } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';

interface UseListNavigationProps {
  skillCount: number;
  onSelectSkill: (index: number) => void;
}

interface UseListNavigationReturn {
  highlightedIndex: number | null;
}

export const useListNavigation = ({
  skillCount,
  onSelectSkill,
}: UseListNavigationProps): UseListNavigationReturn => {
  const highlightedIndex = useKeyboardStore((state) => state.highlightedSkillIndex);
  const setHighlightedIndex = useKeyboardStore((state) => state.setHighlightedSkillIndex);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle empty list
      if (skillCount === 0) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((current) => {
            if (current === null) {
              // No selection - highlight first
              return 0;
            }
            // Move to next, wrap to first if at end
            return (current + 1) % skillCount;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((current) => {
            if (current === null) {
              // No selection - highlight last
              return skillCount - 1;
            }
            // Move to previous, wrap to last if at beginning
            return current === 0 ? skillCount - 1 : current - 1;
          });
          break;

        case 'Enter':
          event.preventDefault();
          // Read current value from store to avoid stale closure
          const currentIndex = useKeyboardStore.getState().highlightedSkillIndex;
          if (currentIndex !== null) {
            onSelectSkill(currentIndex);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setHighlightedIndex(null);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [skillCount, onSelectSkill, setHighlightedIndex]);

  return {
    highlightedIndex,
  };
};
