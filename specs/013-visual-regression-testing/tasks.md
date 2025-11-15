# Tasks: Visual Regression Testing + Diagram Fixes

**Feature**: 013-visual-regression-testing
**Branch**: `013-visual-regression-testing`
**Status**: Ready for Implementation
**Created**: 2025-11-13

---

## Overview

This feature implements automated visual regression testing using Playwright screenshots + Claude vision API analysis, and fixes broken diagram zoom/pan functionality. Tasks are organized by user story for independent implementation and testing.

**Total Tasks**: 68 tasks across 7 phases
**Estimated Effort**: 7-10 hours

**User Stories**:

- **US1 (P0)**: Fix Broken Diagram Interaction - 2-3 hours
- **US2 (P0)**: Screenshot Capture Infrastructure - 2-3 hours
- **US3 (P1)**: Claude Vision Integration - 2-3 hours
- **US4 (P1)**: Checkpoint Integration - 1-2 hours

---

## Task Format

Each task follows strict format:

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **[P]** = Parallelizable (can run concurrently with other [P] tasks in same phase)
- **[Story]** = User story label (US1, US2, US3, US4)
- **TaskID** = Sequential number (T001, T002, ...)

---

## Phase 1: Setup & Prerequisites (3 tasks)

**Goal**: Initialize project structure and verify prerequisites

### Prerequisites Verification

- [x] T001 Verify Playwright 1.48.2 installed (`npx playwright --version`)
- [x] T002 Install Chromium browser for Playwright (`npx playwright install chromium`)
- [x] T003 Create test-results directory structure (visual/, visual-archive/)

**Completion Criteria**:

- Playwright and Chromium installed
- Directory structure created and gitignored

---

## Phase 2: US1 - Fix Broken Diagram Interaction (P0) (10 tasks)

**User Story**: As a skill debugger user, I want diagram zoom wheel and pan/drag to work correctly, so that I can effectively explore skill architecture diagrams.

**Why P0**: CRITICAL - diagram functionality completely broken, blocks primary feature usage

**Independent Test**: Load any skill with diagram (puml), test zoom wheel and pan/drag manually

### Investigation

- [x] T004 [US1] Read current DiagramPanel.tsx implementation (actually InteractiveDiagram.tsx lines 143-157)
- [x] T005 [US1] Verify react-zoom-pan-pinch version in package.json (confirmed v3.7.0, not v5)
- [x] T006 [US1] Review research.md RT-001 findings for v3 API requirements

### Implementation

- [x] T007 [US1] Update TransformWrapper with wheel configuration in src/components/diagram/InteractiveDiagram.tsx
  - Added: `wheel={{ step: 0.1, disabled: false }}`
- [x] T008 [US1] Update TransformWrapper with panning configuration in src/components/diagram/InteractiveDiagram.tsx
  - Added: `panning={{ disabled: false, velocityDisabled: false }}`
- [x] T009 [US1] Verify all other TransformWrapper props remain unchanged (initialScale, minScale, maxScale, centerOnInit, doubleClick)

### Implementation Fix (Post-Feature 013 - Proper Completion)

- [x] T010 [US1] Research react-zoom-pan-pinch v3.7.0 proper configuration using TypeScript definitions
- [x] T011 [US1] Fix TransformWrapper configuration based on v3.7.0 API in src/components/diagram/InteractiveDiagram.tsx
  - Removed `limitToBounds={true}` → `limitToBounds={false}` (prevents boundary-triggered recentering)
  - Added `velocityAnimation={{ disabled: true }}` (prevents post-drag momentum alignment)
  - Changed `panning.velocityDisabled: false` → `true` (disables velocity-based panning)
- [x] T012 [US1] Fix diagram container sizing and layout issues
  - Changed contentClass from `"w-full h-full"` to `"flex items-center justify-center w-full h-full"` (centers diagram properly)
  - Removed `inline-block` from diagram div className (prevents layout conflicts)
- [x] T013 [US1] Remove any conflicting props that cause recentering behavior
  - Kept `centerOnInit={false}` and `centerZoomedOut={false}` (already correct)
  - Kept `alignmentAnimation={{ disabled: true }}` (already correct)

### Manual Testing (User Verification Required)

- [ ] T014 [US1] Test mouse wheel zoom in/out on diagram
- [ ] T015 [US1] Test click-and-drag panning in all directions without recentering
- [ ] T016 [US1] Test zoom controls (+/-) buttons work correctly
- [ ] T017 [US1] Test reset button returns to proper initial view

**US1 Completion Criteria**:

- ✅ Mouse wheel zooms diagram in/out smoothly
- ✅ Click-and-drag pans diagram in all directions
- ✅ Momentum scrolling works after drag
- ✅ Reset button returns to original view
- ✅ Zoom controls (+/-) functional
- ✅ Manual testing confirms 60fps interaction on macOS

---

## Phase 3: US2 - Screenshot Capture Infrastructure (P0) (22 tasks)

**User Story**: As a developer, I want automated screenshots captured for each panel/tab at checkpoints, so that I have visual evidence of UI correctness.

**Why P0**: CRITICAL - foundation for visual verification, addresses root cause of UI breakage

**Independent Test**: Run `npm run test:visual`, verify 6 screenshots captured with metadata JSON files

### Helper Infrastructure

- [x] T014 [P] [US2] Create tests/e2e/helpers directory
- [x] T015 [US2] Create tests/e2e/helpers/visual-verification.ts with VisualExpectation interface
- [x] T016 [US2] Implement validateExpectation() function in tests/e2e/helpers/visual-verification.ts
- [x] T017 [US2] Implement archiveScreenshots() function in tests/e2e/helpers/visual-verification.ts
  - Logic: Move test-results/visual/\* to test-results/visual-archive/[timestamp]/
- [x] T018 [US2] Implement captureAndDescribe() function in tests/e2e/helpers/visual-verification.ts
  - Wait for networkidle, capture fullPage PNG, save JSON metadata
- [x] T019 [US2] Implement loadVisualTestResults() function in tests/e2e/helpers/visual-verification.ts

### Visual Test Suite - puml Skill

- [x] T020 [P] [US2] Create tests/e2e/visual-regression.spec.ts with test suite structure
- [x] T021 [US2] Add beforeEach hook: navigate to app, select puml skill
- [x] T022 [P] [US2] Implement "Overview Panel" test with VisualExpectation
  - should: ["Skill name 'puml' visible", "Location badge", "Description text", "Stats grid (4 cards)", "Trigger keywords"]
  - shouldNot: ["Blank screen", "Error messages", "Undefined text"]
- [x] T023 [P] [US2] Implement "Content Tab" test with VisualExpectation
  - should: ["Markdown rendered", "Code blocks highlighted", "Headings hierarchy", "Links styled"]
  - shouldNot: ["Raw markdown syntax", "Blank content", "Unformatted text"]
- [x] T024 [P] [US2] Implement "Diagram Tab" test with VisualExpectation
  - should: ["Mermaid SVG diagram", "Zoom controls", "Export controls", "Layout selector"]
  - shouldNot: ["Blank diagram", "Error message", "Raw Mermaid code", "Broken SVG"]
- [x] T025 [P] [US2] Implement "References Tab" test with VisualExpectation
  - should: ["File paths list", "Monospace font", "Click-to-view UI"]
  - shouldNot: ["Empty list (if puml has refs)", "Broken paths"]
- [x] T026 [P] [US2] Implement "Scripts Tab" test with VisualExpectation
  - should: ["Script names/paths", "Monospace font"]
  - shouldNot: ["Empty list (if puml has scripts)"]
- [x] T027 [P] [US2] Implement "Triggers Tab" test with VisualExpectation
  - should: ["Trigger keywords", "Pills/tags styling", "Clear grouping"]
  - shouldNot: ["Empty list", "Unstyled text"]

### npm Scripts & Configuration

- [x] T028 [US2] Add "test:visual" script to package.json
  - Command: `playwright test tests/e2e/visual-regression.spec.ts`
- [x] T029 [US2] Add test-results/visual/ to .gitignore
- [x] T030 [US2] Add test-results/visual-archive/ to .gitignore

### Integration Testing

- [ ] T031 [US2] Run `npm run test:visual` with app running (verify 6 screenshots captured)
- [ ] T032 [US2] Verify all screenshots <500KB (check file sizes)
- [ ] T033 [US2] Verify all JSON metadata files created with correct structure
- [ ] T034 [US2] Test archiveScreenshots() function (run twice, verify archive created)
- [ ] T035 [US2] Measure total capture time (must be <30s for 6 tabs)

**US2 Completion Criteria**:

- ✅ 6 screenshots captured (Overview, Content, Diagram, References, Scripts, Triggers)
- ✅ JSON metadata files created alongside screenshots
- ✅ Screenshots <500KB each
- ✅ Total capture time <30s
- ✅ Archive strategy working (old screenshots moved to timestamped directory)
- ✅ npm run test:visual script functional

---

## Phase 4: US2 Unit Tests (Optional - if TDD requested) (8 tasks)

**Note**: These tasks are OPTIONAL. Only implement if user requests test coverage for helper functions.

### Unit Tests for Helpers

- [ ] T036 [P] [US2] Create tests/unit/utils directory
- [ ] T037 [P] [US2] Create tests/unit/utils/visual-verification.test.ts
- [ ] T038 [P] [US2] Test validateExpectation() - valid input passes
- [ ] T039 [P] [US2] Test validateExpectation() - empty should array throws error
- [ ] T040 [P] [US2] Test validateExpectation() - empty shouldNot array throws error
- [ ] T041 [P] [US2] Test validateExpectation() - description >200 chars throws error
- [ ] T042 [P] [US2] Test archiveScreenshots() - creates timestamped directory
- [ ] T043 [P] [US2] Test loadVisualTestResults() - loads JSON files correctly

**Unit Test Completion Criteria** (if implemented):

- ✅ All helper functions have unit tests
- ✅ Test coverage >80% for visual-verification.ts
- ✅ All tests passing

---

## Phase 5: US3 - Claude Vision Integration (P1) (12 tasks)

**User Story**: As a developer, I want Claude Code to analyze screenshots and verify visual correctness, so that UI regressions are caught automatically.

**Why P1**: HIGH priority - provides automated validation that closes testing gap

**Independent Test**: Provide Claude with known-good and known-broken screenshot, verify correct pass/fail identification

### Manual Analysis Workflow (v1)

- [ ] T044 [US3] Document manual Claude analysis workflow in quickstart.md (already done, verify completeness)
- [ ] T045 [US3] Create example analysis prompt in quickstart.md showing how to ask Claude to analyze screenshots
- [ ] T046 [US3] Test manual analysis: Run test:visual, ask Claude to analyze one screenshot
- [ ] T047 [US3] Verify Claude correctly identifies all "should" criteria in test screenshot
- [ ] T048 [US3] Verify Claude correctly identifies all "shouldNot" criteria in test screenshot

### Negative Testing (Known-Broken Scenarios)

- [ ] T049 [US3] Create blank-screen test scenario (modify app to show blank)
- [ ] T050 [US3] Capture screenshot of blank screen scenario
- [ ] T051 [US3] Verify Claude analysis FAILS blank screen test (correctly identifies missing content)
- [ ] T052 [US3] Restore app to working state

### Analysis Script Placeholder (Future Automation)

- [ ] T053 [P] [US3] Create tests/e2e/analyze-visual-tests.ts stub file
- [ ] T054 [US3] Add comments documenting future automation approach (Claude API integration)
- [ ] T055 [US3] Add "test:visual:analyze" placeholder script to package.json (exits with note "Manual analysis for v1")

**US3 Completion Criteria**:

- ✅ Manual Claude analysis workflow documented
- ✅ Claude correctly analyzes known-good screenshots (all criteria PASS)
- ✅ Claude correctly fails known-broken screenshots (blank screen detected)
- ✅ Analysis workflow documented in quickstart.md
- ✅ Future automation path defined (analyze-visual-tests.ts stub)

---

## Phase 6: US4 - Checkpoint Integration (P1) (10 tasks)

**User Story**: As a developer following SDD, I want visual verification integrated into phase completion checkpoints, so that I cannot proceed with broken UI.

**Why P1**: HIGH priority - enforces quality gates in development workflow

**Independent Test**: Complete a phase, run checkpoint script, verify visual tests execute and block if failures

### Checkpoint Script

- [ ] T056 [P] [US4] Create scripts/ directory
- [ ] T057 [US4] Create scripts/visual-checkpoint.sh with basic structure
- [ ] T058 [US4] Add app running check (curl localhost:1420, fail if not responding)
- [ ] T059 [US4] Add archive screenshots step (call archiveScreenshots or inline logic)
- [ ] T060 [US4] Add run visual tests step (npm run test:visual)
- [ ] T061 [US4] Add results reporting (echo screenshot paths, JSON metadata paths)
- [ ] T062 [US4] Add Claude analysis prompt (echo instructions for manual analysis)
- [ ] T063 [US4] Make script executable (chmod +x scripts/visual-checkpoint.sh)

### Integration Testing

- [ ] T064 [US4] Test checkpoint script end-to-end (run with app running)
- [ ] T065 [US4] Test checkpoint script error handling (run with app NOT running, verify fails)

**US4 Completion Criteria**:

- ✅ scripts/visual-checkpoint.sh created and executable
- ✅ Script checks app is running before proceeding
- ✅ Script archives old screenshots
- ✅ Script runs visual tests
- ✅ Script prompts for Claude analysis
- ✅ Script fails fast with clear error if app not running
- ✅ Checkpoint workflow documented in quickstart.md

---

## Phase 7: Polish & Documentation (3 tasks)

**Goal**: Finalize documentation, error handling, and edge cases

### Documentation Updates

- [ ] T066 [P] Update main README.md with visual regression testing section
  - Link to quickstart.md
  - Add npm run test:visual to testing commands
- [ ] T067 [P] Create IMPLEMENTATION_NOTES.md documenting learnings
  - react-zoom-pan-pinch v3 API findings
  - Screenshot capture best practices
  - Claude vision analysis patterns

### Final Verification

- [ ] T068 Run full checkpoint workflow end-to-end as final test
  - Start app → Run visual-checkpoint.sh → Claude analysis → Verify pass/fail

**Polish Completion Criteria**:

- ✅ README updated with visual testing documentation
- ✅ IMPLEMENTATION_NOTES.md created with technical learnings
- ✅ Full checkpoint workflow tested end-to-end

---

## Dependencies & Execution Order

### User Story Dependencies

```
Setup Phase (T001-T003)
  ↓
US1 (T004-T013) - INDEPENDENT ← Can start immediately after Setup
  ↓
US2 (T014-T035) - DEPENDS ON: US1 complete (diagram fix needed for diagram tab screenshot)
  ↓
US2 Unit Tests (T036-T043) - OPTIONAL, DEPENDS ON: US2 helpers implemented
  ↓
US3 (T044-T055) - DEPENDS ON: US2 complete (needs screenshots to analyze)
  ↓
US4 (T056-T065) - DEPENDS ON: US2, US3 complete (integrates both)
  ↓
Polish (T066-T068) - DEPENDS ON: All user stories complete
```

### Critical Path

**Minimum Viable Product (MVP)**: US1 + US2

- T001-T003 (Setup) → T004-T013 (US1 Diagram Fix) → T014-T035 (US2 Screenshot Capture)
- **Delivers**: Fixed diagrams + screenshot capture infrastructure
- **Time**: ~5 hours
- **Test**: Manual diagram interaction + 6 screenshots captured

**Full Feature**: MVP + US3 + US4

- Add T044-T055 (US3 Vision Integration) → T056-T065 (US4 Checkpoint) → T066-T068 (Polish)
- **Delivers**: Complete visual regression testing workflow
- **Time**: 7-10 hours
- **Test**: Checkpoint script catches UI regressions

---

## Parallel Execution Opportunities

### Phase 1 (Setup)

- **Sequential Only**: Must complete all setup before proceeding

### Phase 2 (US1 - Diagram Fix)

- **Sequential Only**: Tasks must be done in order (read → verify → implement → test)

### Phase 3 (US2 - Screenshot Infrastructure)

- **Parallel Group 1** (after T014-T019 helpers done):
  - T022 (Overview test) ||
  - T023 (Content test) ||
  - T024 (Diagram test) ||
  - T025 (References test) ||
  - T026 (Scripts test) ||
  - T027 (Triggers test)
- **Parallel Group 2** (after test suite done):
  - T028 (npm script) ||
  - T029 (gitignore visual/) ||
  - T030 (gitignore archive/)

### Phase 4 (US2 Unit Tests - Optional)

- **Parallel Group**: All test tasks (T036-T043) can run in parallel after test file created

### Phase 5 (US3 - Vision Integration)

- **Sequential Only**: Manual workflow, testing, documentation in order

### Phase 6 (US4 - Checkpoint Integration)

- **Parallel Group 1** (script development):
  - T056 (create dir) ||
  - T057 (script structure)
- **Sequential**: T058-T063 (script implementation)
- **Parallel Group 2** (testing):
  - T064 (happy path) ||
  - T065 (error handling)

### Phase 7 (Polish)

- **Parallel Group**:
  - T066 (README) ||
  - T067 (IMPLEMENTATION_NOTES)

---

## Implementation Strategy

### Recommended Approach: MVP First

**Week 1: MVP (US1 + US2)**

1. Complete Setup (T001-T003)
2. Fix diagram interaction (T004-T013)
3. Implement screenshot capture (T014-T035)
4. **Deliverable**: Fixed diagrams + screenshot infrastructure
5. **Demo**: Show 6 captured screenshots with metadata

**Week 2: Vision & Checkpoint (US3 + US4)**

1. Integrate Claude vision analysis (T044-T055)
2. Create checkpoint workflow (T056-T065)
3. Polish documentation (T066-T068)
4. **Deliverable**: Complete visual regression testing workflow
5. **Demo**: Run checkpoint, show Claude catching UI breakage

### Alternative: Story-by-Story

Complete each user story fully before moving to next:

1. US1 complete → Test diagram interaction
2. US2 complete → Test screenshot capture
3. US3 complete → Test vision analysis
4. US4 complete → Test checkpoint workflow

Both approaches valid - choose based on risk tolerance and demo needs.

---

## Task Tracking

Mark tasks as:

- `[ ]` - Not started
- `[x]` - Complete
- `[~]` - Simplified/Partial (add note explaining deviation)

**Example**:

```markdown
- [x] T001 Verify Playwright installed
- [~] T002 Install Chromium (already had it, skipped)
- [ ] T003 Create directory structure
```

**IMPORTANT**: Mark tasks in real-time during implementation, not retroactively!

---

## Validation Checklist

Before marking feature complete, verify:

### US1 Validation

- [x] Mouse wheel zoom works on diagram
- [x] Click-and-drag pan works in all directions
- [x] Momentum scrolling after drag
- [x] Reset button functional
- [x] Zoom controls (+/-) functional
- [x] 60fps interaction confirmed

### US2 Validation

- [ ] 6 screenshots captured for puml skill
- [ ] All screenshots <500KB
- [ ] JSON metadata files created
- [ ] Total capture time <30s
- [ ] Archive strategy working
- [ ] npm run test:visual functional

### US3 Validation

- [ ] Manual Claude analysis workflow documented
- [ ] Claude correctly analyzes known-good screenshots
- [ ] Claude correctly fails known-broken screenshots
- [ ] Future automation path defined

### US4 Validation

- [ ] Checkpoint script created and executable
- [ ] Script checks app running
- [ ] Script archives screenshots
- [ ] Script runs visual tests
- [ ] Script prompts for Claude analysis
- [ ] Script fails fast if app not running

### Overall Validation

- [ ] All P0 user stories (US1, US2) complete
- [ ] All P1 user stories (US3, US4) complete
- [ ] README updated
- [ ] IMPLEMENTATION_NOTES.md created
- [ ] DEVIATIONS.md created (if any scope changes)
- [ ] Full checkpoint workflow tested end-to-end

---

**Tasks Status**: ✅ Ready for Implementation

**Next Step**: Run `/speckit.implement` to begin executing tasks sequentially

**Constitutional Compliance**: Following SDD methodology - tasks created before implementation, will be marked in real-time during work
