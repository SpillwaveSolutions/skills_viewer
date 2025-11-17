# Quickstart: Visual Regression Testing

**Feature**: 013-visual-regression-testing
**Version**: 1.0.0
**Last Updated**: 2025-11-13

---

## Overview

This guide explains how to set up and use visual regression testing for the Skill Debugger application. Visual tests capture screenshots at checkpoints and verify UI correctness using Claude Code's vision API.

**Key Benefits**:

- Catches UI breakage that passes selector-based E2E tests
- Prevents blank screens, broken diagrams, and rendering issues
- Provides visual documentation of feature implementation
- Integrates into SDD checkpoint workflow

---

## Prerequisites

### Required Software

1. **Node.js 18+** (check: `node --version`)
2. **npm** (check: `npm --version`)
3. **Playwright 1.48.2+** (already in package.json)
4. **Chromium browser** (install below)

### Installation

```bash
# 1. Install Chromium browser for Playwright
npx playwright install chromium

# 2. Verify installation
npx playwright --version
```

**Expected output**:

```
Version 1.48.2
```

---

## Quick Start

### 1. Run the Application

Visual tests require the app to be running on `localhost:1420`:

```bash
# Terminal 1: Start app in dev mode
npm run dev

# Wait for: "VITE v5.x.x ready in Xms"
# App should be accessible at: http://localhost:1420
```

**Verify app is running**:

```bash
curl http://localhost:1420
# Should return HTML (not error)
```

### 2. Run Visual Tests

```bash
# Terminal 2: Run visual regression tests
npm run test:visual

# This will:
# 1. Archive previous screenshots (if any)
# 2. Navigate to app and select puml skill
# 3. Capture screenshots of all 6 tabs
# 4. Save screenshots + JSON metadata
```

**Expected output**:

```
Running 6 tests using 1 worker

  ✓ Visual Regression: puml Skill › Overview Panel - Visual Verification (2.5s)
  ✓ Visual Regression: puml Skill › Content Tab - Visual Verification (1.8s)
  ✓ Visual Regression: puml Skill › Diagram Tab - Visual Verification (3.2s)
  ✓ Visual Regression: puml Skill › References Tab - Visual Verification (1.5s)
  ✓ Visual Regression: puml Skill › Scripts Tab - Visual Verification (1.4s)
  ✓ Visual Regression: puml Skill › Triggers Tab - Visual Verification (1.6s)

  6 passed (12.0s)
```

**Generated Files**:

```
test-results/visual/
├── puml-overview-1699900000.png
├── puml-overview-1699900000.json
├── puml-content-1699900000.png
├── puml-content-1699900000.json
├── puml-diagram-1699900000.png
├── puml-diagram-1699900000.json
├── puml-references-1699900000.png
├── puml-references-1699900000.json
├── puml-scripts-1699900000.png
├── puml-scripts-1699900000.json
├── puml-triggers-1699900000.png
└── puml-triggers-1699900000.json
```

### 3. Verify Screenshots (Manual - v1)

**Option A: Visual Inspection** (quick check):

```bash
# Open screenshot directory
open test-results/visual/   # macOS
xdg-open test-results/visual/  # Linux
explorer test-results\visual\  # Windows

# Manually review each screenshot for correctness
```

**Option B: Claude Code Analysis** (recommended):

In your Claude Code session, say:

> "Analyze the screenshots in test-results/visual/ against the expectations in the corresponding JSON files. For each screenshot, verify that all 'should' criteria are met and all 'shouldNot' criteria are absent. Report PASS or FAIL with specific findings."

Claude Code will:

1. Read each PNG screenshot using the Read tool
2. Read corresponding JSON expectation file
3. Verify visual correctness against criteria
4. Report PASS/FAIL with specific observations

---

## Checkpoint Integration

Visual tests should run at SDD phase completion checkpoints to verify UI correctness before proceeding.

### Using the Checkpoint Script

```bash
# Run full visual verification checkpoint
./scripts/visual-checkpoint.sh

# Or specify different skill
./scripts/visual-checkpoint.sh sdd
```

**What the script does**:

1. Checks app is running (fails fast if not)
2. Archives previous screenshots
3. Runs visual tests (6 screenshots)
4. Prompts for Claude Code analysis
5. Blocks progression if failures detected

**Workflow**:

```bash
# 1. Complete Phase N tasks (e.g., Phase 3: Implementation)
task mark T030 complete

# 2. Run checkpoint script
./scripts/visual-checkpoint.sh

# 3. Claude Code analyzes screenshots
# (either manually or via prompt)

# 4. IF all visual tests PASS:
#    - Mark phase complete
#    - Proceed to Phase N+1

# 5. IF any visual test FAILS:
#    - Fix UI issue
#    - Re-run checkpoint
#    - Do NOT proceed until PASS
```

---

## Understanding Visual Expectations

Each screenshot has an associated JSON file with visual expectations:

**Example**: `puml-diagram-1699900000.json`

```json
{
  "screenshot": "/path/to/puml-diagram-1699900000.png",
  "expectation": {
    "should": [
      "Skill name 'puml' displayed prominently at top",
      "Mermaid diagram rendered as SVG graphic",
      "Zoom controls visible (+ - reset buttons)",
      "Export controls visible",
      "Layout selector dropdown visible"
    ],
    "shouldNot": [
      "Blank white screen",
      "Error messages or stack traces",
      "Raw Mermaid syntax visible as text",
      "Broken SVG rendering (missing diagram)",
      "Loading spinner"
    ],
    "description": "Diagram tab showing interactive Mermaid skill architecture"
  },
  "timestamp": "2025-11-13T10:30:00.000Z",
  "testName": "puml-diagram"
}
```

**How to Read Expectations**:

- **`should`**: Things that MUST be visible in the screenshot
  - If any missing → FAIL
  - Example: "Diagram rendered" - screenshot must show actual diagram, not blank area

- **`shouldNot`**: Things that MUST NOT be visible
  - If any present → FAIL
  - Example: "Blank white screen" - if screenshot is just white → FAIL

- **`description`**: One-sentence summary of what screenshot should show
  - Used for context when analyzing

---

## Updating Expectations

When you make legitimate UI changes, visual expectations may need updating.

### When to Update

✅ **Update expectations when**:

- UI design changed intentionally (e.g., moved zoom controls to top-right)
- New features added to UI (e.g., added "Copy Diagram" button)
- Wording/labels changed (e.g., "Reset Zoom" → "Reset View")

❌ **Do NOT update expectations to**:

- Make failing tests pass (fix the UI bug instead)
- Hide rendering issues
- Skip visual verification

### How to Update

1. **Run visual tests** to generate new screenshots
2. **Manually verify** new screenshots are correct
3. **Edit JSON file** with new expectations:

```bash
# Edit expectation file
vim test-results/visual/puml-diagram-1699900000.json

# Update "should" and "shouldNot" arrays
# Add/remove/modify criteria as needed
```

4. **Commit updated expectations** with clear justification:

```bash
git add test-results/visual/puml-diagram-1699900000.json
git commit -m "Update diagram visual expectations: moved zoom controls to top-right

Rationale: New UI design moves zoom controls from bottom-right to top-right
for better mobile experience. Updated 'should' criteria to reflect new position.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Troubleshooting

### Error: "App not running on localhost:1420"

**Cause**: Visual tests require app to be running

**Solution**:

```bash
# Terminal 1: Start app
npm run dev

# Wait for "ready" message, then run tests in Terminal 2
npm run test:visual
```

### Error: "Chromium browser not found"

**Cause**: Playwright browser not installed

**Solution**:

```bash
npx playwright install chromium
```

### Screenshots show blank screens

**Possible causes**:

1. **App crashed during test** - Check Terminal 1 for errors
2. **Navigation failed** - Skill not found or UI changed
3. **Timing issue** - Page loaded too slowly

**Solution**:

```bash
# 1. Check app logs (Terminal 1)
# 2. Manually navigate to app and verify skill loads
# 3. If manual navigation works, increase timeout in test:
#    page.waitForLoadState('networkidle', { timeout: 10000 })
```

### Screenshots look correct but Claude reports failures

**Possible causes**:

1. **Expectations too strict** - Criteria too specific
2. **Visual ambiguity** - Claude interpretation differs from intent
3. **False positive** - Actual issue but not obvious visually

**Solution**:

```bash
# 1. Manually review screenshot vs expectations
# 2. Refine expectation wording for clarity
# 3. Ask Claude to re-analyze with more context
# 4. If persistent, update expectations with justification
```

### Visual tests take too long (>2 min)

**Possible causes**:

1. **Slow network/rendering** - Mermaid diagram rendering slow
2. **Too many tabs** - 6 tabs × 5s = 30s expected, if slower investigate
3. **App performance issue** - App itself is slow

**Solution**:

```bash
# 1. Profile individual test times
npm run test:visual -- --reporter=line

# 2. Check which tab is slowest
# 3. Optimize that tab's rendering or reduce timeout
# 4. Consider parallel test execution (future enhancement)
```

---

## Advanced Usage

### Running Specific Tab Tests

```bash
# Only test diagram tab
npx playwright test tests/e2e/visual-regression.spec.ts -g "Diagram Tab"

# Only test overview and content
npx playwright test tests/e2e/visual-regression.spec.ts -g "Overview|Content"
```

### Headless Mode (CI/CD)

```bash
# Run tests in headless mode (no browser window)
npm run test:visual -- --headed=false

# Or set in playwright.config.ts
# headless: true
```

### Custom Screenshot Options

Edit `tests/e2e/visual-regression.spec.ts`:

```typescript
// Capture viewport only (not full page)
await captureAndDescribe(page, 'puml-overview', expectation, {
  fullPage: false,
  timeout: 2000,
  waitForStable: false,
});
```

---

## File Structure

```
skill-debugger/
├── scripts/
│   └── visual-checkpoint.sh        # Checkpoint integration script
├── tests/
│   ├── e2e/
│   │   ├── visual-regression.spec.ts   # Playwright test suite
│   │   └── helpers/
│   │       └── visual-verification.ts   # Helper functions
│   └── unit/
│       └── utils/
│           └── visual-verification.test.ts  # Unit tests
├── test-results/
│   ├── visual/                     # Current test run screenshots
│   │   ├── puml-overview-*.png
│   │   ├── puml-overview-*.json
│   │   └── ...
│   └── visual-archive/             # Historical screenshots
│       ├── 2025-11-13T10-30-00/
│       └── 2025-11-12T14-15-30/
└── specs/
    └── 013-visual-regression-testing/
        ├── spec.md                 # Feature specification
        ├── plan.md                 # Implementation plan
        ├── research.md             # Research findings
        ├── data-model.md           # Data structures
        ├── quickstart.md           # This file
        └── contracts/
            └── visual-testing.ts   # TypeScript interfaces
```

---

## npm Scripts

| Command                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `npm run test:visual`         | Run visual regression tests (capture screenshots) |
| `npm run test:visual:analyze` | (Future) Automated Claude vision analysis         |
| `npm run clean:screenshots`   | Clean archived screenshots older than 30 days     |

---

## Next Steps

1. **Read Feature Spec**: `specs/013-visual-regression-testing/spec.md` for full requirements
2. **Read Implementation Plan**: `specs/013-visual-regression-testing/plan.md` for technical details
3. **Review Research**: `specs/013-visual-regression-testing/research.md` for API decisions
4. **Check Data Model**: `specs/013-visual-regression-testing/data-model.md` for entity definitions
5. **Follow Tasks**: `specs/013-visual-regression-testing/tasks.md` (generated by `/speckit.tasks`)

---

## Support

**Issues**: Report bugs or issues via GitHub issues
**Documentation**: Full feature documentation in `specs/013-visual-regression-testing/`
**SDD Workflow**: See `.claude/CLAUDE.md` for SDD methodology

---

**Quickstart Status**: ✅ Complete - Ready for implementation
