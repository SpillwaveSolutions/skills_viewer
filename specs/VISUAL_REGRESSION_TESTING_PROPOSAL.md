# Visual Regression Testing Proposal

**Author**: Claude Code
**Date**: 2025-11-13
**Status**: Proposal
**Priority**: P1 (Critical - prevents repeated UI breakage)

---

## Problem Statement

### Current Pain Points

1. **Brittle E2E Tests**: Current Playwright tests check DOM elements exist but don't verify visual correctness
2. **Repeated UI Breakage**: Multiple instances where tests passed but UI was broken (blank screens, missing diagrams)
3. **Manual Verification Gap**: No automated way to verify "does the app LOOK correct?"
4. **Time Waste**: Discovering UI breakage late in development cycle requires rework

### Historical Issues

- **Blank Screen Bugs**: Tests passed but app showed blank white screen
- **Diagram Rendering**: Diagrams broke twice - selectors found elements but rendering failed
- **Current Concern**: User mentioned "diagrams are broken" - tests don't catch visual rendering issues

---

## Solution: AI-Powered Visual Regression Testing

### Core Concept

**Combine Playwright screenshots + Claude's multimodal vision** to verify not just that elements exist, but that they LOOK correct to a human (AI) eye.

### Workflow

```
1. Playwright captures screenshots of each panel/view
2. Screenshots sent to Claude Code for visual analysis
3. Claude verifies against expected visual requirements
4. Pass/fail based on visual correctness, not just DOM presence
```

---

## Implementation Plan

### Phase 1: Visual Test Infrastructure (Priority: P1)

#### 1.1 Create Visual Test Helper

**File**: `tests/e2e/helpers/visual-verification.ts`

```typescript
import { Page } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface VisualExpectation {
  should: string[]; // What should be visible
  shouldNot: string[]; // What should NOT be visible
  description: string; // Human description of expected state
}

export async function captureAndDescribe(
  page: Page,
  testName: string,
  expectation: VisualExpectation
): Promise<{ path: string; description: string }> {
  const timestamp = Date.now();
  const screenshotPath = join('test-results', 'visual', `${testName}-${timestamp}.png`);

  // Capture screenshot
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Write expectation file for Claude analysis
  const expectationPath = join('test-results', 'visual', `${testName}-${timestamp}.json`);

  writeFileSync(
    expectationPath,
    JSON.stringify(
      {
        screenshot: screenshotPath,
        expectation,
        timestamp: new Date().toISOString(),
        testName,
      },
      null,
      2
    )
  );

  return { path: screenshotPath, description: expectation.description };
}
```

#### 1.2 Create Visual Test Suite

**File**: `tests/e2e/visual-regression.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { captureAndDescribe, VisualExpectation } from './helpers/visual-verification';

test.describe('Visual Regression: puml Skill', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('[data-testid="skill-list"]');

    // Select puml skill
    await page.click('[data-testid="skill-item-puml"]');
    await page.waitForTimeout(500); // Wait for transition
  });

  test('Overview Panel - Visual Verification', async ({ page }) => {
    const expectation: VisualExpectation = {
      should: [
        'Skill name "puml" displayed prominently at top',
        'Location badge showing "claude" or "opencode" in colored pill',
        'Description text visible and readable',
        'Quick stats grid with 4 cards: References, Scripts, Triggers, Lines',
        'Trigger keywords displayed as blue pills/tags',
        'Clean white background with proper spacing',
      ],
      shouldNot: [
        'Blank white screen',
        'Error messages',
        'Undefined or null text',
        'Broken layout (overlapping elements)',
        'Missing sections',
      ],
      description: 'Overview panel showing puml skill metadata, stats, and trigger preview',
    };

    await captureAndDescribe(page, 'puml-overview', expectation);
  });

  test('Content Tab - Visual Verification', async ({ page }) => {
    await page.click('[data-testid="tab-content"]');
    await page.waitForTimeout(500);

    const expectation: VisualExpectation = {
      should: [
        'Markdown content rendered with proper formatting',
        'Code blocks with syntax highlighting',
        'Headings in correct hierarchy (h1, h2, h3)',
        'Links styled and visible',
        'Tables formatted correctly (if present)',
        'Content is scrollable if longer than viewport',
      ],
      shouldNot: [
        'Raw markdown syntax visible (*, **, #, etc)',
        'Blank content area',
        'Broken images',
        'Unformatted plain text',
      ],
      description: 'Content tab showing formatted markdown skill content',
    };

    await captureAndDescribe(page, 'puml-content', expectation);
  });

  test('Diagram Tab - Visual Verification', async ({ page }) => {
    await page.click('[data-testid="tab-diagram"]');
    await page.waitForTimeout(2000); // Mermaid rendering takes time

    const expectation: VisualExpectation = {
      should: [
        'Mermaid diagram rendered as SVG or graphic',
        'Diagram shows skill architecture (nodes and edges)',
        'Zoom controls visible (zoom in, zoom out, reset)',
        'Export controls visible (PNG, SVG, Mermaid source)',
        'Layout selector visible (TD, LR, etc)',
        'Diagram is NOT blank/empty',
        'Node labels are readable',
      ],
      shouldNot: [
        'Blank diagram area',
        'Error message about Mermaid rendering',
        'Raw Mermaid syntax visible as text',
        'Broken SVG rendering',
        'Missing toolbar controls',
      ],
      description:
        'Diagram tab showing interactive Mermaid skill architecture diagram with controls',
    };

    await captureAndDescribe(page, 'puml-diagram', expectation);
  });

  test('References Tab - Visual Verification', async ({ page }) => {
    await page.click('[data-testid="tab-references"]');
    await page.waitForTimeout(500);

    const expectation: VisualExpectation = {
      should: [
        'List of reference files with paths',
        'File paths displayed in monospace/code font',
        'Click-to-view or expand functionality visible',
        'Count of references matches overview panel',
        'Each reference item clearly separated',
      ],
      shouldNot: ['Empty list (if puml has references)', 'Broken file paths', 'Overlapping text'],
      description: 'References tab showing list of skill reference files',
    };

    await captureAndDescribe(page, 'puml-references', expectation);
  });

  test('Scripts Tab - Visual Verification', async ({ page }) => {
    await page.click('[data-testid="tab-scripts"]');
    await page.waitForTimeout(500);

    const expectation: VisualExpectation = {
      should: [
        'List of scripts with names and paths',
        'Script count matches overview panel',
        'Each script item clearly formatted',
        'Code/path displayed in monospace font',
      ],
      shouldNot: ['Empty list (if puml has scripts)', 'Broken script paths'],
      description: 'Scripts tab showing list of skill scripts',
    };

    await captureAndDescribe(page, 'puml-scripts', expectation);
  });

  test('Triggers Tab - Visual Verification', async ({ page }) => {
    await page.click('[data-testid="tab-triggers"]');
    await page.waitForTimeout(500);

    const expectation: VisualExpectation = {
      should: [
        'Full list of trigger keywords',
        'Keywords displayed as pills/tags',
        'Count matches overview panel',
        'Clear grouping or list structure',
      ],
      shouldNot: ['Empty trigger list', 'Unstyled plain text list'],
      description: 'Triggers tab showing complete list of skill trigger keywords',
    };

    await captureAndDescribe(page, 'puml-triggers', expectation);
  });
});
```

#### 1.3 Create Claude Analysis Script

**File**: `tests/e2e/analyze-visual-tests.ts`

```typescript
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface VisualTestResult {
  screenshot: string;
  expectation: {
    should: string[];
    shouldNot: string[];
    description: string;
  };
  timestamp: string;
  testName: string;
}

async function analyzeVisualTests() {
  const visualDir = 'test-results/visual';
  const expectationFiles = readdirSync(visualDir).filter((f) => f.endsWith('.json'));

  console.log(`\n=== VISUAL REGRESSION TEST RESULTS ===\n`);
  console.log(`Found ${expectationFiles.length} visual test(s) to analyze\n`);

  for (const file of expectationFiles) {
    const data: VisualTestResult = JSON.parse(readFileSync(join(visualDir, file), 'utf-8'));

    console.log(`\n--- ${data.testName} ---`);
    console.log(`Screenshot: ${data.screenshot}`);
    console.log(`\nExpected Visual State:`);
    console.log(`Description: ${data.expectation.description}`);
    console.log(`\nShould contain:`);
    data.expectation.should.forEach((item) => console.log(`  ✓ ${item}`));
    console.log(`\nShould NOT contain:`);
    data.expectation.shouldNot.forEach((item) => console.log(`  ✗ ${item}`));
    console.log(`\n**ACTION REQUIRED**: Claude Code should analyze screenshot at:`);
    console.log(`  ${data.screenshot}`);
    console.log(`\nVerify visual correctness and report pass/fail.`);
    console.log(`\n${'='.repeat(60)}\n`);
  }
}

analyzeVisualTests();
```

---

### Phase 2: Integration into Workflow (Priority: P1)

#### 2.1 Add to package.json Scripts

```json
{
  "scripts": {
    "test:visual": "playwright test tests/e2e/visual-regression.spec.ts",
    "test:visual:analyze": "ts-node tests/e2e/analyze-visual-tests.ts"
  }
}
```

#### 2.2 Workflow Integration

**Before Checkpoint** (e.g., before marking Phase 3 complete):

```bash
# 1. Run visual tests to capture screenshots
npm run test:visual

# 2. Analyze screenshots (shows Claude what to check)
npm run test:visual:analyze

# 3. Claude Code reads screenshots and verifies visual correctness
# 4. Only proceed to next phase if visual verification passes
```

---

### Phase 3: Automation with Multiple Agents (Future Enhancement)

#### 3.1 Parallel Visual Testing

```bash
# Run visual tests for multiple skills in parallel using agents
task test:visual:parallel SKILLS="puml,sdd,notion-uploader-downloader"
```

**Implementation**:

- Launch separate `Task` agents for each skill
- Each agent captures screenshots + runs visual verification
- Aggregate results at the end
- Benefits: 3-5x faster visual testing

#### 3.2 Background Visual Monitoring

- Run visual tests in background during development
- Alert if visual regression detected
- Auto-generate visual diff reports

---

## Success Criteria

### Phase 1 (MVP)

- [ ] Visual test suite captures screenshots for all 6 tabs (Overview, Content, Diagram, References, Scripts, Triggers)
- [ ] Each screenshot has associated VisualExpectation JSON
- [ ] Claude Code can read screenshots and verify against expectations
- [ ] Visual verification catches blank screen bugs
- [ ] Visual verification catches diagram rendering failures

### Phase 2 (Integration)

- [ ] Visual tests integrated into `task test` or `npm test` workflow
- [ ] Visual verification required before phase completion checkpoints
- [ ] Documentation updated with visual testing workflow

### Phase 3 (Automation)

- [ ] Parallel agent execution for multi-skill visual testing
- [ ] Background visual monitoring during development
- [ ] Visual diff reports generated automatically

---

## Benefits

1. **Early Detection**: Catch UI breakage immediately, not after manual testing
2. **Confidence**: Know that app LOOKS correct, not just that DOM elements exist
3. **Time Savings**: Reduce rework cycles from late-discovered UI bugs
4. **Leverage Existing Tools**: Uses Playwright (already installed) + Claude's vision (already available)
5. **Human-Like Verification**: Claude sees what a human would see, not just CSS selectors

---

## Implementation Estimate

### Phase 1: Visual Test Infrastructure

- **Effort**: 3-4 hours
- **Deliverables**:
  - `visual-verification.ts` helper
  - `visual-regression.spec.ts` test suite (6 tests for puml skill)
  - `analyze-visual-tests.ts` script
  - Documentation

### Phase 2: Workflow Integration

- **Effort**: 1-2 hours
- **Deliverables**:
  - npm scripts
  - Task commands (if using Taskfile)
  - Updated workflow documentation
  - Integration into checkpoint process

### Phase 3: Automation Enhancement

- **Effort**: 4-6 hours
- **Deliverables**:
  - Parallel agent execution
  - Background monitoring
  - Visual diff tooling

**Total Phase 1+2**: 4-6 hours (immediate value)
**Total All Phases**: 8-12 hours (complete solution)

---

## Next Steps

1. **Decision**: Approve or modify this proposal
2. **Scope**: Decide whether to implement in Feature 014 or separate feature
3. **Timeline**: If approved, create tasks in tasks.md or new feature spec
4. **Quick Win**: Could implement Phase 1 for just diagram tab first (highest risk area)

---

## Questions for User

1. Should we implement this as part of Feature 014 or as Feature 015-visual-regression-testing?
2. Priority for Phase 1 implementation - now or after completing current feature?
3. Which panels/tabs are highest priority for visual verification? (Diagram seems critical based on historical issues)
4. Should visual tests block phase progression (hard requirement) or be informational (soft requirement)?

---

**End of Proposal**
