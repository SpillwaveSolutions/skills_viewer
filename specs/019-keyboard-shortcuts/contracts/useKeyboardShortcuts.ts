/**
 * API Contract: useKeyboardShortcuts Hook
 *
 * Custom React hook for centralized keyboard shortcut management.
 * Provides registration, unregistration, and querying of keyboard shortcuts.
 *
 * @module hooks/useKeyboardShortcuts
 * @since 0.2.0 (Feature 019)
 */

/**
 * Return type of useKeyboardShortcuts hook
 *
 * @example
 * ```typescript
 * function App() {
 *   const { registerShortcut, getAllShortcuts } = useKeyboardShortcuts();
 *
 *   useEffect(() => {
 *     registerShortcut({
 *       id: 'search-focus',
 *       key: 'f',
 *       modifiers: ['ctrl', 'cmd'],
 *       handler: () => searchInput.current?.focus(),
 *       description: 'Focus search field',
 *       category: 'Search'
 *     });
 *   }, []);
 *
 *   return <App />;
 * }
 * ```
 */
export interface KeyboardShortcutsHook {
  /**
   * Register a new keyboard shortcut
   *
   * Adds a shortcut to the global registry. The shortcut will be active
   * immediately after registration. Shortcuts are identified by their `id`
   * and must be unique.
   *
   * @param shortcut - Shortcut configuration object
   * @throws {Error} If shortcut with same ID already exists
   * @throws {Error} If shortcut configuration is invalid
   *
   * @example
   * ```typescript
   * registerShortcut({
   *   id: 'search-focus',
   *   key: 'f',
   *   modifiers: ['ctrl', 'cmd'],
   *   handler: (event) => {
   *     event.preventDefault();
   *     searchInput.current?.focus();
   *   },
   *   description: 'Focus search field',
   *   category: 'Search'
   * });
   * ```
   *
   * @example With condition
   * ```typescript
   * registerShortcut({
   *   id: 'tab-details',
   *   key: '2',
   *   modifiers: ['ctrl', 'cmd'],
   *   handler: () => setActiveTab(1),
   *   description: 'Switch to Details tab',
   *   category: 'Navigation',
   *   condition: () => selectedSkill !== null // Only active when skill selected
   * });
   * ```
   */
  registerShortcut: (shortcut: KeyboardShortcut) => void;

  /**
   * Unregister a keyboard shortcut by ID
   *
   * Removes a shortcut from the global registry. The shortcut will no longer
   * respond to keypresses after unregistration.
   *
   * @param id - Unique shortcut identifier
   * @returns True if shortcut was found and removed, false if not found
   *
   * @example
   * ```typescript
   * const removed = unregisterShortcut('search-focus');
   * if (removed) {
   *   console.log('Shortcut removed successfully');
   * }
   * ```
   */
  unregisterShortcut: (id: string) => boolean;

  /**
   * Check if a shortcut is currently registered and active
   *
   * Returns true if:
   * 1. Shortcut with given ID exists in registry
   * 2. Shortcut's condition (if any) evaluates to true
   *
   * @param id - Shortcut identifier to check
   * @returns True if shortcut is registered and active, false otherwise
   *
   * @example
   * ```typescript
   * if (isShortcutActive('tab-details')) {
   *   // Show indicator that Cmd+2 is available
   * }
   * ```
   */
  isShortcutActive: (id: string) => boolean;

  /**
   * Get all registered shortcuts grouped by category
   *
   * Returns a Map where keys are categories and values are arrays of shortcuts
   * in that category. Useful for rendering help overlays and documentation.
   *
   * @returns Map of category name to array of shortcuts
   *
   * @example
   * ```typescript
   * const shortcuts = getAllShortcuts();
   *
   * // Render by category
   * for (const [category, items] of shortcuts.entries()) {
   *   console.log(`${category}:`);
   *   items.forEach(s => console.log(`  ${s.key}: ${s.description}`));
   * }
   *
   * // Output:
   * // Search:
   * //   f: Focus search field
   * // Navigation:
   * //   1: Switch to Skills tab
   * //   2: Switch to Details tab
   * ```
   */
  getAllShortcuts: () => Map<ShortcutCategory, KeyboardShortcut[]>;

  /**
   * Internal keyboard event handler (for advanced use)
   *
   * Processes keyboard events and triggers matching shortcuts.
   * Typically called by global window.addEventListener('keydown').
   *
   * @param event - Native browser KeyboardEvent
   * @internal
   *
   * @example
   * ```typescript
   * // Usually handled automatically by hook, but can be called manually:
   * useEffect(() => {
   *   const handleKey = (e: KeyboardEvent) => handleKeyDown(e);
   *   window.addEventListener('keydown', handleKey);
   *   return () => window.removeEventListener('keydown', handleKey);
   * }, [handleKeyDown]);
   * ```
   */
  handleKeyDown: (event: KeyboardEvent) => void;
}

/**
 * Keyboard shortcut configuration
 *
 * Defines a single keyboard shortcut including its trigger key(s),
 * behavior, and metadata for display.
 */
export interface KeyboardShortcut {
  /**
   * Unique identifier for the shortcut
   *
   * Must be unique across all registered shortcuts.
   * Convention: kebab-case (e.g., "search-focus", "tab-details")
   *
   * @example "search-focus"
   * @example "tab-details"
   */
  id: string;

  /**
   * Physical key to press
   *
   * Must match KeyboardEvent.key values (case-insensitive).
   * Use special key names for non-character keys.
   *
   * @example "f" - Letter F key
   * @example "1" - Number 1 key
   * @example "ArrowDown" - Down arrow key
   * @example "Escape" - Escape key
   * @example "Enter" - Enter/Return key
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
   */
  key: string;

  /**
   * Required modifier keys
   *
   * Array of modifiers that must be held while pressing `key`.
   * Use empty array `[]` for shortcuts with no modifiers.
   *
   * Special behavior:
   * - Both "ctrl" and "cmd" map to Cmd on macOS, Ctrl on Windows/Linux
   * - Order doesn't matter
   *
   * @example ['ctrl', 'cmd'] - Cmd+F on macOS, Ctrl+F on Windows/Linux
   * @example ['shift'] - Shift+key
   * @example [] - No modifiers (plain key press)
   */
  modifiers: Modifier[];

  /**
   * Callback function invoked when shortcut is triggered
   *
   * Receives the native KeyboardEvent. Handler should call preventDefault()
   * if the shortcut should block default browser behavior.
   *
   * @param event - Native browser KeyboardEvent
   *
   * @example
   * ```typescript
   * handler: (event) => {
   *   event.preventDefault(); // Prevent browser Cmd+F
   *   searchInput.current?.focus();
   * }
   * ```
   */
  handler: (event: KeyboardEvent) => void;

  /**
   * Human-readable description of shortcut action
   *
   * Displayed in help overlay and tooltips.
   * Max length: 50 characters
   * Convention: Sentence case, imperative mood
   *
   * @example "Focus search field"
   * @example "Switch to Details tab"
   * @maxLength 50
   */
  description: string;

  /**
   * Category for organizing shortcuts in help overlay
   *
   * Shortcuts are grouped by category in the help UI.
   *
   * - **Navigation**: Tab switching, view changes
   * - **Search**: Search-related actions
   * - **Selection**: List navigation, item selection
   * - **Help**: Help overlay toggle
   */
  category: ShortcutCategory;

  /**
   * Optional condition to determine if shortcut is active
   *
   * If provided, shortcut only triggers when condition returns true.
   * Condition is evaluated on every keypress.
   *
   * Use cases:
   * - Tab shortcuts only active when skill is selected
   * - Navigation shortcuts only active when list has focus
   *
   * @returns True if shortcut should be active, false otherwise
   *
   * @example
   * ```typescript
   * // Only active when skill is selected
   * condition: () => useSkillStore.getState().selectedSkill !== null
   * ```
   *
   * @example
   * ```typescript
   * // Only active when skill list has focus
   * condition: () => document.activeElement === skillListRef.current
   * ```
   */
  condition?: () => boolean;
}

/**
 * Modifier key types
 *
 * - **ctrl/cmd**: Command (macOS) or Control (Windows/Linux) - treated as aliases
 * - **shift**: Shift key (all platforms)
 * - **alt**: Option (macOS) or Alt (Windows/Linux)
 */
export type Modifier = 'ctrl' | 'cmd' | 'shift' | 'alt';

/**
 * Shortcut categories for organization
 *
 * Categories are used to group shortcuts in the help overlay.
 *
 * - **Navigation**: Moving between tabs and views
 * - **Search**: Search-related operations
 * - **Selection**: Navigating and selecting items in lists
 * - **Help**: Accessing help and documentation
 */
export type ShortcutCategory = 'Navigation' | 'Search' | 'Selection' | 'Help';

/**
 * Platform identifier for modifier key mapping
 *
 * Used internally to map Cmd/Ctrl correctly.
 *
 * - **macos**: macOS (Cmd = metaKey)
 * - **windows**: Windows (Ctrl = ctrlKey)
 * - **linux**: Linux (Ctrl = ctrlKey)
 */
export type PlatformInfo = 'macos' | 'windows' | 'linux';

/**
 * Hook usage example (full implementation)
 *
 * @example
 * ```typescript
 * // src/App.tsx
 * import { useEffect, useRef } from 'react';
 * import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
 * import { useSkillStore } from './stores/skillStore';
 *
 * function App() {
 *   const { registerShortcut, handleKeyDown } = useKeyboardShortcuts();
 *   const searchInputRef = useRef<HTMLInputElement>(null);
 *   const setActiveTab = useSkillStore(state => state.setActiveTab);
 *   const selectedSkill = useSkillStore(state => state.selectedSkill);
 *
 *   // Register all shortcuts on mount
 *   useEffect(() => {
 *     // Search focus (Cmd/Ctrl+F)
 *     registerShortcut({
 *       id: 'search-focus',
 *       key: 'f',
 *       modifiers: ['ctrl', 'cmd'],
 *       handler: (e) => {
 *         e.preventDefault();
 *         searchInputRef.current?.focus();
 *         searchInputRef.current?.select();
 *       },
 *       description: 'Focus search field',
 *       category: 'Search'
 *     });
 *
 *     // Tab switching (Cmd/Ctrl+1-6)
 *     for (let i = 1; i <= 6; i++) {
 *       registerShortcut({
 *         id: `tab-${i}`,
 *         key: String(i),
 *         modifiers: ['ctrl', 'cmd'],
 *         handler: () => setActiveTab(i - 1),
 *         description: `Switch to tab ${i}`,
 *         category: 'Navigation',
 *         condition: i === 1 ? undefined : () => selectedSkill !== null
 *       });
 *     }
 *   }, [registerShortcut, setActiveTab, selectedSkill]);
 *
 *   // Global keyboard listener
 *   useEffect(() => {
 *     window.addEventListener('keydown', handleKeyDown);
 *     return () => window.removeEventListener('keydown', handleKeyDown);
 *   }, [handleKeyDown]);
 *
 *   return (
 *     <div>
 *       <input ref={searchInputRef} type="search" />
 *       {/* rest of app *\/}
 *     </div>
 *   );
 * }
 * ```
 */
