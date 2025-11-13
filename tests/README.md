# Testing Infrastructure

This directory contains all tests for the Skill Debugger project. The testing infrastructure is built on **Vitest**, a fast unit test framework powered by Vite.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/sample.test.ts
```

## Directory Structure

```
tests/
├── README.md                    # This file
├── setup.ts                     # Global test setup (loaded automatically)
├── fixtures/                    # Test data and mock files
├── unit/                        # Unit tests (components, hooks, utilities)
│   ├── sample.test.ts          # Sample test demonstrating patterns
│   ├── components/             # React component tests
│   ├── hooks/                  # React hooks tests
│   ├── stores/                 # Zustand store tests
│   └── utils/                  # Utility function tests
├── integration/                 # Integration tests (cross-module)
└── e2e/                        # End-to-end tests (Playwright)
```

## Test Types

### Unit Tests (`tests/unit/`)

Fast, isolated tests for individual functions, components, and hooks.

**Characteristics**:

- No external dependencies
- Use mocks for Zustand stores and Tauri commands
- Run in `happy-dom` environment (fast DOM simulation)
- Should complete in milliseconds

**Example**:

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/dateUtils';

describe('formatDate', () => {
  it('should format ISO date to readable string', () => {
    const result = formatDate('2025-11-13');
    expect(result).toBe('Nov 13, 2025');
  });
});
```

### Integration Tests (`tests/integration/`)

Tests that verify multiple modules work together correctly.

**Characteristics**:

- Test interactions between components and stores
- May use real stores instead of mocks
- Still avoid file system and network calls
- Run in `happy-dom` environment

**Example**:

```typescript
describe('SkillList + SkillViewer Integration', () => {
  it('should select skill when clicking list item', () => {
    // Test that clicking SkillList updates SkillViewer
  });
});
```

### End-to-End Tests (`tests/e2e/`)

Full application tests using Playwright to control the actual Tauri app.

**Characteristics**:

- Tests complete user workflows
- Runs against real application build
- Uses file system and Tauri APIs
- Slower (seconds per test)

**Example**:

```typescript
test('should scan skills and display results', async ({ page }) => {
  await page.click('button:has-text("Scan Skills")');
  await expect(page.locator('.skill-list')).toBeVisible();
});
```

Run E2E tests:

```bash
npm run test:e2e
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true, // Use global test functions (describe, it, expect)
    environment: 'happy-dom', // Fast DOM environment
    setupFiles: ['./tests/setup.ts'], // Run before all tests
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80, // Minimum 80% line coverage
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Test Setup (`tests/setup.ts`)

Global setup file that runs before all tests:

- Imports `@testing-library/jest-dom` for DOM matchers
- Mocks `window.matchMedia` for media query tests
- Mocks `navigator.platform` for platform detection

## Writing Tests

### Component Tests

Use `@testing-library/react` for component testing:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render with text', () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Tests

Use `@testing-library/react` for hook testing:

```typescript
import { renderHook } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });
});
```

### Store Tests

Test Zustand stores directly:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from '@/stores/myStore';

describe('myStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMyStore.setState({ count: 0 });
  });

  it('should increment count', () => {
    const { increment } = useMyStore.getState();
    increment();
    expect(useMyStore.getState().count).toBe(1);
  });
});
```

### Mocking Tauri Commands

Mock Tauri commands for unit tests:

```typescript
import { vi } from 'vitest';

// Mock the entire Tauri API module
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({ skills: [] }),
}));

// Or mock specific command
import { invoke } from '@tauri-apps/api/core';
vi.mocked(invoke).mockResolvedValue({ skills: [] });
```

## Test Coverage

Coverage requirements (enforced by CI):

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

View coverage report:

```bash
npm run test:coverage
```

Coverage HTML report is generated in `coverage/` directory.

## Best Practices

### 1. Test Behavior, Not Implementation

❌ Bad:

```typescript
expect(component.state.internalCounter).toBe(5);
```

✅ Good:

```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ Bad:

```typescript
it('works', () => { ... });
```

✅ Good:

```typescript
it('should display error message when API call fails', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should add item to list', () => {
  // Arrange: Set up test data
  const list = [];

  // Act: Perform the action
  list.push('item');

  // Assert: Verify the result
  expect(list).toContain('item');
});
```

### 4. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';

afterEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Reset store state
  useMyStore.setState({ count: 0 });
});
```

### 5. Test Edge Cases

Don't just test the happy path:

- Empty inputs
- Null/undefined values
- Error conditions
- Boundary values
- Race conditions

### 6. Keep Tests Fast

- Unit tests should complete in milliseconds
- Mock external dependencies (file system, network)
- Use `happy-dom` instead of `jsdom` for speed

### 7. One Assertion Per Test (When Possible)

❌ Bad (testing multiple things):

```typescript
it('should work', () => {
  expect(result.name).toBe('John');
  expect(result.age).toBe(30);
  expect(result.email).toBe('john@example.com');
});
```

✅ Good (focused tests):

```typescript
it('should set name correctly', () => {
  expect(result.name).toBe('John');
});

it('should set age correctly', () => {
  expect(result.age).toBe(30);
});
```

## CI/CD Integration

Tests run automatically on:

- Every push to feature branches
- Every pull request
- Before merging to main

CI fails if:

- Any test fails
- Coverage drops below 80%

## Debugging Tests

### Run Single Test File

```bash
npm test -- tests/unit/components/MyComponent.test.tsx
```

### Run Tests Matching Pattern

```bash
npm test -- -t "should render"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## Common Matchers

From `@testing-library/jest-dom`:

- `toBeInTheDocument()` - Element is in DOM
- `toBeVisible()` - Element is visible
- `toHaveTextContent(text)` - Element has text
- `toHaveAttribute(attr, value)` - Element has attribute
- `toBeDisabled()` - Element is disabled
- `toHaveFocus()` - Element has focus

From Vitest:

- `toBe(value)` - Strict equality (===)
- `toEqual(value)` - Deep equality
- `toContain(item)` - Array/string contains item
- `toHaveLength(n)` - Array/string has length
- `toThrow(error)` - Function throws error
- `toHaveBeenCalled()` - Mock was called
- `toHaveBeenCalledWith(args)` - Mock called with args

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Sample Tests

See `tests/unit/sample.test.ts` for examples of:

- Basic assertions
- Mock functions
- Setup/teardown
- Async tests
- Error handling

## Current Test Statistics

As of last run:

- **Test Files**: 8 passing
- **Tests**: 130 passing
- **Coverage**: 93.22% (lines), 85.46% (branches), 95.23% (functions)
- **Duration**: ~1.4s

## Contributing

When adding new features:

1. **Write tests first** (TDD approach preferred)
2. **Maintain coverage** above 80% for all new code
3. **Follow naming conventions**: `*.test.ts` or `*.test.tsx`
4. **Group related tests** with `describe` blocks
5. **Use meaningful test names** that explain what is being tested

For questions or issues with testing, see:

- [Project CLAUDE.md](../.claude/CLAUDE.md)
- [SDD Workflow](../specs/README.md)
