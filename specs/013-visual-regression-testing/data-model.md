# Data Model: Visual Regression Testing

**Feature**: 013-visual-regression-testing
**Date**: 2025-11-13
**Status**: Complete

---

## Overview

This document defines the data structures for visual regression testing infrastructure. The model supports screenshot capture, metadata storage, and visual verification workflows.

---

## Entity 1: VisualExpectation

**Purpose**: Defines expected visual state for a screenshot

**TypeScript Interface**:

```typescript
export interface VisualExpectation {
  should: string[]; // What MUST be visible in the screenshot
  shouldNot: string[]; // What MUST NOT be visible in the screenshot
  description: string; // Human-readable summary of expected visual state
}
```

**Properties**:

| Property      | Type       | Required | Description                                                                                    |
| ------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------- |
| `should`      | `string[]` | Yes      | Array of visual criteria that MUST be present (e.g., "Skill name visible", "Diagram rendered") |
| `shouldNot`   | `string[]` | Yes      | Array of visual criteria that MUST NOT be present (e.g., "Blank screen", "Error messages")     |
| `description` | `string`   | Yes      | One-sentence summary of what the screenshot should show                                        |

**Validation Rules**:

- `should` array must have at least 1 criterion
- `shouldNot` array must have at least 1 criterion
- `description` must be non-empty string (max 200 characters recommended)
- Criteria should be specific and observable (avoid vague terms like "looks good")

**Example**:

```typescript
const diagramExpectation: VisualExpectation = {
  should: [
    "Skill name 'puml' displayed prominently at top",
    'Mermaid diagram rendered as SVG graphic with visible nodes and edges',
    'Zoom controls visible in bottom-right (+ - reset buttons)',
    'Export controls visible (PNG, SVG, Mermaid source buttons)',
    'Layout selector dropdown visible',
  ],
  shouldNot: [
    'Blank white screen',
    'Error messages or stack traces',
    'Raw Mermaid syntax visible as plain text',
    'Broken SVG rendering (missing diagram)',
    'Loading spinner (should be fully rendered)',
  ],
  description: 'Diagram tab showing interactive Mermaid skill architecture with controls',
};
```

---

## Entity 2: VisualTestResult

**Purpose**: Captured screenshot with associated metadata and expectations

**TypeScript Interface**:

```typescript
export interface VisualTestResult {
  screenshot: string; // Absolute file path to PNG screenshot
  expectation: VisualExpectation; // Visual expectations for this screenshot
  timestamp: string; // ISO 8601 timestamp of capture
  testName: string; // Unique identifier (e.g., "puml-diagram")
}
```

**Properties**:

| Property      | Type                | Required | Description                                                                                    |
| ------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `screenshot`  | `string`            | Yes      | Absolute path to PNG file (e.g., `/Users/.../test-results/visual/puml-diagram-1699900000.png`) |
| `expectation` | `VisualExpectation` | Yes      | Embedded visual expectations object                                                            |
| `timestamp`   | `string`            | Yes      | ISO 8601 format (e.g., `"2025-11-13T10:30:00.000Z"`)                                           |
| `testName`    | `string`            | Yes      | Unique test identifier, kebab-case (e.g., `"puml-diagram"`, `"puml-overview"`)                 |

**Storage Format**: JSON file with same basename as screenshot

**File Naming Convention**:

- Screenshot: `{testName}-{unixTimestamp}.png`
- Metadata: `{testName}-{unixTimestamp}.json`
- Example: `puml-diagram-1699900000.png` + `puml-diagram-1699900000.json`

**Example**:

```typescript
const testResult: VisualTestResult = {
  screenshot:
    '/Users/richardhightower/src/skill-debugger/test-results/visual/puml-diagram-1699900000.png',
  expectation: {
    should: ['Skill name visible', 'Diagram rendered'],
    shouldNot: ['Blank screen', 'Error messages'],
    description: 'Diagram tab showing skill architecture',
  },
  timestamp: '2025-11-13T10:30:00.000Z',
  testName: 'puml-diagram',
};
```

**JSON File Content** (`puml-diagram-1699900000.json`):

```json
{
  "screenshot": "/Users/richardhightower/src/skill-debugger/test-results/visual/puml-diagram-1699900000.png",
  "expectation": {
    "should": [
      "Skill name 'puml' displayed prominently at top",
      "Mermaid diagram rendered as SVG graphic"
    ],
    "shouldNot": ["Blank white screen", "Error messages"],
    "description": "Diagram tab showing interactive Mermaid skill architecture"
  },
  "timestamp": "2025-11-13T10:30:00.000Z",
  "testName": "puml-diagram"
}
```

---

## Entity 3: CaptureOptions

**Purpose**: Configuration options for screenshot capture

**TypeScript Interface**:

```typescript
export interface CaptureOptions {
  fullPage?: boolean; // Capture entire scrollable page (default: true)
  timeout?: number; // Max wait time in ms (default: 5000)
  waitForStable?: boolean; // Wait for network idle (default: true)
}
```

**Properties**:

| Property        | Type      | Required | Default | Description                                                |
| --------------- | --------- | -------- | ------- | ---------------------------------------------------------- |
| `fullPage`      | `boolean` | No       | `true`  | If true, captures entire page including scrollable content |
| `timeout`       | `number`  | No       | `5000`  | Maximum wait time in milliseconds before screenshot        |
| `waitForStable` | `boolean` | No       | `true`  | If true, waits for network idle before capture             |

**Usage**:

```typescript
// Use defaults (fullPage, wait for stable)
await captureAndDescribe(page, 'puml-overview', expectation);

// Custom options (quick capture, viewport only)
await captureAndDescribe(page, 'puml-overview', expectation, {
  fullPage: false,
  timeout: 2000,
  waitForStable: false,
});
```

---

## Entity 4: VisualAnalysisReport (Future Enhancement)

**Purpose**: Result of automated Claude vision API analysis

**TypeScript Interface**:

```typescript
export interface VisualAnalysisReport {
  testName: string; // Links to VisualTestResult
  passed: boolean; // Overall pass/fail status
  findings: string[]; // What Claude observed in screenshot
  failures: string[]; // Specific failures (expected but missing or unexpected present)
  confidence: 'high' | 'medium' | 'low'; // Confidence level of analysis
  timestamp: string; // ISO 8601 timestamp of analysis
}
```

**Properties**:

| Property     | Type                          | Required | Description                                                        |
| ------------ | ----------------------------- | -------- | ------------------------------------------------------------------ |
| `testName`   | `string`                      | Yes      | Matches `testName` from VisualTestResult                           |
| `passed`     | `boolean`                     | Yes      | `true` if all criteria met, `false` if any failures                |
| `findings`   | `string[]`                    | Yes      | Array of observations from Claude (what was actually seen)         |
| `failures`   | `string[]`                    | Yes      | Specific failures (e.g., "Expected 'Zoom controls' but not found") |
| `confidence` | `'high' \| 'medium' \| 'low'` | Yes      | How confident Claude is in the analysis                            |
| `timestamp`  | `string`                      | Yes      | ISO 8601 timestamp when analysis completed                         |

**Note**: This entity is for **future automation** (Phase 3). Initial v1 implementation uses manual Claude Code analysis via Read tool, not this structured report.

**Example** (future):

```typescript
const analysisReport: VisualAnalysisReport = {
  testName: 'puml-diagram',
  passed: false,
  findings: [
    "Skill name 'puml' visible at top-left",
    'Diagram area shows blank white space (no SVG)',
    'Zoom controls visible in bottom-right',
  ],
  failures: ["Expected 'Mermaid diagram rendered as SVG' but found blank diagram area"],
  confidence: 'high',
  timestamp: '2025-11-13T10:31:00.000Z',
};
```

---

## Data Flow

### Screenshot Capture Flow

```
1. Playwright Test
   ↓
2. Navigate to tab (e.g., Diagram)
   ↓
3. Define VisualExpectation
   ↓
4. Call captureAndDescribe(page, testName, expectation, options?)
   ↓
5. Wait for page stable (network idle)
   ↓
6. Capture screenshot → save as PNG
   ↓
7. Create VisualTestResult object
   ↓
8. Save JSON metadata file
   ↓
9. Return { screenshot: path, metadata: path }
```

### Visual Verification Flow (v1 - Manual)

```
1. Run npm run test:visual
   ↓ (generates screenshots + JSON)
2. Claude Code reads test-results/visual/*.png
   ↓
3. Claude Code reads corresponding *.json expectations
   ↓
4. Claude verifies each "should" criterion
   ↓
5. Claude verifies each "shouldNot" criterion
   ↓
6. Claude reports PASS or FAIL with specific findings
   ↓
7. Developer fixes issues or updates expectations
```

### Archive Flow

```
1. Before new test run
   ↓
2. Check if test-results/visual/ has files
   ↓ (if yes)
3. Create timestamp directory in visual-archive/
   ↓
4. Move all files from visual/ to visual-archive/[timestamp]/
   ↓
5. visual/ directory now empty
   ↓
6. New test run captures fresh screenshots
```

---

## Storage Locations

### Test Artifacts

```
test-results/
├── visual/                          # Current test run (active)
│   ├── puml-overview-1699900000.png
│   ├── puml-overview-1699900000.json
│   ├── puml-content-1699900000.png
│   ├── puml-content-1699900000.json
│   ├── puml-diagram-1699900000.png
│   ├── puml-diagram-1699900000.json
│   ├── puml-references-1699900000.png
│   ├── puml-references-1699900000.json
│   ├── puml-scripts-1699900000.png
│   ├── puml-scripts-1699900000.json
│   ├── puml-triggers-1699900000.png
│   └── puml-triggers-1699900000.json
└── visual-archive/                  # Historical test runs
    ├── 2025-11-13T10-30-00/
    │   ├── puml-overview-*.png
    │   └── ...
    └── 2025-11-12T14-15-30/
        ├── puml-overview-*.png
        └── ...
```

### Source Code

```
tests/
├── e2e/
│   ├── visual-regression.spec.ts       # Playwright test suite
│   └── helpers/
│       └── visual-verification.ts      # Helper functions (captureAndDescribe, etc.)
└── unit/
    └── utils/
        └── visual-verification.test.ts # Unit tests for helpers
```

---

## Relationships

```
VisualTestResult
  ├── contains → VisualExpectation
  ├── references → Screenshot file (.png)
  └── saved as → Metadata file (.json)

CaptureOptions
  └── configures → captureAndDescribe() function

VisualAnalysisReport (future)
  ├── references → VisualTestResult (by testName)
  └── evaluates → VisualExpectation criteria
```

---

## Validation Summary

| Entity                 | Required Fields                                                         | Validation Rules                                        |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `VisualExpectation`    | `should`, `shouldNot`, `description`                                    | Arrays non-empty, description max 200 chars             |
| `VisualTestResult`     | `screenshot`, `expectation`, `timestamp`, `testName`                    | Paths absolute, timestamp ISO 8601, testName kebab-case |
| `CaptureOptions`       | None (all optional)                                                     | Timeout > 0, fullPage/waitForStable boolean             |
| `VisualAnalysisReport` | `testName`, `passed`, `findings`, `failures`, `confidence`, `timestamp` | testName matches existing result, confidence enum value |

---

**Data Model Status**: ✅ Complete - Ready for contract generation
