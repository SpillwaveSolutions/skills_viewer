# Testing Quickstart: Diagram Toolbar Redesign

**Feature**: 018-diagram-toolbar-redesign
**Purpose**: Guide for running tests, measuring performance, and validating accessibility

## Prerequisites

Ensure the following tools are installed:

```bash
# Check Node.js version (need 18+)
node --version  # Should be >= 18.0.0

# Check npm
npm --version

# Install dependencies (if not already done)
npm install
```

## Test Structure Overview

```
tests/
├── unit/                          # Vitest unit tests
│   └── components/
│       └── DiagramToolbar.test.tsx
│
└── e2e/                           # Playwright E2E tests
    └── diagram-toolbar.spec.ts

src/components/diagram/__tests__/
├── InteractiveDiagram.test.tsx    # Modified - add toolbar integration tests
└── DiagramToolbar.test.tsx        # New - toolbar component unit tests
```

## Running Tests

### Unit Tests (Vitest + React Testing Library)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (for TDD)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only toolbar tests
npm test -- DiagramToolbar

# Run tests with UI (interactive mode)
npm run test:ui
```

**Coverage Target**: >80% for new DiagramToolbar component

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- diagram-toolbar

# Debug E2E test with Playwright Inspector
PWDEBUG=1 npm run test:e2e
```

## Accessibility Testing

### Automated Accessibility Audit (axe DevTools)

**Option 1: Browser Extension**

1. Install [axe DevTools Chrome Extension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility/lhdoppojpmngadmnindnejefpokejbdd)
2. Start dev server: `npm run dev`
3. Navigate to Diagram tab with a skill loaded
4. Open Chrome DevTools → axe DevTools tab
5. Click "Scan All of My Page"
6. **Target**: Zero violations

**Option 2: Automated in Tests**

```bash
# Run E2E tests with axe accessibility checks
npm run test:e2e -- --grep "accessibility"
```

**Example Playwright test with axe**:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('toolbar has no accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for toolbar to render
  await page.waitForSelector('[aria-label="Diagram toolbar"]');

  // Run axe accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('[aria-label="Diagram toolbar"]')
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual Keyboard Navigation Testing

1. Start dev server: `npm run dev`
2. Navigate to Diagram tab
3. Press `Tab` key repeatedly and verify:
   - Focus moves through all toolbar buttons in logical order
   - Focus indicator is clearly visible
   - Disabled buttons are skipped
   - `Enter` or `Space` activates focused button

**Expected Tab Order**:

1. Layout selector dropdown
2. Zoom out button (−)
3. Zoom percentage (clickable)
4. Zoom in button (+)
5. Fit to View button
6. Download SVG button
7. Download Mermaid button
8. Regenerate button

### Screen Reader Testing

**macOS (VoiceOver)**:

1. Enable VoiceOver: `Cmd+F5`
2. Navigate to toolbar: `VO+Right Arrow`
3. Verify each button announces:
   - Button label
   - Button role
   - Disabled state (if applicable)

**Windows (NVDA)**:

1. Install [NVDA](https://www.nvaccess.org/download/)
2. Start NVDA
3. Navigate with `Tab` key
4. Verify announcements

## Performance Testing

### Component Render Performance

**Tool**: React DevTools Profiler

1. Install [React DevTools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
2. Start dev server: `npm run dev`
3. Open Chrome DevTools → Profiler tab
4. Click "Record" (🔴)
5. Navigate to Diagram tab (trigger toolbar render)
6. Click "Stop" (⏹️)
7. Find "DiagramToolbar" in flame graph
8. **Target**: Render time <50ms

**Interpreting Results**:

- Green: Good (<16ms)
- Yellow: Acceptable (16-50ms)
- Red: Needs optimization (>50ms)

### Interaction Response Time

**Tool**: Chrome DevTools Performance Tab

1. Open Chrome DevTools → Performance tab
2. Click "Record" (🔴)
3. Click a toolbar button (e.g., Zoom In)
4. Click "Stop" (⏹️)
5. Find "click" event in timeline
6. Measure time from click to screen update
7. **Target**: <100ms from click to visual feedback

**Quick Manual Test**:

- Click toolbar buttons rapidly
- Verify they feel instant and responsive
- No lag or delays

### Layout Shift Testing

**Tool**: Chrome DevTools Lighthouse

1. Open Chrome DevTools → Lighthouse tab
2. Select "Performance" category
3. Click "Generate report"
4. Check "Cumulative Layout Shift (CLS)" score
5. **Target**: CLS = 0 (no layout shifts)

**Manual verification**:

1. Hover over each toolbar button
2. Watch for any layout shifts (content jumping)
3. **Expected**: No size changes on hover

## Test-Driven Development Workflow

When implementing toolbar component, follow TDD:

### Step 1: Write Failing Test

```typescript
// src/components/diagram/__tests__/DiagramToolbar.test.tsx

import { render, screen } from '@testing-library/react';
import { DiagramToolbar } from '../DiagramToolbar';

describe('DiagramToolbar', () => {
  it('renders zoom controls with correct percentage', () => {
    render(
      <DiagramToolbar
        zoom={1.5}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        // ... other props
      />
    );

    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});
```

**Run test**: `npm test -- DiagramToolbar`
**Expected**: ❌ FAIL (component doesn't exist yet)

### Step 2: Implement Minimum Code to Pass

```typescript
// src/components/diagram/DiagramToolbar.tsx

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({ zoom }) => {
  return <div>{(zoom * 100).toFixed(0)}%</div>;
};
```

**Run test**: `npm test -- DiagramToolbar`
**Expected**: ✅ PASS

### Step 3: Refactor with Confidence

Add visual grouping, TailwindCSS classes, accessibility attributes while tests ensure functionality preserved.

## Common Test Commands Reference

```bash
# Development
npm run dev                    # Start dev server (port 5173)
npm run tauri dev             # Start Tauri desktop app

# Unit Testing
npm test                      # Run all unit tests
npm run test:watch            # Watch mode (TDD)
npm run test:coverage         # Generate coverage report
npm run test:ui               # Interactive test UI

# E2E Testing
npm run test:e2e              # Run Playwright tests
npm run test:e2e -- --headed  # Show browser
npm run test:e2e -- --debug   # Debug mode

# Linting & Formatting
npm run lint                  # ESLint check
npm run format                # Prettier format

# Build
npm run build                 # Production build
npm run tauri build           # Build Tauri desktop app
```

## Troubleshooting

### "Cannot find module '@testing-library/react'"

**Solution**:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Playwright tests fail with "Target closed"

**Solution**:

```bash
# Reinstall Playwright browsers
npx playwright install
```

### Coverage report not generating

**Solution**:

```bash
# Ensure vitest config includes coverage plugin
npm install --save-dev @vitest/coverage-v8
```

### Accessibility violations found

**Common issues**:

1. Missing `aria-label` on buttons
2. Missing `alt` text on images
3. Insufficient color contrast
4. Missing focus indicators

**Fix**: Review axe DevTools report, add required attributes

## Success Criteria Validation

Before marking feature complete, verify:

- [x] Unit tests pass with >80% coverage
- [x] E2E tests pass for all user scenarios
- [x] Zero accessibility violations in axe DevTools
- [x] Toolbar renders in <50ms (React DevTools Profiler)
- [x] Button clicks respond in <100ms (Chrome Performance)
- [x] Zero layout shifts on hover (CLS = 0)
- [x] Keyboard navigation works (Tab, Enter, Space)
- [x] Screen reader announces all controls correctly
- [x] Works on narrow viewports (≥800px)

## Next Steps

After tests pass:

1. Run full test suite: `npm test && npm run test:e2e`
2. Perform accessibility audit
3. Measure performance with React DevTools
4. Create PR with test coverage report
5. Request review from team

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [axe DevTools Guide](https://www.deque.com/axe/devtools/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
