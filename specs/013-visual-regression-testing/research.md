# Research Findings: Visual Regression Testing + Diagram Fixes

**Feature**: 013-visual-regression-testing
**Date**: 2025-11-13
**Status**: Complete

---

## RT-001: react-zoom-pan-pinch v3 API Changes

**Decision**: Enable mouse drag panning explicitly with `panning={{ disabled: false }}` and ensure wheel zoom is properly configured

**Rationale**:
In react-zoom-pan-pinch v3.0.0+, there was a breaking change where **panning via mouse drag is disabled by default**. The current implementation in InteractiveDiagram.tsx (lines 143-151) only configures `wheel` and `doubleClick` props but does not explicitly enable panning. According to the API documentation, the `panning` object includes a `disabled` property that controls whether drag-to-pan functionality is enabled.

The library is currently at v3.7.0 (not v5.4.0 as initially stated in plan.md - this was an error). The breaking change that disabled panning by default occurred in v3.0.0.

**Alternatives Considered**:

- **Alternative 1: Use `activationKeys` to require modifier key for panning**
  - **Why rejected**: Adds unnecessary friction for users. Mermaid diagrams should be freely pannable without keyboard modifiers, especially on touchpad devices.

- **Alternative 2: Keep default behavior and rely on implicit defaults**
  - **Why rejected**: Research confirms that v3 changed defaults. Mouse drag panning does NOT work by default in v3.0.0+ and must be explicitly enabled. The current broken behavior confirms this.

- **Alternative 3: Downgrade to v2.x**
  - **Why rejected**: Loses other v3 features and improvements. Better to properly configure v3 than downgrade.

**Implementation Notes**:

Update `src/components/InteractiveDiagram.tsx` TransformWrapper configuration (lines 143-151):

```typescript
<TransformWrapper
  ref={transformRef}
  initialScale={1}
  minScale={0.1}
  maxScale={5}
  centerOnInit={true}
  wheel={{
    step: 0.1,                    // KEEP: Smooth zoom increments
    disabled: false,               // ADD: Explicitly enable wheel zoom
  }}
  panning={{
    disabled: false,               // ADD: Enable mouse drag panning (CRITICAL FIX)
    velocityDisabled: false,       // ADD: Enable smooth inertial panning
  }}
  doubleClick={{ disabled: true }} // KEEP: Prevents accidental double-click zoom
>
```

**Key Configuration Properties**:

- `wheel.disabled: false` - Ensures mouse wheel zoom is enabled
- `wheel.step: 0.1` - Smooth zoom increments (current value is good)
- `panning.disabled: false` - **CRITICAL** - Enables click-and-drag panning
- `panning.velocityDisabled: false` - Enables momentum/inertia after dragging for better UX
- `doubleClick.disabled: true` - Prevents accidental double-click zoom (current, keep as-is)

**Testing Checklist**:

- [ ] Mouse wheel zooms in/out smoothly
- [ ] Click and drag pans diagram in all directions
- [ ] Inertial scrolling works (momentum after drag release)
- [ ] Reset button returns to initial scale and position
- [ ] Zoom controls (+/-) work correctly
- [ ] Test on macOS, Linux, Windows (trackpad and mouse)

---

## RT-002: Playwright Screenshot Best Practices

**Decision**: Use `fullPage: true`, wait for network idle, PNG format with quality optimization

**Rationale**:
For Tauri desktop applications, Playwright screenshot capture needs to balance determinism, file size, and cross-platform consistency. Based on Playwright documentation and Tauri best practices:

1. **fullPage: true** - Captures entire scrollable content, not just viewport. Essential for tabs with long content (like Content tab with skill markdown).
2. **waitForLoadState('networkidle')** - Ensures all async content (Mermaid diagram rendering, markdown processing) is complete before capture.
3. **PNG format** - Lossless compression, better for text/UI screenshots than JPEG. File sizes manageable (<500KB target achievable with PNG optimization).
4. **Fixed viewport** - Not needed for Tauri (app has consistent window size), but can add if screenshots vary.

**Alternatives Considered**:

- **Alternative 1: JPEG format for smaller file size**
  - **Why rejected**: Lossy compression creates artifacts in text/UI screenshots, making visual diff harder. PNG compression adequate for <500KB target.

- **Alternative 2: waitForTimeout(2000) instead of networkidle**
  - **Why rejected**: Fixed timeouts are brittle (too short = incomplete render, too long = slow tests). Network idle is deterministic and adapts to actual render time.

- **Alternative 3: animations: 'disabled' option**
  - **Why rejected**: Tauri app has minimal animations. Disabling not necessary and may mask animation-related bugs.

**Implementation Notes**:

```typescript
// tests/e2e/helpers/visual-verification.ts
export async function captureAndDescribe(
  page: Page,
  testName: string,
  expectation: VisualExpectation,
  options?: CaptureOptions
): Promise<{ screenshot: string; metadata: string }> {
  // Wait for page to be fully rendered
  await page.waitForLoadState('networkidle');

  // Additional wait for Mermaid rendering if on diagram tab
  if (testName.includes('diagram')) {
    await page.waitForSelector('svg.mermaid', { timeout: 10000 });
    await page.waitForTimeout(1000); // Extra buffer for Mermaid animations
  }

  const timestamp = Date.now();
  const screenshotPath = path.join('test-results', 'visual', `${testName}-${timestamp}.png`);

  // Capture screenshot with optimized settings
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    type: 'png',
    // PNG compression level (0-100, higher = better quality/larger file)
    // Default 80 provides good balance
  });

  // Save metadata alongside screenshot
  const metadataPath = screenshotPath.replace('.png', '.json');
  await fs.writeFile(
    metadataPath,
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

  return { screenshot: screenshotPath, metadata: metadataPath };
}
```

**Performance Targets**:

- Screenshot capture: <5s per tab (including wait for network idle)
- File size: <500KB per PNG (text/UI compresses well)
- Total for 6 tabs: <30s

---

## RT-003: Claude Vision API Integration Pattern

**Decision**: Manual Claude Code analysis via Read tool on screenshots, with structured expectation prompts

**Rationale**:
Claude Code's Read tool supports multimodal input (images + text). The vision API is already available in the current session. For v1 implementation, manual analysis provides:

1. **Immediate value** - No API integration overhead, works today
2. **Human oversight** - Developer reviews visual correctness, builds confidence in criteria
3. **Iteration** - Refine visual expectations based on real analysis results
4. **Future automation path** - Once criteria stabilized, can automate via API calls

The workflow: Playwright captures screenshots → JSON metadata saved → Claude Code reads screenshots → Verifies against JSON expectations → Reports pass/fail.

**Alternatives Considered**:

- **Alternative 1: Fully automated Claude API integration (analyze-visual-tests.ts script)**
  - **Why rejected**: Premature optimization. Manual analysis first to establish criteria, then automate. V1 focuses on screenshot infrastructure.

- **Alternative 2: Third-party visual diff tools (Percy, Applitools)**
  - **Why rejected**: Requires external service, costs money, doesn't leverage Claude vision. Pixel-perfect diff too brittle for dynamic content (Mermaid diagrams vary).

- **Alternative 3: Hash-based screenshot comparison**
  - **Why rejected**: Brittle - any pixel change = failure. Doesn't distinguish meaningful UI breakage from harmless variation (font rendering, anti-aliasing).

**Implementation Notes**:

**Checkpoint Workflow** (manual for v1):

```bash
# 1. Run visual tests (captures screenshots + metadata)
npm run test:visual

# 2. Claude Code reads screenshots
# User (or checkpoint script) says:
"Analyze screenshots in test-results/visual/ against expectations in .json files"

# 3. Claude Code workflow:
for screenshot in test-results/visual/*.png:
  - Read screenshot using Read tool
  - Read corresponding .json expectation file
  - Verify each "should" criterion (is it visible?)
  - Verify each "shouldNot" criterion (is it absent?)
  - Report PASS if all criteria met, FAIL with specific issues if not

# 4. Developer reviews report, fixes issues or updates expectations
```

**Expectation Prompt Format**:

```json
{
  "expectation": {
    "should": [
      "Skill name 'puml' displayed prominently at top",
      "Diagram rendered as SVG graphic (not blank)",
      "Zoom controls visible (+, -, reset buttons)"
    ],
    "shouldNot": [
      "Blank white screen",
      "Error messages or stack traces",
      "Raw Mermaid syntax visible as text"
    ],
    "description": "Diagram tab showing interactive Mermaid skill architecture"
  }
}
```

**Claude Analysis Pattern**:

```
Given screenshot: test-results/visual/puml-diagram-1699900000.png
Expected state: [description]

Verification:
✓ Skill name 'puml' visible at top-left
✓ SVG Mermaid diagram rendered (nodes and edges visible)
✓ Zoom controls present in bottom-right corner
✓ No blank screen detected
✓ No error messages visible
✓ No raw Mermaid code visible

Result: PASS - All visual expectations met
```

**Future Enhancement** (Phase 3, post-v1):
Create `tests/e2e/analyze-visual-tests.ts` that programmatically calls Claude API with screenshot + expectation, parses response for pass/fail.

---

## RT-004: Screenshot Archive Strategy

**Decision**: Timestamp-based directory archiving with 30-day retention policy

**Rationale**:
Screenshot accumulation must be managed to prevent disk bloat while preserving debugging history. Timestamp-based directories provide:

1. **No data loss** - Old screenshots moved to archive, never overwritten
2. **Easy navigation** - Each test run has its own timestamped directory
3. **Manageable growth** - 6 screenshots × 500KB × 30 days = ~90MB/month (acceptable)
4. **Git-friendly** - All screenshots gitignored, no repo bloat

**Alternatives Considered**:

- **Alternative 1: Keep only last N runs (e.g., last 10)**
  - **Why rejected**: Loses historical data for debugging regressions over time. Disk space not constrained enough to justify.

- **Alternative 2: Overwrite previous screenshots (no archive)**
  - **Why rejected**: Data loss risk. If visual test fails, previous good screenshots are gone, can't compare before/after.

- **Alternative 3: Commit screenshots to git**
  - **Why rejected**: Bloats git repository (binary files don't compress). Screenshots are test artifacts, not source code.

**Implementation Notes**:

**Directory Structure**:

```text
test-results/
├── visual/                          # Current test run screenshots
│   ├── puml-overview-1699900000.png
│   ├── puml-overview-1699900000.json
│   ├── puml-content-1699900000.png
│   ├── puml-content-1699900000.json
│   └── ...
└── visual-archive/                  # Historical screenshots
    ├── 2025-11-13_10-30-00/         # Timestamp directory
    │   ├── puml-overview-*.png
    │   └── ...
    ├── 2025-11-13_14-15-30/
    └── 2025-11-12_09-45-00/
```

**Archive Logic** (in tests/e2e/helpers/visual-verification.ts):

```typescript
export async function archiveScreenshots(): Promise<string> {
  const visualDir = path.join('test-results', 'visual');
  const archiveBaseDir = path.join('test-results', 'visual-archive');

  // Create archive directory if it doesn't exist
  await fs.mkdir(archiveBaseDir, { recursive: true });

  // Check if visual directory has files
  const files = await fs.readdir(visualDir);
  if (files.length === 0) {
    return ''; // Nothing to archive
  }

  // Create timestamped archive directory
  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, '-') // 2025-11-13T10:30:00 -> 2025-11-13T10-30-00
    .replace(/\..+/, ''); // Remove milliseconds
  const archiveDir = path.join(archiveBaseDir, timestamp);
  await fs.mkdir(archiveDir, { recursive: true });

  // Move all files from visual/ to archive/[timestamp]/
  for (const file of files) {
    const srcPath = path.join(visualDir, file);
    const destPath = path.join(archiveDir, file);
    await fs.rename(srcPath, destPath);
  }

  return archiveDir;
}
```

**Cleanup Policy** (documented in quickstart.md):

```bash
# Manual cleanup (run periodically)
find test-results/visual-archive -type d -mtime +30 -exec rm -rf {} +

# Or add to package.json scripts
"clean:screenshots": "find test-results/visual-archive -type d -mtime +30 -delete"
```

**.gitignore Entry**:

```gitignore
# Visual regression test artifacts
test-results/visual/
test-results/visual-archive/
```

**Disk Space Estimates**:

- Per screenshot: ~300KB (PNG, text/UI heavy)
- Per test run: 6 tabs × 300KB = ~1.8MB
- Per day (3 runs): 3 × 1.8MB = ~5.4MB
- Per month (30 days): 30 × 5.4MB = ~162MB
- With 30-day retention: ~162MB steady state

---

## Summary

All research tasks (RT-001 through RT-004) completed. Key findings:

1. **Diagram Fix**: Add `panning={{ disabled: false, velocityDisabled: false }}` to TransformWrapper
2. **Screenshot Capture**: Use fullPage + networkidle + PNG format
3. **Visual Analysis**: Manual Claude Code analysis for v1, automation later
4. **Archive Strategy**: Timestamp directories with 30-day retention

**Next Steps**:

- Create data-model.md with entity definitions
- Create contracts/visual-testing.ts with TypeScript interfaces
- Create quickstart.md with setup/usage guide
- Update agent context with new technology
- Generate tasks.md via /speckit.tasks

**Research Status**: ✅ Complete - Ready for Phase 1 (Design & Data Modeling)
