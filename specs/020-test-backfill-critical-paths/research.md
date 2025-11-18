# Research: Test Backfill - Critical Paths

**Date**: 2025-11-17
**Feature**: 020-test-backfill-critical-paths

## Overview

This document consolidates research findings for implementing comprehensive unit tests for skill scanner (Rust), YAML parser (Rust), useSkillStore (Zustand), and SkillList component (React).

---

## 1. Rust Test Fixtures and Temporary Directories

### Decision: Use `tempfile::TempDir`

**Rationale**:

- Automatic cleanup on drop (RAII pattern)
- Cross-platform compatibility (macOS, Linux, Windows)
- Already in project dependencies (`Cargo.toml` line 27)
- Battle-tested across Rust ecosystem

**Implementation Pattern**:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::fs;

    fn create_test_skill_fixture(name: &str, content: &str) -> std::io::Result<TempDir> {
        let temp_dir = TempDir::new()?;
        let skill_dir = temp_dir.path().join(name);
        fs::create_dir(&skill_dir)?;
        fs::write(skill_dir.join("SKILL.md"), content)?;
        Ok(temp_dir)
    }
}
```

**Alternatives Considered**:

- Manual cleanup with `fs::remove_dir_all()`: Rejected due to cleanup failure risks
- Hardcoded test directories: Rejected due to cleanup issues and test isolation problems

**References**:

- tempfile crate: https://docs.rs/tempfile/latest/tempfile/
- Rust Book - Testing: https://doc.rust-lang.org/book/ch11-03-test-organization.html

---

## 2. YAML Parsing Error Testing

### Decision: Test errors via `None` return values and stderr inspection

**Rationale**:

- Existing `extract_frontmatter()` function returns `(Option<Value>, String)`
- Error handling uses `eprintln!` for logging
- No changes to production code needed (tests adapt to current impl)

**Implementation Pattern**:

```rust
#[test]
fn test_malformed_yaml() {
    let content = "---\ninvalid: [yaml: content\n---\n\nContent";
    let (frontmatter, _) = extract_frontmatter(content);

    // Should return None for invalid YAML
    assert!(frontmatter.is_none());
}

#[test]
fn test_missing_delimiter() {
    let content = "name: test\n\nNo opening delimiter";
    let (frontmatter, content_clean) = extract_frontmatter(content);

    assert!(frontmatter.is_none());
    assert_eq!(content_clean, content); // Full content returned
}
```

**UTF-8 Edge Cases**:

- Test BOM handling: `"\u{FEFF}---\nkey: value\n---"`
- Test special characters: Emojis, accented characters, CJK
- Test large frontmatter: >10KB YAML blocks

**References**:

- serde_yaml error handling: https://docs.rs/serde_yaml/latest/serde_yaml/

---

## 3. Zustand Store Testing Patterns

### Decision: Use real store instances with reset pattern

**Rationale**:

- Zustand is lightweight in-memory utility (not external service)
- Official docs recommend avoiding mocks
- Project already uses this pattern successfully (`keyboardStore.test.ts`)
- Real instances test actual behavior

**Implementation Pattern**:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSkillStore } from '@/stores/useSkillStore';

describe('useSkillStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useSkillStore());
    act(() => {
      result.current.reset(); // Requires adding reset() action to store
    });
  });

  it('should initialize with empty skills', () => {
    const { result } = renderHook(() => useSkillStore());
    expect(result.current.skills).toEqual([]);
  });
});
```

**Immutability Testing**:

- Use `toBe` for primitives and reference equality
- Use `toEqual` for arrays/objects (deep equality)
- Use `not.toBe` to verify new object references (immutability)

**Selector Testing**:

- Test selectors as pure functions by passing mock state
- Example: `getFilteredSkills(mockState)` for unit testing
- Combine with integration tests using real store

**Alternatives Considered**:

- Full store mocking: Rejected per official Zustand docs ("avoid mocking")
- `__mocks__/zustand.ts` auto-reset: Rejected as overkill for component unit tests

**References**:

- Zustand testing guide: https://zustand.docs.pmnd.rs/guides/testing
- React Testing Library renderHook: https://testing-library.com/docs/react-testing-library/api/#renderhook

---

## 4. React Component Testing with React Testing Library

### Decision: Use `@testing-library/user-event` for user interactions

**Rationale**:

- More realistic than `fireEvent` (simulates complete user behavior)
- Async by default (encourages proper testing patterns)
- Better keyboard simulation (supports modifiers, special keys)
- Official React Testing Library recommendation
- Already installed in project (v14.6.1)

**Implementation Pattern**:

```typescript
import userEvent from '@testing-library/user-event';

it('handles keyboard navigation', async () => {
  const user = userEvent.setup(); // Always call setup()
  render(<SkillList />);

  const listbox = screen.getByRole('listbox');
  listbox.focus();

  await user.keyboard('{ArrowDown}');
  await user.keyboard('{Enter}');

  expect(mockSelectSkill).toHaveBeenCalled();
});
```

**Keyboard Event Syntax**:

- `{ArrowDown}`, `{ArrowUp}`, `{Enter}`, `{Escape}`, `{Tab}`
- Modifiers: `{Control>}a{/Control}` (Ctrl+A), `{Meta>}k{/Meta}` (Cmd+K)
- Special: `{Space}`, `{Backspace}`, `{Delete}`

**Zustand Store Mocking** (for component tests):

```typescript
vi.mock('@/stores', () => ({
  useSkillStore: vi.fn(),
}));

beforeEach(() => {
  (useSkillStore as any).mockImplementation((selector?: any) => {
    const state = { selectedSkill: mockSkill, selectSkill: mockFn };
    return typeof selector === 'function' ? selector(state) : state;
  });
});
```

**Accessibility Assertions**:

```typescript
import { axe } from 'vitest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<SkillList />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it('uses correct ARIA attributes', () => {
  render(<SkillList />);
  const listbox = screen.getByRole('listbox');
  expect(listbox).toHaveAttribute('aria-activedescendant');
});
```

**Alternatives Considered**:

- `fireEvent`: Rejected as lower-level and less realistic
- Full Zustand integration in component tests: Rejected as too complex for unit tests

**References**:

- user-event docs: https://testing-library.com/docs/user-event/intro
- user-event keyboard API: https://testing-library.com/docs/user-event/keyboard
- vitest-axe: https://github.com/chaance/vitest-axe

---

## 5. Coverage Measurement for Rust

### Decision: Use `cargo-llvm-cov`

**Rationale**:

- Most accurate (uses official LLVM instrumentation)
- Works on all platforms (macOS, Linux, Windows)
- Modern Rust 1.75+ support (project uses Rust 1.75+)
- Clean GitHub Actions integration
- Built-in threshold enforcement
- Multiple output formats (HTML, LCOV, JSON)

**Installation**:

```bash
cargo install cargo-llvm-cov
```

**Usage**:

```bash
# HTML report (local development)
cargo llvm-cov --all-features --workspace --html --open

# Text summary
cargo llvm-cov --all-features --workspace

# CI/CD with threshold enforcement
cargo llvm-cov --all-features --workspace --lcov \
  --output-path lcov.info \
  --fail-under-lines 80
```

**Taskfile Integration** (add to `/Taskfile.yml`):

```yaml
test:coverage:backend:
  desc: Run Rust backend tests with HTML coverage report
  dir: '{{.BACKEND_DIR}}'
  cmds:
    - cargo llvm-cov --all-features --workspace --html
    - echo "Coverage report at src-tauri/target/llvm-cov/html/index.html"

test:coverage:backend:check:
  desc: Check backend coverage against 80% threshold
  dir: '{{.BACKEND_DIR}}'
  cmds:
    - cargo llvm-cov --all-features --workspace --fail-under-lines 80
```

**Alternatives Considered**:

- `cargo-tarpaulin`: Rejected due to platform limitations (Linux x86_64 only) and accuracy issues
- No coverage tool: Rejected as violates constitutional Principle VII

**References**:

- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- Rust instrumentation coverage: https://doc.rust-lang.org/rustc/instrument-coverage.html

---

## Frontend Coverage (Already Configured)

**Tool**: Vitest with V8 coverage provider

**Configuration** (already in `vitest.config.ts`):

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

**Usage**:

```bash
npm run test:coverage  # Generate coverage report
```

**Coverage targets**:

- useSkillStore: 100% coverage
- SkillList component: >90% coverage

---

## Summary of Decisions

| Area                         | Decision                       | Rationale                                 |
| ---------------------------- | ------------------------------ | ----------------------------------------- |
| Rust test fixtures           | tempfile::TempDir              | Automatic cleanup, cross-platform         |
| YAML error testing           | Assert on None, inspect stderr | Matches existing error handling           |
| Zustand testing              | Real store instances + reset   | Avoid over-mocking, test real behavior    |
| React component testing      | user-event library             | Most realistic user interactions          |
| Keyboard events              | user.keyboard() API            | Better than fireEvent, supports modifiers |
| Zustand mocking (components) | Manual vi.mock() pattern       | Already working in project                |
| Accessibility testing        | vitest-axe + ARIA assertions   | Automated + manual checks                 |
| Rust coverage                | cargo-llvm-cov                 | Most accurate, cross-platform             |
| Frontend coverage            | Vitest V8 provider             | Already configured                        |

---

## Implementation Checklist

### Rust Backend

- [ ] Install tempfile in dev-dependencies (already done)
- [ ] Install cargo-llvm-cov: `cargo install cargo-llvm-cov`
- [ ] Add test modules to skill_scanner.rs and yaml_parser.rs
- [ ] Create helper functions for test fixtures
- [ ] Test error cases (missing dirs, malformed YAML, UTF-8)
- [ ] Run coverage: `cargo llvm-cov --workspace --html`
- [ ] Verify >80% coverage for both modules

### Frontend

- [ ] Add reset() action to useSkillStore
- [ ] Create tests/unit/stores/useSkillStore.test.ts
- [ ] Test initial state, actions, selectors
- [ ] Test immutability with toBe/toEqual assertions
- [ ] Create tests/unit/components/SkillList.test.tsx
- [ ] Mock useSkillStore with vi.mock()
- [ ] Use user-event for keyboard interactions
- [ ] Test ARIA attributes and accessibility
- [ ] Run coverage: `npm run test:coverage`
- [ ] Verify 100% store coverage, >90% component coverage

### CI/CD

- [ ] Add Taskfile tasks for backend coverage
- [ ] Update ci task to include coverage checks
- [ ] Add GitHub Actions workflow for coverage enforcement
- [ ] Configure coverage thresholds (80%/100%/90%)

---

## Next Steps

Phase 1 artifacts to be generated:

1. **data-model.md**: Test fixture data structures
2. **contracts/**: Test interface contracts for each module
3. **quickstart.md**: Developer testing guide

After Phase 1, proceed to `/speckit.tasks` for task breakdown.
