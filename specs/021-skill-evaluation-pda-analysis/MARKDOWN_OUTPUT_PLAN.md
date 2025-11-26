# Plan: Markdown-Based Analysis Output

**Date**: 2025-11-26
**Feature**: 021 - Skill Evaluation & PDA Analysis
**Status**: Planning

---

## Problem Statement

Current implementation issues:

1. "Detailed Analysis" tab not clearly clickable/accessible
2. "Analyze Skill" button not visible
3. No clear LED status indicator for analysis tasks
4. Unclear UX when switching between tabs during analysis
5. Results not easily exportable for skill developers to use with Claude Code

## Proposed Solution

### Core Concept

Each analyzer generates a **standalone markdown file** that:

1. Contains human-readable analysis results
2. Ends with a **JSON code block** containing structured data
3. Can be displayed individually as analysis completes
4. Can be concatenated into a **composite report**

### Benefits

- **Progressive Display**: Show markdown as each analyzer completes (streaming feel)
- **Copy/Paste Ready**: Skill developers copy the composite markdown into Claude Code
- **Self-Documenting**: Markdown includes fix suggestions inline
- **Structured Data**: JSON block at end enables programmatic parsing if needed

---

## Architecture

### 1. Backend Markdown Generation (Rust)

Each analyzer returns a `AnalyzerReport` struct:

```rust
pub struct AnalyzerReport {
    pub analyzer_name: String,      // e.g., "Spec Compliance"
    pub markdown: String,           // Full markdown content
    pub json_data: serde_json::Value, // Structured data
    pub status: AnalyzerStatus,     // Success, Warning, Error
    pub duration_ms: u64,
}
```

Markdown format for each analyzer:

````markdown
## [Analyzer Name] Analysis

**Status**: [Pass/Warning/Fail]
**Score**: [0-100]

### Findings

- Finding 1...
- Finding 2...

### Suggestions

1. **Issue**: [description]
   **Fix**: [how to fix]
   **Location**: [file:line if applicable]

---

<!-- JSON Data -->

```json
{
  "analyzer": "spec_compliance",
  "score": 85,
  "violations": [...],
  "warnings": [...]
}
```
````

````

### 2. Analyzers to Generate Markdown

| Analyzer | Output File | Description |
|----------|-------------|-------------|
| Spec Validator | `spec_compliance.md` | Frontmatter validation, required sections |
| PDA Scorer | `pda_analysis.md` | Token estimates, tier breakdown, recommendations |
| Permissions | `permissions.md` | Security review, unused/risky permissions |
| Triggers | `triggers.md` | Keyword suggestions with relevance scores |
| Link Validator | `links.md` | Broken link detection |

### 3. Composite Report

Backend generates `composite_report.md` by concatenating all individual reports:

```markdown
# Skill Analysis Report: [Skill Name]

**Generated**: [timestamp]
**Skill Path**: [path]

---

[spec_compliance.md content]

---

[pda_analysis.md content]

---

[permissions.md content]

---

[triggers.md content]

---

[links.md content]

---

## Summary

- **Overall Score**: [weighted average]
- **Critical Issues**: [count]
- **Warnings**: [count]
- **Suggestions**: [count]

## Quick Fix Commands

Copy this entire report and paste it into Claude Code with the prompt:
"Please review this skill analysis and help me fix the issues identified."
````

### 4. Frontend Display

#### New Tab Structure

```
[Overview] [Content] [Diagram] [Scripts] [Evaluation]
                                              |
                                    +---------+---------+
                                    |                   |
                              [Analysis]          [Reports]
                                    |                   |
                            (run analysis)    (view markdown)
```

#### Analysis Tab UI

```
+--------------------------------------------------+
| [LED] Analysis Status: [Idle/Running/Complete]   |
+--------------------------------------------------+
| [Analyze Skill] button (purple gradient, visible)|
+--------------------------------------------------+
| Progress:                                        |
|   [x] Spec Compliance    (1.2s)                 |
|   [x] PDA Analysis       (2.5s)                 |
|   [~] Permissions        (running...)           |
|   [ ] Triggers                                   |
|   [ ] Links                                      |
+--------------------------------------------------+
```

#### Reports Tab UI

```
+--------------------------------------------------+
| Report View:  [Composite v]  [Copy Report]       |
+--------------------------------------------------+
| +----------------------------------------------+ |
| | # Skill Analysis Report: my-skill            | |
| |                                              | |
| | ## Spec Compliance Analysis                  | |
| | **Status**: Warning                          | |
| | **Score**: 85                                | |
| |                                              | |
| | ### Findings                                 | |
| | - Missing description field                  | |
| | ...                                          | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

Dropdown options:

- Composite (all reports combined)
- Spec Compliance
- PDA Analysis
- Permissions
- Triggers
- Links

### 5. LED Status Indicator

Located in header/toolbar area:

| State    | Color  | Animation | Label                |
| -------- | ------ | --------- | -------------------- |
| Idle     | Gray   | None      | "Ready"              |
| Running  | Purple | Pulse     | "Analyzing: [skill]" |
| Complete | Green  | None      | "Complete"           |
| Error    | Red    | None      | "Error"              |

---

## Implementation Phases

### Phase A: Backend Markdown Generation (2 days)

1. Create `MarkdownReportGenerator` trait in Rust
2. Implement for each analyzer:
   - `spec_validator.rs` → `generate_markdown_report()`
   - `pda_scorer.rs` → `generate_markdown_report()`
   - `permissions_analyzer.rs` → `generate_markdown_report()`
   - `trigger_analyzer.rs` → `generate_markdown_report()`
   - `link_validator.rs` → `generate_markdown_report()`
3. Create `CompositeReportGenerator` to combine all reports
4. Update Tauri commands to return markdown strings

### Phase B: Frontend State & Store (1 day)

1. Update `analysisStore.ts`:
   - Add `reports: Map<string, string>` for individual markdown reports
   - Add `compositeReport: string`
   - Add `reportStatus: Map<string, 'pending' | 'running' | 'complete' | 'error'>`
2. Create polling mechanism to fetch reports as they complete

### Phase C: UI Components (2 days)

1. Create `AnalysisLED.tsx` - Status indicator component
2. Create `ReportsTab.tsx` - Markdown display with dropdown
3. Update `EvaluationTab.tsx`:
   - Fix button visibility (purple gradient)
   - Add progress checklist
   - Wire up LED indicator
4. Add copy-to-clipboard for composite report

### Phase D: Integration & Polish (1 day)

1. E2E tests for analysis flow
2. Accessibility review (ARIA labels, keyboard nav)
3. Error handling and edge cases
4. Documentation update

---

## API Contract

### Tauri Commands

```typescript
// Start analysis - returns analysis ID
invoke('start_skill_analysis', { skillPath: string }): Promise<string>

// Get individual report (returns markdown or null if not ready)
invoke('get_analyzer_report', {
  analysisId: string,
  analyzer: 'spec' | 'pda' | 'permissions' | 'triggers' | 'links'
}): Promise<string | null>

// Get composite report (returns markdown or null if not all complete)
invoke('get_composite_report', { analysisId: string }): Promise<string | null>

// Get analysis status
invoke('get_analysis_status', { analysisId: string }): Promise<{
  status: 'running' | 'complete' | 'error',
  analyzers: {
    spec: 'pending' | 'running' | 'complete' | 'error',
    pda: 'pending' | 'running' | 'complete' | 'error',
    permissions: 'pending' | 'running' | 'complete' | 'error',
    triggers: 'pending' | 'running' | 'complete' | 'error',
    links: 'pending' | 'running' | 'complete' | 'error',
  },
  error?: string
}>
```

---

## Success Criteria

1. [ ] Each analyzer generates standalone markdown with JSON footer
2. [ ] Reports display progressively as analyzers complete
3. [ ] Composite report concatenates all individual reports
4. [ ] "Copy Report" button copies full composite markdown
5. [ ] LED indicator shows analysis status clearly
6. [ ] "Analyze Skill" button is visible with purple gradient
7. [ ] Skill developers can paste report into Claude Code for fixes

---

## Files to Modify

### Backend (Rust)

- `src-tauri/src/analyzers/mod.rs` - Add MarkdownReportGenerator trait
- `src-tauri/src/analyzers/spec_validator.rs`
- `src-tauri/src/analyzers/pda_scorer.rs`
- `src-tauri/src/analyzers/permissions_analyzer.rs`
- `src-tauri/src/analyzers/trigger_analyzer.rs`
- `src-tauri/src/analyzers/link_validator.rs`
- `src-tauri/src/commands/skill_analysis.rs` - New commands

### Frontend (TypeScript/React)

- `src/stores/analysisStore.ts`
- `src/components/analysis/EvaluationTab.tsx`
- `src/components/analysis/ReportsTab.tsx` (new)
- `src/components/analysis/AnalysisLED.tsx` (new)
- `src/components/analysis/AnalysisProgress.tsx`

---

## Questions to Resolve

1. Should reports be cached to disk or only in memory?
2. Should we support re-running individual analyzers?
3. What's the timeout for each analyzer before marking as error?
4. Should the composite report include a table of contents?
