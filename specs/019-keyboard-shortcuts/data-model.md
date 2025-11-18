# Data Model: Keyboard Shortcuts

**Feature**: 019-keyboard-shortcuts | **Date**: 2025-11-16 | **Phase**: 1 (Design)

## Overview

This document defines the data structures, state machines, and relationships for keyboard shortcut functionality in Skill Debugger.

---

## Core Entities

### 1. KeyboardShortcut

Represents a single keyboard shortcut configuration.

```typescript
interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;

  /** Physical key to press (e.g., "f", "1", "ArrowDown") */
  key: string;

  /** Required modifier keys (empty array for no modifiers) */
  modifiers: Modifier[];

  /** Callback function invoked when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;

  /** Human-readable description for help overlay */
  description: string;

  /** Category for grouping in help overlay */
  category: ShortcutCategory;

  /** Optional condition to check if shortcut is currently active */
  condition?: () => boolean;
}
```

**Field Constraints**:

- `id`: Must be unique across all shortcuts, kebab-case (e.g., "search-focus")
- `key`: Single character or special key name (follows KeyboardEvent.key standard)
- `modifiers`: Can contain "ctrl"/"cmd" (cross-platform), "shift", "alt"
- `handler`: Must call preventDefault() if needed
- `description`: Max 50 characters, sentence case
- `category`: One of predefined categories
- `condition`: If omitted, shortcut is always active

**Examples**:

```typescript
// Simple shortcut (always active)
{
  id: "search-focus",
  key: "f",
  modifiers: ["ctrl", "cmd"],
  handler: (e) => { e.preventDefault(); searchInput.focus(); },
  description: "Focus search field",
  category: "Search"
}

// Conditional shortcut (only when skill selected)
{
  id: "tab-details",
  key: "2",
  modifiers: ["ctrl", "cmd"],
  handler: () => setActiveTab("details"),
  description: "Switch to Details tab",
  category: "Navigation",
  condition: () => useSkillStore.getState().selectedSkill !== null
}

// No modifiers (arrow key navigation)
{
  id: "skill-down",
  key: "ArrowDown",
  modifiers: [],
  handler: () => navigateDown(),
  description: "Navigate to next skill",
  category: "Selection",
  condition: () => document.activeElement === skillListElement
}
```

---

### 2. Modifier

Enumeration of modifier keys.

```typescript
type Modifier = 'ctrl' | 'cmd' | 'shift' | 'alt';
```

**Mapping Rules**:

- `"ctrl"` and `"cmd"` are **aliases** - both map to Cmd on macOS, Ctrl on Windows/Linux
- `"shift"` maps to Shift key on all platforms
- `"alt"` maps to Option (macOS) / Alt (Windows/Linux)

**Why both "ctrl" and "cmd"?**

- Allows shortcuts to specify intent ("cmd" for macOS-style, "ctrl" for cross-platform)
- Both are treated identically by `matchesModifiers()` function
- Simplifies shortcut definitions (no need to duplicate for each platform)

---

### 3. ShortcutCategory

Enumeration of categories for organizing shortcuts in help overlay.

```typescript
type ShortcutCategory = 'Navigation' | 'Search' | 'Selection' | 'Help';
```

**Category Definitions**:

- **Navigation**: Tab switching, view navigation (Cmd/Ctrl+1-6)
- **Search**: Search-related actions (Cmd/Ctrl+F, Escape)
- **Selection**: Skill list navigation (Arrow keys, Home, End, Enter)
- **Help**: Help overlay toggle (Cmd/Ctrl+/)

---

### 4. KeyboardEvent (Browser API)

Standard browser KeyboardEvent interface (no custom modifications).

```typescript
interface KeyboardEvent extends UIEvent {
  /** Key value (e.g., "f", "ArrowDown", "Escape") */
  key: string;

  /** Cmd key on macOS */
  metaKey: boolean;

  /** Ctrl key on Windows/Linux (also Ctrl on macOS) */
  ctrlKey: boolean;

  /** Shift key */
  shiftKey: boolean;

  /** Option (macOS) / Alt (Windows/Linux) */
  altKey: boolean;

  /** Element that triggered the event */
  target: EventTarget;

  /** Prevent default browser action */
  preventDefault(): void;

  /** Stop event propagation */
  stopPropagation(): void;
}
```

**Usage in Handlers**:

```typescript
handler: (event: KeyboardEvent) => {
  // Prevent browser Cmd+F / Ctrl+F
  event.preventDefault();

  // Check if event came from input field
  if (event.target instanceof HTMLInputElement) {
    // Handle differently
  }
};
```

---

### 5. FocusState

Tracks focus history for restoration after dismissing modals.

```typescript
interface FocusState {
  /** Currently focused element */
  activeElement: HTMLElement | null;

  /** Previously focused element (for restoration) */
  previousElement: HTMLElement | null;
}
```

**State Transitions**:

```
Initial State:
  activeElement: null
  previousElement: null

User Opens Help Overlay (Cmd+/):
  previousElement = document.activeElement  // Store current focus
  activeElement = Dialog first focusable element

User Closes Help Overlay (Escape):
  activeElement = previousElement  // Restore focus
  previousElement = null
```

**Implementation**:

```typescript
// src/hooks/useFocusManagement.ts
const [focusState, setFocusState] = useState<FocusState>({
  activeElement: null,
  previousElement: null,
});

const saveFocus = () => {
  setFocusState({
    activeElement: document.activeElement as HTMLElement,
    previousElement: focusState.activeElement,
  });
};

const restoreFocus = () => {
  focusState.previousElement?.focus();
  setFocusState({
    activeElement: focusState.previousElement,
    previousElement: null,
  });
};
```

---

### 6. PlatformInfo

Platform detection result for modifier key mapping.

```typescript
type PlatformInfo = 'macos' | 'windows' | 'linux';
```

**Detection Logic**:

```typescript
// Cached at app startup
let cachedPlatform: PlatformInfo | null = null;

async function getPlatform(): Promise<PlatformInfo> {
  if (cachedPlatform) return cachedPlatform;

  // Modern browser API
  if (navigator.userAgentData?.platform) {
    const platform = navigator.userAgentData.platform.toLowerCase();
    if (platform.includes('mac')) return (cachedPlatform = 'macos');
    if (platform.includes('win')) return (cachedPlatform = 'windows');
    return (cachedPlatform = 'linux');
  }

  // Tauri fallback
  const osType = await tauriPlatform();
  return (cachedPlatform = osType as PlatformInfo);
}
```

---

## State Machines

### Search Focus State Machine

**States**: `Unfocused`, `Focused`, `TextSelected`

```
┌─────────────┐
│  Unfocused  │
└──────┬──────┘
       │ Cmd/Ctrl+F
       ▼
┌─────────────┐
│   Focused   │
└──────┬──────┘
       │ focus() + select()
       ▼
┌──────────────┐
│TextSelected  │
└──────────────┘
```

**Transitions**:

1. **Unfocused → Focused**: User presses Cmd/Ctrl+F
2. **Focused → TextSelected**: Search input receives focus, text is selected

**Exit Conditions**:

- User clicks elsewhere (Focused → Unfocused)
- User presses Escape (TextSelected → Unfocused, search cleared)

---

### Tab Switching State Machine

**States**: `Skills`, `Details`, `Triggers`, `References`, `Scripts`, `Diagram`

```
        Cmd/Ctrl+1
   ┌──────────────────┐
   │                  ▼
┌──────┐  Cmd/Ctrl+2  ┌─────────┐
│Skills│◄─────────────┤ Details │
└───┬──┘              └────┬────┘
    │                      │
    │ Cmd/Ctrl+3           │ Cmd/Ctrl+4
    ▼                      ▼
┌──────────┐         ┌────────────┐
│Triggers  │         │ References │
└────┬─────┘         └─────┬──────┘
     │                     │
     │ Cmd/Ctrl+5          │ Cmd/Ctrl+6
     ▼                     ▼
┌─────────┐           ┌─────────┐
│Scripts  │           │ Diagram │
└─────────┘           └─────────┘
```

**Conditional Transitions**:

- **Cmd/Ctrl+1**: Always works (Skills tab always available)
- **Cmd/Ctrl+2-6**: Only work if `selectedSkill !== null`

**Implementation**:

```typescript
const tabShortcuts: Record<string, number> = {
  '1': 0, // Skills
  '2': 1, // Details
  '3': 2, // Triggers
  '4': 3, // References
  '5': 4, // Scripts
  '6': 5, // Diagram
};

registerShortcut({
  key: '2',
  modifiers: ['ctrl', 'cmd'],
  handler: () => setActiveTab(1),
  condition: () => useSkillStore.getState().selectedSkill !== null,
});
```

---

### Skill List Navigation State Machine

**States**: `Skill[0]`, `Skill[1]`, ..., `Skill[N-1]`

```
┌──────────┐  ArrowDown  ┌──────────┐  ArrowDown  ┌──────────┐
│Skill[0]  │────────────►│Skill[1]  │────────────►│Skill[2]  │
└──────────┘             └──────────┘             └──────────┘
     ▲                        │                         │
     │ Home                   │ ArrowUp                 │ Enter
     │                        ▼                         ▼
     │                   ┌──────────┐             (Skill Selected)
     └───────────────────┤Skill[0]  │
                         └──────────┘
```

**Transitions**:

- **ArrowDown**: `Skill[i] → Skill[i+1]` (if `i < N-1`, else stay at `Skill[N-1]`)
- **ArrowUp**: `Skill[i] → Skill[i-1]` (if `i > 0`, else stay at `Skill[0]`)
- **Home**: `Skill[i] → Skill[0]`
- **End**: `Skill[i] → Skill[N-1]`
- **Enter**: `Skill[i] → SelectedSkill` (triggers Zustand store update)

**Edge Cases**:

- At top (`Skill[0]`): ArrowUp does nothing (no wrap)
- At bottom (`Skill[N-1]`): ArrowDown does nothing (no wrap)
- Empty list: All navigation shortcuts disabled

---

### Help Overlay State Machine

**States**: `Closed`, `Open`

```
┌────────┐  Cmd/Ctrl+/  ┌──────┐
│ Closed │─────────────►│ Open │
└────────┘              └───┬──┘
     ▲                      │
     │ Escape / Click Out   │
     └──────────────────────┘
```

**State Data**:

```typescript
{
  isOpen: boolean;
  shortcuts: Map<ShortcutCategory, KeyboardShortcut[]>;
}
```

**Transitions**:

1. **Closed → Open**: User presses Cmd/Ctrl+/
   - Save current focus (`previousElement`)
   - Render Dialog component
   - Focus first element in Dialog
2. **Open → Closed**: User presses Escape or clicks outside
   - Unmount Dialog component
   - Restore focus to `previousElement`

---

## Data Flow Diagrams

### Global Keyboard Event Flow

```
User Presses Key
      │
      ▼
┌───────────────────────┐
│ window.keydown event  │
└──────────┬────────────┘
           │
           ▼
┌──────────────────────────────┐
│ useKeyboardShortcuts hook    │
│ - matchesModifiers()         │
│ - findMatchingShortcut()     │
└──────────┬───────────────────┘
           │
           ├──► Shortcut Match Found?
           │    ┌─────────────────────┐
           │    │ Yes: Call handler   │
           │    │ - preventDefault()  │
           │    │ - Execute action    │
           │    └─────────────────────┘
           │
           └──► No Match?
                └─────────────────────┐
                │ Allow default       │
                │ browser behavior    │
                └─────────────────────┘
```

### Search Focus Flow

```
User Presses Cmd/Ctrl+F
      │
      ▼
┌─────────────────────────────┐
│ handleSearchFocus()         │
│ - event.preventDefault()    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ searchInputRef.current      │
│   .focus()                  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ searchInputRef.current      │
│   .select()                 │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ AriaLiveAnnouncer           │
│ "Search field focused"      │
└─────────────────────────────┘
```

### Tab Switching Flow

```
User Presses Cmd/Ctrl+2
      │
      ▼
┌─────────────────────────────┐
│ Check condition:            │
│ selectedSkill !== null      │
└──────────┬──────────────────┘
           │
           ├──► Condition true?
           │    ┌─────────────────────┐
           │    │ Yes: setActiveTab(1)│
           │    └─────────┬───────────┘
           │              ▼
           │    ┌─────────────────────┐
           │    │ Zustand store update│
           │    └─────────┬───────────┘
           │              ▼
           │    ┌─────────────────────┐
           │    │ Details tab renders │
           │    └─────────┬───────────┘
           │              ▼
           │    ┌─────────────────────┐
           │    │ AriaLiveAnnouncer   │
           │    │ "Details tab active"│
           │    └─────────────────────┘
           │
           └──► Condition false?
                └─────────────────────┐
                │ No action (no-op)   │
                └─────────────────────┘
```

---

## Relationships

### Shortcut Registry

**Structure**: Map of shortcut ID to KeyboardShortcut

```typescript
const shortcutRegistry = new Map<string, KeyboardShortcut>();

// Registration
shortcutRegistry.set('search-focus', {
  id: 'search-focus',
  key: 'f',
  modifiers: ['ctrl', 'cmd'],
  handler: focusSearch,
  description: 'Focus search field',
  category: 'Search',
});

// Lookup
const shortcut = shortcutRegistry.get('search-focus');

// Category grouping (for help overlay)
const byCategory = Array.from(shortcutRegistry.values()).reduce((acc, shortcut) => {
  if (!acc.has(shortcut.category)) {
    acc.set(shortcut.category, []);
  }
  acc.get(shortcut.category)!.push(shortcut);
  return acc;
}, new Map<ShortcutCategory, KeyboardShortcut[]>());
```

### Component Integration

**Relationship Diagram**:

```
┌──────────────────────────────────────────────┐
│ App.tsx (root)                               │
│ - useKeyboardShortcuts() hook                │
│ - Global keydown listener                    │
│ - Registers all shortcuts                    │
└────────────┬─────────────────────────────────┘
             │
             ├──► SearchBar.tsx
             │    - searchInputRef
             │    - Responds to "search-focus" shortcut
             │
             ├──► SkillList.tsx
             │    - Responds to "skill-down", "skill-up", etc.
             │    - Manages focused index
             │    - Triggers skill selection
             │
             ├──► SkillViewer.tsx
             │    - Responds to "tab-details", "tab-triggers", etc.
             │    - Zustand store integration
             │
             └──► KeyboardShortcutsHelp.tsx
                  - Radix Dialog component
                  - Displays shortcutRegistry grouped by category
                  - Responds to "help-toggle" shortcut
```

---

## Validation Rules

### Shortcut Registration Validation

```typescript
function validateShortcut(shortcut: KeyboardShortcut): void {
  // ID uniqueness
  if (shortcutRegistry.has(shortcut.id)) {
    throw new Error(`Duplicate shortcut ID: ${shortcut.id}`);
  }

  // Key validity
  if (!shortcut.key || shortcut.key.length === 0) {
    throw new Error('Shortcut key cannot be empty');
  }

  // Description length
  if (shortcut.description.length > 50) {
    throw new Error('Description must be ≤50 characters');
  }

  // Handler must be function
  if (typeof shortcut.handler !== 'function') {
    throw new Error('Handler must be a function');
  }

  // Category must be valid
  const validCategories: ShortcutCategory[] = ['Navigation', 'Search', 'Selection', 'Help'];
  if (!validCategories.includes(shortcut.category)) {
    throw new Error(`Invalid category: ${shortcut.category}`);
  }
}
```

### Modifier Matching Validation

```typescript
function validateModifierMatch(
  event: KeyboardEvent,
  modifiers: Modifier[],
  platform: PlatformInfo
): boolean {
  // Check each modifier
  for (const modifier of modifiers) {
    switch (modifier) {
      case 'ctrl':
      case 'cmd':
        // On macOS: metaKey (Cmd), on others: ctrlKey
        const correctKey = platform === 'macos' ? event.metaKey : event.ctrlKey;
        if (!correctKey) return false;
        break;

      case 'shift':
        if (!event.shiftKey) return false;
        break;

      case 'alt':
        if (!event.altKey) return false;
        break;

      default:
        throw new Error(`Unknown modifier: ${modifier}`);
    }
  }

  return true;
}
```

---

## Performance Considerations

### Shortcut Lookup Optimization

**Naive Approach** (O(N) per keystroke):

```typescript
// Iterate all shortcuts on every keypress
function findShortcut(event: KeyboardEvent): KeyboardShortcut | null {
  for (const shortcut of shortcutRegistry.values()) {
    if (matchesShortcut(event, shortcut)) {
      return shortcut;
    }
  }
  return null;
}
```

**Optimized Approach** (O(1) average case):

```typescript
// Index by key for O(1) lookup
const shortcutsByKey = new Map<string, KeyboardShortcut[]>();

function registerShortcut(shortcut: KeyboardShortcut) {
  const key = shortcut.key.toLowerCase();
  if (!shortcutsByKey.has(key)) {
    shortcutsByKey.set(key, []);
  }
  shortcutsByKey.get(key)!.push(shortcut);
}

function findShortcut(event: KeyboardEvent): KeyboardShortcut | null {
  const key = event.key.toLowerCase();
  const candidates = shortcutsByKey.get(key) || [];

  // Only check shortcuts for pressed key (typically 1-2 shortcuts)
  for (const shortcut of candidates) {
    if (matchesModifiers(event, shortcut.modifiers, platform)) {
      if (!shortcut.condition || shortcut.condition()) {
        return shortcut;
      }
    }
  }

  return null;
}
```

**Performance Impact**:

- Naive: 6 comparisons per keystroke (all shortcuts)
- Optimized: 1-2 comparisons per keystroke (only matching key)
- Speedup: 3-6x faster

---

## Testing Data

### Test Fixtures

```typescript
// tests/fixtures/shortcuts.ts
export const testShortcuts: KeyboardShortcut[] = [
  {
    id: 'test-search',
    key: 'f',
    modifiers: ['ctrl', 'cmd'],
    handler: vi.fn(),
    description: 'Test search',
    category: 'Search',
  },
  {
    id: 'test-tab',
    key: '2',
    modifiers: ['ctrl', 'cmd'],
    handler: vi.fn(),
    description: 'Test tab switch',
    category: 'Navigation',
    condition: () => true,
  },
  {
    id: 'test-arrow',
    key: 'ArrowDown',
    modifiers: [],
    handler: vi.fn(),
    description: 'Test arrow navigation',
    category: 'Selection',
  },
];
```

### Mock Platform Data

```typescript
// tests/mocks/platform.ts
export const mockPlatforms: Record<PlatformInfo, NavigatorUserAgentData> = {
  macos: {
    platform: 'macOS',
    brands: [{ brand: 'Chromium', version: '120' }],
    mobile: false,
  },
  windows: {
    platform: 'Windows',
    brands: [{ brand: 'Chromium', version: '120' }],
    mobile: false,
  },
  linux: {
    platform: 'Linux',
    brands: [{ brand: 'Chromium', version: '120' }],
    mobile: false,
  },
};
```

---

## Summary

**Total Entities**: 6 (KeyboardShortcut, Modifier, ShortcutCategory, KeyboardEvent, FocusState, PlatformInfo)

**State Machines**: 4 (Search Focus, Tab Switching, Skill Navigation, Help Overlay)

**Key Relationships**:

- Shortcuts stored in registry (Map<string, KeyboardShortcut>)
- Shortcuts indexed by key for O(1) lookup
- Components integrate via useKeyboardShortcuts hook
- Help overlay displays shortcuts grouped by category

**Next Phase**: Create TypeScript interface contracts for implementation

**Status**: ✅ Data Model Complete | ⏭️ Ready for Contracts
