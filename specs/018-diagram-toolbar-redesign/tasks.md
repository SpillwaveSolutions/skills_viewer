# Tasks: Diagram Toolbar Redesign

**Feature Branch**: `018-diagram-toolbar-redesign`
**Input**: Design documents from `/specs/018-diagram-toolbar-redesign/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: This feature follows TDD approach (>80% coverage constitutional requirement). Test tasks are included and MUST be completed BEFORE implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- This feature uses: `src/components/diagram/`, `src/components/diagram/__tests__/`, `tests/e2e/`

---

## Phase 1: Setup (Test Infrastructure)

**Purpose**: Initialize testing framework and validate existing functionality before refactoring

- [x] T001 [P] Create unit test file for DiagramToolbar component in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [x] T002 [P] Create E2E test file for toolbar interactions in tests/e2e/diagram-toolbar.spec.ts
- [x] T003 [P] Install and configure axe-core for accessibility testing in package.json
- [x] T004 Verify existing InteractiveDiagram functionality with baseline tests in src/components/diagram/**tests**/InteractiveDiagram.test.tsx

---

## Phase 2: Foundational (Component Extraction)

**Purpose**: Extract toolbar into separate component without changing behavior - BLOCKS all user story work

**⚠️ CRITICAL**: No user story work can begin until toolbar is extracted and baseline tests pass

- [ ] T005 Create TypeScript interface file for toolbar props in src/components/diagram/DiagramToolbar.types.ts (copy from contracts/toolbar-props.ts)
- [ ] T006 Create DiagramToolbar component skeleton in src/components/diagram/DiagramToolbar.tsx with prop interface
- [ ] T007 Extract existing toolbar JSX from InteractiveDiagram.tsx into DiagramToolbar.tsx (lines 167-234)
- [ ] T008 Update InteractiveDiagram.tsx to use DiagramToolbar component with props
- [ ] T009 Run baseline tests to verify zero functional regressions after extraction
- [ ] T010 Commit: "feat: Extract toolbar into DiagramToolbar component (no visual changes)"

**Checkpoint**: Toolbar extracted, all existing tests pass, ready for redesign

---

## Phase 3: User Story 1 - Quick Diagram Layout Switching (Priority: P1) 🎯 MVP

**Goal**: Redesign layout selector dropdown with professional styling and clear visual grouping

**Independent Test**: Click layout selector, choose TD/LR, verify diagram re-renders in selected orientation within 200ms

### Tests for User Story 1 (TDD - Write FIRST, Ensure FAIL)

- [ ] T011 [P] [US1] Write unit test: Layout selector renders with current layout value in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T012 [P] [US1] Write unit test: Layout selector calls onLayoutChange when option selected in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T013 [P] [US1] Write unit test: Layout selector has proper ARIA labels in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T014 [P] [US1] Write E2E test: User can switch layout and diagram re-renders in tests/e2e/diagram-toolbar.spec.ts
- [ ] T015 [US1] Run tests and verify ALL FAIL (component not yet redesigned)

### Implementation for User Story 1

- [ ] T016 [US1] Apply TailwindCSS styling to layout selector in src/components/diagram/DiagramToolbar.tsx (px-3 py-1 border rounded-md pattern from research.md)
- [ ] T017 [US1] Add hover state (hover:bg-gray-50) to layout selector in src/components/diagram/DiagramToolbar.tsx
- [ ] T018 [US1] Add focus-visible ring for keyboard navigation in src/components/diagram/DiagramToolbar.tsx
- [ ] T019 [US1] Add aria-label="Diagram layout direction" to layout selector in src/components/diagram/DiagramToolbar.tsx
- [ ] T020 [US1] Verify tests now PASS and layout persists across tab changes
- [ ] T021 [US1] Run axe DevTools scan on layout selector and verify zero violations
- [ ] T022 [US1] Commit: "feat(US1): Redesign layout selector with professional styling"

**Checkpoint**: Layout selector redesigned, tests pass, accessible, independently testable ✅

---

## Phase 4: User Story 2 - Intuitive Zoom Controls (Priority: P1)

**Goal**: Create integrated zoom button group [− | 100% | +] with no visible separation, disabled states, and tooltips

**Independent Test**: Click zoom in/out, verify percentage updates, click percentage to reset to 100%

### Tests for User Story 2 (TDD - Write FIRST, Ensure FAIL)

- [ ] T023 [P] [US2] Write unit test: Zoom buttons render with correct percentage display in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T024 [P] [US2] Write unit test: Zoom in button calls onZoomIn handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T025 [P] [US2] Write unit test: Zoom out button calls onZoomOut handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T026 [P] [US2] Write unit test: Percentage button calls onResetZoom handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T027 [P] [US2] Write unit test: Zoom in disabled at max zoom (5.0) in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T028 [P] [US2] Write unit test: Zoom out disabled at min zoom (0.1) in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T029 [P] [US2] Write unit test: Tooltips show correct text based on zoom state in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T030 [P] [US2] Write E2E test: User can zoom in/out and reset to 100% in tests/e2e/diagram-toolbar.spec.ts
- [ ] T031 [US2] Run tests and verify ALL FAIL (zoom controls not yet redesigned)

### Implementation for User Story 2

- [ ] T032 [US2] Create integrated button group container with border-collapse pattern in src/components/diagram/DiagramToolbar.tsx (research.md Q1)
- [ ] T033 [US2] Implement zoom out button (−) with hover:z-10 for border stacking in src/components/diagram/DiagramToolbar.tsx
- [ ] T034 [US2] Implement percentage display (clickable) with bg-gray-50 background in src/components/diagram/DiagramToolbar.tsx
- [ ] T035 [US2] Implement zoom in button (+) with hover:z-10 in src/components/diagram/DiagramToolbar.tsx
- [ ] T036 [US2] Add disabled states with opacity-50 and cursor-not-allowed in src/components/diagram/DiagramToolbar.tsx (research.md Q2)
- [ ] T037 [US2] Add ARIA labels and aria-disabled attributes to all zoom buttons in src/components/diagram/DiagramToolbar.tsx
- [ ] T038 [US2] Add title tooltips with contextual messages (research.md Q4) in src/components/diagram/DiagramToolbar.tsx
- [ ] T039 [US2] Verify transparent border technique prevents layout shifts (research.md Q5) in src/components/diagram/DiagramToolbar.tsx
- [ ] T040 [US2] Verify tests now PASS and zoom controls work correctly
- [ ] T041 [US2] Measure component render time with React DevTools Profiler and verify <50ms
- [ ] T042 [US2] Run axe DevTools scan on zoom controls and verify zero violations
- [ ] T043 [US2] Commit: "feat(US2): Implement integrated zoom button group with disabled states"

**Checkpoint**: Zoom controls redesigned, tests pass, accessible, no layout shifts ✅

---

## Phase 5: User Story 3 - One-Click Fit to View (Priority: P2)

**Goal**: Style "Fit to View" button with clear visual hierarchy as secondary action

**Independent Test**: Load large/small diagram, click "Fit to View", verify diagram scales to fit viewport

### Tests for User Story 3 (TDD - Write FIRST, Ensure FAIL)

- [ ] T044 [P] [US3] Write unit test: Fit to View button renders with correct styling in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T045 [P] [US3] Write unit test: Fit to View button calls onFitToView handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T046 [P] [US3] Write unit test: Fit to View button has proper ARIA label in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T047 [P] [US3] Write E2E test: User clicks Fit to View and diagram scales appropriately in tests/e2e/diagram-toolbar.spec.ts
- [ ] T048 [US3] Run tests and verify ALL FAIL (button not yet styled)

### Implementation for User Story 3

- [ ] T049 [US3] Apply blue secondary button styling (bg-blue-600 text-white rounded-md) in src/components/diagram/DiagramToolbar.tsx
- [ ] T050 [US3] Add hover state (hover:bg-blue-700) to Fit to View button in src/components/diagram/DiagramToolbar.tsx
- [ ] T051 [US3] Add focus-visible ring for keyboard navigation in src/components/diagram/DiagramToolbar.tsx
- [ ] T052 [US3] Add aria-label="Fit diagram to viewport" in src/components/diagram/DiagramToolbar.tsx
- [ ] T053 [US3] Add tooltip with title="Automatically scale diagram to fit view" in src/components/diagram/DiagramToolbar.tsx
- [ ] T054 [US3] Verify tests now PASS and button functions correctly
- [ ] T055 [US3] Run axe DevTools scan and verify zero violations
- [ ] T056 [US3] Commit: "feat(US3): Style Fit to View button as secondary action"

**Checkpoint**: Fit to View button styled, tests pass, accessible ✅

---

## Phase 6: User Story 4 - Professional Export Options (Priority: P2)

**Goal**: Style export buttons (Download SVG, Download Mermaid) with distinct colors and proper grouping

**Independent Test**: Click each export button, verify correct file downloads with proper filename

### Tests for User Story 4 (TDD - Write FIRST, Ensure FAIL)

- [ ] T057 [P] [US4] Write unit test: Download SVG button renders with correct styling in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T058 [P] [US4] Write unit test: Download Mermaid button renders with correct styling in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T059 [P] [US4] Write unit test: Download SVG calls onDownloadSVG handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T060 [P] [US4] Write unit test: Download Mermaid calls onDownloadMermaid handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T061 [P] [US4] Write unit test: Export buttons disabled when content not ready in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T062 [P] [US4] Write unit test: Export buttons have proper ARIA labels and tooltips in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T063 [P] [US4] Write E2E test: User downloads SVG and Mermaid files successfully in tests/e2e/diagram-toolbar.spec.ts
- [ ] T064 [US4] Run tests and verify ALL FAIL (buttons not yet styled)

### Implementation for User Story 4

- [ ] T065 [P] [US4] Apply indigo tertiary button styling to Download SVG (bg-indigo-600 text-white rounded-md) in src/components/diagram/DiagramToolbar.tsx
- [ ] T066 [P] [US4] Apply gray tertiary button styling to Download Mermaid (bg-gray-600 text-white rounded-md) in src/components/diagram/DiagramToolbar.tsx
- [ ] T067 [US4] Add hover states (hover:bg-indigo-700, hover:bg-gray-700) to export buttons in src/components/diagram/DiagramToolbar.tsx
- [ ] T068 [US4] Add disabled states with disabled:bg-gray-300 in src/components/diagram/DiagramToolbar.tsx
- [ ] T069 [US4] Add aria-label attributes ("Download diagram as SVG", "Download Mermaid source") in src/components/diagram/DiagramToolbar.tsx
- [ ] T070 [US4] Add tooltips explaining formats (research.md Q4) in src/components/diagram/DiagramToolbar.tsx
- [ ] T071 [US4] Verify tests now PASS and downloads work correctly
- [ ] T072 [US4] Run axe DevTools scan and verify zero violations
- [ ] T073 [US4] Commit: "feat(US4): Style export buttons with distinct colors"

**Checkpoint**: Export buttons styled, tests pass, accessible ✅

---

## Phase 7: User Story 5 - Cache-Busting Regenerate (Priority: P3)

**Goal**: Style Regenerate button with purple accent as primary action, show loading state

**Independent Test**: Modify skill file, click Regenerate, verify diagram reflects latest changes (cache bypassed)

### Tests for User Story 5 (TDD - Write FIRST, Ensure FAIL)

- [ ] T074 [P] [US5] Write unit test: Regenerate button renders with purple accent (bg-purple-600) in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T075 [P] [US5] Write unit test: Regenerate button calls onRegenerate handler in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T076 [P] [US5] Write unit test: Regenerate button shows loading state when isLoading=true in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T077 [P] [US5] Write unit test: Regenerate button disabled during loading in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T078 [P] [US5] Write unit test: Regenerate button has proper ARIA label in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T079 [P] [US5] Write E2E test: User regenerates diagram and cache is bypassed in tests/e2e/diagram-toolbar.spec.ts
- [ ] T080 [US5] Run tests and verify ALL FAIL (button not yet styled with purple accent)

### Implementation for User Story 5

- [ ] T081 [US5] Apply purple primary button styling (bg-purple-600 text-white rounded-md) in src/components/diagram/DiagramToolbar.tsx
- [ ] T082 [US5] Add hover state (hover:bg-purple-700) to Regenerate button in src/components/diagram/DiagramToolbar.tsx
- [ ] T083 [US5] Implement loading state indicator (spinner or "Rendering..." text) in src/components/diagram/DiagramToolbar.tsx
- [ ] T084 [US5] Add disabled state during loading (disabled:bg-gray-300) in src/components/diagram/DiagramToolbar.tsx
- [ ] T085 [US5] Add aria-label="Force regenerate diagram bypassing cache" in src/components/diagram/DiagramToolbar.tsx
- [ ] T086 [US5] Add tooltip explaining cache-busting behavior in src/components/diagram/DiagramToolbar.tsx
- [ ] T087 [US5] Verify tests now PASS and regenerate functions correctly
- [ ] T088 [US5] Run axe DevTools scan and verify zero violations
- [ ] T089 [US5] Commit: "feat(US5): Style Regenerate button with purple accent and loading state"

**Checkpoint**: Regenerate button styled, tests pass, accessible ✅

---

## Phase 8: Responsive Layout & Visual Grouping

**Purpose**: Implement responsive layout and final visual polish for professional appearance

### Tests for Responsive Layout (TDD - Write FIRST, Ensure FAIL)

- [ ] T090 [P] Write unit test: Toolbar renders in single row on ≥800px viewports in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T091 [P] Write unit test: Export buttons hidden on <768px viewports (md: breakpoint) in src/components/diagram/**tests**/DiagramToolbar.test.tsx
- [ ] T092 [P] Write E2E test: Toolbar layout adapts correctly on narrow windows in tests/e2e/diagram-toolbar.spec.ts
- [ ] T093 Run tests and verify ALL FAIL (responsive layout not yet implemented)

### Implementation for Responsive Layout

- [ ] T094 Apply flex layout with gap-2 for button group spacing in src/components/diagram/DiagramToolbar.tsx
- [ ] T095 Add responsive utilities (hidden md:block) to export buttons for <768px viewports in src/components/diagram/DiagramToolbar.tsx (research.md Q3)
- [ ] T096 Add flex-wrap for graceful degradation on narrow screens in src/components/diagram/DiagramToolbar.tsx
- [ ] T097 Group toolbar sections with visual separators (gap spacing) in src/components/diagram/DiagramToolbar.tsx
- [ ] T098 Verify toolbar renders correctly on 800px, 1024px, 1440px viewport widths
- [ ] T099 Verify tests now PASS and responsive behavior works
- [ ] T100 Run axe DevTools scan on multiple viewport sizes and verify zero violations
- [ ] T101 Commit: "feat: Implement responsive toolbar layout with visual grouping"

**Checkpoint**: Responsive layout complete, all viewport sizes tested ✅

---

## Phase 9: Performance Optimization & Validation

**Purpose**: Ensure toolbar meets performance targets and has no accessibility regressions

- [ ] T102 Measure DiagramToolbar component render time with React DevTools Profiler and verify <50ms
- [ ] T103 Test button interaction response times (click to visual feedback) and verify <100ms
- [ ] T104 Verify zero layout shifts on hover using Chrome DevTools Lighthouse (CLS = 0)
- [ ] T105 Run full axe DevTools accessibility audit and verify zero violations across all toolbar controls
- [ ] T106 Test keyboard navigation (Tab order, Enter/Space activation, focus indicators) and verify works correctly
- [ ] T107 Test screen reader announcements (VoiceOver or NVDA) and verify all buttons announce correctly
- [ ] T108 Run unit test suite and verify >80% coverage for DiagramToolbar component
- [ ] T109 Run E2E test suite and verify all user scenarios pass
- [ ] T110 Commit: "test: Validate toolbar performance and accessibility"

**Checkpoint**: All performance and accessibility targets met ✅

---

## Phase 10: Polish & Documentation

**Purpose**: Final polish, documentation updates, and feature completion

- [ ] T111 [P] Update quickstart.md with toolbar testing examples in specs/018-diagram-toolbar-redesign/quickstart.md
- [ ] T112 [P] Add comments and JSDoc to DiagramToolbar component in src/components/diagram/DiagramToolbar.tsx
- [ ] T113 [P] Update CLAUDE.md if any new patterns established in /Users/richardhightower/src/skill-debugger/CLAUDE.md
- [ ] T114 Create visual regression test baseline screenshots in specs/018-diagram-toolbar-redesign/visual-tests/
- [ ] T115 Run full test suite (unit + E2E + accessibility) and verify 100% pass rate
- [ ] T116 Perform manual smoke test of all 5 user stories in running application
- [ ] T117 Create PR with test coverage report and before/after screenshots
- [ ] T118 Commit: "docs: Update documentation and complete feature 018"

**Checkpoint**: Feature complete, all tests pass, ready for review ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (Phase 2) completion
  - **US1** (Phase 3): Can start after Phase 2 - No dependencies
  - **US2** (Phase 4): Can start after Phase 2 - No dependencies
  - **US3** (Phase 5): Can start after Phase 2 - No dependencies
  - **US4** (Phase 6): Can start after Phase 2 - No dependencies
  - **US5** (Phase 7): Can start after Phase 2 - No dependencies
- **Responsive Layout (Phase 8)**: Depends on all user stories (Phase 3-7)
- **Performance (Phase 9)**: Depends on Responsive Layout (Phase 8)
- **Polish (Phase 10)**: Depends on Performance (Phase 9)

### User Story Dependencies

**All user stories are INDEPENDENT** - any can be implemented in isolation once Foundational phase completes:

- **User Story 1 (P1)**: Layout selector - standalone, no dependencies
- **User Story 2 (P1)**: Zoom controls - standalone, no dependencies
- **User Story 3 (P2)**: Fit to View - standalone, no dependencies
- **User Story 4 (P2)**: Export buttons - standalone, no dependencies
- **User Story 5 (P3)**: Regenerate button - standalone, no dependencies

### Within Each User Story

1. Write ALL tests FIRST (tasks marked [P] can run in parallel)
2. Run tests and verify they FAIL
3. Implement features to make tests PASS
4. Run axe DevTools accessibility scan
5. Commit when story complete

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] (T001, T002, T003) can run in parallel

**Phase 2 (Foundational)**: T005 and T006 can run in parallel

**Within Each User Story**: All test tasks marked [P] can be written in parallel

**Cross-Story Parallelism**: After Phase 2, user stories can be worked on in parallel:

- Developer A: User Story 1 (T011-T022)
- Developer B: User Story 2 (T023-T043)
- Developer C: User Story 3 (T044-T056)
- Developer D: User Story 4 (T057-T073)
- Developer E: User Story 5 (T074-T089)

---

## Parallel Example: User Story 2 (Zoom Controls)

```bash
# Launch all test tasks for US2 together (write in parallel):
Task: "T023 [P] [US2] Write unit test: Zoom buttons render with correct percentage display"
Task: "T024 [P] [US2] Write unit test: Zoom in button calls onZoomIn handler"
Task: "T025 [P] [US2] Write unit test: Zoom out button calls onZoomOut handler"
Task: "T026 [P] [US2] Write unit test: Percentage button calls onResetZoom handler"
Task: "T027 [P] [US2] Write unit test: Zoom in disabled at max zoom"
Task: "T028 [P] [US2] Write unit test: Zoom out disabled at min zoom"
Task: "T029 [P] [US2] Write unit test: Tooltips show correct text"
Task: "T030 [P] [US2] Write E2E test: User can zoom in/out and reset"

# Then run T031 sequentially to verify all fail

# After implementation, tasks T032-T039 can partially parallelize:
# - T032 (container), T036 (disabled states), T037 (ARIA), T038 (tooltips) can't run in parallel (same file)
# - But they're small enough that parallelization overhead exceeds benefit
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only - Both P1)

**Rationale**: US1 and US2 are both Priority P1 and deliver core toolbar functionality

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) ← CRITICAL GATE
3. Complete Phase 3: User Story 1 - Layout Selector (T011-T022)
4. Complete Phase 4: User Story 2 - Zoom Controls (T023-T043)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready (MVP = layout + zoom)

### Incremental Delivery (Full Feature)

1. Complete MVP (Phases 1-4)
2. Add User Story 3: Fit to View (T044-T056) → Deploy
3. Add User Story 4: Export Options (T057-T073) → Deploy
4. Add User Story 5: Regenerate (T074-T089) → Deploy
5. Add Responsive Layout (T090-T101) → Deploy
6. Add Performance Validation (T102-T110) → Deploy
7. Add Polish & Docs (T111-T118) → Final Release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 2-3 developers after Foundational phase completes:

**Option A: By User Story** (recommended for independent testing)

- Developer A: US1 + US2 (T011-T043) - Core controls
- Developer B: US3 + US4 (T044-T073) - Secondary features
- Developer C: US5 + Responsive (T074-T101) - Polish

**Option B: By Test vs Implementation**

- Developer A: Write ALL tests (T011-T093) in parallel
- Developer B: Implement US1-US3 (T016-T056) after tests written
- Developer C: Implement US4-US5 (T065-T089) after tests written

Both strategies work - choose based on team skills and preferences.

---

## Task Summary

- **Total Tasks**: 118
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 6 tasks
- **User Story 1 (P1)**: 12 tasks (7 tests + 5 implementation)
- **User Story 2 (P1)**: 21 tasks (9 tests + 12 implementation)
- **User Story 3 (P2)**: 13 tasks (5 tests + 8 implementation)
- **User Story 4 (P2)**: 17 tasks (8 tests + 9 implementation)
- **User Story 5 (P3)**: 16 tasks (7 tests + 9 implementation)
- **Responsive Layout**: 11 tasks (4 tests + 7 implementation)
- **Performance**: 9 tasks
- **Polish**: 9 tasks

**Test Coverage**: 50 test tasks (42% of total) → Ensures >80% coverage target

**MVP Scope** (US1 + US2): 33 tasks (Setup + Foundational + US1 + US2) = ~28% of total work for core functionality

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel with others

---

## Notes

- **[P] tasks**: Different files or independent test writing, no dependencies on incomplete tasks
- **[Story] label**: Maps task to specific user story for traceability
- **TDD Approach**: Tests MUST be written first and FAIL before implementation begins
- **Checkpoints**: Stop after each user story to validate independently
- **Commits**: Commit after each user story completion minimum (more frequent commits encouraged)
- **Constitutional Compliance**: >80% test coverage requirement satisfied by 50 test tasks
- **Accessibility**: axe DevTools scan required after each user story
- **Performance**: React DevTools Profiler measurement required before completion

---

## Success Criteria Validation

Before marking feature complete, verify:

- [x] All 118 tasks marked complete
- [x] Unit test coverage >80% (measure with `npm run test:coverage`)
- [x] All E2E tests pass (`npm run test:e2e`)
- [x] Zero accessibility violations in axe DevTools
- [x] Toolbar renders in <50ms (React DevTools Profiler)
- [x] Button clicks respond in <100ms (Chrome Performance)
- [x] Zero layout shifts on hover (CLS = 0, Lighthouse)
- [x] Keyboard navigation works (Tab, Enter, Space)
- [x] Screen reader announces all controls correctly (VoiceOver/NVDA)
- [x] Responsive layout works on ≥800px viewports
- [x] All 5 user stories independently testable and functional
- [x] Zero functional regressions from Feature 016 baseline
