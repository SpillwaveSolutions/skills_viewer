# Implementation Guide: Feature 019 Remaining Work

**Date**: 2025-11-17
**Purpose**: Guide for completing User Stories 3-5 and achieving 100% spec compliance
**Prerequisite**: Read [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) first

---

## Quick Reference

| Phase | User Story            | Tasks     | Effort  | Priority | Status                      |
| ----- | --------------------- | --------- | ------- | -------- | --------------------------- |
| 1     | Setup                 | T001-T004 | 30 mins | P1       | ✅ Complete                 |
| 2     | Foundation            | T005-T026 | N/A     | P1       | ✅ Exists (Feature 003)     |
| 3     | US1: Search Focus     | T027-T040 | 3-4h    | P1       | ⚠️ Partial (missing tests)  |
| 4     | US2: Tab Switching    | T041-T059 | 4-5h    | P1       | ⚠️ Partial (missing tests)  |
| 5     | US3: Skill Navigation | T060-T082 | 5-6h    | P2       | ⚠️ Partial (needs fixes)    |
| 6     | US4: Search Clear     | T083-T096 | 3-4h    | P2       | ❌ Not implemented          |
| 7     | US5: Help Overlay     | T097-T125 | 7-8h    | P3       | ⚠️ Partial (needs Radix UI) |
| 8     | Polish                | T126-T150 | 5-6h    | P4       | ❌ Not done                 |

---

## Phase 3: US1 - Search Focus (Quick Wins)

### Current State

- ✅ Cmd/Ctrl+F triggers search focus
- ❌ Text NOT selected on focus (spec FR-016)
- ❌ No ARIA announcement
- ❌ Missing 6 TDD tests

### Implementation Steps

#### Step 1: Add Text Selection (T036) - 5 minutes

**File**: `src/components/SearchBar.tsx`

**Find**:

```typescript
// Wherever search input is defined
<input
  ref={searchInputRef}
  type="search"
  ...
/>
```

**Add Effect**:

```typescript
import { useEffect } from 'react';
import { useKeyboardStore } from '@/stores/keyboardStore';

export function SearchBar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFocusRequested = useKeyboardStore(state => state.searchFocusRequested);
  const setSearchFocusRequested = useKeyboardStore(state => state.setSearchFocusRequested);

  // Handle search focus request from keyboard shortcut
  useEffect(() => {
    if (searchFocusRequested && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select(); // ← ADD THIS LINE (FR-016)
      setSearchFocusRequested(false);
    }
  }, [searchFocusRequested, setSearchFocusRequested]);

  return <input ref={searchInputRef} type="search" ... />;
}
```

**Test Manually**:

1. Enter text in search: "react"
2. Click elsewhere
3. Press Cmd/Ctrl+F
4. ✅ Text should be selected (highlighted blue)

#### Step 2: Add ARIA Announcer Component (T019-T023) - 30 minutes

**Create**: `src/components/AriaLiveAnnouncer.tsx`

```typescript
import { useEffect, useState } from 'react';

interface AriaLiveAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Screen reader announcements for keyboard navigation
 * Uses ARIA live region pattern
 */
export function AriaLiveAnnouncer({
  message,
  politeness = 'polite'
}: AriaLiveAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Slight delay ensures screen readers pick up changes
    const timer = setTimeout(() => setAnnouncement(message), 100);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only" // Tailwind class for screen-reader-only
    >
      {announcement}
    </div>
  );
}
```

**Add to SearchBar.tsx** (T037):

```typescript
import { AriaLiveAnnouncer } from './AriaLiveAnnouncer';

export function SearchBar() {
  const [ariaMessage, setAriaMessage] = useState('');

  useEffect(() => {
    if (searchFocusRequested && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
      setAriaMessage('Search field focused'); // ← ARIA announcement
      setSearchFocusRequested(false);

      // Clear message after announcement
      setTimeout(() => setAriaMessage(''), 1000);
    }
  }, [searchFocusRequested]);

  return (
    <>
      <AriaLiveAnnouncer message={ariaMessage} />
      <input ref={searchInputRef} ... />
    </>
  );
}
```

#### Step 3: Write Missing Tests (T027-T032) - 2-3 hours

**Create**: `src/components/__tests__/SearchBar.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('SearchBar - Keyboard Shortcuts', () => {
  beforeEach(() => {
    // Reset keyboard store
    useKeyboardStore.getState().reset();
  });

  it('should focus search on Cmd/Ctrl+F (T027)', () => {
    render(<SearchBar />);
    const searchInput = screen.getByRole('searchbox');

    // Simulate Cmd/Ctrl+F triggering store state
    useKeyboardStore.getState().setSearchFocusRequested(true);

    // Verify focus
    expect(document.activeElement).toBe(searchInput);
  });

  it('should select existing text when focusing via shortcut (T028)', () => {
    render(<SearchBar initialValue="react" />);
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement;

    // Trigger focus request
    useKeyboardStore.getState().setSearchFocusRequested(true);

    // Verify text selection
    expect(searchInput.selectionStart).toBe(0);
    expect(searchInput.selectionEnd).toBe(5); // "react".length
  });

  // Add T029-T032 integration/E2E tests in separate files
});
```

**Create**: `tests/integration/keyboard-shortcuts.test.tsx` (T029-T030)
**Create**: `tests/e2e/keyboard-shortcuts.spec.ts` (T031)
**Create**: `src/components/__tests__/SearchBar.a11y.test.tsx` (T032)

---

## Phase 4: US2 - Tab Switching (Enhanced)

### Current State

- ✅ Cmd/Ctrl+1-6 switches tabs
- ❌ No condition check for skill selection (spec FR-003)
- ❌ No ARIA announcement
- ❌ Missing 8 TDD tests

### Implementation Steps

#### Step 1: Add Skill Selection Condition (T050-T054) - 10 minutes

**File**: `src/hooks/useKeyboardShortcuts.ts`

**Find**:

```typescript
// US2: Cmd/Ctrl+1-6 - Tab navigation
const hasModifier = isMac ? event.metaKey : event.ctrlKey;
if (hasModifier && key >= '1' && key <= '6' && !isInput && !isHelpModalOpen) {
  event.preventDefault();
  const tabIndex = parseInt(key, 10) - 1;
  setActiveTabIndex(tabIndex);
  return;
}
```

**Replace with**:

```typescript
import { useSkillStore } from '../stores/useSkillStore';

// Inside useKeyboardShortcuts:
const selectedSkill = useSkillStore((state) => state.selectedSkill);

// US2: Cmd/Ctrl+1-6 - Tab navigation
const hasModifier = isMac ? event.metaKey : event.ctrlKey;
if (hasModifier && key >= '1' && key <= '6' && !isInput && !isHelpModalOpen) {
  event.preventDefault();
  const tabIndex = parseInt(key, 10) - 1;

  // Cmd/Ctrl+1 (Skills tab) always works
  // Cmd/Ctrl+2-6 require skill selection (FR-003)
  if (tabIndex === 0 || selectedSkill !== null) {
    setActiveTabIndex(tabIndex);
  }
  // If no skill selected and tabIndex > 0, do nothing (no-op)
  return;
}
```

#### Step 2: Add ARIA Announcement (T056) - 15 minutes

**Add to App.tsx or SkillViewer.tsx**:

```typescript
import { AriaLiveAnnouncer } from './components/AriaLiveAnnouncer';

const [tabAriaMessage, setTabAriaMessage] = useState('');
const activeTabIndex = useKeyboardStore(state => state.activeTabIndex);

const TAB_NAMES = ['Skills', 'Details', 'Triggers', 'References', 'Scripts', 'Diagram'];

useEffect(() => {
  if (activeTabIndex !== null) {
    setTabAriaMessage(`${TAB_NAMES[activeTabIndex]} tab active`);
    setTimeout(() => setTabAriaMessage(''), 1000);
  }
}, [activeTabIndex]);

return (
  <>
    <AriaLiveAnnouncer message={tabAriaMessage} />
    {/* rest of app */}
  </>
);
```

#### Step 3: Write Missing Tests (T041-T048) - 3-4 hours

Follow same pattern as US1 tests. See tasks.md T041-T048 for exact test cases.

---

## Phase 5: US3 - Skill Navigation (Fixes Required)

### Current State

- ✅ Arrow Up/Down implemented
- ❌ Wraps around at boundaries (spec says NO WRAP)
- ❌ Home/End keys NOT implemented
- ❌ Enter key to select NOT implemented

### Implementation Steps

#### Step 1: Fix Arrow Key Wrapping (T072-T073) - 5 minutes

**File**: `src/hooks/useKeyboardShortcuts.ts`

**Find**:

```typescript
if (key === 'arrowdown') {
  if (currentHighlight === null) {
    setHighlightedSkillIndex(0);
  } else {
    const nextIndex = (currentHighlight + 1) % currentCount; // ← WRAPS
    setHighlightedSkillIndex(nextIndex);
  }
}
```

**Replace with**:

```typescript
if (key === 'arrowdown') {
  if (currentHighlight === null) {
    setHighlightedSkillIndex(0);
  } else if (currentHighlight < currentCount - 1) {
    // ← NO WRAP (spec requirement)
    setHighlightedSkillIndex(currentHighlight + 1);
  }
  // Stay at bottom if already at last item
}
```

**Same for ArrowUp**:

```typescript
} else { // arrowup
  if (currentHighlight === null) {
    setHighlightedSkillIndex(currentCount - 1);
  } else if (currentHighlight > 0) { // ← NO WRAP
    setHighlightedSkillIndex(currentHighlight - 1);
  }
  // Stay at top if already at first item
}
```

#### Step 2: Add Home/End Keys (T074-T075) - 10 minutes

**Add after arrow key handling**:

```typescript
// US3: Home - Jump to first skill
if (key === 'home') {
  event.preventDefault();
  const currentCount = useKeyboardStore.getState().visibleSkillCount;
  if (currentCount > 0) {
    setHighlightedSkillIndex(0);
  }
  return;
}

// US3: End - Jump to last skill
if (key === 'end') {
  event.preventDefault();
  const currentCount = useKeyboardStore.getState().visibleSkillCount;
  if (currentCount > 0) {
    setHighlightedSkillIndex(currentCount - 1);
  }
  return;
}
```

#### Step 3: Add Enter to Select (T076) - 15 minutes

**Add after Home/End**:

```typescript
import { useSkillStore } from '../stores/useSkillStore';

// US3: Enter - Select highlighted skill
if (key === 'enter') {
  const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;

  if (currentHighlight !== null) {
    event.preventDefault();

    // Get the skill at highlighted index
    const visibleSkills = useSkillStore.getState().visibleSkills; // Assumes this exists
    const skill = visibleSkills[currentHighlight];

    if (skill) {
      // Select the skill
      useSkillStore.getState().setSelectedSkill(skill);

      // Switch to Details tab (tab index 1)
      setActiveTabIndex(1);
    }
  }
  return;
}
```

**Note**: You may need to add `visibleSkills` to the skill store if it doesn't exist.

#### Step 4: Write Tests (T060-T069) - 4-5 hours

See tasks.md for exact test cases. Key tests:

- Arrow down increments index
- Arrow up decrements index
- Arrow down at end stays at end (NO WRAP)
- Arrow up at start stays at start (NO WRAP)
- Home jumps to index 0
- End jumps to last index
- Enter selects highlighted skill

---

## Phase 6: US4 - Search Clear (New Feature)

### Current State

- ❌ Escape only clears highlight, NOT search text
- ❌ No search restoration

### Implementation Steps

#### Step 1: Modify Escape Handler (T089-T092) - 20 minutes

**File**: `src/hooks/useKeyboardShortcuts.ts`

**Find**:

```typescript
// Escape - Clear highlight
if (key === 'escape') {
  const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;
  if (currentHighlight !== null) {
    setHighlightedSkillIndex(null);
  }
  return;
}
```

**Replace with**:

```typescript
// Escape - Clear search or highlight
if (key === 'escape') {
  const target = event.target as HTMLElement;

  // If in search field, clear search
  if (target.tagName === 'INPUT' && target.getAttribute('type') === 'search') {
    const searchInput = target as HTMLInputElement;

    if (searchInput.value) {
      // Clear search text
      searchInput.value = '';

      // Trigger search update to restore full list
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      // ARIA announcement
      setAriaMessage('Search cleared');
    } else {
      // If search is empty, blur and restore previous focus
      searchInput.blur();
    }

    event.preventDefault();
    return;
  }

  // Otherwise, clear highlight
  const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;
  if (currentHighlight !== null) {
    setHighlightedSkillIndex(null);
  }
  return;
}
```

**Note**: This assumes search uses controlled component with onChange handler.

#### Step 2: Write Tests (T083-T088) - 2-3 hours

See tasks.md for exact test cases.

---

## Phase 7: US5 - Help Overlay (Radix UI Refactor)

### Current State

- ⚠️ Uses `?` key instead of `/`
- ⚠️ Custom modal, not Radix UI Dialog
- ❌ No formatted shortcut display
- ❌ No grouping by category

### Implementation Steps

#### Step 1: Create KeyboardShortcutsHelp Component (T106-T116) - 2 hours

**Create**: `src/components/KeyboardShortcutsHelp.tsx`

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { useKeyboardStore } from '@/stores/keyboardStore';
import { groupShortcutsByContext, formatKeyCombo } from '@/utils/keyboardUtils';
import { usePlatformModifier } from '@/hooks/usePlatformModifier';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { modifierSymbol } = usePlatformModifier();

  // Get all shortcuts (you'll need to define these)
  const shortcuts = getAllShortcuts(); // TODO: Implement getAllShortcuts()
  const grouped = groupShortcutsByContext(shortcuts);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
          <Dialog.Title className="text-2xl font-bold mb-4">
            Keyboard Shortcuts
          </Dialog.Title>

          <Dialog.Description className="sr-only">
            List of all available keyboard shortcuts organized by category
          </Dialog.Description>

          {grouped.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <li key={shortcut.id} className="flex justify-between items-center">
                    <span className="text-gray-600">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-gray-100 rounded text-sm font-mono border border-gray-300">
                      {formatKeyCombo({
                        key: shortcut.key,
                        requiresModifier: shortcut.requiresModifier,
                        requiresShift: shortcut.requiresShift,
                        modifierSymbol
                      })}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Dialog.Close asChild>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Step 2: Update Keyboard Hook (T118-T119) - 10 minutes

**File**: `src/hooks/useKeyboardShortcuts.ts`

**Change**:

```typescript
// US4: ? (Shift+/) - Show help modal
if ((key === '?' || (key === '/' && event.shiftKey)) && !isInput) {
```

**To**:

```typescript
// US5: Cmd/Ctrl+/ - Show help modal (FR-008)
if (key === '/') {
  const hasModifier = isMac ? event.metaKey : event.ctrlKey;

  if (hasModifier && !isInput) {
    event.preventDefault();
    setHelpModalOpen(true);
    return;
  }
}
```

#### Step 3: Write Tests (T097-T105) - 3-4 hours

See tasks.md for exact test cases, including accessibility tests with vitest-axe.

---

## Phase 8: Polish & Validation (T126-T150)

### Performance Validation (T126-T130) - 1 hour

**Add Performance Measurements**:

```typescript
// In useKeyboardShortcuts.ts
function handleKeyDown(event: KeyboardEvent): void {
  const startTime = performance.now();

  // ... keyboard handling logic ...

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log if > 10ms (target: <10ms per spec SC-001)
  if (duration > 10) {
    console.warn(`Keyboard event processing took ${duration}ms (target: <10ms)`);
  }
}
```

**Manual Testing**:

- T127: Measure search focus time (should be <100ms)
- T128: Measure tab switch time (should be <100ms)
- T129: Measure help overlay render time (should be <50ms)

### Accessibility Validation (T131-T135) - 2 hours

**Run axe DevTools** (T131):

```bash
npm test -- --grep "accessibility" --run
```

**Manual Screen Reader Testing** (T132-T133):

- macOS VoiceOver: Cmd+F5
- Windows NVDA: Download and install

**WCAG Contrast Check** (T134):

```bash
# Use browser DevTools → Accessibility panel
# Verify all focus indicators meet 3:1 contrast ratio
```

### Documentation (T136-T138) - 1 hour

**Update README.md**:

```markdown
## Keyboard Shortcuts

- **Cmd/Ctrl+F**: Focus search field
- **Cmd/Ctrl+1-6**: Switch between tabs
- **Arrow Up/Down**: Navigate skill list
- **Home/End**: Jump to first/last skill
- **Enter**: Select highlighted skill
- **Escape**: Clear search or highlight
- **Cmd/Ctrl+/**: Show keyboard shortcuts help
```

**Update CHANGELOG.md**:

```markdown
## [0.2.0] - 2025-XX-XX

### Added

- Comprehensive keyboard shortcuts for navigation and search
- ARIA live announcements for screen reader support
- Keyboard shortcuts help overlay (Cmd/Ctrl+/)

### Fixed

- Arrow key navigation no longer wraps at boundaries
- Tab shortcuts now require skill selection (Cmd/Ctrl+2-6)
```

### Code Quality (T139-T144) - 1 hour

```bash
# Run linter
npm run lint

# Run formatter
npm run format

# Check coverage
npm test -- --coverage

# Remove console.log statements
# Add JSDoc comments
```

### Final Validation (T145-T150) - 1 hour

```bash
# Run full test suite
npm test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm test -- --grep "accessibility"

# Manual walkthrough of quickstart.md
# Test on macOS
# Test on Windows/Linux (if available)
```

---

## Effort Summary

| Phase                  | Tasks | Effort    | Cumulative |
| ---------------------- | ----- | --------- | ---------- |
| 1: Setup               | 4     | ✅ 30m    | 30m        |
| 2: Foundation          | 22    | ✅ Exists | 30m        |
| 3: US1 Quick Wins      | 3     | 45m       | 1h 15m     |
| 3: US1 Full Tests      | 11    | 3h        | 4h 15m     |
| 4: US2 Quick Wins      | 2     | 25m       | 4h 40m     |
| 4: US2 Full Tests      | 17    | 4h        | 8h 40m     |
| 5: US3 Fixes + Tests   | 23    | 6h        | 14h 40m    |
| 6: US4 Full Impl       | 14    | 4h        | 18h 40m    |
| 7: US5 Full Impl       | 29    | 8h        | 26h 40m    |
| 8: Polish + Validation | 25    | 6h        | 32h 40m    |

**Total for 100% Compliance**: ~33 hours

**Quick Wins Only** (Phases 3-4 enhancements): ~1 hour 15 minutes

---

## Recommended Approach

### Path 1: Quick Wins (Recommended) ✅

**Time**: 1.25 hours
**Value**: High (fixes spec gaps)

1. Add text selection on search focus (5 mins)
2. Add ARIA Live Announcer component (30 mins)
3. Add skill selection condition for tabs (10 mins)
4. Add ARIA announcement for tab changes (15 mins)
5. Test manually (5 mins)

**Result**: MVP complete with all P1 requirements met

### Path 2: Full TDD Compliance

**Time**: 33 hours
**Value**: Establishes gold-standard pattern

Follow tasks.md sequentially, completing all 150 tasks with full TDD approach.

**Result**: 100% spec compliance, 100% test coverage, constitutional compliance achieved

---

## Testing Strategy

### Unit Tests (Vitest)

**Pattern**:

```typescript
// tests/unit/[component]/__tests__/[feature].test.tsx

// 1. Write test that fails
it('should do X when Y happens', () => {
  // Arrange
  // Act
  // Assert
});

// 2. Run test: npm test -- [file] --run
// Verify it FAILS

// 3. Implement feature
// 4. Run test again
// Verify it PASSES
```

### E2E Tests (Playwright)

**Pattern**:

```typescript
// tests/e2e/keyboard-shortcuts.spec.ts

test('Cmd/Ctrl+F focuses search', async ({ page }) => {
  await page.goto('http://localhost:1420');

  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+F`);

  const searchInput = page.locator('[role="searchbox"]');
  await expect(searchInput).toBeFocused();
});
```

### Accessibility Tests (vitest-axe)

**Pattern**:

```typescript
// src/components/__tests__/[component].a11y.test.tsx

import { axe, toHaveNoViolations } from 'vitest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/...'"

**Fix**: Check `vite.config.ts` has path alias:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

**Issue**: Keyboard events not working in tests

**Fix**: Use `fireEvent.keyDown` with correct event structure:

```typescript
fireEvent.keyDown(window, {
  key: 'f',
  metaKey: true, // Cmd on macOS
  ctrlKey: false,
});
```

**Issue**: Radix UI Dialog not rendering

**Fix**: Ensure Portal is inside <Dialog.Root>:

```typescript
<Dialog.Root open={isOpen}>
  <Dialog.Portal> {/* Must be INSIDE Root */}
    <Dialog.Overlay />
    <Dialog.Content />
  </Dialog.Portal>
</Dialog.Root>
```

---

## Next Steps

1. ✅ Read IMPLEMENTATION_STATUS.md
2. ✅ Read this guide
3. Choose path:
   - **Quick Wins**: Follow Path 1 above
   - **Full Compliance**: Follow tasks.md T027-T150 sequentially
4. Update tasks.md with [x] as you complete each task
5. Run tests after each task group
6. Document any deviations in DEVIATIONS.md

---

## Status

**Document**: ✅ Complete
**Quick Wins Path**: ⏭️ Ready to implement (1.25 hours)
**Full Compliance Path**: ⏭️ Ready to implement (33 hours)
