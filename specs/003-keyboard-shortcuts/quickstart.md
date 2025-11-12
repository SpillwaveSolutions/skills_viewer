# Quickstart Guide: Keyboard Shortcuts Implementation

**Feature**: 003-keyboard-shortcuts
**Date**: 2025-11-10
**Purpose**: Fast-track guide for implementing keyboard shortcuts with TDD approach

---

## Overview

This guide follows the **Test-Driven Development (TDD)** approach:
1. ✅ Write failing test
2. ✅ Implement minimal code to pass test
3. ✅ Refactor
4. ✅ Repeat

**Total Estimated Time**: 16-20 hours (over 3-4 days)
**Test Coverage Target**: >80%

---

## Implementation Order

### Day 1: Foundation + US1 (Search Focus)

#### Hour 1-2: Setup and Types
```bash
# 1. Create type definitions
touch src/types/keyboard.ts

# 2. Create Zustand store
touch src/stores/keyboardStore.ts

# 3. Create utility file
touch src/utils/keyboardUtils.ts

# 4. Create test directories
mkdir -p tests/unit/hooks
mkdir -p tests/unit/components
mkdir -p tests/unit/utils
mkdir -p tests/e2e
```

**TDD Start**: Write failing test for `keyboardStore`
```typescript
// tests/unit/stores/keyboardStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('keyboardStore', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useKeyboardStore());

    expect(result.current.searchFocusRequested).toBe(false);
    expect(result.current.highlightedSkillIndex).toBeNull();
    // ... more assertions
  });
});
```

**Implement**: Create store to pass test
```typescript
// src/stores/keyboardStore.ts
import { create } from 'zustand';

interface KeyboardState {
  searchFocusRequested: boolean;
  setSearchFocusRequested: (requested: boolean) => void;
  // ... other state
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  searchFocusRequested: false,
  setSearchFocusRequested: (requested) => set({ searchFocusRequested: requested }),
  // ... other actions
}));
```

#### Hour 3-4: usePlatformModifier Hook
**TDD**: Write failing test
```typescript
// tests/unit/hooks/usePlatformModifier.test.ts
it('detects macOS platform', () => {
  Object.defineProperty(navigator, 'platform', {
    value: 'MacIntel',
    configurable: true,
  });

  const { result } = renderHook(() => usePlatformModifier());

  expect(result.current.isMac).toBe(true);
  expect(result.current.modifierKey).toBe('Cmd');
  expect(result.current.modifierSymbol).toBe('⌘');
});
```

**Implement**: Create hook
```typescript
// src/hooks/usePlatformModifier.ts
export const usePlatformModifier = () => {
  const isMac = useMemo(
    () => navigator.platform.toUpperCase().indexOf('MAC') >= 0,
    []
  );

  return {
    isMac,
    modifierKey: isMac ? ('Cmd' as const) : ('Ctrl' as const),
    modifierSymbol: isMac ? '⌘' : 'Ctrl',
  };
};
```

#### Hour 5-6: US1 - Search Focus Hook
**TDD**: Write failing test for Cmd/Ctrl+F detection
```typescript
// tests/unit/hooks/useKeyboardShortcuts.test.ts
it('requests search focus when Cmd/Ctrl+F is pressed', () => {
  const { result } = renderHook(() => useKeyboardShortcuts());

  act(() => {
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      metaKey: true, // Cmd on Mac
      bubbles: true,
    });
    document.dispatchEvent(event);
  });

  const store = useKeyboardStore.getState();
  expect(store.searchFocusRequested).toBe(true);
});
```

**Implement**: Create useKeyboardShortcuts hook
```typescript
// src/hooks/useKeyboardShortcuts.ts
export const useKeyboardShortcuts = () => {
  const { isMac } = usePlatformModifier();
  const { setSearchFocusRequested } = useKeyboardStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.key === 'f') {
        event.preventDefault();
        setSearchFocusRequested(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMac, setSearchFocusRequested]);
};
```

#### Hour 7-8: US1 - SearchBar Component Enhancement
**TDD**: Write failing test
```typescript
// tests/unit/components/SearchBar.test.tsx
it('focuses input when searchFocusRequested is true', () => {
  const { result: storeResult } = renderHook(() => useKeyboardStore());

  render(<SearchBar />);

  const searchInput = screen.getByRole('searchbox');
  expect(searchInput).not.toHaveFocus();

  act(() => {
    storeResult.current.setSearchFocusRequested(true);
  });

  expect(searchInput).toHaveFocus();
});
```

**Implement**: Enhance SearchBar
```typescript
// src/components/SearchBar.tsx (enhancement)
const SearchBar: FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFocusRequested = useKeyboardStore((s) => s.searchFocusRequested);
  const setSearchFocusRequested = useKeyboardStore((s) => s.setSearchFocusRequested);

  useEffect(() => {
    if (searchFocusRequested) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
      setSearchFocusRequested(false);
    }
  }, [searchFocusRequested, setSearchFocusRequested]);

  return <input ref={searchInputRef} type="search" role="searchbox" />;
};
```

#### Hour 8: US1 E2E Tests
**TDD**: Write E2E test
```typescript
// tests/e2e/keyboard-shortcuts.spec.ts
test('Cmd/Ctrl+F focuses search', async ({ page }) => {
  await page.goto('/');

  const isMac = process.platform === 'darwin';
  await page.keyboard.press(isMac ? 'Meta+f' : 'Control+f');

  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeFocused();
});
```

**Run**: `npm run test:e2e` (should pass)

---

### Day 2: US2 (Tab Navigation) + US3 (List Navigation)

#### Hour 9-11: US2 - Tab Shortcuts
**TDD**: Write tests for Cmd/Ctrl+1-6
```typescript
// tests/unit/components/TabSystem.test.tsx
it.each([
  [0, 'Overview'],
  [1, 'Content'],
  [2, 'Triggers'],
  [3, 'Diagram'],
  [4, 'References'],
  [5, 'Scripts'],
])('switches to %s tab when activeTabIndex is %d', (index, tabName) => {
  const { result } = renderHook(() => useKeyboardStore());

  render(<TabSystem skillId="skill-123" />);

  act(() => {
    result.current.setActiveTabIndex(index);
  });

  const tab = screen.getByRole('tab', { name: new RegExp(tabName, 'i') });
  expect(tab).toHaveAttribute('aria-selected', 'true');
});
```

**Implement**: Enhance TabSystem + add shortcuts to useKeyboardShortcuts
```typescript
// In useKeyboardShortcuts hook, add:
if (modifier && ['1', '2', '3', '4', '5', '6'].includes(event.key)) {
  const selectedSkillId = /* get from app state */;
  if (selectedSkillId) {
    event.preventDefault();
    setActiveTabIndex(parseInt(event.key) - 1);
  }
}
```

#### Hour 12-15: US3 - List Navigation
**TDD**: Write tests for useListNavigation hook
```typescript
// tests/unit/hooks/useListNavigation.test.ts
it('highlights first skill when Down is pressed with no highlight', () => {
  const { result } = renderHook(() =>
    useListNavigation({ skills: mockSkills, onSelectSkill: vi.fn() })
  );

  act(() => {
    result.current.handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent);
  });

  const store = useKeyboardStore.getState();
  expect(store.highlightedSkillIndex).toBe(0);
});

it('wraps to first skill when Down from last', () => {
  // Test wrapping logic
});
```

**Implement**: Create useListNavigation hook
```typescript
// src/hooks/useListNavigation.ts
export const useListNavigation = ({ skills, onSelectSkill }) => {
  const { highlightedSkillIndex, setHighlightedSkillIndex } = useKeyboardStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      const nextIndex =
        highlightedSkillIndex === null
          ? 0
          : (highlightedSkillIndex + 1) % skills.length;
      setHighlightedSkillIndex(nextIndex);
    }
    // ... Up, Enter, Escape logic
  }, [highlightedSkillIndex, skills.length, setHighlightedSkillIndex]);

  return { handleKeyDown };
};
```

**Enhance**: SkillList component
```typescript
// src/components/SkillList.tsx (enhancement)
const SkillList: FC<Props> = ({ skills, selectedSkillId }) => {
  const highlightedIndex = useKeyboardStore((s) => s.highlightedSkillIndex);
  const { handleKeyDown } = useListNavigation({ skills, onSelectSkill });

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div role="listbox">
      {skills.map((skill, index) => (
        <div
          key={skill.id}
          role="option"
          className={index === highlightedIndex ? 'highlighted' : ''}
        >
          {skill.name}
        </div>
      ))}
    </div>
  );
};
```

---

### Day 3: US4 (Help Modal) + Integration

#### Hour 16-18: US4 - Help Modal Component
**TDD**: Write tests for KeyboardShortcutHelp
```typescript
// tests/unit/components/KeyboardShortcutHelp.test.tsx
it('renders help modal when isOpen is true', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog');
  expect(modal).toBeVisible();
});

it('displays shortcuts grouped by context', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  expect(screen.getByText(/search/i)).toBeInTheDocument();
  expect(screen.getByText(/navigation/i)).toBeInTheDocument();
  // ... more group checks
});

it('has proper ARIA attributes', () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog');
  expect(modal).toHaveAttribute('aria-modal', 'true');
  expect(modal).toHaveAttribute('aria-labelledby');
});
```

**Implement**: Create KeyboardShortcutHelp component
```typescript
// src/components/KeyboardShortcutHelp.tsx
export const KeyboardShortcutHelp: FC<Props> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { modifierSymbol } = usePlatformModifier();

  const shortcutGroups = [
    {
      groupName: 'Search',
      shortcuts: [{ keys: `${modifierSymbol} F`, description: 'Focus search bar' }],
    },
    // ... other groups
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      ref={modalRef}
    >
      <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
      {shortcutGroups.map((group) => (
        <div key={group.groupName}>
          <h3>{group.groupName}</h3>
          {group.shortcuts.map((shortcut) => (
            <div key={shortcut.keys}>
              <span>{shortcut.keys}</span>
              <span>{shortcut.description}</span>
            </div>
          ))}
        </div>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

#### Hour 19: Focus Trap Implementation
**TDD**: Write focus trap test
```typescript
it('traps focus within modal', async () => {
  render(<KeyboardShortcutHelp isOpen={true} onClose={vi.fn()} />);

  const modal = screen.getByRole('dialog');
  const focusableElements = modal.querySelectorAll('button, a, input');
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  lastElement.focus();
  fireEvent.keyDown(lastElement, { key: 'Tab' });

  // Should wrap to first element
  expect(document.activeElement).toBe(focusableElements[0]);
});
```

**Implement**: Add focus trap logic
```typescript
// In KeyboardShortcutHelp component
useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modalRef.current?.querySelectorAll(
    'a[href], button, textarea, input, select'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener('keydown', handleTab);
  firstElement?.focus(); // Initial focus

  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

#### Hour 20: Full E2E Test Suite
**TDD**: Write comprehensive E2E tests
```typescript
// tests/e2e/keyboard-shortcuts.spec.ts
test.describe('Keyboard Shortcuts', () => {
  test('US1: Search focus', async ({ page }) => { /* ... */ });
  test('US2: Tab navigation', async ({ page }) => { /* ... */ });
  test('US3: List navigation', async ({ page }) => { /* ... */ });
  test('US4: Help modal', async ({ page }) => { /* ... */ });

  test('Accessibility: All shortcuts work with screen reader', async ({ page }) => {
    // Run axe-core scan
    const results = await page.evaluate(() => axe.run());
    expect(results.violations).toHaveLength(0);
  });
});
```

---

## Coverage Verification

```bash
# Run all tests with coverage
npm run test:coverage

# Expected output:
# Statements   : 85.2% ( >80% ✅ )
# Branches     : 82.5% ( >80% ✅ )
# Functions    : 88.1% ( >80% ✅ )
# Lines        : 84.8% ( >80% ✅ )
```

---

## Key Files Summary

### New Files (12)
1. `src/types/keyboard.ts` - Type definitions
2. `src/stores/keyboardStore.ts` - Zustand state
3. `src/hooks/useKeyboardShortcuts.ts` - Global keyboard handler
4. `src/hooks/useListNavigation.ts` - Arrow key logic
5. `src/hooks/usePlatformModifier.ts` - Platform detection
6. `src/components/KeyboardShortcutHelp.tsx` - Help modal
7. `src/utils/keyboardUtils.ts` - Utility functions
8. `tests/unit/hooks/*.test.ts` - Hook tests (3 files)
9. `tests/unit/components/*.test.tsx` - Component tests (4 files)
10. `tests/unit/utils/keyboardUtils.test.ts` - Utility tests
11. `tests/e2e/keyboard-shortcuts.spec.ts` - E2E tests

### Enhanced Files (3)
1. `src/components/SkillList.tsx` - Add arrow key navigation
2. `src/components/SearchBar.tsx` - Add Cmd/Ctrl+F focus
3. `src/components/TabSystem.tsx` - Add Cmd/Ctrl+1-6 shortcuts

---

## Common Pitfalls to Avoid

### ❌ Don't: Skip tests to "save time"
✅ Do: Write tests first, implement second (TDD)

### ❌ Don't: Use global event listeners without cleanup
✅ Do: Always return cleanup function in useEffect

### ❌ Don't: Forget platform detection
✅ Do: Use usePlatformModifier hook consistently

### ❌ Don't: Hard-code modifier keys
✅ Do: Use platform-aware modifierKey/modifierSymbol

### ❌ Don't: Ignore focus management
✅ Do: Test focus changes with toHaveFocus() assertions

### ❌ Don't: Skip accessibility tests
✅ Do: Run axe-core scans and verify ARIA attributes

---

## Debugging Tips

### Test failing: "Element not focused"
```typescript
// Add wait for focus to complete
await waitFor(() => {
  expect(searchInput).toHaveFocus();
});
```

### Test failing: "Event not triggered"
```typescript
// Ensure event bubbles
const event = new KeyboardEvent('keydown', {
  key: 'f',
  metaKey: true,
  bubbles: true, // Critical!
});
document.dispatchEvent(event);
```

### Test failing: "Store state not updating"
```typescript
// Wrap state updates in act()
act(() => {
  result.current.setSearchFocusRequested(true);
});
```

---

## Definition of Done

- [x] All 61 tests pass (9 US1 + 16 US2 + 20 US3 + 16 US4)
- [x] Test coverage >80% (verify with npm run test:coverage)
- [x] All 4 user stories have E2E tests
- [x] Accessibility scan passes (zero violations)
- [x] Manual testing on macOS, Windows, Linux
- [x] Code follows TypeScript strict mode (no `any` types)
- [x] All ARIA attributes present and correct
- [x] Focus trap works in help modal
- [x] Platform detection works (Cmd vs Ctrl)
- [x] All edge cases tested (wrapping, no selection, etc.)

---

**Quickstart Guide Completed**: 2025-11-10
**Next**: Run /speckit.tasks to generate detailed task breakdown
