/**
 * API Contract: KeyboardShortcutsHelp Component
 *
 * Modal overlay component that displays all available keyboard shortcuts
 * organized by category. Uses Radix UI Dialog for accessibility.
 *
 * @module components/KeyboardShortcutsHelp
 * @since 0.2.0 (Feature 019)
 */

import type { KeyboardShortcut, ShortcutCategory } from './useKeyboardShortcuts';

/**
 * Props for KeyboardShortcutsHelp component
 *
 * @example
 * ```typescript
 * function App() {
 *   const [isHelpOpen, setIsHelpOpen] = useState(false);
 *   const { getAllShortcuts } = useKeyboardShortcuts();
 *
 *   return (
 *     <KeyboardShortcutsHelp
 *       isOpen={isHelpOpen}
 *       onClose={() => setIsHelpOpen(false)}
 *       shortcuts={getAllShortcuts()}
 *     />
 *   );
 * }
 * ```
 */
export interface KeyboardShortcutsHelpProps {
  /**
   * Whether the help overlay is currently visible
   *
   * Controls the open/closed state of the Radix Dialog.
   * When true, dialog is rendered and focused.
   * When false, dialog is unmounted.
   *
   * @example
   * ```typescript
   * const [isOpen, setIsOpen] = useState(false);
   *
   * // Open with Cmd/Ctrl+/
   * registerShortcut({
   *   id: 'help-toggle',
   *   key: '/',
   *   modifiers: ['ctrl', 'cmd'],
   *   handler: () => setIsOpen(true),
   *   description: 'Show keyboard shortcuts',
   *   category: 'Help'
   * });
   *
   * <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />
   * ```
   */
  isOpen: boolean;

  /**
   * Callback invoked when overlay should close
   *
   * Called when:
   * - User presses Escape key
   * - User clicks outside the dialog
   * - User clicks the Close button
   *
   * Parent component should set `isOpen` to false in this callback.
   *
   * @example
   * ```typescript
   * const [isOpen, setIsOpen] = useState(false);
   *
   * <KeyboardShortcutsHelp
   *   isOpen={isOpen}
   *   onClose={() => {
   *     setIsOpen(false);
   *     console.log('Help overlay closed');
   *   }}
   * />
   * ```
   */
  onClose: () => void;

  /**
   * Optional shortcuts to display
   *
   * If provided, displays these shortcuts. If omitted, component will
   * call `useKeyboardShortcuts().getAllShortcuts()` internally.
   *
   * Useful for testing or when parent component already has shortcuts loaded.
   *
   * @default undefined (will fetch shortcuts internally)
   *
   * @example With explicit shortcuts
   * ```typescript
   * const { getAllShortcuts } = useKeyboardShortcuts();
   * const shortcuts = getAllShortcuts();
   *
   * <KeyboardShortcutsHelp
   *   isOpen={true}
   *   onClose={() => {}}
   *   shortcuts={shortcuts}
   * />
   * ```
   *
   * @example Without shortcuts (auto-fetch)
   * ```typescript
   * // Component will call getAllShortcuts() internally
   * <KeyboardShortcutsHelp
   *   isOpen={true}
   *   onClose={() => {}}
   * />
   * ```
   */
  shortcuts?: Map<ShortcutCategory, KeyboardShortcut[]>;
}

/**
 * Component behavior specification
 *
 * ## Accessibility
 * - Uses Radix UI Dialog for WCAG 2.1 AA compliance
 * - Automatic focus trap (focus stays within dialog)
 * - Escape key closes dialog (built-in)
 * - Focus returns to trigger element on close
 * - ARIA attributes: aria-modal, aria-labelledby, aria-describedby
 *
 * ## Visual Design
 * - Centered modal overlay
 * - Semi-transparent backdrop (50% black)
 * - White content card with rounded corners
 * - Shortcuts grouped by category
 * - Keyboard shortcuts displayed as `<kbd>` elements
 * - Close button at bottom
 *
 * ## Keyboard Interactions
 * - Tab: Navigate between focusable elements
 * - Shift+Tab: Navigate backwards
 * - Escape: Close dialog
 * - Enter/Space on Close button: Close dialog
 *
 * ## Platform-Specific Display
 * - macOS: Show "Cmd" instead of "Ctrl"
 * - Windows/Linux: Show "Ctrl"
 * - Automatically detect platform and format shortcuts accordingly
 *
 * @example Full implementation
 * ```tsx
 * import * as Dialog from '@radix-ui/react-dialog';
 * import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
 * import type { KeyboardShortcutsHelpProps } from './KeyboardShortcutsHelp.interface';
 *
 * export function KeyboardShortcutsHelp({
 *   isOpen,
 *   onClose,
 *   shortcuts: providedShortcuts
 * }: KeyboardShortcutsHelpProps) {
 *   const { getAllShortcuts } = useKeyboardShortcuts();
 *   const shortcuts = providedShortcuts || getAllShortcuts();
 *   const platform = getPlatform(); // 'macos' | 'windows' | 'linux'
 *
 *   return (
 *     <Dialog.Root open={isOpen} onOpenChange={onClose}>
 *       <Dialog.Portal>
 *         <Dialog.Overlay className="fixed inset-0 bg-black/50" />
 *         <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
 *           <Dialog.Title>Keyboard Shortcuts</Dialog.Title>
 *
 *           {Array.from(shortcuts.entries()).map(([category, items]) => (
 *             <div key={category}>
 *               <h3>{category}</h3>
 *               <ul>
 *                 {items.map(shortcut => (
 *                   <li key={shortcut.id}>
 *                     <span>{shortcut.description}</span>
 *                     <kbd>{formatShortcut(shortcut, platform)}</kbd>
 *                   </li>
 *                 ))}
 *               </ul>
 *             </div>
 *           ))}
 *
 *           <Dialog.Close asChild>
 *             <button>Close</button>
 *           </Dialog.Close>
 *         </Dialog.Content>
 *       </Dialog.Portal>
 *     </Dialog.Root>
 *   );
 * }
 * ```
 */

/**
 * Helper function to format shortcut display
 *
 * Converts shortcut configuration to human-readable string.
 * Handles platform-specific modifier key display.
 *
 * @param shortcut - Shortcut to format
 * @param platform - Current platform
 * @returns Formatted string (e.g., "Cmd+F", "Ctrl+2", "↓")
 *
 * @example
 * ```typescript
 * formatShortcut(
 *   { key: 'f', modifiers: ['ctrl', 'cmd'], ... },
 *   'macos'
 * ); // Returns: "Cmd+F"
 *
 * formatShortcut(
 *   { key: 'f', modifiers: ['ctrl', 'cmd'], ... },
 *   'windows'
 * ); // Returns: "Ctrl+F"
 *
 * formatShortcut(
 *   { key: 'ArrowDown', modifiers: [], ... },
 *   'macos'
 * ); // Returns: "↓"
 * ```
 */
export function formatShortcut(
  shortcut: KeyboardShortcut,
  platform: 'macos' | 'windows' | 'linux'
): string;

/**
 * Shortcut display formatting rules
 *
 * ## Modifier Keys
 * - macOS: "Cmd", "Shift", "Option"
 * - Windows/Linux: "Ctrl", "Shift", "Alt"
 *
 * ## Special Keys
 * - "ArrowDown" → "↓"
 * - "ArrowUp" → "↑"
 * - "ArrowLeft" → "←"
 * - "ArrowRight" → "→"
 * - "Escape" → "Esc"
 * - "Enter" → "↵"
 * - "Backspace" → "⌫"
 *
 * ## Letter Keys
 * - Always uppercase (e.g., "F" not "f")
 *
 * ## Number Keys
 * - Display as-is (e.g., "1", "2")
 *
 * ## Format Pattern
 * - Single modifier: "Cmd+F"
 * - Multiple modifiers: "Cmd+Shift+F"
 * - No modifiers: "↓"
 *
 * @example Formatting examples
 * ```typescript
 * // Search focus
 * { key: 'f', modifiers: ['ctrl', 'cmd'] }
 * // macOS: "Cmd+F"
 * // Windows: "Ctrl+F"
 *
 * // Tab switch
 * { key: '2', modifiers: ['ctrl', 'cmd'] }
 * // macOS: "Cmd+2"
 * // Windows: "Ctrl+2"
 *
 * // Arrow navigation
 * { key: 'ArrowDown', modifiers: [] }
 * // All platforms: "↓"
 *
 * // With multiple modifiers
 * { key: 'f', modifiers: ['ctrl', 'cmd', 'shift'] }
 * // macOS: "Cmd+Shift+F"
 * // Windows: "Ctrl+Shift+F"
 * ```
 */
