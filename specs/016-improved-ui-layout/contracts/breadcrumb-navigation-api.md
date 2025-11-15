# API Contract: Breadcrumb Navigation

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Define the API for breadcrumb navigation component and segment management

## Overview

The Breadcrumb Navigation API provides hierarchical navigation within the Skill Debugger UI. It displays the current location as a clickable path (Home › Skill › Tab) and updates reactively when navigation changes.

## Component API

### `BreadcrumbNavigation`

**Type**: React functional component

**Props**:

```typescript
interface BreadcrumbNavigationProps {
  segments: BreadcrumbSegment[];
  className?: string;
  'aria-label'?: string;
}
```

**Segment Type**:

```typescript
interface BreadcrumbSegment {
  id: string; // Unique identifier ('home', 'skill', 'tab')
  label: string; // Display text
  clickable: boolean; // Can user click this segment?
  ariaLabel?: string; // Accessibility label
  onClick?: () => void; // Navigation handler
}
```

**Example**:

```typescript
<BreadcrumbNavigation
  segments={[
    { id: 'home', label: 'Home', clickable: true, onClick: navigateHome },
    { id: 'skill', label: 'My Skill', clickable: false },
    { id: 'tab', label: 'Diagram', clickable: false }
  ]}
  aria-label="Breadcrumb"
/>
```

**Rendering**:

```html
<nav aria-label="Breadcrumb" class="bg-gray-800 text-white px-6 py-3">
  <ol class="flex items-center gap-2">
    <li>
      <button aria-label="Navigate to home" class="hover:underline">Home</button>
    </li>
    <li aria-hidden="true">›</li>
    <li>
      <span class="text-gray-300">My Skill</span>
    </li>
    <li aria-hidden="true">›</li>
    <li>
      <span class="text-gray-400 font-medium">Diagram</span>
    </li>
  </ol>
</nav>
```

**Referenced Requirements**:

- FR-015: Display breadcrumb navigation in top bar
- FR-017: Show "Home › [Skill Name] › [Tab Name]" when viewing skill
- FR-046: Use semantic HTML for breadcrumb (nav element with aria-label)

---

## Segment Generation

### `useBreadcrumbSegments`

**Type**: React hook

**Purpose**: Generate breadcrumb segments from navigation state

**Returns**:

```typescript
{
  segments: BreadcrumbSegment[];
  updateSegments: () => void;
}
```

**Logic**:

```typescript
export const useBreadcrumbSegments = (): BreadcrumbSegment[] => {
  const { selectedSkill, selectSkill } = useSkillStore();
  const activeTabIndex = useKeyboardStore((state) => state.activeTabIndex);

  // Home only (viewing skill list)
  if (!selectedSkill) {
    return [{ id: 'home', label: 'Home', clickable: false }];
  }

  // Home › Skill › Tab (viewing skill)
  const tabName = TABS[activeTabIndex ?? 0].label;

  return [
    {
      id: 'home',
      label: 'Home',
      clickable: true,
      ariaLabel: 'Navigate to home',
      onClick: () => selectSkill(null),
    },
    {
      id: 'skill',
      label: selectedSkill.name,
      clickable: false,
    },
    {
      id: 'tab',
      label: tabName,
      clickable: false,
    },
  ];
};
```

**Referenced Requirements**:

- FR-016: Show "Home" as breadcrumb when viewing skill list
- FR-017: Show "Home › [Skill Name] › [Tab Name]" when viewing skill
- FR-019: Navigate to skill list when "Home" breadcrumb clicked

---

## Update Triggers

### Tab Change

**Trigger**: `keyboardStore.setActiveTabIndex(index)`

**Expected Behavior**:

- Breadcrumb updates to show new tab name
- Update completes within 50ms (FR-020)

**Implementation**:

```typescript
useEffect(() => {
  // Segments re-compute when activeTabIndex changes
  const segments = useBreadcrumbSegments();
  setBreadcrumbSegments(segments);
}, [activeTabIndex, selectedSkill]);
```

**Performance Optimization**:

- Use `React.memo` on BreadcrumbNavigation component
- Avoid inline object creation in segment generation
- Pre-compute TABS array (constant, no re-computation)

**Referenced Requirements**:

- FR-020: Update breadcrumb tab name immediately when tab changes (<50ms)
- FR-021: Update breadcrumb when navigating via keyboard shortcuts
- SC-003: Breadcrumb updates within 50ms of tab change

---

### Skill Selection

**Trigger**: `selectSkill(skill)` or `selectSkill(null)`

**Expected Behavior**:

- Breadcrumb shows 3 segments (Home › Skill › Tab) when skill selected
- Breadcrumb shows 1 segment (Home) when skill deselected
- Update is immediate (<50ms)

**Referenced Requirements**:

- FR-016: Show "Home" when viewing skill list
- FR-017: Show "Home › Skill › Tab" when viewing skill

---

### Browser Navigation

**Trigger**: Browser back/forward buttons, Escape key

**Expected Behavior**:

- Breadcrumb syncs with navigation history
- Uses `navigationStore.history` as source of truth

**Implementation**:

```typescript
useEffect(() => {
  const currentEntry = navigationStore.history[navigationStore.history.length - 1];
  if (currentEntry.type === 'home') {
    // Show Home only
  } else if (currentEntry.type === 'skill') {
    // Show Home › Skill › Tab
  }
}, [navigationStore.history]);
```

**Referenced Requirements**:

- FR-022: Update breadcrumb when navigating via browser back/forward

---

## Navigation Arrows

### Component Integration

**Props**:

```typescript
interface NavigationArrowsProps {
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}
```

**Example**:

```typescript
<div className="flex items-center gap-4 bg-gray-800 px-6 py-3">
  <button
    onClick={onBack}
    disabled={!canGoBack}
    aria-label="Go back"
    className="text-white disabled:opacity-50"
  >
    ←
  </button>
  <button
    onClick={onForward}
    disabled={!canGoForward}
    aria-label="Go forward"
    className="text-white disabled:opacity-50"
  >
    →
  </button>
  <BreadcrumbNavigation segments={segments} />
</div>
```

**Business Logic**:

```typescript
const canGoBack = navigationStore.currentIndex > 0;
const canGoForward = navigationStore.currentIndex < navigationStore.history.length - 1;

const onBack = () => {
  navigationStore.goBack();
};

const onForward = () => {
  navigationStore.goForward();
};
```

**Referenced Requirements**:

- FR-023: Include navigation arrows (← →) in breadcrumb bar

---

## Responsive Behavior

### Long Skill Names

**Problem**: Skill name > 50 characters causes breadcrumb overflow

**Solution**: Truncate with ellipsis

**Implementation**:

```typescript
<span
  className="max-w-xs truncate"
  title={skill.name} // Tooltip shows full name
>
  {skill.name}
</span>
```

**Referenced Requirements**:

- FR-042: Truncate breadcrumb text with ellipsis when skill name + tab name exceeds width

---

### Small Windows (800px min)

**Problem**: Breadcrumb may overflow on narrow windows

**Solution**: Responsive truncation strategy

**Implementation**:

```typescript
// Desktop (>1024px): Show full path
Home › Very Long Skill Name › Diagram

// Tablet (800-1024px): Truncate skill name
Home › Very Long Ski... › Diagram

// Mobile (<800px): Not supported (Tauri desktop min width is 800px)
```

**Referenced Requirements**:

- FR-041: Support minimum window width of 800px

---

## Accessibility

### Semantic HTML

**Requirements**:

- `<nav aria-label="Breadcrumb">` container
- `<ol>` list for segments (ordered hierarchy)
- `<button>` for clickable segments
- `<span>` for non-clickable segments (current location)

**Example**:

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><button aria-label="Navigate to home">Home</button></li>
    <li aria-hidden="true">›</li>
    <li><span>Current Location</span></li>
  </ol>
</nav>
```

**Referenced Requirements**:

- FR-046: Use semantic HTML (nav element with aria-label="breadcrumb")
- FR-047: Provide ARIA labels for breadcrumb links

---

### Keyboard Navigation

**Tab Order**:

1. Back arrow button (if enabled)
2. Forward arrow button (if enabled)
3. Home breadcrumb (if clickable)

**Focus Indicators**:

- Visible focus ring on all interactive elements
- Focus ring color: purple (#7c3aed) matching brand

**Referenced Requirements**:

- FR-050: Provide keyboard navigation for breadcrumbs (Tab/Shift+Tab)
- FR-051: Show visible focus indicators for all interactive elements

---

### Screen Reader Announcements

**Tab Change**:

```typescript
// Announce new location when tab changes
useEffect(() => {
  const announcement = `Navigated to ${tabName} tab`;
  announceToScreenReader(announcement);
}, [activeTabIndex]);
```

**Segment Click**:

```typescript
// Announce navigation when segment clicked
const handleHomeClick = () => {
  selectSkill(null);
  announceToScreenReader('Navigated to home');
};
```

**Referenced Requirements**:

- FR-047: Provide ARIA labels for breadcrumb links

---

## Performance Requirements

| Operation              | Target | Measurement                     |
| ---------------------- | ------ | ------------------------------- |
| Segment re-computation | <5ms   | `performance.now()`             |
| Breadcrumb re-render   | <50ms  | React DevTools Profiler         |
| Tab name update        | <50ms  | E2E test with timestamp capture |

**Optimization Strategies**:

- Memoize BreadcrumbNavigation component
- Use constant TABS array (no re-computation)
- Avoid inline onClick handlers (define outside render)

**Referenced Requirements**:

- FR-020: Update breadcrumb within 50ms of tab change
- SC-003: Breadcrumb updates within 50ms (measured via performance API)

---

## Test Requirements

### Unit Tests

**Segment Generation** (`useBreadcrumbSegments.test.ts`):

- ✅ Returns single 'Home' segment when no skill selected
- ✅ Returns 3 segments when skill selected (Home › Skill › Tab)
- ✅ Home segment is clickable when skill selected
- ✅ Skill segment is not clickable
- ✅ Tab segment is not clickable
- ✅ Tab name updates when activeTabIndex changes

### Integration Tests

**Breadcrumb Update** (`BreadcrumbUpdate.test.tsx`):

- ✅ Breadcrumb updates when tab changes
- ✅ Breadcrumb updates when skill selected
- ✅ Breadcrumb updates when skill deselected
- ✅ Clicking Home segment navigates to skill list
- ✅ Update completes within 50ms

### E2E Tests

**Breadcrumb Navigation** (`breadcrumb-navigation.spec.ts`):

- ✅ Breadcrumb shows "Home" on initial load
- ✅ Breadcrumb shows "Home › Skill › Tab" when skill selected
- ✅ Clicking Home breadcrumb returns to skill list
- ✅ Breadcrumb updates when using keyboard shortcuts (Cmd+1-6)
- ✅ Breadcrumb updates when using back/forward arrows
- ✅ Long skill names truncate with ellipsis

**Referenced Requirements**:

- Principle VII: >80% test coverage required
- SC-003: Breadcrumb updates within 50ms (measured)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
