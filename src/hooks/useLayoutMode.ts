import { useLayoutStore } from '../stores/layoutStore';
import { LayoutMode } from '../types/layout';

/**
 * Hook return type with computed properties
 */
interface UseLayoutModeReturn {
  mode: LayoutMode;
  isCompact: boolean;
  isStandard: boolean;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
}

/**
 * Custom hook for layout mode management
 *
 * Wraps the layout store and provides computed boolean flags
 * for convenient conditional rendering.
 *
 * @returns Layout mode state and actions with computed flags
 *
 * @example
 * ```tsx
 * function SkillHeader() {
 *   const { mode, isCompact, toggleMode } = useLayoutMode();
 *
 *   return (
 *     <header>
 *       {isCompact ? <InlineStats /> : <Description />}
 *       <button onClick={toggleMode}>Toggle Mode</button>
 *     </header>
 *   );
 * }
 * ```
 */
export function useLayoutMode(): UseLayoutModeReturn {
  const { mode, setMode, toggleMode } = useLayoutStore();

  return {
    mode,
    isCompact: mode === 'compact',
    isStandard: mode === 'standard',
    setMode,
    toggleMode,
  };
}
