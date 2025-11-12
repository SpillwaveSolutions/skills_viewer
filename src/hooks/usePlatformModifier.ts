/**
 * usePlatformModifier hook
 *
 * Detects the user's operating system and returns appropriate modifier key information.
 * This hook is used to display platform-appropriate shortcuts in the UI:
 * - macOS: Cmd (⌘)
 * - Windows: Ctrl
 * - Linux: Ctrl
 *
 * The detection is performed once on mount and the result is memoized.
 *
 * @returns {PlatformModifier} Platform information including modifier keys
 *
 * @example
 * ```tsx
 * function ShortcutDisplay() {
 *   const { modifierSymbol } = usePlatformModifier();
 *   return <div>{modifierSymbol} + F to search</div>;
 * }
 * ```
 */

import { useMemo } from 'react';
import type { PlatformModifier } from '../types/keyboard';

export function usePlatformModifier(): PlatformModifier {
  return useMemo(() => {
    // Detect platform from navigator.platform
    const platformString = navigator.platform.toUpperCase();

    // Check for macOS (MacIntel, MacPPC, Mac68K)
    const isMac = platformString.indexOf('MAC') >= 0;

    // Check for Windows (Win32, Win64, Windows)
    const isWindows = platformString.indexOf('WIN') >= 0;

    // Determine platform type
    const platform = isMac ? 'mac' : isWindows ? 'windows' : 'linux';

    // Map platform to modifier key
    const modifierKey = isMac ? 'Cmd' : 'Ctrl';
    const modifierSymbol = isMac ? '⌘' : 'Ctrl';

    return {
      platform,
      isMac,
      modifierKey,
      modifierSymbol,
    };
  }, []); // Empty dependency array - detect once on mount
}
