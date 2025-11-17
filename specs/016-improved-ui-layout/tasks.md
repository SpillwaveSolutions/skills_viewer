# Tasks: Improved UI Layout with Top Tabs

**Input**: Design documents from `/specs/016-improved-ui-layout/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. This feature follows TDD (Test-Driven Development) - tests are written BEFORE implementation tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All file paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic type definitions

- [x] T001 Create type definitions in src/types/layout.ts (LayoutMode, BreadcrumbSegment, TabConfig, InlineStats, HeaderState)
- [x] T002 [P] Create localStorage utility in src/utils/localStorage.ts with type-safe get/set/remove operations
- [x] T003 [P] Create TABS constant array in src/types/layout.ts with all 6 tab configurations (Overview, Content, Triggers, Diagram, References, Scripts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create layoutStore in src/stores/layoutStore.ts with mode state, setMode, toggleMode, and localStorage persistence
- [x] T005 [P] Create useLayoutMode hook in src/hooks/useLayoutMode.ts that wraps layoutStore and provides isCompact/isStandard computed properties
- [x] T006 [P] Update existing keyboardStore in src/stores/keyboardStore.ts to ensure activeTabIndex state is properly exported (verify, do not modify if already correct)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Maximum Vertical Space for Diagrams (Priority: P0) 🎯 MVP

**Goal**: Move tabs from bottom to top, gaining 200+ pixels of vertical space for diagrams

**Independent Test**: Open any skill with a diagram, measure diagram content area height, verify it's 200+ pixels taller than v0.1.0 (bottom tabs)

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Unit test for TabBar component in tests/unit/components/TabBar.test.tsx (renders 6 tabs, active tab styling, onClick handler)
- [ ] T008 [P] [US1] Integration test for tab switching in tests/integration/TabSwitching.test.tsx (click tab updates activeTabIndex, keyboardStore sync, breadcrumb update trigger)
- [ ] T009 [P] [US1] E2E test for top tabs in tests/e2e/top-tabs.spec.ts (tabs below header, all 6 visible, correct content per tab, +200px vertical space measurement at 1080p)

### Implementation for User Story 1

- [x] T010 [P] [US1] Create TabBar component in src/components/TabBar.tsx with TailwindCSS styling (purple active border, gray hover background, 200ms transitions)
- [x] T011 [P] [US1] Create Tab sub-component in src/components/Tab.tsx with icon + label, aria attributes, focus ring
- [x] T012 [US1] Refactor SkillViewer component in src/components/SkillViewer.tsx to position TabBar below header (remove bottom tabs, update layout structure)
- [x] T013 [US1] Update content area CSS in SkillViewer.tsx to extend from below tabs to bottom of window (full-height scrolling)
- [x] T014 [US1] Wire TabBar onTabChange to keyboardStore.setActiveTabIndex and update active content area
- [x] T015 [US1] Verify diagram area gains minimum 200px vertical space (visual regression test or measurement)

**Checkpoint**: At this point, tabs appear at top, diagrams have 200+ pixels more space, all 6 tabs functional

---

## Phase 4: User Story 2 - Consolidated Overview Content (Priority: P0)

**Goal**: Remove duplicate content from header, consolidate all metadata into Overview tab

**Independent Test**: Select any skill, verify header shows only title + badge, all metadata appears only in Overview tab (zero duplication)

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Unit test for SkillHeader component in tests/unit/components/SkillHeader.test.tsx (renders title + badge only in standard mode, no description)
- [ ] T017 [P] [US2] Unit test for OverviewTab component in tests/unit/components/OverviewTab.test.tsx (renders all metadata sections: description, version, triggers, stats, metadata grid, tags)
- [ ] T018 [P] [US2] Integration test for content consolidation in tests/integration/ContentConsolidation.test.tsx (automated check: description appears exactly once, stats appear exactly once)

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create SkillHeader component in src/components/SkillHeader.tsx showing only title and location badge (no description in standard mode)
- [ ] T020 [P] [US2] Create OverviewTab component in src/components/OverviewTab.tsx consolidating all metadata (description, version, triggers, stats grid, metadata grid, tags)
- [ ] T021 [US2] Refactor SkillViewer to use new SkillHeader component (remove OverviewPanel from header area)
- [ ] T022 [US2] Update SkillViewer to render OverviewTab as first tab content (index 0)
- [ ] T023 [US2] Remove duplicate content rendering logic from OverviewPanel (convert to Overview tab-only)
- [ ] T024 [US2] Style OverviewTab sections using TailwindCSS (version badge monospace, trigger badges light blue #dbeafe, stats grid 4 columns)

**Checkpoint**: Header is minimal (title + badge), all metadata consolidated in Overview tab, zero duplication verified

---

## Phase 5: User Story 3 - Breadcrumb Navigation (Priority: P1)

**Goal**: Add breadcrumb navigation showing "Home › Skill › Tab" with clickable segments

**Independent Test**: Navigate to a skill's Diagram tab, verify breadcrumb shows "Home › [Skill] › Diagram", click Home, verify return to skill list

### Tests for User Story 3 ⚠️

- [ ] T025 [P] [US3] Unit test for useBreadcrumbSegments hook in tests/unit/hooks/useBreadcrumbSegments.test.ts (returns correct segments for skill list, skill selected, tab changes)
- [ ] T026 [P] [US3] Integration test for breadcrumb updates in tests/integration/BreadcrumbUpdate.test.tsx (tab change updates within 50ms, skill select/deselect updates, keyboard shortcuts update)
- [ ] T027 [P] [US3] E2E test for breadcrumb navigation in tests/e2e/breadcrumb-navigation.spec.ts (shows "Home" on list, "Home › Skill › Tab" when viewing skill, clicking Home returns to list, updates with Cmd+1-6)

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create useBreadcrumbSegments hook in src/hooks/useBreadcrumbSegments.ts generating segments from selectedSkill and activeTabIndex
- [ ] T029 [P] [US3] Create BreadcrumbNavigation component in src/components/BreadcrumbNavigation.tsx with semantic HTML (nav, ol, aria-label="Breadcrumb")
- [ ] T030 [US3] Add navigation arrows (← →) to breadcrumb bar integrating with navigationStore.goBack/goForward
- [ ] T031 [US3] Integrate BreadcrumbNavigation into SkillViewer above SkillHeader (dark background #2d2d2d)
- [ ] T032 [US3] Wire breadcrumb "Home" segment onClick to selectSkill(null) for navigation
- [ ] T033 [US3] Add useEffect to update breadcrumb when activeTabIndex or selectedSkill changes (ensure <50ms update time)
- [ ] T034 [US3] Implement long skill name truncation with ellipsis (max-w-xs truncate, title tooltip)
- [ ] T035 [US3] Verify breadcrumb updates within 50ms using performance.now() measurement

**Checkpoint**: Breadcrumb navigation functional, updates <50ms on tab change, clickable Home segment works

---

## Phase 6: User Story 4 - Compact Layout Mode (Priority: P2)

**Goal**: Provide compact mode with inline stats in header, saving 80-120px vertical space

**Independent Test**: Toggle compact mode, verify header shows inline stats (refs: X | scripts: Y | triggers: Z | lines: N), measure 80-120px height reduction

### Tests for User Story 4 ⚠️

- [ ] T036 [P] [US4] Unit test for layoutStore in tests/unit/stores/layoutStore.test.ts (initial state 'standard', setMode updates state, toggleMode switches modes, localStorage persistence)
- [ ] T037 [P] [US4] Unit test for useLayoutMode hook in tests/unit/hooks/useLayoutMode.test.ts (returns store state, provides isCompact/isStandard flags, restores from localStorage on mount)
- [ ] T038 [P] [US4] Integration test for layout mode toggle in tests/integration/LayoutModeToggle.test.tsx (clicking toggle switches mode, header updates to inline stats, persists to localStorage)
- [ ] T039 [P] [US4] E2E test for compact mode persistence in tests/e2e/compact-mode.spec.ts (toggle to compact, reload app, verify mode restored, verify +80-120px space gain)

### Implementation for User Story 4

- [ ] T040 [P] [US4] Update SkillHeader to render inline stats when mode is 'compact' (format: "refs: X | scripts: Y | triggers: Z | lines: N" in monospace font)
- [ ] T041 [P] [US4] Update SkillHeader to show description section only when mode is 'standard'
- [ ] T042 [US4] Add compact mode toggle button to UI (location: settings panel or header toolbar - TBD during implementation)
- [ ] T043 [US4] Wire toggle button onClick to layoutStore.toggleMode()
- [ ] T044 [US4] Verify compact mode provides 80-120px additional vertical space (measurement test)
- [ ] T045 [US4] Verify layout mode persists across app restarts (localStorage read on mount)
- [ ] T046 [US4] Verify OverviewTab shows full description in both standard and compact modes (FR-030)

**Checkpoint**: Compact mode fully functional, persists across restarts, provides 80-120px space gain

---

## Phase 7: User Story 5 - Visual Feedback for Tab Interaction (Priority: P1)

**Goal**: Clear visual feedback with icons, colors, hover states, and focus rings

**Independent Test**: Hover over tabs (light gray background), click tabs (purple border), use keyboard shortcuts (visual active state updates), verify focus rings on Tab navigation

### Tests for User Story 5 ⚠️

- [ ] T047 [P] [US5] E2E test for visual feedback in tests/e2e/tab-visual-feedback.spec.ts (hover shows gray background, active shows purple border, keyboard shortcuts update visual state, focus rings visible)
- [ ] T048 [P] [US5] Integration test for keyboard shortcuts in tests/integration/KeyboardShortcuts.test.tsx (Cmd+1-6 switch tabs, visual state updates immediately, existing shortcuts still work)

### Implementation for User Story 5

- [ ] T049 [P] [US5] Add hover state styling to Tab component (bg-gray-100 on hover, FR-033)
- [ ] T050 [P] [US5] Add active tab styling to Tab component (border-b-2 border-purple-600 text-purple-600, FR-034)
- [ ] T051 [P] [US5] Add focus ring styling to Tab component (focus:ring-2 focus:ring-purple-600, FR-038)
- [ ] T052 [P] [US5] Add smooth transition CSS (transition-colors duration-200, FR-037)
- [ ] T053 [US5] Verify existing keyboard shortcuts (Cmd/Ctrl+1-6) still work with new tab system
- [ ] T054 [US5] Update keyboard shortcut handlers to trigger visual state updates immediately (FR-039)
- [ ] T055 [US5] Add screen reader announcements for tab changes ("Content tab active", FR-049)
- [ ] T056 [US5] Verify 100% of tab interactions show correct visual feedback (automated E2E test)

**Checkpoint**: All visual feedback working, keyboard shortcuts functional, accessibility complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [ ] T057 [P] Export all new components in src/components/index.ts (BreadcrumbNavigation, SkillHeader, TabBar, Tab, OverviewTab)
- [ ] T058 [P] Add responsive behavior tests for minimum 800px window width (FR-041)
- [ ] T059 [P] Verify breadcrumb truncation works correctly on narrow windows (FR-042)
- [ ] T060 [P] Run accessibility audit with axe DevTools and WAVE (verify zero regressions, FR-046-FR-052)
- [ ] T061 [P] Measure and document vertical space gains (+200px for US1, +80-120px for US4 compact mode, SC-001, SC-004)
- [ ] T062 [P] Performance testing: breadcrumb updates <50ms, tab transitions <200ms (SC-003, SC-005)
- [ ] T063 [P] Coverage report: verify >80% test coverage for all layout-related code (constitutional Principle VII)
- [ ] T064 Code cleanup: remove old OverviewPanel code if fully replaced
- [ ] T065 Update quickstart.md with final implementation notes and lessons learned
- [ ] T066 Run full test suite (npm test && npm run test:e2e) and verify all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (T004-T006) completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P0 → P0 → P1 → P2 → P1)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P0)**: Can start after Foundational - No dependencies on other stories
- **US2 (P0)**: Can start after Foundational - No dependencies on other stories (but logically follows US1 for coherent layout)
- **US3 (P1)**: Can start after Foundational - Depends on US1 (TabBar) for tab name display
- **US4 (P2)**: Can start after Foundational - Depends on US2 (SkillHeader) for header refactoring
- **US5 (P1)**: Can start after US1 (TabBar exists) - Adds styling enhancements to tabs

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components can be created in parallel (marked [P])
- Integration tasks follow component creation
- Story verification/measurement is final step

### Parallel Opportunities

- **Setup (Phase 1)**: T002 and T003 can run in parallel
- **Foundational (Phase 2)**: T005 and T006 can run in parallel
- **Within US1**: T007-T009 (tests) can run in parallel, T010-T011 (components) can run in parallel
- **Within US2**: T016-T018 (tests) can run in parallel, T019-T020 (components) can run in parallel
- **Within US3**: T025-T027 (tests) can run in parallel, T028-T029 (components) can run in parallel
- **Within US4**: T036-T039 (tests) can run in parallel, T040-T041 (components) can run in parallel
- **Within US5**: T047-T048 (tests) can run in parallel, T049-T052 (styling) can run in parallel
- **Polish (Phase 8)**: T057-T063 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T007: "Unit test for TabBar component in tests/unit/components/TabBar.test.tsx"
Task T008: "Integration test for tab switching in tests/integration/TabSwitching.test.tsx"
Task T009: "E2E test for top tabs in tests/e2e/top-tabs.spec.ts"

# Launch all components for User Story 1 together:
Task T010: "Create TabBar component in src/components/TabBar.tsx"
Task T011: "Create Tab sub-component in src/components/Tab.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL checkpoint
3. Complete Phase 3: User Story 1 (T007-T015) - Top tabs with +200px space
4. Complete Phase 4: User Story 2 (T016-T024) - Consolidated overview
5. **STOP and VALIDATE**: Test US1+US2 together (tabs at top, no duplication)
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Top tabs MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Consolidated content)
4. Add User Story 3 → Test independently → Deploy/Demo (Breadcrumb navigation)
5. Add User Story 4 → Test independently → Deploy/Demo (Compact mode)
6. Add User Story 5 → Test independently → Deploy/Demo (Visual polish)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (tabs at top)
   - Developer B: User Story 2 (consolidated overview)
3. After US1+US2 merge:
   - Developer A: User Story 3 (breadcrumb)
   - Developer B: User Story 4 (compact mode)
   - Developer C: User Story 5 (visual feedback)
4. Stories complete and integrate independently

---

## Task Summary

| Phase        | Tasks        | Parallelizable        | Est. Time       |
| ------------ | ------------ | --------------------- | --------------- |
| Setup        | 3            | 2                     | 1 hour          |
| Foundational | 3            | 2                     | 1-2 hours       |
| US1 (P0)     | 9            | 5                     | 3-4 hours       |
| US2 (P0)     | 9            | 5                     | 2-3 hours       |
| US3 (P1)     | 11           | 5                     | 3-4 hours       |
| US4 (P2)     | 11           | 7                     | 2-3 hours       |
| US5 (P1)     | 10           | 7                     | 2-3 hours       |
| Polish       | 10           | 9                     | 2-3 hours       |
| **Total**    | **66 tasks** | **42 parallelizable** | **16-23 hours** |

**Parallel Efficiency**: 64% of tasks can run in parallel (42/66)

**MVP Scope** (US1 + US2): 21 tasks, ~5-7 hours

**Constitutional Compliance**: >80% test coverage enforced (Principle VII) - 25 test tasks out of 66 total (38% are tests)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label (US1-US5) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD approach: Write failing tests BEFORE implementation
- Commit after each task or logical checkpoint
- Stop at checkpoints to validate story independently
- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story] Description with file path`
- Constitutional requirement: >80% test coverage MUST be achieved
