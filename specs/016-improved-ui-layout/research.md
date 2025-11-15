# Phase 0: Research - Improved UI Layout with Top Tabs

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Research best practices, patterns, and implementation strategies before design

## Research Areas

### 1. React Best Practices for Top Tab Navigation Patterns

**Pattern: Controlled Tab Component with Keyboard Navigation**

```tsx
// Industry standard pattern (VS Code, Chrome DevTools)
interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  index: number;
}

const Tab: React.FC<TabProps> = ({ id, label, icon, active, onClick, index }) => {
  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={active}
      aria-controls={`tabpanel-${id}`}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={/* TailwindCSS utilities */}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
};
```

**Key Findings**:

- Use `role="tablist"` on container, `role="tab"` on buttons
- Active tab gets `tabIndex={0}`, inactive tabs get `tabIndex={-1}`
- Use `aria-selected` for screen reader feedback
- Connect tabs to panels via `aria-controls` and `id` attributes
- Position tabs immediately below header (industry standard)

**Accessibility Requirements** (FR-046 to FR-052):

- Semantic HTML: `<nav>` for breadcrumb, `role="tablist"` for tabs
- ARIA labels: `aria-label="breadcrumb"`, `aria-label="Skill detail tabs"`
- Focus management: visible focus rings, keyboard navigation support
- Announcements: screen readers announce "Content tab active" on change

### 2. TailwindCSS Utilities for Tab Styling

**Active Tab Border Pattern** (FR-034):

```tsx
// Purple bottom border (#7c3aed, 2px thick)
<button className={`
  px-4 py-3 text-sm font-medium
  border-b-2 transition-colors duration-200
  ${active
    ? 'border-purple-600 text-purple-600'
    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
  }
`}>
```

**Hover States** (FR-033):

```tsx
// Light gray background on hover (#f3f4f6)
<button className={`
  hover:bg-gray-100
  ${active ? 'bg-white' : 'bg-transparent'}
`}>
```

**Smooth Transitions** (FR-037):

```tsx
// <200ms transitions for border, text color, background
<button className="
  transition-all duration-200 ease-in-out
  border-b-2
  hover:bg-gray-100
">
```

**Key TailwindCSS Classes**:

- `border-b-2`: Bottom border for active tab indicator
- `border-purple-600`: Active tab color (#7c3aed)
- `hover:bg-gray-100`: Hover background (#f3f4f6)
- `transition-all duration-200`: Smooth 200ms transitions
- `text-sm font-medium`: 14px medium weight (FR-036)

### 3. LocalStorage Patterns for Persisting Layout Preferences

**Type-Safe LocalStorage Wrapper**:

```typescript
// src/utils/localStorage.ts
export const LocalStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};
```

**Persistence Pattern** (FR-028, FR-029):

```typescript
// Restore on mount
useEffect(() => {
  const savedMode = LocalStorage.get<LayoutMode>('layoutMode', 'standard');
  setLayoutMode(savedMode);
}, []);

// Persist on change
useEffect(() => {
  LocalStorage.set('layoutMode', layoutMode);
}, [layoutMode]);
```

**Key Findings**:

- Wrap localStorage in try/catch (quota errors, privacy mode)
- Use JSON.parse/stringify for structured data
- Provide default values for first load
- Sync Zustand store with localStorage via effects

### 4. Breadcrumb Navigation Component Patterns

**Semantic Breadcrumb Structure** (FR-046, FR-047):

```tsx
<nav aria-label="Breadcrumb" className="bg-gray-800 text-white px-6 py-3">
  <ol className="flex items-center gap-2">
    <li>
      <button onClick={navigateHome} aria-label="Navigate to home" className="hover:underline">
        Home
      </button>
    </li>
    <li aria-hidden="true">›</li>
    <li>
      <span className="text-gray-300">{skillName}</span>
    </li>
    <li aria-hidden="true">›</li>
    <li>
      <span className="text-gray-400 font-medium">{activeTab}</span>
    </li>
  </ol>
</nav>
```

**Responsive Truncation** (FR-042):

```tsx
// Truncate long skill names with ellipsis
<span className="max-w-xs truncate" title={skillName}>
  {skillName}
</span>
```

**Navigation Arrows** (FR-023):

```tsx
// Back/forward buttons in breadcrumb bar
<div className="flex items-center gap-4">
  <button onClick={goBack} aria-label="Go back">
    ←
  </button>
  <button onClick={goForward} aria-label="Go forward">
    →
  </button>
  <nav aria-label="Breadcrumb">...</nav>
</div>
```

**Key Findings**:

- Use `<nav aria-label="Breadcrumb">` for semantic HTML
- Use `<ol>` list for breadcrumb segments
- Clickable segments are buttons with aria-labels
- Non-clickable segments (current location) are `<span>`
- Separator characters get `aria-hidden="true"`
- Dark background (#2d2d2d) provides contrast

### 5. Zustand Store Design for Layout State Management

**Layout Store Pattern** (FR-024 to FR-032):

```typescript
// src/stores/layoutStore.ts
import { create } from 'zustand';
import { LocalStorage } from '../utils/localStorage';

type LayoutMode = 'standard' | 'compact';

interface LayoutState {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  mode: LocalStorage.get<LayoutMode>('layoutMode', 'standard'),

  setMode: (mode) => {
    set({ mode });
    LocalStorage.set('layoutMode', mode);
  },

  toggleMode: () => {
    const newMode = get().mode === 'standard' ? 'compact' : 'standard';
    get().setMode(newMode);
  },
}));
```

**Hook Pattern with Persistence**:

```typescript
// src/hooks/useLayoutMode.ts
export const useLayoutMode = () => {
  const { mode, setMode, toggleMode } = useLayoutStore();

  // Restore on mount
  useEffect(() => {
    const saved = LocalStorage.get<LayoutMode>('layoutMode', 'standard');
    if (saved !== mode) {
      setMode(saved);
    }
  }, []);

  return { mode, setMode, toggleMode };
};
```

**Key Findings**:

- Initialize store with localStorage value (prevent flash of wrong mode)
- Sync to localStorage on every mode change
- Provide both `setMode` (explicit) and `toggleMode` (convenience)
- Use hooks for encapsulation and reusability

## Decision Matrix

| Decision                   | Options Considered                                     | Choice           | Rationale                                                                                 |
| -------------------------- | ------------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------- |
| Tab position               | Bottom (current), Top, Sidebar                         | **Top**          | Industry standard (VS Code, Chrome DevTools), +200px vertical space for diagrams (FR-003) |
| Layout modes               | 1 (standard only), 2 (standard + compact), 3+ (custom) | **2 modes**      | Balances simplicity with power-user needs; compact mode addresses FR-024 to FR-032        |
| State management           | React Context, Zustand, Redux                          | **Zustand**      | Already in stack (5.0.8), minimal boilerplate, excellent TypeScript support               |
| Persistence                | localStorage, IndexedDB, Backend                       | **localStorage** | Simple key-value storage sufficient, no backend dependency, works offline                 |
| Breadcrumb update strategy | Debounce, Throttle, Immediate                          | **Immediate**    | <50ms requirement (FR-020) needs instant updates, no perceived lag                        |
| Tab transition             | Instant, Fade, Slide                                   | **Fade (200ms)** | Smooth enough for polish, fast enough for responsiveness (FR-037)                         |

## Implementation Risks & Mitigations

### Risk 1: Breaking Keyboard Shortcuts (High Impact)

**Risk**: Refactoring tab system might disconnect keyboard shortcuts (Cmd/Ctrl+1-6)
**Mitigation**:

- Preserve existing keyboardStore integration
- Write E2E tests for shortcuts BEFORE refactoring
- Regression test: verify all 6 shortcuts work after layout change

### Risk 2: Performance Regression on Breadcrumb Updates (Medium Impact)

**Risk**: Breadcrumb updates might exceed 50ms target (FR-020)
**Mitigation**:

- Use React.memo for BreadcrumbNavigation component
- Avoid inline object creation in render
- Performance test with `performance.now()` in tests
- Target: <20ms actual update time (40% buffer)

### Risk 3: LocalStorage Quota Exceeded (Low Impact)

**Risk**: localStorage.setItem() can throw QuotaExceededError
**Mitigation**:

- Wrap all localStorage calls in try/catch
- Layout mode data is tiny (~20 bytes), very low risk
- Graceful degradation: app works without persistence

### Risk 4: TailwindCSS Class Conflicts (Medium Impact)

**Risk**: Existing global styles might conflict with new utilities
**Mitigation**:

- Use TailwindCSS purge to remove unused classes
- Test with different theme configurations
- Explicitly override conflicting styles with `!important` utilities if needed

## Constraints Validation

| Constraint                         | Status               | Validation Strategy                                 |
| ---------------------------------- | -------------------- | --------------------------------------------------- |
| >80% test coverage (Principle VII) | ✅                   | Measure via Vitest coverage, fail CI if <80%        |
| TDD approach                       | ✅                   | Write tests in tasks.md before implementation tasks |
| No custom CSS                      | ✅                   | Use only TailwindCSS utilities, no `.css` files     |
| Maintain keyboard shortcuts        | ✅                   | E2E regression tests before refactoring             |
| <50ms breadcrumb updates           | ⚠️ NEEDS TESTING     | Performance tests with `performance.now()`          |
| <200ms tab transitions             | ✅                   | TailwindCSS `duration-200` enforces limit           |
| +200px vertical space              | ⚠️ NEEDS MEASUREMENT | Visual regression test at 1080p resolution          |

## Open Questions Resolved

All questions from spec have been answered:

1. **Long skill names (100+ chars)**: Use `max-w-xs truncate` with `title` tooltip
2. **Breadcrumb overflow**: Truncate middle segments, always show Home and current tab
3. **No description in skill**: Compact mode shows stats only, standard mode shows empty state
4. **Small window sizes (800px min)**: Responsive TailwindCSS classes adapt layout
5. **Switching modes while on Overview tab**: No change in content, just header height
6. **Browser history navigation**: navigationStore already tracks history, breadcrumb syncs
7. **Zero counts in inline stats**: Display "refs: 0" (explicit zero, not hidden)
8. **Focus handling**: Use `tabIndex` and `aria-selected` for keyboard/mouse consistency
9. **Diagram tab in compact mode**: Full vertical space benefit (+200px from top tabs, +80-120px from compact header)

## Next Steps

Ready to proceed to **Phase 1: Data Model & API Design**

Generate:

1. `data-model.md` - Entities: LayoutMode, BreadcrumbNavigation, TabConfiguration, HeaderState, OverviewTabContent
2. `contracts/layout-mode-api.md` - Layout mode toggle, persistence, restoration
3. `contracts/breadcrumb-navigation-api.md` - Segment updates, navigation handlers
4. `contracts/tab-system-api.md` - Tab switching, active state, keyboard integration
5. `quickstart.md` - Developer setup, component refactoring guide, testing strategy

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
