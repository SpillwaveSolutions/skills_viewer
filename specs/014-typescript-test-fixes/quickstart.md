# Quickstart: TypeScript Error Fixes + Unit Test Backfill

**Feature**: 014-typescript-test-fixes | **Branch**: `014-typescript-test-fixes` | **Date**: 2025-01-13

## Overview

This feature repairs **11 TypeScript compilation errors** (initially scoped for 8, found 3 additional) and adds comprehensive unit tests for stores, utilities, and hooks. It uses existing technologies (Vitest 4.0.8, @testing-library/react, Zustand 5.0.8) with zero new dependencies.

**Scope**: Technical debt repair from Features 009-013 parallel implementation
**Duration**: ~11 hours total effort
**Goal**: Production builds succeed + >95.5% test coverage
**Status**: Phase 2 Complete (TypeScript fixes ✓), Phase 3 In Progress (Build validation)

## Prerequisites

**Required**:

- Node.js 18+ and npm
- TypeScript 5.8.3 (already installed)
- Vitest 4.0.8 (already installed)
- @testing-library/react (already installed)

**Verify Setup**:

```bash
npm run build          # Should FAIL with 8 TypeScript errors (before fix)
npm test              # Should pass (existing tests)
npm run test:coverage # Check current coverage (95.02%)
```

## Quick Reference: TypeScript Error Fixes

### Category 1: ReactNode Type Mismatches (5 errors)

**Files**: `DescriptionSection.tsx:19`, `OverviewPanel.tsx:50,54,62`

**Problem**: React 19 strict type checking rejects `{}` or `unknown` as ReactNode children

**Fix Pattern**:

```typescript
// ❌ Before
<div>{someValue}</div>

// ✅ After (simple case)
<div>{(someValue as ReactNode) || null}</div>

// ✅ After (unknown type from Record<string, unknown>)
// Use type guard to narrow unknown to concrete type first
const metadataValue =
  typeof metadata?.field === 'string' ? metadata.field : undefined;
<div>{(metadataValue as ReactNode) || null}</div>
```

**Import Required**: Add `import { ReactNode } from 'react';`

**Special Case - OverviewPanel**: When accessing `Record<string, unknown>` properties, use `typeof` type guard to narrow `unknown` to `string | undefined` before casting to ReactNode.

### Category 2: Library Type Mismatches (2 errors)

**File**: `InteractiveDiagram.tsx:155,161`

**Problem**: react-zoom-pan-pinch v5.x changed API structure

**Fix Pattern**:

```typescript
// ❌ Before
transformRef.current.state.scale;

// ✅ After (correct v5 API)
transformRef.current?.instance.transformState.scale;

// ❌ Before
const containerRef = useRef<HTMLDivElement>(null);

// ✅ After (nullable RefObject)
const containerRef = useRef<HTMLDivElement | null>(null);
```

### Category 3: Unused Import (1 error)

**File**: `ErrorBoundary.tsx:10`

**Fix**: Remove `import React from 'react';` (React 17+ JSX transform doesn't need it)

### Category 4: Zustand setState Errors (2 errors)

**File**: `useListNavigation.ts:35,47`

**Problem**: Zustand stores don't support functional updaters like React's useState

**Fix Pattern**:

```typescript
// ❌ Before (functional updater - doesn't work with Zustand)
setIndex((current) => Math.max(0, current - 1));

// ❌ Also Wrong (type annotations don't help)
setIndex((current: number) => Math.max(0, current - 1));

// ✅ After (read state, compute, then set direct value)
const current = highlightedIndex; // Read from store
if (current === null) {
  setIndex(0);
} else {
  setIndex(Math.max(0, current - 1)); // Set computed value directly
}
```

**Key Learning**: Zustand's `set()` functions only accept direct values, NOT functional updaters. Must read state first, then set computed value.

## Quick Reference: Testing Patterns

### Zustand Store Tests

**Pattern**:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSkillStore } from '../useSkillStore';

describe('useSkillStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useSkillStore.setState({
      skills: [],
      selectedSkillId: null,
      searchQuery: '',
    });
  });

  it('setSkills updates state correctly', () => {
    const { result } = renderHook(() => useSkillStore());

    act(() => {
      result.current.setSkills([mockSkill]);
    });

    expect(result.current.skills).toEqual([mockSkill]);
  });
});
```

**Key Points**:

- Use `renderHook()` from @testing-library/react
- Wrap state changes in `act()`
- Reset store in `beforeEach()` for test isolation

### Utility Function Tests

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

**Key Points**:

- Test pure functions directly (no mocking needed)
- Cover happy path + edge cases + error cases
- Use descriptive test names

### React Hook Tests

**Pattern**:

```typescript
import { renderHook } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls callback on Cmd+1', () => {
    const mockCallback = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onTab1: mockCallback }));

    const event = new KeyboardEvent('keydown', { key: '1', metaKey: true });
    window.dispatchEvent(event);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('cleanup removes event listeners', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts({}));
    unmount();

    const event = new KeyboardEvent('keydown', { key: '1', metaKey: true });
    window.dispatchEvent(event);
    // Should not throw or cause effects
  });
});
```

**Key Points**:

- Mock platform with `vi.stubGlobal('navigator', { platform: 'MacIntel' })`
- Test event listeners with `window.dispatchEvent()`
- Test cleanup with `unmount()`

## Workflow

### Phase 1: Fix TypeScript Errors (~2 hours)

```bash
# 1. Run build to see all errors
npm run build

# 2. Fix each error using patterns above
# - DescriptionSection.tsx (ReactNode fix)
# - ErrorBoundary.tsx (remove unused import)
# - OverviewPanel.tsx (ReactNode fixes)
# - InteractiveDiagram.tsx (library API fixes)
# - useListNavigation.ts (setState type annotations)

# 3. Verify build succeeds
npm run build  # Must complete with exit code 0

# 4. Manual smoke test
npm run dev    # Verify app launches without errors
```

### Phase 2: Store Tests (~3 hours)

**Files to Create**:

- `tests/unit/stores/useSkillStore.test.ts`
- `tests/unit/stores/navigationStore.test.ts`
- `tests/unit/stores/keyboardStore.test.ts`

**Coverage Target**: >90% per store

```bash
# Run tests incrementally
npm test tests/unit/stores/useSkillStore.test.ts
npm test tests/unit/stores/navigationStore.test.ts
npm test tests/unit/stores/keyboardStore.test.ts

# Check coverage
npm run test:coverage -- tests/unit/stores/
```

### Phase 3: Utils Tests (~3 hours)

**Files to Create**:

- `tests/unit/utils/searchOperators.test.ts`
- `tests/unit/utils/keyboardUtils.test.ts`
- `tests/unit/utils/diagramGenerator.test.ts`
- `tests/unit/utils/triggerAnalyzer.test.ts`

**Coverage Target**: >90% per util

```bash
# Run tests incrementally
npm test tests/unit/utils/

# Check coverage
npm run test:coverage -- tests/unit/utils/
```

### Phase 4: Hook Tests (~2 hours)

**Files to Create**:

- `tests/unit/hooks/useKeyboardShortcuts.test.ts`
- `tests/unit/hooks/useNavigationShortcuts.test.ts`
- `tests/unit/hooks/usePlatformModifier.test.ts`
- `tests/unit/hooks/useListNavigation.test.ts`

**Coverage Target**: >90% per hook

```bash
# Run tests incrementally
npm test tests/unit/hooks/

# Check coverage
npm run test:coverage -- tests/unit/hooks/
```

### Phase 5: Integration & Verification (~1 hour)

```bash
# 1. Run full test suite
npm test

# 2. Check overall coverage
npm run test:coverage
# Verify: >95.5% overall, >90% per module

# 3. Production build verification
npm run build
# Must complete with exit code 0

# 4. Manual testing
npm run dev
# Verify all features work correctly

# 5. Create PR
git add .
git commit -m "Fix TypeScript errors and complete unit test backfill"
git push origin 014-typescript-test-fixes
gh pr create --base main --head 014-typescript-test-fixes
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (for manual testing)

# Testing
npm test                 # Run all tests
npm test -- [file]       # Run specific test file
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Building
npm run build            # Build frontend (TypeScript compilation)
npm run tauri build      # Build complete Tauri app

# Type Checking
npx tsc --noEmit         # Check types without building
```

## Success Criteria Checklist

- [ ] All 8 TypeScript errors fixed
- [ ] `npm run build` completes with exit code 0
- [ ] App launches without errors or blank screen
- [ ] useSkillStore tests achieve >90% coverage
- [ ] navigationStore tests achieve >90% coverage
- [ ] keyboardStore tests achieve >90% coverage
- [ ] searchOperators tests achieve >90% coverage
- [ ] keyboardUtils tests achieve >90% coverage
- [ ] diagramGenerator tests achieve >90% coverage
- [ ] triggerAnalyzer tests achieve >90% coverage
- [ ] useKeyboardShortcuts tests achieve >90% coverage
- [ ] useNavigationShortcuts tests achieve >90% coverage
- [ ] usePlatformModifier tests achieve >90% coverage
- [ ] useListNavigation tests achieve >90% coverage
- [ ] Overall coverage >95.5%
- [ ] All tests pass (100% pass rate)
- [ ] Build completes in <60 seconds
- [ ] Tests complete in <5 seconds

## Troubleshooting

**Problem**: TypeScript error persists after fix

- **Solution**: Clear Vite cache: `rm -rf node_modules/.vite && npm run build`

**Problem**: Tests fail with "Cannot find module"

- **Solution**: Check import paths match barrel exports in `src/stores/index.ts`

**Problem**: Coverage not increasing

- **Solution**: Ensure test file naming matches pattern `*.test.ts` or `*.test.tsx`

**Problem**: Hook tests fail with "act() warning"

- **Solution**: Wrap state changes in `act(() => { ... })`

**Problem**: Platform-specific tests fail on CI

- **Solution**: Use `vi.stubGlobal('navigator', { platform: 'MacIntel' })` in beforeEach

## Resources

- [Zustand Testing Docs](https://github.com/pmndrs/zustand#testing)
- [@testing-library/react Hooks](https://react-hooks-testing-library.com/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [React 19 TypeScript Changes](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes)
- [react-zoom-pan-pinch v5 API](https://github.com/BetterTyped/react-zoom-pan-pinch)

---

**Created**: 2025-01-13 | **Phase**: Quickstart (Phase 1 of /speckit.plan)
