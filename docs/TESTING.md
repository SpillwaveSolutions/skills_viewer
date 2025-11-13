# Testing Guide

**Project**: Skill Debugger
**Last Updated**: 2025-11-13
**Maintained By**: Development Team

---

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Quick Start](#quick-start)
- [Writing Tests](#writing-tests)
  - [Unit Tests](#unit-tests)
  - [Component Tests](#component-tests)
  - [Hook Tests](#hook-tests)
  - [E2E Tests](#e2e-tests)
  - [Rust Backend Tests](#rust-backend-tests)
- [Running Tests](#running-tests)
- [Coverage Requirements](#coverage-requirements)
- [Testing Best Practices](#testing-best-practices)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Testing is a **constitutional requirement** for the Skill Debugger project (Principle VII: >80% coverage). We follow **Test-Driven Development (TDD)** for all new features.

**TDD Workflow**:

1. Write failing tests first (red)
2. Write minimal code to pass tests (green)
3. Refactor while keeping tests passing (refactor)
4. Repeat

This ensures:

- All code has corresponding tests
- Features meet requirements before implementation
- Refactoring is safe and confidence-building
- Code coverage targets are naturally met

---

## Test Stack

### Frontend Testing

| Tool                            | Purpose                                         | Version |
| ------------------------------- | ----------------------------------------------- | ------- |
| **Vitest**                      | Unit and integration test runner                | 4.0.8   |
| **@testing-library/react**      | Component testing with user-centric queries     | 16.3.0  |
| **@testing-library/user-event** | Simulate user interactions                      | 14.6.1  |
| **happy-dom**                   | Lightweight DOM environment (faster than JSDOM) | 20.0.10 |
| **@vitest/coverage-v8**         | Code coverage reporting                         | 4.0.8   |
| **@vitest/ui**                  | Interactive test UI                             | 4.0.8   |

### E2E Testing

| Tool                     | Purpose                          | Version |
| ------------------------ | -------------------------------- | ------- |
| **Playwright**           | Browser automation for E2E tests | 1.56.1  |
| **@axe-core/playwright** | Automated accessibility testing  | 4.11.0  |

### Backend Testing

| Tool           | Purpose                         | Version  |
| -------------- | ------------------------------- | -------- |
| **cargo test** | Rust unit and integration tests | Built-in |

---

## Quick Start

### Run All Tests

```bash
# Unit tests (watch mode)
npm test

# E2E tests
npm run test:e2e

# Backend tests
cd src-tauri && cargo test
```

### Generate Coverage Report

```bash
npm run test:coverage
open coverage/index.html  # View in browser
```

### Interactive Test UI

```bash
npm run test:ui
# Opens browser at http://localhost:51204/__vitest__/
```

---

## Writing Tests

### Test File Locations

```
tests/
├── unit/                      # Unit and integration tests
│   ├── components/            # Component tests
│   │   ├── SkillList.test.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── KeyboardShortcutHelp.test.tsx
│   ├── hooks/                 # Hook tests
│   │   ├── useKeyboardShortcuts.test.ts
│   │   └── usePlatformModifier.test.ts
│   ├── stores/                # State management tests
│   │   └── keyboardStore.test.ts
│   └── utils/                 # Utility function tests
│       └── keyboardUtils.test.ts
├── e2e/                       # End-to-end tests
│   ├── keyboard.spec.ts
│   ├── search.spec.ts
│   └── navigation.spec.ts
├── fixtures/                  # Test data and mocks
│   └── mockSkills.ts
└── setup.ts                   # Test configuration
```

**Naming Convention**:

- Unit tests: `[filename].test.ts` or `[filename].test.tsx`
- E2E tests: `[feature].spec.ts`

---

### Unit Tests

**Purpose**: Test individual functions or utilities in isolation.

**Example**: Testing a utility function

```typescript
// tests/unit/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('should format ISO date to MM/DD/YYYY', () => {
    const result = formatDate('2025-11-13');
    expect(result).toBe('11/13/2025');
  });

  it('should handle invalid dates gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid Date');
  });

  it('should return empty string for null input', () => {
    const result = formatDate(null);
    expect(result).toBe('');
  });
});
```

**Key Points**:

- Test one function or class per file
- Use descriptive test names ("should [expected behavior] when [condition]")
- Test happy path, edge cases, and error conditions
- Keep tests fast (<10ms per test)

---

### Component Tests

**Purpose**: Test React components with user interactions.

**Example**: Testing a component with user events

```typescript
// tests/unit/components/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();

    render(<SearchBar value="" onChange={onChangeMock} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, 'test query');

    expect(onChangeMock).toHaveBeenCalledWith('test query');
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();

    render(<SearchBar value="test" onChange={onChangeMock} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('should have accessible label', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByLabelText(/search skills/i);
    expect(input).toBeInTheDocument();
  });
});
```

**Key Points**:

- Use `@testing-library/react` for rendering
- Use `userEvent` for simulating user interactions (preferred over `fireEvent`)
- Query by role or label (accessibility-first)
- Mock callbacks with `vi.fn()`
- Test accessibility (labels, ARIA attributes)

---

### Hook Tests

**Purpose**: Test custom React hooks in isolation.

**Example**: Testing a custom hook

```typescript
// tests/unit/hooks/useKeyboardShortcuts.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useKeyboardStore } from '@/stores/keyboardStore';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset store before each test
    useKeyboardStore.getState().reset();
  });

  afterEach(() => {
    // Clean up event listeners
    vi.restoreAllMocks();
  });

  it('should set searchFocusRequested on Cmd+F', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: 'f',
      metaKey: true,
    });

    window.dispatchEvent(event);

    const state = useKeyboardStore.getState();
    expect(state.searchFocusRequested).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
```

**Key Points**:

- Use `renderHook` from `@testing-library/react`
- Reset global state in `beforeEach`
- Clean up side effects in `afterEach`
- Test lifecycle (mount, unmount, updates)

---

### E2E Tests

**Purpose**: Test complete user workflows in a real browser.

**Example**: E2E test with Playwright

```typescript
// tests/e2e/keyboard.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('text=Skill Debugger');
  });

  test('should focus search on Cmd/Ctrl+F', async ({ page }) => {
    // Press Cmd+F (or Ctrl+F on Windows/Linux)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+F' : 'Control+F');

    // Verify search input has focus
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
  });

  test('should open help modal on ?', async ({ page }) => {
    await page.keyboard.press('?');

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Keyboard Shortcuts');
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

**Key Points**:

- Use Playwright's `page` API for browser interactions
- Test complete workflows (multi-step user actions)
- Include accessibility checks with `@axe-core/playwright`
- Use `waitForSelector` for dynamic content
- Test cross-browser (Chromium, Firefox, WebKit)

---

### Rust Backend Tests

**Purpose**: Test Tauri commands and Rust utilities.

**Example**: Rust unit test

```rust
// src-tauri/src/skills.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_skill_frontmatter() {
        let content = r#"---
name: Test Skill
description: A test skill
---
# Content"#;

        let skill = parse_skill(content).unwrap();
        assert_eq!(skill.name, "Test Skill");
        assert_eq!(skill.description, "A test skill");
    }

    #[test]
    fn test_scan_skills_directory() {
        let skills = scan_skills("/path/to/skills").unwrap();
        assert!(!skills.is_empty());
    }
}
```

**Key Points**:

- Use `#[cfg(test)]` to conditionally compile tests
- Use `#[test]` attribute for test functions
- Use `assert!`, `assert_eq!`, `assert_ne!` macros
- Test error conditions with `Result` types

**Run Rust tests**:

```bash
cd src-tauri
cargo test
cargo test -- --nocapture  # Show println! output
```

---

## Running Tests

### Unit Tests

```bash
# Watch mode (default) - reruns tests on file changes
npm test

# Run once (for CI/CD)
npm test -- --run

# Run specific test file
npm test SearchBar.test.tsx

# Run tests matching pattern
npm test -- --grep "keyboard"

# Run with coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- keyboard.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode (pause on failures)
npm run test:e2e -- --debug

# Update snapshots
npm run test:e2e -- --update-snapshots
```

**Prerequisites for E2E tests**:

- Tauri app must be running: `npm run tauri dev`
- Or use webServer config in `playwright.config.ts` (automatic)

### Backend Tests

```bash
cd src-tauri
cargo test

# Run specific test
cargo test parse_skill

# Show output (println!)
cargo test -- --nocapture

# Run in release mode (faster)
cargo test --release
```

---

## Coverage Requirements

Per **constitutional Principle VII**, all core logic must maintain:

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

**Current Coverage**: 97.12% (exceeds constitutional requirement)

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report in browser
open coverage/index.html

# View in terminal
npm run test:coverage -- --reporter=text
```

### Coverage Configuration

Coverage thresholds are enforced in `vitest.config.ts`:

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

**Exclusions**:

- `node_modules/`
- `tests/`
- `*.test.ts`, `*.spec.ts`
- `types/` (TypeScript type definitions)
- Configuration files (`vite.config.ts`, etc.)

### Coverage Report Example

```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   97.12 |    95.45 |   96.77 |   97.12 |
 components                 |     100 |      100 |     100 |     100 |
  KeyboardShortcutHelp.tsx  |     100 |      100 |     100 |     100 |
  SearchBar.tsx             |     100 |      100 |     100 |     100 |
  SkillList.tsx             |     100 |      100 |     100 |     100 |
 hooks                      |   96.82 |    94.11 |   95.83 |   96.82 |
  useKeyboardShortcuts.ts   |   96.82 |    94.11 |   95.83 |   96.82 |
  usePlatformModifier.ts    |     100 |      100 |     100 |     100 |
 stores                     |     100 |      100 |     100 |     100 |
  keyboardStore.ts          |     100 |      100 |     100 |     100 |
 utils                      |   91.42 |    88.88 |   90.00 |   91.42 |
  keyboardUtils.ts          |   91.42 |    88.88 |   90.00 |   91.42 |
```

---

## Testing Best Practices

### 1. Write Tests First (TDD)

**Bad**:

```typescript
// Write code first, tests later (or never)
function add(a: number, b: number): number {
  return a + b;
}

// Tests added as afterthought
test('should add numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

**Good**:

```typescript
// Write failing test first
test('should add two numbers', () => {
  expect(add(2, 3)).toBe(5);
});

// Then implement to make it pass
function add(a: number, b: number): number {
  return a + b;
}
```

### 2. Test Behavior, Not Implementation

**Bad**:

```typescript
test('should call internal helper function', () => {
  const spy = vi.spyOn(component, '_internalHelper');
  component.doSomething();
  expect(spy).toHaveBeenCalled(); // Testing implementation detail
});
```

**Good**:

```typescript
test('should display success message after submission', async () => {
  const user = userEvent.setup();
  render(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### 3. Use User-Centric Queries

**Priority Order** (from best to worst):

1. **Role**: `getByRole('button', { name: /submit/i })`
2. **Label**: `getByLabelText('Email')`
3. **Placeholder**: `getByPlaceholderText('Enter email')`
4. **Text**: `getByText('Hello')`
5. **Test ID**: `getByTestId('custom-element')` (last resort)

**Why?** Role and label queries ensure accessibility.

### 4. Test Accessibility

Always include accessibility checks:

```typescript
test('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  render(<Button onClick={mockFn}>Click me</Button>);

  const button = screen.getByRole('button');
  button.focus();
  await user.keyboard('{Enter}');

  expect(mockFn).toHaveBeenCalled();
});
```

### 5. Keep Tests Independent

**Bad**:

```typescript
let sharedState;

test('test 1', () => {
  sharedState = 'foo'; // Mutation affects other tests
});

test('test 2', () => {
  expect(sharedState).toBe('foo'); // Depends on test 1
});
```

**Good**:

```typescript
test('test 1', () => {
  const state = 'foo'; // Local state
  expect(state).toBe('foo');
});

test('test 2', () => {
  const state = 'bar'; // Independent state
  expect(state).toBe('bar');
});
```

### 6. Mock External Dependencies

```typescript
// Mock Tauri commands
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn((cmd, args) => {
    if (cmd === 'scan_skills') {
      return Promise.resolve([{ name: 'Test Skill' }]);
    }
  }),
}));
```

### 7. Use Descriptive Test Names

**Bad**:

```typescript
test('test 1', () => { ... });
test('button test', () => { ... });
```

**Good**:

```typescript
test('should display error message when email is invalid', () => { ... });
test('should call onSubmit with form data when submit button is clicked', () => { ... });
```

### 8. Test Error Conditions

```typescript
test('should handle API error gracefully', async () => {
  // Mock API to return error
  vi.mocked(invoke).mockRejectedValue(new Error('API Error'));

  render(<SkillList />);

  await waitFor(() => {
    expect(screen.getByText(/error loading skills/i)).toBeInTheDocument();
  });
});
```

---

## Continuous Integration

All pull requests must pass:

1. **Unit tests** with 80%+ coverage
2. **E2E tests** for critical user flows
3. **Linting** and formatting checks
4. **Rust tests** (backend)

### GitHub Actions Workflow

```yaml
name: CI

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Lint code
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Rust tests
        run: cd src-tauri && cargo test
```

---

## Troubleshooting

### Issue 1: Tests Fail with "Cannot find module"

**Symptom**:

```
Error: Cannot find module '@/components/MyComponent'
```

**Solution**: Check `vitest.config.ts` has correct path alias:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue 2: Happy-DOM vs JSDOM

**Symptom**: Tests behave differently than expected

**Solution**: happy-dom is faster but less complete than JSDOM. If tests fail, try switching:

```typescript
// vitest.config.ts
test: {
  environment: 'jsdom', // Change from 'happy-dom'
}
```

Then install:

```bash
npm install -D jsdom
```

### Issue 3: E2E Tests Timeout

**Symptom**:

```
Error: Test timeout of 30000ms exceeded
```

**Solution**: Increase timeout in test or config:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

Or globally in `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 60 * 1000, // 60 seconds
});
```

### Issue 4: Playwright Browsers Not Installed

**Symptom**:

```
Error: Executable doesn't exist at ...
```

**Solution**:

```bash
npx playwright install
```

### Issue 5: Coverage Threshold Not Met

**Symptom**:

```
ERROR: Coverage for lines (75%) does not meet threshold (80%)
```

**Solution**: Write more tests or adjust threshold temporarily:

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 75, // Lower temporarily
  },
}
```

**Important**: Constitutional requirement is 80%, so this is only for temporary development.

### Issue 6: Flaky Tests

**Symptom**: Tests pass/fail intermittently

**Common Causes**:

1. **Race conditions**: Use `waitFor` or `findBy*` queries
2. **Timers**: Mock timers with `vi.useFakeTimers()`
3. **Shared state**: Reset state in `beforeEach`
4. **Network requests**: Mock all external requests

**Solution**:

```typescript
// Use waitFor for async updates
import { waitFor } from '@testing-library/react';

test('async update', async () => {
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

---

## Additional Resources

- **Vitest Documentation**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Playwright**: https://playwright.dev/
- **Rust Testing**: https://doc.rust-lang.org/book/ch11-00-testing.html
- **Constitutional Requirements**: `.specify/memory/constitution.md`
- **Test Backfill Strategy**: `specs/TEST_BACKFILL_STRATEGY.md`

---

**Last Updated**: 2025-11-13
**Version**: 1.0
**Maintained By**: Development Team
