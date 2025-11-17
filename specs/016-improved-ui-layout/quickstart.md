# Developer Quickstart: Improved UI Layout with Top Tabs

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Guide developers through setup, implementation, and testing

## Project Setup

### Prerequisites

- Node.js 18+ and npm installed
- Rust 1.75+ and Tauri CLI installed
- Git repository cloned and on branch `016-improved-ui-layout`

### Initial Setup

```bash
# Ensure you're on the feature branch
git checkout 016-improved-ui-layout

# Install dependencies (if not already installed)
npm install

# Verify all tools are available
npm run verify  # or: task verify
```

### Development Environment

```bash
# Start Tauri development server
npm run dev
# or with Task:
task dev

# In a separate terminal, run tests in watch mode
npm run test:watch
# or with Task:
task test:ui
```

---

## Architecture Overview

### Component Hierarchy (After Refactoring)

```
App
└── SkillViewer
    ├── BreadcrumbNavigation (NEW - top bar with Home › Skill › Tab)
    ├── SkillHeader (NEW - title + badge, mode-specific content)
    ├── TabBar (NEW - 6 tabs in horizontal row)
    └── TabContent (conditional rendering based on activeTab)
        ├── OverviewTab (REFACTORED from OverviewPanel)
        ├── ContentTab (existing)
        ├── TriggersTab (existing)
        ├── DiagramTab (existing)
        ├── ReferencesTab (existing)
        └── ScriptsTab (existing)
```

### State Management

```
Zustand Stores:
  keyboardStore (existing)
    └── activeTabIndex: number | null

  layoutStore (NEW)
    └── mode: 'standard' | 'compact'

  navigationStore (existing)
    └── history: NavigationEntry[]

LocalStorage:
  layoutMode: 'standard' | 'compact' (persisted preference)
```

---

## Component Refactoring Guide

### Step 1: Create New Components

#### 1.1 BreadcrumbNavigation Component

**File**: `src/components/BreadcrumbNavigation.tsx`

**Purpose**: Display hierarchical navigation (Home › Skill › Tab)

**Key Features**:

- Dark background (#2d2d2d) top bar
- Clickable "Home" segment when viewing skill
- Updates within <50ms when tab changes
- Truncates long skill names with ellipsis

**Contract**: See `contracts/breadcrumb-navigation-api.md`

**Testing Strategy**:

- Unit tests: Segment generation logic
- Integration tests: Updates on tab change, skill selection
- E2E tests: Click navigation, keyboard shortcut updates

---

#### 1.2 SkillHeader Component

**File**: `src/components/SkillHeader.tsx`

**Purpose**: Consolidated header showing title, badge, and mode-specific content

**Variants**:

- **Standard Mode**: Title + badge + description
- **Compact Mode**: Title + badge + inline stats

**Key Features**:

- Responds to layoutStore.mode changes
- Inline stats format: "refs: 3 | scripts: 4 | triggers: 9 | lines: 417"
- Truncates long titles with ellipsis

**Contract**: See `contracts/layout-mode-api.md`

**Testing Strategy**:

- Unit tests: Mode switching, stat formatting
- Integration tests: Toggle mode updates header
- E2E tests: Compact mode persists across reloads

---

#### 1.3 TabBar Component

**File**: `src/components/TabBar.tsx`

**Purpose**: Horizontal tab bar with 6 tabs

**Key Features**:

- Purple bottom border on active tab
- Light gray hover background
- Smooth 200ms transitions
- Keyboard shortcut integration (Cmd/Ctrl+1-6)

**Contract**: See `contracts/tab-system-api.md`

**Testing Strategy**:

- Unit tests: Tab rendering, click handlers
- Integration tests: Tab switching, keyboard shortcuts
- E2E tests: Visual states (active, hover, focus)

---

#### 1.4 OverviewTab Component

**File**: `src/components/OverviewTab.tsx`

**Purpose**: Consolidated metadata tab (replaces OverviewPanel in header)

**Sections**:

- Description
- Version badge
- Trigger badges (first 5)
- Stats grid (4 columns)
- Metadata grid (2 columns)
- Tag cloud (if tags exist)

**Key Features**:

- No duplicate content with header
- Identical content in both standard and compact modes
- Full metadata visibility

**Contract**: See `data-model.md` (OverviewTabContent entity)

**Testing Strategy**:

- Unit tests: Section rendering, data display
- Integration tests: Mode switching doesn't change content
- E2E tests: All metadata visible in both modes

---

### Step 2: Refactor Existing Components

#### 2.1 SkillViewer.tsx

**Changes Required**:

1. **Remove bottom tab bar** (move to top)
2. **Remove OverviewPanel from header area** (now a tab)
3. **Add BreadcrumbNavigation, SkillHeader, TabBar** (new top structure)
4. **Update tab content rendering** (Overview tab uses OverviewTab component)

**Before (Current)**:

```tsx
<div className="flex flex-col h-full">
  <BackButton />
  <OverviewPanel skill={selectedSkill} /> {/* Header area */}
  <div className="flex-1 overflow-y-auto">{/* Content area */}</div>
  <div className="border-t">
    {' '}
    {/* Bottom tabs */}
    <Tabs />
  </div>
</div>
```

**After (Refactored)**:

```tsx
<div className="flex flex-col h-full">
  <BreadcrumbNavigation /> {/* NEW: Top bar */}
  <SkillHeader skill={selectedSkill} /> {/* NEW: Consolidated header */}
  <TabBar tabs={TABS} activeIndex={activeTabIndex} /> {/* NEW: Top tabs */}
  <div className="flex-1 overflow-y-auto">
    {activeTab === 'overview' && <OverviewTab skill={selectedSkill} />}
    {activeTab === 'content' && <ContentTab skill={selectedSkill} />}
    {/* ... other tabs ... */}
  </div>
  {/* Bottom tab bar REMOVED */}
</div>
```

**Vertical Space Gain**: +200px (from removing bottom tab bar)

---

#### 2.2 OverviewPanel.tsx → OverviewTab.tsx

**Transformation**:

- Old: Rendered in header area above tabs
- New: Rendered as first tab content (Overview tab)

**Changes**:

1. Rename component: `OverviewPanel` → `OverviewTab`
2. Remove header positioning logic (now in tab content area)
3. Add all metadata sections (version, triggers, stats, metadata grid, tags)
4. Ensure no content duplication with SkillHeader

**Migration Checklist**:

- ✅ Move description to Overview tab (remove from header)
- ✅ Add version badge section
- ✅ Add trigger badges (first 5, light blue background)
- ✅ Add stats grid (4 columns)
- ✅ Add metadata grid (2 columns)
- ✅ Add tag cloud (conditional on tags existence)

---

### Step 3: Create State Management

#### 3.1 Layout Store

**File**: `src/stores/layoutStore.ts`

**Implementation**:

```typescript
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

**Contract**: See `contracts/layout-mode-api.md`

---

#### 3.2 LocalStorage Utility

**File**: `src/utils/localStorage.ts`

**Implementation**:

```typescript
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

---

#### 3.3 Layout Mode Hook

**File**: `src/hooks/useLayoutMode.ts`

**Implementation**:

```typescript
import { useEffect } from 'react';
import { useLayoutStore } from '../stores/layoutStore';
import { LocalStorage } from '../utils/localStorage';

export const useLayoutMode = () => {
  const { mode, setMode, toggleMode } = useLayoutStore();

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = LocalStorage.get<LayoutMode>('layoutMode', 'standard');
    if (saved !== mode) {
      setMode(saved);
    }
  }, []);

  return {
    mode,
    setMode,
    toggleMode,
    isCompact: mode === 'compact',
    isStandard: mode === 'standard',
  };
};
```

---

## Testing Strategy

### Test-Driven Development (TDD) Workflow

**CRITICAL**: This feature MUST follow TDD approach (constitutional requirement)

```bash
# Step 1: Write failing test
npm run test:unit src/stores/layoutStore.test.ts
# Expected: Test fails (store not implemented yet)

# Step 2: Implement minimum code to pass
# Edit src/stores/layoutStore.ts

# Step 3: Run test again
npm run test:unit src/stores/layoutStore.test.ts
# Expected: Test passes

# Step 4: Refactor (if needed)
# Step 5: Repeat for next feature
```

---

### Test Coverage Breakdown

**Target**: >80% coverage (constitutional Principle VII)

| Category    | Target Coverage | Files                                                                  |
| ----------- | --------------- | ---------------------------------------------------------------------- |
| Stores      | 100%            | layoutStore.ts                                                         |
| Hooks       | 100%            | useLayoutMode.ts                                                       |
| Utils       | 100%            | localStorage.ts                                                        |
| Components  | 85%             | BreadcrumbNavigation.tsx, SkillHeader.tsx, TabBar.tsx, OverviewTab.tsx |
| Integration | 80%             | Tab switching, breadcrumb updates, mode toggle                         |
| E2E         | 60%             | Critical user paths                                                    |

---

### Unit Tests

**Run**:

```bash
npm run test:unit
# or with Task:
task test:frontend
```

**Key Test Files**:

- `tests/unit/stores/layoutStore.test.ts` (layout mode state)
- `tests/unit/hooks/useLayoutMode.test.ts` (layout mode hook)
- `tests/unit/utils/localStorage.test.ts` (storage wrapper)
- `tests/unit/components/TabBar.test.tsx` (tab rendering)
- `tests/unit/components/BreadcrumbNavigation.test.tsx` (segment generation)

---

### Integration Tests

**Run**:

```bash
npm run test:integration
# or with Task:
task test:frontend
```

**Key Test Files**:

- `tests/integration/TabSwitching.test.tsx` (tab navigation, keyboard shortcuts)
- `tests/integration/BreadcrumbUpdate.test.tsx` (breadcrumb sync)
- `tests/integration/LayoutModeToggle.test.tsx` (compact mode toggle, persistence)

**Critical Scenarios**:

- ✅ Clicking tab updates activeTabIndex and breadcrumb within 50ms
- ✅ Keyboard shortcuts (Cmd+1-6) switch tabs correctly
- ✅ Toggling compact mode updates header immediately
- ✅ Layout mode persists to localStorage on change

---

### E2E Tests

**Run**:

```bash
npm run test:e2e
# or with Task:
task test:e2e
```

**Key Test Files**:

- `tests/e2e/top-tabs.spec.ts` (tab positioning, visual states)
- `tests/e2e/breadcrumb-navigation.spec.ts` (breadcrumb clicks, updates)
- `tests/e2e/compact-mode.spec.ts` (mode persistence across reloads)
- `tests/e2e/keyboard-shortcuts.spec.ts` (regression test for Cmd+1-6)

**Critical User Paths**:

1. **Tab Navigation**: Select skill → click each tab → verify content displays
2. **Keyboard Shortcuts**: Select skill → press Cmd+1-6 → verify tabs switch
3. **Breadcrumb Navigation**: Select skill → click "Home" → return to list
4. **Compact Mode**: Toggle compact → reload app → verify mode restored
5. **Vertical Space**: Measure content area height → verify +200px vs current

---

### Performance Tests

**Breadcrumb Update Speed** (FR-020):

```typescript
test('breadcrumb updates within 50ms of tab change', async () => {
  const start = performance.now();

  // Trigger tab change
  fireEvent.click(screen.getByRole('tab', { name: 'Diagram tab' }));

  // Wait for breadcrumb update
  await waitFor(() => {
    expect(screen.getByText(/Diagram/)).toBeInTheDocument();
  });

  const elapsed = performance.now() - start;
  expect(elapsed).toBeLessThan(50);
});
```

**Tab Transition Speed** (FR-037):

```typescript
test('tab switching completes within 200ms', async () => {
  const start = performance.now();

  fireEvent.click(screen.getByRole('tab', { name: 'Content tab' }));

  await waitFor(() => {
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'tabpanel-content');
  });

  const elapsed = performance.now() - start;
  expect(elapsed).toBeLessThan(200);
});
```

---

## Common Development Tasks

### Add a New Layout Mode

1. Update `LayoutMode` type in `src/types/layout.ts`
2. Update `useLayoutStore` logic in `src/stores/layoutStore.ts`
3. Update `SkillHeader` rendering logic
4. Add tests for new mode
5. Update localStorage migration (if needed)

---

### Change Tab Order

1. Update `TABS` constant in `src/components/TabBar.tsx`
2. Update `shortcutIndex` for affected tabs
3. Update E2E tests to reflect new order
4. Update documentation (README, spec)

---

### Add Breadcrumb Segment

1. Update `BreadcrumbSegment` type in `src/types/layout.ts`
2. Update `useBreadcrumbSegments` logic
3. Add navigation handler
4. Add tests for new segment
5. Update accessibility labels

---

## Debugging Tips

### Breadcrumb Not Updating

**Symptom**: Breadcrumb shows stale tab name after tab change

**Diagnosis**:

```typescript
// Add console.log in BreadcrumbNavigation
useEffect(() => {
  console.log('activeTabIndex changed:', activeTabIndex);
  console.log('new tab name:', TABS[activeTabIndex]?.label);
}, [activeTabIndex]);
```

**Common Causes**:

- `activeTabIndex` not updating in keyboardStore
- `TABS` array out of sync with tab list
- Memoization preventing re-render

---

### Compact Mode Not Persisting

**Symptom**: App always starts in standard mode, ignoring localStorage

**Diagnosis**:

```typescript
// Check localStorage on app start
console.log('Stored mode:', localStorage.getItem('layoutMode'));
console.log('Parsed mode:', JSON.parse(localStorage.getItem('layoutMode') || '"standard"'));
```

**Common Causes**:

- localStorage write failing (quota exceeded, privacy mode)
- Store initialization not reading localStorage
- localStorage key mismatch ('layoutMode' vs 'layout_mode')

---

### Tabs Not Switching

**Symptom**: Clicking tab does nothing

**Diagnosis**:

```typescript
// Add console.log in TabBar onClick
<button onClick={(index) => {
  console.log('Tab clicked:', index);
  console.log('Current activeIndex:', activeIndex);
  onTabChange(index);
}}>
```

**Common Causes**:

- `onTabChange` prop not connected to state setter
- `activeIndex` prop not updating
- Event handler not firing (z-index issue, overlay)

---

## Deployment Checklist

Before merging to main:

- ✅ All tests pass (`npm run test:all`)
- ✅ Test coverage >80% (`npm run test:coverage`)
- ✅ No TypeScript errors (`npm run build`)
- ✅ No Rust errors (`cd src-tauri && cargo build`)
- ✅ E2E tests pass on all platforms (macOS, Linux, Windows)
- ✅ Accessibility audit passes (axe DevTools, WAVE)
- ✅ Performance targets met (breadcrumb <50ms, tabs <200ms)
- ✅ Manual testing completed (checklist in PR)
- ✅ Screenshots/video demo included in PR
- ✅ DEVIATIONS.md updated (if any tasks simplified)
- ✅ CHANGELOG.md updated

---

## Resources

### Documentation

- **Spec**: `specs/016-improved-ui-layout/spec.md`
- **Plan**: `specs/016-improved-ui-layout/plan.md`
- **Research**: `specs/016-improved-ui-layout/research.md`
- **Data Model**: `specs/016-improved-ui-layout/data-model.md`
- **Contracts**: `specs/016-improved-ui-layout/contracts/`

### Code References

- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **React Aria**: https://react-spectrum.adobe.com/react-aria/ (accessibility patterns)
- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/

### Design References

- **VS Code Tabs**: Chrome DevTools → Inspect VS Code tabs (industry standard)
- **Material Design Tabs**: https://m3.material.io/components/tabs
- **WCAG 2.1 Tab Pattern**: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
