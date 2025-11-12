# Phase 1: Data Model - Keyboard Shortcuts for Power Users

**Feature**: 003-keyboard-shortcuts
**Date**: 2025-11-10
**Purpose**: Define state structures, types, and data flows for keyboard functionality

## Overview

This feature is **state-driven**: keyboard events trigger state changes, and React components respond to state updates. All keyboard state is ephemeral (not persisted) and managed in a Zustand store.

**Key Design Principle**: Separation of concerns
- **Hooks**: Capture keyboard events, update state
- **Store**: Hold current keyboard state (focus, highlight, modal visibility)
- **Components**: Read state, render UI updates

---

## 1. State Model

### 1.1 Keyboard State (Zustand Store)

**Location**: `src/stores/keyboardStore.ts`

**Purpose**: Central state for all keyboard-related UI state

```typescript
interface KeyboardState {
  // Focus state (US1: Search focus)
  searchFocusRequested: boolean;
  setSearchFocusRequested: (requested: boolean) => void;

  // List navigation state (US3: Arrow keys)
  highlightedSkillIndex: number | null;
  setHighlightedSkillIndex: (index: number | null) => void;

  // Tab navigation state (US2: Cmd/Ctrl+1-6)
  activeTabIndex: number | null;
  setActiveTabIndex: (index: number | null) => void;

  // Help modal state (US4: ? key)
  isHelpModalOpen: boolean;
  setHelpModalOpen: (open: boolean) => void;

  // Platform detection
  platform: 'mac' | 'windows' | 'linux';
  modifierKey: 'Cmd' | 'Ctrl';
  modifierSymbol: '⌘' | 'Ctrl';
  detectPlatform: () => void;

  // Reset all keyboard state
  reset: () => void;
}

const useKeyboardStore = create<KeyboardState>((set, get) => ({
  // Default state
  searchFocusRequested: false,
  highlightedSkillIndex: null,
  activeTabIndex: 0, // Default to first tab when skill selected
  isHelpModalOpen: false,
  platform: 'mac', // Default, will be detected on mount
  modifierKey: 'Cmd',
  modifierSymbol: '⌘',

  // Actions
  setSearchFocusRequested: (requested) => set({ searchFocusRequested: requested }),
  setHighlightedSkillIndex: (index) => set({ highlightedSkillIndex: index }),
  setActiveTabIndex: (index) => set({ activeTabIndex: index }),
  setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),

  detectPlatform: () => {
    const platform = navigator.platform.toUpperCase();
    const isMac = platform.indexOf('MAC') >= 0;
    const isWindows = platform.indexOf('WIN') >= 0;

    set({
      platform: isMac ? 'mac' : isWindows ? 'windows' : 'linux',
      modifierKey: isMac ? 'Cmd' : 'Ctrl',
      modifierSymbol: isMac ? '⌘' : 'Ctrl',
    });
  },

  reset: () =>
    set({
      searchFocusRequested: false,
      highlightedSkillIndex: null,
      activeTabIndex: 0,
      isHelpModalOpen: false,
    }),
}));
```

**State Transitions**:
```
Initial State: { searchFocusRequested: false, highlightedSkillIndex: null, ... }

User presses Cmd/Ctrl+F
  → setSearchFocusRequested(true)
  → SearchBar component reads state, focuses input
  → SearchBar calls setSearchFocusRequested(false) after focus complete

User presses Down arrow (no highlight)
  → setHighlightedSkillIndex(0)
  → SkillList component reads state, highlights first item

User presses Down arrow (index 0 highlighted)
  → setHighlightedSkillIndex(1)
  → SkillList component reads state, highlights second item

User presses Enter (skill highlighted)
  → Existing skill selection logic (no keyboard store involvement)
  → setHighlightedSkillIndex(null) to clear highlight

User presses ? (help modal closed)
  → setHelpModalOpen(true)
  → KeyboardShortcutHelp component reads state, renders modal

User presses Escape (help modal open)
  → setHelpModalOpen(false)
  → KeyboardShortcutHelp component reads state, hides modal
```

---

## 2. TypeScript Types

### 2.1 Keyboard Event Types

**Location**: `src/types/keyboard.ts`

```typescript
/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;

  /** Human-readable label (e.g., "Search", "Next Tab") */
  label: string;

  /** Description of what the shortcut does */
  description: string;

  /** Key code (e.g., "f", "1", "ArrowDown", "Escape") */
  key: string;

  /** Whether Cmd (macOS) or Ctrl (Windows/Linux) is required */
  requiresModifier: boolean;

  /** Whether Shift is required */
  requiresShift: boolean;

  /** Context where shortcut is active (e.g., "global", "list", "modal") */
  context: ShortcutContext;

  /** Handler function to execute when shortcut is triggered */
  handler: () => void;
}

/**
 * Contexts where shortcuts can be active
 */
export type ShortcutContext =
  | 'global' // Active anywhere in the app
  | 'list' // Active when skill list has focus
  | 'search' // Active when search bar has focus
  | 'tabs' // Active when a skill is selected
  | 'modal'; // Active when modal is open

/**
 * Platform-specific modifier key info
 */
export interface PlatformModifier {
  platform: 'mac' | 'windows' | 'linux';
  modifierKey: 'Cmd' | 'Ctrl';
  modifierSymbol: '⌘' | 'Ctrl';
  isMac: boolean;
}

/**
 * Grouped shortcuts for help modal display
 */
export interface ShortcutGroup {
  groupName: string;
  shortcuts: Array<{
    keys: string; // Display string (e.g., "⌘ F" or "Ctrl F")
    description: string;
  }>;
}
```

### 2.2 Component Prop Types

```typescript
/**
 * Props for KeyboardShortcutHelp modal
 */
export interface KeyboardShortcutHelpProps {
  /** Whether modal is currently open */
  isOpen: boolean;

  /** Callback to close the modal */
  onClose: () => void;

  /** Optional: custom shortcuts to display (defaults to all) */
  shortcuts?: ShortcutGroup[];
}

/**
 * Props for SkillList with keyboard navigation
 */
export interface SkillListWithKeyboardProps {
  /** Current list of skills */
  skills: Skill[];

  /** Currently selected skill (if any) */
  selectedSkillId: string | null;

  /** Callback when skill is selected */
  onSelectSkill: (skillId: string) => void;

  /** Index of highlighted skill (controlled by keyboard store) */
  highlightedIndex: number | null;
}
```

---

## 3. Data Flows

### 3.1 Search Focus Flow (US1: Cmd/Ctrl+F)

```
[1] User presses Cmd/Ctrl+F
    ↓
[2] useKeyboardShortcuts hook detects event
    ↓
[3] Hook calls keyboardStore.setSearchFocusRequested(true)
    ↓
[4] SearchBar component reads searchFocusRequested from store
    ↓
[5] useEffect triggers when searchFocusRequested changes to true
    ↓
[6] SearchBar focuses input element via ref.current?.focus()
    ↓
[7] SearchBar selects existing text via ref.current?.select()
    ↓
[8] SearchBar calls keyboardStore.setSearchFocusRequested(false)
    ↓
[9] If user was on skill detail page, navigate back to skill list
```

**Data**: `searchFocusRequested: boolean`

**Components Involved**:
- `useKeyboardShortcuts` (triggers)
- `SearchBar` (responds)
- Navigation logic (if detail page → list page)

### 3.2 List Navigation Flow (US3: Arrow Keys)

```
[1] User presses Down arrow
    ↓
[2] useListNavigation hook detects event (only if list has focus)
    ↓
[3] Hook reads current highlightedSkillIndex from store
    ↓
[4] Hook calculates next index:
    - If null → 0 (first item)
    - If < lastIndex → currentIndex + 1
    - If === lastIndex → 0 (wrap to first)
    ↓
[5] Hook calls keyboardStore.setHighlightedSkillIndex(nextIndex)
    ↓
[6] SkillList component reads highlightedSkillIndex from store
    ↓
[7] SkillList renders highlight indicator on item at highlightedSkillIndex
    ↓
[8] SkillList scrolls item into view if needed
```

**Data**: `highlightedSkillIndex: number | null`

**Components Involved**:
- `useListNavigation` (triggers)
- `SkillList` (responds)

**Selection Flow** (Enter key):
```
[1] User presses Enter (while item is highlighted)
    ↓
[2] useListNavigation hook detects Enter key
    ↓
[3] Hook reads highlightedSkillIndex from store
    ↓
[4] Hook calls onSelectSkill(skills[highlightedSkillIndex].id)
    ↓
[5] Existing skill selection logic takes over
    ↓
[6] Hook calls setHighlightedSkillIndex(null) to clear highlight
```

### 3.3 Tab Navigation Flow (US2: Cmd/Ctrl+1-6)

```
[1] User presses Cmd/Ctrl+2 (Content tab)
    ↓
[2] useKeyboardShortcuts hook detects event
    ↓
[3] Hook checks if skill is currently selected (prerequisite)
    ↓
[4] If selected: Hook calls keyboardStore.setActiveTabIndex(1) // 0-indexed
    ↓
[5] TabSystem component reads activeTabIndex from store
    ↓
[6] TabSystem updates visible tab to index 1 (Content)
    ↓
[7] TabSystem applies visual highlight to active tab
```

**Data**: `activeTabIndex: number | null`

**Components Involved**:
- `useKeyboardShortcuts` (triggers)
- `TabSystem` (responds)

**Edge Case**: If no skill selected, shortcut is ignored.

### 3.4 Help Modal Flow (US4: ? key)

```
[1] User presses ? (Shift+/)
    ↓
[2] useKeyboardShortcuts hook detects event
    ↓
[3] Hook calls keyboardStore.setHelpModalOpen(true)
    ↓
[4] KeyboardShortcutHelp component reads isHelpModalOpen from store
    ↓
[5] Component renders modal with focus trap
    ↓
[6] Component displays grouped shortcuts (context-aware)
    ↓
[7] User presses Escape or clicks outside
    ↓
[8] Component calls keyboardStore.setHelpModalOpen(false)
    ↓
[9] Component unmounts modal, restores previous focus
```

**Data**: `isHelpModalOpen: boolean`

**Components Involved**:
- `useKeyboardShortcuts` (triggers)
- `KeyboardShortcutHelp` (responds)

---

## 4. State Persistence

**Decision**: NO PERSISTENCE

**Rationale**:
- Keyboard state is ephemeral (per-session UI state)
- Highlighted item, focus state, modal visibility are transient
- Platform detection happens on every app launch (no need to persist)
- User preferences (if added later) would be separate feature

**Storage**: Zustand in-memory store only (no localStorage, no backend)

---

## 5. State Reset Conditions

The keyboard store provides a `reset()` function to clear all state. This is called:

1. **When user navigates away from skill list**
   - Clear `highlightedSkillIndex` (no longer relevant)
   - Clear `searchFocusRequested`

2. **When user closes help modal**
   - Set `isHelpModalOpen = false`
   - (Other state unchanged)

3. **When skill selection changes**
   - Clear `highlightedSkillIndex` (selection overrides highlight)
   - Reset `activeTabIndex` to 0 (default to Overview tab)

4. **On app restart**
   - Automatic (Zustand store is in-memory)

---

## 6. Accessibility Data Model

### 6.1 ARIA Attributes

**SkillList**:
```typescript
<div
  role="listbox"
  aria-label="Skills list"
  aria-activedescendant={highlightedIndex !== null ? `skill-${skills[highlightedIndex].id}` : undefined}
>
  {skills.map((skill, index) => (
    <div
      key={skill.id}
      id={`skill-${skill.id}`}
      role="option"
      aria-selected={skill.id === selectedSkillId}
      className={highlightedIndex === index ? 'highlighted' : ''}
    >
      {skill.name}
    </div>
  ))}
</div>
```

**KeyboardShortcutHelp Modal**:
```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="keyboard-shortcuts-title"
  aria-describedby="keyboard-shortcuts-description"
>
  <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
  <p id="keyboard-shortcuts-description">
    All available keyboard shortcuts for the Skill Debugger
  </p>
  {/* Shortcut groups */}
</div>
```

### 6.2 Focus Management Data

**Focus Targets** (stored as refs):
- `searchInputRef: RefObject<HTMLInputElement>`
- `helpModalCloseButtonRef: RefObject<HTMLButtonElement>`
- `firstFocusableElementRef: RefObject<HTMLElement>` (for modal focus trap)
- `lastFocusableElementRef: RefObject<HTMLElement>` (for modal focus trap)

**Previous Focus Tracking**:
```typescript
// Store element that had focus before modal opened
const previousActiveElement = useRef<HTMLElement | null>(null);

// On modal open
previousActiveElement.current = document.activeElement as HTMLElement;

// On modal close
previousActiveElement.current?.focus();
```

---

## 7. Performance Considerations

### 7.1 State Update Frequency

**Low Frequency Events**:
- Search focus: User-triggered (infrequent)
- Tab navigation: User-triggered (infrequent)
- Help modal: User-triggered (infrequent)

**Higher Frequency Events**:
- List navigation: Arrow keys (potentially rapid, but still human-speed)

**Optimization**: Zustand uses shallow equality checks. State updates are fast (<1ms).

### 7.2 Re-render Impact

**Selective Re-renders**:
- Only components subscribed to specific state slices re-render
- Example: Changing `highlightedSkillIndex` does NOT re-render SearchBar
- Example: Changing `isHelpModalOpen` does NOT re-render SkillList

**Zustand Optimization**:
```typescript
// ❌ Re-renders on ANY store change
const state = useKeyboardStore();

// ✅ Re-renders ONLY when highlightedSkillIndex changes
const highlightedIndex = useKeyboardStore((state) => state.highlightedSkillIndex);
```

---

## 8. Error Handling

### 8.1 Invalid State Transitions

**Scenario**: User presses Cmd/Ctrl+1 when no skill is selected

**Handling**:
```typescript
// In useKeyboardShortcuts hook
if (modifier && event.key === '1') {
  event.preventDefault();

  // Guard: Only allow tab navigation if skill is selected
  if (selectedSkillId === null) {
    console.warn('Tab navigation requires a skill to be selected');
    return; // Ignore shortcut
  }

  keyboardStore.setActiveTabIndex(0);
}
```

### 8.2 Out-of-Bounds Index

**Scenario**: `highlightedSkillIndex` is 5, but skills list only has 3 items (skills were filtered)

**Handling**:
```typescript
// In SkillList component
useEffect(() => {
  if (highlightedIndex !== null && highlightedIndex >= skills.length) {
    // Reset highlight if out of bounds
    keyboardStore.setHighlightedSkillIndex(null);
  }
}, [skills.length, highlightedIndex]);
```

### 8.3 Platform Detection Failure

**Scenario**: `navigator.platform` is undefined or unrecognized

**Handling**:
```typescript
detectPlatform: () => {
  const platform = navigator.platform?.toUpperCase() || 'UNKNOWN';
  const isMac = platform.indexOf('MAC') >= 0;
  const isWindows = platform.indexOf('WIN') >= 0;

  set({
    platform: isMac ? 'mac' : isWindows ? 'windows' : 'linux', // Default to 'linux' for unknown
    modifierKey: isMac ? 'Cmd' : 'Ctrl',
    modifierSymbol: isMac ? '⌘' : 'Ctrl',
  });
},
```

---

## 9. Data Model Summary

### Core State (Zustand)
- `searchFocusRequested: boolean`
- `highlightedSkillIndex: number | null`
- `activeTabIndex: number | null`
- `isHelpModalOpen: boolean`
- `platform: 'mac' | 'windows' | 'linux'`
- `modifierKey: 'Cmd' | 'Ctrl'`
- `modifierSymbol: '⌘' | 'Ctrl'`

### Core Types (TypeScript)
- `KeyboardShortcut` - Shortcut definition
- `ShortcutContext` - Where shortcut is active
- `PlatformModifier` - Platform detection info
- `ShortcutGroup` - Grouped shortcuts for help modal

### Data Flows
1. **Event → Hook → Store → Component → UI Update**
2. **Reactive**: Components subscribe to specific state slices
3. **Unidirectional**: State flows down, events flow up

### Persistence
- **None** - All state is ephemeral (in-memory only)

### Performance
- **Optimized**: Shallow equality checks, selective re-renders
- **Fast**: State updates <1ms, UI response <16ms (60fps)

---

**Phase 1 Data Model Completed**: 2025-11-10
**Next**: Contracts & Quickstart Guide
