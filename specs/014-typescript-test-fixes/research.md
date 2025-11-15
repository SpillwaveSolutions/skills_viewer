# Research: TypeScript Error Fixes + Unit Test Backfill

**Feature**: 014-typescript-test-fixes
**Date**: 2025-01-13
**Phase**: Phase 0 - Technical Research

## Overview

This feature repairs technical debt from parallel implementation (Features 009-013). Since all technologies are already in use and the scope is well-defined (fix 8 specific TypeScript errors + add tests), minimal research is needed. This document consolidates best practices and patterns for the implementation.

## TypeScript Error Fixes

### Error Categories Identified

**Category 1: ReactNode Type Mismatches** (5 errors)

- DescriptionSection.tsx:19 - Type '{}' not assignable to ReactNode
- OverviewPanel.tsx:50, 54, 62 - Type 'unknown' or '{}' not assignable to ReactNode

**Decision**: Use proper ReactNode typing with null coalescing

```typescript
// Instead of: <Component>{someValue}</Component>
// Use: <Component>{(someValue as ReactNode) || null}</Component>
```

**Rationale**: React 19 has stricter type checking for children props. Empty objects and unknown types need explicit ReactNode typing.

**Category 2: Library Type Mismatches** (2 errors)

- InteractiveDiagram.tsx:155 - Property 'state' does not exist on react-zoom-pan-pinch
- InteractiveDiagram.tsx:161 - RefObject type mismatch

**Decision**: Use correct react-zoom-pan-pinch v5.4.0 API

```typescript
// Instead of: transformRef.current.state.scale
// Use: transformRef.current?.instance.transformState.scale

// Instead of: RefObject<HTMLDivElement>
// Use: RefObject<HTMLDivElement | null>
```

**Rationale**: react-zoom-pan-pinch v5.x changed API structure. TypeScript strictNullChecks requires nullable RefObject types.

**Category 3: Unused Imports** (1 error)

- ErrorBoundary.tsx:10 - 'React' declared but never used

**Decision**: Remove unused import or use React.FC typing

```typescript
// Either remove: import React from 'react';
// Or use: const ErrorBoundary: React.FC<Props> = ...
```

**Rationale**: React 17+ JSX transform doesn't require React import. Clean code removes unused imports.

**Category 4: setState Type Errors** (2 errors in same file)

- useListNavigation.ts:35, 47 - setState argument type errors

**Decision**: Use functional updater form with proper typing

```typescript
// Instead of: setIndex((current) => ...)
// Use: setIndex((current: number) => ...)
```

**Rationale**: TypeScript can't infer type from arrow function parameter without annotation.

## Testing Strategy

### Zustand Store Testing Patterns

**Research Source**: Zustand official docs + @testing-library/react best practices

**Pattern**:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSkillStore } from '../useSkillStore';

test('action updates state correctly', () => {
  const { result } = renderHook(() => useSkillStore());

  act(() => {
    result.current.setSkills([mockSkill]);
  });

  expect(result.current.skills).toEqual([mockSkill]);
});
```

**Key Practices**:

- Use `renderHook()` from @testing-library/react
- Wrap state changes in `act()`
- Reset store between tests: `useSkillStore.setState(initialState)`
- Test selectors separately from actions

### Utility Function Testing Patterns

**Research Source**: Vitest best practices

**Pattern**:

```typescript
import { describe, it, expect } from 'vitest';
import { parseSearchQuery } from '../searchOperators';

describe('parseSearchQuery', () => {
  it('parses AND operator correctly', () => {
    const result = parseSearchQuery('term1 AND term2');
    expect(result.operator).toBe('AND');
    expect(result.terms).toEqual(['term1', 'term2']);
  });

  it('handles edge case: empty query', () => {
    const result = parseSearchQuery('');
    expect(result.terms).toEqual([]);
  });
});
```

**Key Practices**:

- Test pure functions directly (no mocking needed)
- Cover happy path + edge cases + error cases
- Use descriptive test names (what + when + expected)
- Group related tests with describe()

### React Hook Testing Patterns

**Research Source**: @testing-library/react hooks testing guide

**Pattern**:

```typescript
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

test('calls callback on Cmd+1', () => {
  const mockCallback = vi.fn();
  renderHook(() => useKeyboardShortcuts({ onTab1: mockCallback }));

  const event = new KeyboardEvent('keydown', { key: '1', metaKey: true });
  window.dispatchEvent(event);

  expect(mockCallback).toHaveBeenCalledTimes(1);
});

test('cleanup removes event listeners', () => {
  const { unmount } = renderHook(() => useKeyboardShortcuts({}));
  unmount();

  // Verify no memory leaks
  const event = new KeyboardEvent('keydown', { key: '1', metaKey: true });
  window.dispatchEvent(event);
  // Should not throw or cause effects
});
```

**Key Practices**:

- Use `renderHook()` for hook testing
- Mock window/document APIs (keyboard events, navigator.platform)
- Test cleanup functions (unmount behavior)
- Verify event listeners are added/removed correctly

## Platform Detection Testing

**Research**: How to mock navigator.platform in Vitest

**Solution**: Use `vi.stubGlobal()`

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.stubGlobal('navigator', {
    platform: 'MacIntel', // or 'Win32', 'Linux x86_64'
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

**Rationale**: Allows testing platform-specific logic (macOS vs Windows/Linux modifier keys) without running on multiple OSes.

## Coverage Targets

**Constitutional Requirement**: >80% overall coverage
**Feature Target**: >95% overall, >90% per module

**Coverage Gaps Identified** (from current 95.02%):

- Stores: 0% (no tests exist)
- Utils: ~30% (partial coverage from E2E tests)
- Hooks: ~40% (partial coverage from component tests)

**Strategy**: Prioritize stores and utils (core business logic) before hooks.

## Alternatives Considered

### Alternative 1: Skip Tests, Just Fix Types

**Rejected**: Violates constitutional requirement for >80% coverage and leaves technical debt

### Alternative 2: Use `any` Types to "Fix" Errors

**Rejected**: Violates code quality standards (no `any` types in strict mode)

### Alternative 3: Relax TypeScript Strict Mode

**Rejected**: Violates technical standards and code quality requirements

### Alternative 4: Add Tests Later (Defer to v0.3.0)

**Rejected**: This feature IS the test backfill - deferring defeats the purpose

## Technology Decisions Summary

| Decision              | Choice                                         | Rationale                                  |
| --------------------- | ---------------------------------------------- | ------------------------------------------ |
| **Type Fix Approach** | Add type annotations, use correct library APIs | Maintains strict mode, fixes root cause    |
| **Store Testing**     | renderHook() + act() pattern                   | Zustand best practice, works with React 19 |
| **Utility Testing**   | Direct function calls, no mocking              | Pure functions don't need mocking          |
| **Hook Testing**      | renderHook() + event mocking                   | Standard @testing-library/react pattern    |
| **Platform Mocking**  | vi.stubGlobal()                                | Vitest best practice for global mocking    |
| **Coverage Tool**     | Vitest v8 provider (existing)                  | Already configured, no new dependencies    |

## Implementation Order

**Rationale for Phase Order**:

1. **TypeScript Fixes First**: Unblocks builds, allows continuous testing during test writing
2. **Stores Second**: Most critical (state management backbone), highest impact
3. **Utils Third**: Core business logic, moderate complexity
4. **Hooks Fourth**: Depends on stores/utils, can leverage existing patterns

## Risk Assessment

**Low Risk**:

- All technologies already in use (no learning curve)
- Scope is well-defined (8 specific errors, known test gaps)
- Changes are additive (tests) or minimal (type annotations)
- No architectural changes

**Mitigations**:

- Run `npm run build` after each TypeScript fix to verify
- Run `npm test` after each test file to catch regressions early
- Verify coverage incrementally (per module, not just at end)

## References

- [Zustand Testing](https://github.com/pmndrs/zustand#testing)
- [@testing-library/react Hooks](https://react-hooks-testing-library.com/)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [React 19 Type Changes](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes)
- [react-zoom-pan-pinch v5 API](https://github.com/BetterTyped/react-zoom-pan-pinch)

---

**Research Complete**: All unknowns resolved, ready for quickstart creation (Phase 1)
