# E2E Tests for Skill Debugger

This directory contains comprehensive end-to-end tests for the Skill Debugger application using Playwright.

## Test Suites

### 1. Skill Discovery (`skill-discovery.spec.ts`)

Tests for discovering and displaying skills:

- Loading and displaying skill list
- Displaying skill names and locations
- Showing skill counts
- Refresh and filter functionality

### 2. Skill Viewing (`skill-viewing.spec.ts`)

Tests for viewing skill details:

- Opening skill viewer
- Displaying all tabs (Overview, Content, Triggers, Diagram, References, Scripts)
- Tab switching functionality
- Back navigation

### 3. Navigation (`navigation.spec.ts`)

Tests for navigation between views:

- Back button functionality
- Maintaining selection state
- Switching between different skills

### 4. Search (`search.spec.ts`)

Tests for search and filtering:

- Filtering skills by search query
- Clearing search with Escape
- Field-specific search (name:, location:, description:)
- Location filtering
- No results message

### 5. Keyboard Shortcuts (`keyboard-shortcuts.spec.ts`)

Tests for keyboard navigation:

- Tab switching (Cmd/Ctrl+1-6)
- Back navigation (Alt+Left)
- Search focus (Cmd/Ctrl+F)
- Arrow key navigation
- Enter to open skill

### 6. Diagram Viewer (`diagram-viewer.spec.ts`)

Tests for diagram rendering and interaction:

- Diagram rendering
- Zoom controls (in, out, reset)
- Tab persistence

## Running Tests

### Local Development

**IMPORTANT**: Tauri desktop apps require a running app instance for E2E testing. The tests interact with the app through its webview.

**Setup Process:**

1. **Start the Tauri app in development mode:**

   ```bash
   npm run tauri dev
   ```

2. **Wait for the app to fully load** (you should see the app window with skills loaded)

3. **In a separate terminal, run the tests:**

   ```bash
   # Run all E2E tests
   npm run test:e2e

   # Run with UI mode (recommended for development)
   npm run test:e2e:ui

   # Run in headed mode (see browser)
   npm run test:e2e:headed

   # Run in debug mode
   npm run test:e2e:debug

   # Run specific test file
   npx playwright test tests/e2e/search.spec.ts
   ```

**Note**: Tests are currently designed to run against a running Tauri app on port 1420. The webServer configuration in playwright.config.ts is disabled because Playwright cannot directly control Tauri's lifecycle.

### CI/CD

Tests will automatically start the Vite dev server in CI:

```bash
npm run test:e2e
```

## Test Structure

Each test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // 1. Navigate to app (Vite dev server on port 1420)
    await page.goto('http://localhost:1420');

    // 2. Wait for app to load
    await page.waitForSelector('[data-testid="skill-list"]');

    // 3. Perform actions
    await page.locator('[data-testid="skill-item"]').first().click();

    // 4. Assert expected behavior
    await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();
  });
});
```

## Test Data

Tests use `data-testid` attributes for reliable element selection:

- `[data-testid="skill-list"]` - The skill list container
- `[data-testid="skill-item"]` - Individual skill items
- `[data-testid="skill-viewer"]` - The skill detail viewer

## Troubleshooting

### Tests Time Out

**Problem**: Tests fail with "Test timeout of 30000ms exceeded"

**Solution**:

1. Make sure the Tauri app is running (`npm run tauri dev`)
2. Wait for the app to fully load before running tests
3. Check that the Vite dev server is accessible at `http://localhost:1420`

### Skills Not Loading

**Problem**: Tests fail because no skills are found

**Solution**:

1. Make sure you have skills in `~/.claude/skills` or `~/.config/opencode/skills`
2. Check that the skill directories contain valid `skill.md` files

### Browser Not Found

**Problem**: Playwright complains about missing browsers

**Solution**: Install Playwright browsers:

```bash
npx playwright install
```

### Test Failures After Code Changes

**Problem**: Tests fail after updating components

**Solution**:

1. Check that `data-testid` attributes are still present
2. Verify element selectors match new component structure
3. Update test assertions if behavior changed intentionally

## Best Practices

1. **Always wait for elements**: Use `waitForSelector` before interacting with elements
2. **Use data-testid**: Prefer `data-testid` over CSS classes or text content
3. **Add timeouts for animations**: Wait for transitions to complete
4. **Test user workflows**: Focus on end-to-end user scenarios, not implementation details
5. **Keep tests independent**: Each test should be able to run in isolation
6. **Clean up after tests**: Tests should leave the app in a known state

## Coverage

Current test coverage:

- ✅ Skill discovery and listing
- ✅ Skill viewing and navigation
- ✅ Search and filtering
- ✅ Keyboard shortcuts
- ✅ Diagram rendering
- ✅ Tab navigation
- ✅ Back/forward navigation

## Future Test Scenarios

Potential areas for additional test coverage:

- Filter panel interactions
- Trigger analysis
- Reference file viewing
- Script file viewing
- Error handling
- Empty state handling
- Keyboard navigation in diagram view
- Accessibility testing
