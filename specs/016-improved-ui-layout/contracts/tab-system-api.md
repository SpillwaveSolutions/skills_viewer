# API Contract: Tab System

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Define the API for top tab bar component and tab switching logic

## Overview

The Tab System API manages the 6-tab navigation interface positioned at the top of the skill viewer. It integrates with keyboard shortcuts (Cmd/Ctrl+1-6), provides visual feedback for active/hover states, and maintains accessibility standards.

## Component API

### `TabBar`

**Type**: React functional component

**Props**:

```typescript
interface TabBarProps {
  tabs: TabConfig[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
}
```

**Tab Configuration Type**:

```typescript
interface TabConfig {
  id: string; // 'overview' | 'content' | 'triggers' | 'diagram' | 'references' | 'scripts'
  label: string; // Display text
  icon: string; // Emoji icon (e.g., '📊')
  shortcutIndex: number; // 1-6 for Cmd/Ctrl+N
  ariaLabel: string; // Accessibility label
}
```

**Example**:

```typescript
<TabBar
  tabs={TABS}
  activeIndex={activeTabIndex}
  onTabChange={(index) => {
    setActiveTabIndex(index);
    keyboardStore.setActiveTabIndex(index);
  }}
/>
```

**Rendering**:

```html
<div role="tablist" aria-label="Skill detail tabs" class="flex gap-1 px-6 border-b border-gray-200">
  <button
    id="tab-overview"
    role="tab"
    aria-selected="true"
    aria-controls="tabpanel-overview"
    class="px-4 py-3 text-sm font-medium border-b-2 border-purple-600 text-purple-600"
  >
    <span aria-hidden="true">📊</span>
    Overview
  </button>
  <!-- ... 5 more tabs ... -->
</div>
```

**Referenced Requirements**:

- FR-001: Position tabs horizontally below skill header
- FR-004: Maintain tab order (Overview, Content, Triggers, Diagram, References, Scripts)
- FR-048: Use role="tablist" and role="tab"

---

## Tab Definitions

### `TABS` Constant

**Type**: Read-only array of TabConfig

**Definition**:

```typescript
const TABS: readonly TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    shortcutIndex: 1,
    ariaLabel: 'Overview tab',
  },
  {
    id: 'content',
    label: 'Content',
    icon: '📄',
    shortcutIndex: 2,
    ariaLabel: 'Content tab',
  },
  {
    id: 'triggers',
    label: 'Triggers',
    icon: '⚡',
    shortcutIndex: 3,
    ariaLabel: 'Triggers tab',
  },
  {
    id: 'diagram',
    label: 'Diagram',
    icon: '🔷',
    shortcutIndex: 4,
    ariaLabel: 'Diagram tab',
  },
  {
    id: 'references',
    label: 'References',
    icon: '📚',
    shortcutIndex: 5,
    ariaLabel: 'References tab',
  },
  {
    id: 'scripts',
    label: 'Scripts',
    icon: '📜',
    shortcutIndex: 6,
    ariaLabel: 'Scripts tab',
  },
] as const;
```

**Business Rules**:

- Tab order is fixed (cannot be reordered)
- Exactly 6 tabs (no more, no less)
- Icons use emoji (consistent cross-platform rendering)
- Shortcut indices map to keyboard numbers (1-6)

**Referenced Requirements**:

- FR-004: Maintain tab order
- FR-035: Show icon + label for each tab
- FR-052: Maintain keyboard shortcut compatibility

---

## Visual States

### Active Tab

**TailwindCSS Classes**:

```tsx
className={`
  px-4 py-3 text-sm font-medium
  border-b-2 border-purple-600
  text-purple-600
  transition-colors duration-200
`}
```

**Visual Appearance**:

- Purple bottom border (#7c3aed, 2px thick)
- Purple text color
- No background color (transparent)

**Referenced Requirements**:

- FR-034: Show purple bottom border (#7c3aed, 2px) on active tab
- FR-036: Use 14px font size with 500 weight (text-sm font-medium)

---

### Inactive Tab (Default)

**TailwindCSS Classes**:

```tsx
className={`
  px-4 py-3 text-sm font-medium
  border-b-2 border-transparent
  text-gray-600
  transition-colors duration-200
`}
```

**Visual Appearance**:

- No bottom border (transparent)
- Gray text color
- No background color

**Referenced Requirements**:

- FR-036: Use 14px font size with 500 weight

---

### Inactive Tab (Hover)

**TailwindCSS Classes**:

```tsx
className={`
  px-4 py-3 text-sm font-medium
  border-b-2 border-transparent
  text-gray-900
  bg-gray-100
  hover:border-gray-300
  transition-colors duration-200
`}
```

**Visual Appearance**:

- Light gray background (#f3f4f6 = bg-gray-100)
- Darker text color (nearly black)
- Light gray bottom border on hover

**Referenced Requirements**:

- FR-033: Show light gray background (#f3f4f6) on tab hover

---

### Focused Tab (Keyboard Navigation)

**TailwindCSS Classes**:

```tsx
className={`
  px-4 py-3 text-sm font-medium
  border-b-2
  focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2
  transition-colors duration-200
`}
```

**Visual Appearance**:

- Purple focus ring (2px)
- 2px offset for visibility
- No default outline (using custom ring)

**Referenced Requirements**:

- FR-038: Show focus ring on tabs when navigating via keyboard
- FR-051: Show visible focus indicators

---

## Tab Switching

### Click Handler

**Method**: `onTabChange(index: number)`

**Implementation**:

```typescript
const handleTabClick = (index: number) => {
  // Update local state
  setActiveTabIndex(index);

  // Update keyboard store (for keyboard shortcuts)
  keyboardStore.setActiveTabIndex(index);

  // Trigger breadcrumb update
  // (handled automatically via useEffect on activeTabIndex)
};
```

**Side Effects**:

- Updates activeTabIndex in component state
- Updates activeTabIndex in keyboardStore
- Triggers breadcrumb update (<50ms)
- Scrolls content area to top (optional UX improvement)

**Referenced Requirements**:

- FR-037: Show smooth transition (<200ms) when switching tabs

---

### Keyboard Shortcut Handler

**Integration**: Existing `useKeyboardShortcuts` hook

**Logic**:

```typescript
// In useKeyboardShortcuts.ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMod = platform === 'mac' ? e.metaKey : e.ctrlKey;

    if (isMod && e.key >= '1' && e.key <= '6') {
      e.preventDefault();
      const index = parseInt(e.key) - 1; // 0-5
      setActiveTabIndex(index);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [platform]);
```

**Referenced Requirements**:

- FR-052: Maintain keyboard shortcut compatibility (Cmd/Ctrl+1-6)
- FR-039: Update visual active state immediately when switching tabs via keyboard shortcuts

---

### Transition Animation

**Duration**: 200ms

**Properties Animated**:

- `border-color` (transparent → purple or vice versa)
- `color` (gray → purple or vice versa)
- `background-color` (transparent → gray on hover)

**TailwindCSS**:

```tsx
transition-colors duration-200
```

**Performance**:

- Uses CSS transitions (GPU-accelerated)
- No JavaScript animation (60fps guaranteed)
- Targets <200ms total transition time

**Referenced Requirements**:

- FR-037: Show smooth transition (<200ms) when switching tabs
- SC-005: Tab switching completes within 200ms

---

## Accessibility

### Semantic HTML

**Structure**:

```html
<div role="tablist" aria-label="Skill detail tabs">
  <button
    id="tab-{id}"
    role="tab"
    aria-selected="{active}"
    aria-controls="tabpanel-{id}"
    tabindex="{active ? 0 : -1}"
  >
    {icon} {label}
  </button>
</div>

<div id="tabpanel-{id}" role="tabpanel" aria-labelledby="tab-{id}">{content}</div>
```

**Referenced Requirements**:

- FR-048: Use role="tablist" and role="tab"

---

### ARIA Attributes

| Attribute         | Purpose                  | Value                           |
| ----------------- | ------------------------ | ------------------------------- |
| `role="tablist"`  | Identifies tab container | Always present                  |
| `role="tab"`      | Identifies tab button    | Always present                  |
| `aria-selected`   | Indicates active tab     | `true` or `false`               |
| `aria-controls`   | Links tab to panel       | `tabpanel-{id}`                 |
| `aria-labelledby` | Links panel to tab       | `tab-{id}`                      |
| `tabIndex`        | Manages keyboard focus   | `0` (active) or `-1` (inactive) |

**Referenced Requirements**:

- FR-048: Use role="tablist" and role="tab"

---

### Screen Reader Announcements

**Tab Change**:

```typescript
// Announce when tab changes
useEffect(() => {
  if (activeTabIndex !== null) {
    const tabName = TABS[activeTabIndex].label;
    announceToScreenReader(`${tabName} tab active`);
  }
}, [activeTabIndex]);
```

**Referenced Requirements**:

- FR-049: Announce tab changes to screen readers ("Content tab active")

---

### Keyboard Focus Management

**Focus Order**:

1. Active tab gets `tabIndex={0}` (focusable)
2. Inactive tabs get `tabIndex={-1}` (not focusable)

**Arrow Key Navigation** (Optional Enhancement):

```typescript
// Allow left/right arrows to navigate between tabs
const handleArrowKeys = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') {
    setActiveTabIndex((prev) => Math.min(prev + 1, TABS.length - 1));
  } else if (e.key === 'ArrowLeft') {
    setActiveTabIndex((prev) => Math.max(prev - 1, 0));
  }
};
```

**Referenced Requirements**:

- FR-050: Provide keyboard navigation for tabs

---

## Integration with Existing Systems

### Keyboard Store

**Dependency**: `keyboardStore.activeTabIndex`

**Bidirectional Sync**:

```typescript
// Sync component state with store
useEffect(() => {
  if (activeTabIndex !== keyboardStore.activeTabIndex) {
    keyboardStore.setActiveTabIndex(activeTabIndex);
  }
}, [activeTabIndex]);

// Sync store state with component
useEffect(() => {
  if (keyboardStore.activeTabIndex !== null) {
    setActiveTabIndex(keyboardStore.activeTabIndex);
  }
}, [keyboardStore.activeTabIndex]);
```

**Referenced Requirements**:

- FR-052: Maintain keyboard shortcut compatibility

---

### Navigation Store

**Dependency**: `navigationStore.navigateTo()`

**Integration**:

```typescript
// Update navigation history when tab changes
useEffect(() => {
  if (selectedSkill && activeTab) {
    const entry: NavigationEntry = {
      type: 'skill',
      skill: selectedSkill,
      tab: activeTab,
      timestamp: Date.now(),
      label: `${selectedSkill.name} - ${activeTab}`,
    };
    navigationStore.navigateTo(entry);
  }
}, [selectedSkill, activeTab]);
```

**Referenced Requirements**:

- FR-022: Update breadcrumb when navigating via browser back/forward

---

## Performance Requirements

| Operation                  | Target        | Measurement                     |
| -------------------------- | ------------- | ------------------------------- |
| Tab click to state update  | <5ms          | `performance.now()`             |
| State update to DOM render | <16ms (60fps) | React DevTools Profiler         |
| Total tab switch time      | <200ms        | E2E test with visual validation |
| Transition animation       | 200ms         | CSS `transition-duration`       |

**Optimization Strategies**:

- Use `React.memo` on TabBar component
- Avoid inline onClick handlers (define outside render)
- Use CSS transitions (not JS animations)

**Referenced Requirements**:

- FR-037: Smooth transition <200ms
- SC-005: Tab switching completes within 200ms

---

## Test Requirements

### Unit Tests

**TabBar Component** (`TabBar.test.tsx`):

- ✅ Renders 6 tabs
- ✅ Active tab shows purple border
- ✅ Inactive tabs show gray text
- ✅ Clicking tab calls onTabChange with correct index
- ✅ Tabs have correct aria-selected values
- ✅ Icons render correctly

### Integration Tests

**Tab Switching** (`TabSwitching.test.tsx`):

- ✅ Clicking tab updates activeTabIndex
- ✅ Clicking tab updates keyboardStore
- ✅ Clicking tab triggers breadcrumb update
- ✅ Keyboard shortcuts switch tabs
- ✅ Tab content updates when switching
- ✅ Transition completes within 200ms

### E2E Tests

**Top Tabs** (`top-tabs.spec.ts`):

- ✅ Tabs appear below header (not at bottom)
- ✅ All 6 tabs visible and clickable
- ✅ Clicking each tab shows correct content
- ✅ Keyboard shortcuts (Cmd+1-6) switch tabs
- ✅ Visual active state updates immediately
- ✅ Hover states work correctly
- ✅ Focus rings appear on keyboard navigation

**Keyboard Shortcuts** (`keyboard-shortcuts.spec.ts`):

- ✅ Cmd/Ctrl+1 switches to Overview tab
- ✅ Cmd/Ctrl+2 switches to Content tab
- ✅ Cmd/Ctrl+3 switches to Triggers tab
- ✅ Cmd/Ctrl+4 switches to Diagram tab
- ✅ Cmd/Ctrl+5 switches to References tab
- ✅ Cmd/Ctrl+6 switches to Scripts tab

**Referenced Requirements**:

- Principle VII: >80% test coverage required
- SC-005: Tab switching <200ms (measured)
- SC-006: 100% of tab interactions show correct visual feedback

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
