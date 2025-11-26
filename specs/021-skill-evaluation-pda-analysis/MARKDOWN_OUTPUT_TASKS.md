# Feature 021: Markdown Output - Task Breakdown

**Generated**: 2025-11-26
**Plan**: [MARKDOWN_OUTPUT_PLAN.md](./MARKDOWN_OUTPUT_PLAN.md)
**Spec Updates**: FR-009, FR-010, FR-011

---

## Phase A: Backend Markdown Generation (2 days)

### Rust Trait & Infrastructure

- [ ] T-MD-001 [P1] Create `MarkdownReportGenerator` trait in `src-tauri/src/analyzers/mod.rs`
- [ ] T-MD-002 [P1] Define `AnalyzerReport` struct (analyzer_name, markdown, json_data, status, duration_ms)
- [ ] T-MD-003 [P1] Add `generate_markdown_report()` method to trait

### Analyzer Implementations

- [ ] T-MD-004 [P1] Implement `generate_markdown_report()` for `spec_validator.rs`
- [ ] T-MD-005 [P1] Implement `generate_markdown_report()` for `pda_scorer.rs`
- [ ] T-MD-006 [P1] Implement `generate_markdown_report()` for `permissions_analyzer.rs`
- [ ] T-MD-007 [P1] Implement `generate_markdown_report()` for `trigger_analyzer.rs`
- [ ] T-MD-008 [P2] Implement `generate_markdown_report()` for `link_validator.rs`

### Composite Report

- [ ] T-MD-009 [P1] Create `CompositeReportGenerator` in `src-tauri/src/analyzers/composite.rs`
- [ ] T-MD-010 [P1] Implement `generate_composite_report()` - concatenates all analyzer reports
- [ ] T-MD-011 [P1] Add summary section with overall score and issue counts
- [ ] T-MD-012 [P1] Add "Quick Fix" section with Claude Code instructions

### Tauri Commands

- [ ] T-MD-013 [P1] Add `get_analyzer_report(analysis_id, analyzer)` command
- [ ] T-MD-014 [P1] Add `get_composite_report(analysis_id)` command
- [ ] T-MD-015 [P1] Update `get_analysis_status()` to include per-analyzer status
- [ ] T-MD-016 [P1] Register new commands in `main.rs`

### Tests

- [ ] T-MD-017 [P1] Unit test: Each analyzer generates valid markdown with JSON footer
- [ ] T-MD-018 [P1] Unit test: Composite report includes all analyzer sections
- [ ] T-MD-019 [P1] Unit test: JSON block is valid and parseable
- [ ] T-MD-020 [P1] Integration test: Full analysis generates all reports

---

## Phase B: Frontend State & Store (1 day)

### Analysis Store Updates

- [ ] T-MD-021 [P1] Add `analyzerReports: Map<string, string>` to `analysisStore.ts`
- [ ] T-MD-022 [P1] Add `compositeReport: string | null` to store
- [ ] T-MD-023 [P1] Add `analyzerStatus: Map<string, 'pending' | 'running' | 'complete' | 'error'>`
- [ ] T-MD-024 [P1] Add `fetchAnalyzerReport(analysisId, analyzer)` action
- [ ] T-MD-025 [P1] Add `fetchCompositeReport(analysisId)` action

### Polling Logic

- [ ] T-MD-026 [P1] Create `useAnalysisPolling` hook for progressive report fetching
- [ ] T-MD-027 [P1] Poll individual analyzer status every 2 seconds
- [ ] T-MD-028 [P1] Fetch report as soon as analyzer completes
- [ ] T-MD-029 [P1] Stop polling when all analyzers complete or error

### Tests

- [ ] T-MD-030 [P1] Unit test: Store updates correctly on report fetch
- [ ] T-MD-031 [P1] Unit test: Polling stops when analysis complete

---

## Phase C: UI Components (2 days)

### Analysis LED Indicator

- [ ] T-MD-032 [P1] Create `AnalysisLED.tsx` component
- [ ] T-MD-033 [P1] LED states: Idle (gray), Running (purple pulse), Complete (green), Error (red)
- [ ] T-MD-034 [P1] Display current skill name when running
- [ ] T-MD-035 [P1] Add to header/toolbar area

### Reports Tab

- [ ] T-MD-036 [P1] Create `ReportsTab.tsx` component
- [ ] T-MD-037 [P1] Add dropdown selector: Composite, Spec, PDA, Permissions, Triggers, Links
- [ ] T-MD-038 [P1] Render markdown with syntax highlighting for JSON blocks
- [ ] T-MD-039 [P1] Add "Copy Report" button (copies full markdown)
- [ ] T-MD-040 [P1] Show empty state when no reports available

### Analysis Progress

- [ ] T-MD-041 [P1] Update `EvaluationTab.tsx` with analyzer checklist
- [ ] T-MD-042 [P1] Show checkbox, analyzer name, and duration for each
- [ ] T-MD-043 [P1] Real-time updates as analyzers complete
- [ ] T-MD-044 [P1] Fix "Analyze Skill" button - purple gradient, always visible

### Tab Integration

- [ ] T-MD-045 [P1] Add "Reports" sub-tab or section to Evaluation tab
- [ ] T-MD-046 [P1] Wire up tab switching to show reports
- [ ] T-MD-047 [P1] Ensure clear UX when switching between Analysis and Reports views

### Tests

- [ ] T-MD-048 [P1] Component test: AnalysisLED shows correct states
- [ ] T-MD-049 [P1] Component test: ReportsTab renders markdown correctly
- [ ] T-MD-050 [P1] Component test: Copy button copies to clipboard
- [ ] T-MD-051 [P1] Component test: Progress checklist updates in real-time

---

## Phase D: Integration & Polish (1 day)

### E2E Tests

- [ ] T-MD-052 [P1] E2E: User clicks Analyze → sees progress → views reports
- [ ] T-MD-053 [P1] E2E: Copy Report button copies markdown
- [ ] T-MD-054 [P1] E2E: Reports display progressively as analyzers complete

### Accessibility

- [ ] T-MD-055 [P1] Add ARIA labels to LED indicator
- [ ] T-MD-056 [P1] Keyboard navigation for report dropdown
- [ ] T-MD-057 [P1] Screen reader friendly progress updates

### Error Handling

- [ ] T-MD-058 [P1] Handle analyzer timeout gracefully
- [ ] T-MD-059 [P1] Show partial results if some analyzers fail
- [ ] T-MD-060 [P1] Clear error messages with retry option

### Documentation

- [ ] T-MD-061 Update spec with implementation notes
- [ ] T-MD-062 Add usage guide to main README

---

## Task Summary

| Phase             | Tasks  | Priority P1 | Priority P2 |
| ----------------- | ------ | ----------- | ----------- |
| A: Backend        | 20     | 19          | 1           |
| B: Frontend Store | 11     | 11          | 0           |
| C: UI Components  | 20     | 20          | 0           |
| D: Integration    | 11     | 9           | 0           |
| **Total**         | **62** | **59**      | **1**       |

---

## Dependency Graph

```
Phase A (Backend)
    ├── T-MD-001..003 (Trait definition)
    │       ↓
    ├── T-MD-004..008 (Analyzer implementations)
    │       ↓
    ├── T-MD-009..012 (Composite report)
    │       ↓
    └── T-MD-013..016 (Tauri commands)
            ↓
Phase B (Frontend Store)
    ├── T-MD-021..025 (Store updates)
    │       ↓
    └── T-MD-026..029 (Polling logic)
            ↓
Phase C (UI)
    ├── T-MD-032..035 (LED indicator) ─────┐
    ├── T-MD-036..040 (Reports tab)        │
    ├── T-MD-041..044 (Analysis progress)  ├── Can run in parallel
    └── T-MD-045..047 (Tab integration) ───┘
            ↓
Phase D (Integration)
    └── T-MD-052..062 (E2E, A11y, Polish)
```

---

## Success Criteria

- [ ] Each analyzer generates valid markdown with JSON footer
- [ ] Reports display progressively (within 2s of analyzer completion)
- [ ] Composite report is complete and copy-pasteable
- [ ] LED indicator clearly shows analysis state
- [ ] "Analyze Skill" button is visible and functional
- [ ] > 80% test coverage for new code
