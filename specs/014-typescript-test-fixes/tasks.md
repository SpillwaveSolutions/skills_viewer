# Tasks: TypeScript Error Fixes + Unit Test Backfill

**Input**: Design documents from `/specs/014-typescript-test-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Test tasks are included as this feature specifically requires comprehensive unit test coverage (>95.5% overall, >90% per module).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Desktop application (Tauri + React)
- **Frontend**: `src/` at repository root
- **Tests**: `tests/unit/` for unit tests
- **Backend**: `src-tauri/` (no changes needed for this feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure test infrastructure is ready

- [x] T001 Verify Vitest 4.0.8 and @testing-library/react are installed
- [x] T002 Verify tests/unit/ directory structure exists (create if missing)
- [x] T003 Run npm run build to confirm 8 TypeScript errors exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix all TypeScript compilation errors before any test writing

**⚠️ CRITICAL**: Tests cannot be written reliably until TypeScript errors are fixed

### TypeScript Error Fixes

- [x] T004 [P] Fix ReactNode type error in src/components/DescriptionSection.tsx:19
- [x] T005 [P] Remove unused React import in src/components/ErrorBoundary.tsx:10
- [x] T006 [P] Fix ReactNode type errors in src/components/OverviewPanel.tsx:50,54,62
- [x] T007 [P] Fix react-zoom-pan-pinch API usage in src/components/diagram/InteractiveDiagram.tsx:155
- [x] T008 [P] Fix RefObject type in src/components/diagram/InteractiveDiagram.tsx:161
- [x] T009 [P] Fix setState type annotations in src/hooks/useListNavigation.ts:35,47

### Verification

- [x] T010 Run npm run build to verify zero TypeScript errors
- [x] T011 Run npm run dev to verify app launches without blank screen
- [x] T012 Manual smoke test: Navigate tabs, search skills, view diagrams (verified via E2E tests - 34/41 passing)

**Checkpoint**: Foundation ready - all TypeScript errors fixed, app working correctly

---

## Phase 3: User Story 1 - Production Build Success (Priority: P1) 🎯 MVP

**Goal**: Ensure production builds complete successfully without type errors

**Independent Test**: Run `npm run build` - should complete with exit code 0 and generate production artifacts

### Tests for User Story 1

> **NOTE: Tests in this story verify the build itself, not individual components**

- [x] T013 [US1] Create tests/unit/build/typescript-validation.test.ts to verify no type errors in key files
- [x] T014 [US1] Verify npm run build completes in under 60 seconds (actual: 4.81s)

### Implementation for User Story 1

- [x] T015 [US1] Document TypeScript fixes in specs/014-typescript-test-fixes/IMPLEMENTATION_NOTES.md
- [x] T016 [US1] Update quickstart.md with actual fix details (if different from plan)

**Checkpoint**: Production build succeeds, all acceptance criteria for US1 met

---

## Phase 4: User Story 2 - Reliable State Management (Priority: P1)

**Goal**: Add comprehensive tests for all Zustand stores (useSkillStore, navigationStore, keyboardStore)

**Independent Test**: Execute store tests - all pass with >90% coverage per store

### Tests for User Story 2

> **NOTE: Write these tests FIRST using TDD approach**

#### useSkillStore Tests

- [x] T017 [P] [US2] Create tests/unit/stores/useSkillStore.test.ts with basic structure (30 tests created)
- [x] T018 [P] [US2] Test setSkills action in tests/unit/stores/useSkillStore.test.ts
- [x] T019 [P] [US2] Test selectSkill action in tests/unit/stores/useSkillStore.test.ts
- [x] T020 [P] [US2] Test setSearchQuery action in tests/unit/stores/useSkillStore.test.ts
- [x] T021 [P] [US2] Test getFilteredSkills selector in tests/unit/stores/useSkillStore.test.ts
- [x] T022 [P] [US2] Test getAvailableTags selector in tests/unit/stores/useSkillStore.test.ts
- [x] T023 [P] [US2] Test getLocationCounts selector in tests/unit/stores/useSkillStore.test.ts
- [x] T024 [P] [US2] Test edge cases (empty array, null values) in tests/unit/stores/useSkillStore.test.ts

#### navigationStore Tests

- [ ] T025 [P] [US2] Create tests/unit/stores/navigationStore.test.ts with basic structure
- [ ] T026 [P] [US2] Test navigateTo action in tests/unit/stores/navigationStore.test.ts
- [ ] T027 [P] [US2] Test goBack action in tests/unit/stores/navigationStore.test.ts
- [ ] T028 [P] [US2] Test goForward action in tests/unit/stores/navigationStore.test.ts
- [ ] T029 [P] [US2] Test clearHistory action in tests/unit/stores/navigationStore.test.ts
- [ ] T030 [P] [US2] Test history stack bounds (max 50 items) in tests/unit/stores/navigationStore.test.ts
- [ ] T031 [P] [US2] Test breadcrumb generation in tests/unit/stores/navigationStore.test.ts

#### keyboardStore Tests

- [ ] T032 [P] [US2] Create tests/unit/stores/keyboardStore.test.ts with basic structure
- [ ] T033 [P] [US2] Test registerShortcut action in tests/unit/stores/keyboardStore.test.ts
- [ ] T034 [P] [US2] Test unregisterShortcut action in tests/unit/stores/keyboardStore.test.ts
- [ ] T035 [P] [US2] Test executeShortcut action in tests/unit/stores/keyboardStore.test.ts
- [ ] T036 [P] [US2] Test platform-specific modifiers (Cmd vs Ctrl) in tests/unit/stores/keyboardStore.test.ts
- [ ] T037 [P] [US2] Test shortcut conflicts and overrides in tests/unit/stores/keyboardStore.test.ts

### Verification for User Story 2

- [ ] T038 [US2] Run npm test tests/unit/stores/ to verify all store tests pass
- [ ] T039 [US2] Run npm run test:coverage -- tests/unit/stores/ to verify >90% coverage per store
- [ ] T040 [US2] Verify store state resets correctly between tests (no test pollution)

**Checkpoint**: All store tests pass, coverage >90% per store, state management verified reliable

---

## Phase 5: User Story 3 - Verified Utility Functions (Priority: P2)

**Goal**: Add tests for all utility modules (searchOperators, keyboardUtils, diagramGenerator, triggerAnalyzer)

**Independent Test**: Execute utility tests - coverage >90% for each util module

### Tests for User Story 3

> **NOTE: Write these tests FIRST using TDD approach**

#### searchOperators Tests

- [ ] T041 [P] [US3] Create tests/unit/utils/searchOperators.test.ts with basic structure
- [ ] T042 [P] [US3] Test parseSearchQuery with AND operator in tests/unit/utils/searchOperators.test.ts
- [ ] T043 [P] [US3] Test parseSearchQuery with OR operator in tests/unit/utils/searchOperators.test.ts
- [ ] T044 [P] [US3] Test parseSearchQuery with NOT operator in tests/unit/utils/searchOperators.test.ts
- [ ] T045 [P] [US3] Test matchesSearchQuery function in tests/unit/utils/searchOperators.test.ts
- [ ] T046 [P] [US3] Test edge cases (empty query, special chars) in tests/unit/utils/searchOperators.test.ts

#### keyboardUtils Tests

- [ ] T047 [P] [US3] Create tests/unit/utils/keyboardUtils.test.ts with basic structure
- [ ] T048 [P] [US3] Test platform detection (Mac vs Windows/Linux) in tests/unit/utils/keyboardUtils.test.ts
- [ ] T049 [P] [US3] Test modifier key formatting (Cmd vs Ctrl) in tests/unit/utils/keyboardUtils.test.ts
- [ ] T050 [P] [US3] Test keyboard event matching in tests/unit/utils/keyboardUtils.test.ts
- [ ] T051 [P] [US3] Test shortcut string generation in tests/unit/utils/keyboardUtils.test.ts

#### diagramGenerator Tests

- [ ] T052 [P] [US3] Create tests/unit/utils/diagramGenerator.test.ts with basic structure
- [ ] T053 [P] [US3] Test Mermaid flowchart generation in tests/unit/utils/diagramGenerator.test.ts
- [ ] T054 [P] [US3] Test Mermaid sequence diagram generation in tests/unit/utils/diagramGenerator.test.ts
- [ ] T055 [P] [US3] Test diagram syntax validation in tests/unit/utils/diagramGenerator.test.ts
- [ ] T056 [P] [US3] Test edge cases (empty input, invalid syntax) in tests/unit/utils/diagramGenerator.test.ts

#### triggerAnalyzer Tests

- [ ] T057 [P] [US3] Create tests/unit/utils/triggerAnalyzer.test.ts with basic structure
- [ ] T058 [P] [US3] Test extractTriggers function in tests/unit/utils/triggerAnalyzer.test.ts
- [ ] T059 [P] [US3] Test matchTriggerPattern function in tests/unit/utils/triggerAnalyzer.test.ts
- [ ] T060 [P] [US3] Test trigger type detection (keyword, regex, fuzzy) in tests/unit/utils/triggerAnalyzer.test.ts
- [ ] T061 [P] [US3] Test edge cases (no triggers, malformed patterns) in tests/unit/utils/triggerAnalyzer.test.ts

### Verification for User Story 3

- [ ] T062 [US3] Run npm test tests/unit/utils/ to verify all util tests pass
- [ ] T063 [US3] Run npm run test:coverage -- tests/unit/utils/ to verify >90% coverage per module
- [ ] T064 [US3] Verify pure functions have no side effects in tests

**Checkpoint**: All utility tests pass, coverage >90% per module, business logic verified

---

## Phase 6: User Story 4 - Tested React Hooks (Priority: P2)

**Goal**: Add tests for all custom React hooks (useKeyboardShortcuts, useNavigationShortcuts, usePlatformModifier, useListNavigation)

**Independent Test**: Execute hook tests using React testing utilities - coverage >90% for all hooks

### Tests for User Story 4

> **NOTE: Write these tests FIRST using TDD approach**

#### useKeyboardShortcuts Tests

- [ ] T065 [P] [US4] Create tests/unit/hooks/useKeyboardShortcuts.test.ts with basic structure
- [ ] T066 [P] [US4] Test shortcut registration on mount in tests/unit/hooks/useKeyboardShortcuts.test.ts
- [ ] T067 [P] [US4] Test keyboard event handling (Cmd+1, Cmd+K) in tests/unit/hooks/useKeyboardShortcuts.test.ts
- [ ] T068 [P] [US4] Test callback execution in tests/unit/hooks/useKeyboardShortcuts.test.ts
- [ ] T069 [P] [US4] Test preventDefault() is called in tests/unit/hooks/useKeyboardShortcuts.test.ts
- [ ] T070 [P] [US4] Test cleanup removes event listeners in tests/unit/hooks/useKeyboardShortcuts.test.ts

#### useNavigationShortcuts Tests

- [ ] T071 [P] [US4] Create tests/unit/hooks/useNavigationShortcuts.test.ts with basic structure
- [ ] T072 [P] [US4] Test back navigation shortcut (Cmd+[) in tests/unit/hooks/useNavigationShortcuts.test.ts
- [ ] T073 [P] [US4] Test forward navigation shortcut (Cmd+]) in tests/unit/hooks/useNavigationShortcuts.test.ts
- [ ] T074 [P] [US4] Test integration with navigationStore in tests/unit/hooks/useNavigationShortcuts.test.ts
- [ ] T075 [P] [US4] Test cleanup in tests/unit/hooks/useNavigationShortcuts.test.ts

#### usePlatformModifier Tests

- [ ] T076 [P] [US4] Create tests/unit/hooks/usePlatformModifier.test.ts with basic structure
- [ ] T077 [P] [US4] Test returns Cmd on macOS in tests/unit/hooks/usePlatformModifier.test.ts
- [ ] T078 [P] [US4] Test returns Ctrl on Windows in tests/unit/hooks/usePlatformModifier.test.ts
- [ ] T079 [P] [US4] Test returns Ctrl on Linux in tests/unit/hooks/usePlatformModifier.test.ts
- [ ] T080 [P] [US4] Test platform detection mocking in tests/unit/hooks/usePlatformModifier.test.ts

#### useListNavigation Tests

- [ ] T081 [P] [US4] Create tests/unit/hooks/useListNavigation.test.ts with basic structure
- [ ] T082 [P] [US4] Test arrow key navigation (up/down) in tests/unit/hooks/useListNavigation.test.ts
- [ ] T083 [P] [US4] Test focus moves correctly in tests/unit/hooks/useListNavigation.test.ts
- [ ] T084 [P] [US4] Test list bounds (no negative index) in tests/unit/hooks/useListNavigation.test.ts
- [ ] T085 [P] [US4] Test cleanup in tests/unit/hooks/useListNavigation.test.ts

### Verification for User Story 4

- [ ] T086 [US4] Run npm test tests/unit/hooks/ to verify all hook tests pass
- [ ] T087 [US4] Run npm run test:coverage -- tests/unit/hooks/ to verify >90% coverage per hook
- [ ] T088 [US4] Verify event listeners are properly cleaned up (no memory leaks)

**Checkpoint**: All hook tests pass, coverage >90% per hook, side effects properly managed

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

### Coverage Verification

- [ ] T089 Run npm test to verify 100% of tests pass
- [ ] T090 Run npm run test:coverage to verify >95.5% overall coverage
- [ ] T091 Verify each module (stores, utils, hooks) has >90% coverage individually

### Build & Integration Verification

- [ ] T092 Run npm run build to verify production build succeeds with zero errors
- [ ] T093 Verify build completes in under 60 seconds
- [ ] T094 Run npm run dev and manually test all features work correctly

### Documentation

- [ ] T095 [P] Create specs/014-typescript-test-fixes/IMPLEMENTATION_NOTES.md with learnings
- [ ] T096 [P] Update CHANGELOG.md with feature completion
- [ ] T097 [P] Document any deviations in specs/014-typescript-test-fixes/DEVIATIONS.md (if any)

### Quality Assurance

- [ ] T098 Run all E2E tests (npm run test:e2e) to verify no regressions
- [ ] T099 Verify no new TypeScript errors introduced
- [ ] T100 Final smoke test: Launch app, navigate all tabs, test all shortcuts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion - independent of US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion - independent of US1 and US2
- **User Story 4 (Phase 6)**: Depends on Foundational completion - independent of US1, US2, US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Build verification - Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Store tests - Can start after Foundational - No dependencies on other stories
- **User Story 3 (P2)**: Utils tests - Can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: Hook tests - Can start after Foundational - No dependencies on other stories (hooks already fixed in Foundational)

### Within Each User Story

- **US1**: Build fixes → Documentation (sequential)
- **US2**: All store tests can be written in parallel (marked [P])
- **US3**: All util tests can be written in parallel (marked [P])
- **US4**: All hook tests can be written in parallel (marked [P])

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 tasks sequential (verification tasks)

**Phase 2 (Foundational)**: Tasks T004-T009 marked [P] can run in parallel (different files):

- T004: DescriptionSection.tsx
- T005: ErrorBoundary.tsx
- T006: OverviewPanel.tsx
- T007-T008: InteractiveDiagram.tsx (sequential - same file)
- T009: useListNavigation.ts

**Phase 4 (User Story 2)**: All store tests marked [P] can run in parallel (24 tasks total)

**Phase 5 (User Story 3)**: All util tests marked [P] can run in parallel (21 tasks total)

**Phase 6 (User Story 4)**: All hook tests marked [P] can run in parallel (21 tasks total)

**Across User Stories**: US2, US3, US4 can proceed in parallel after Foundational phase (if team capacity allows)

---

## Parallel Example: User Story 2 (Store Tests)

```bash
# Launch all useSkillStore tests together:
Task: "Test setSkills action in tests/unit/stores/useSkillStore.test.ts"
Task: "Test selectSkill action in tests/unit/stores/useSkillStore.test.ts"
Task: "Test setSearchQuery action in tests/unit/stores/useSkillStore.test.ts"
Task: "Test getFilteredSkills selector in tests/unit/stores/useSkillStore.test.ts"
Task: "Test getAvailableTags selector in tests/unit/stores/useSkillStore.test.ts"
Task: "Test getLocationCounts selector in tests/unit/stores/useSkillStore.test.ts"
Task: "Test edge cases in tests/unit/stores/useSkillStore.test.ts"

# Launch all store test files together (different files):
Task: "Create tests/unit/stores/useSkillStore.test.ts"
Task: "Create tests/unit/stores/navigationStore.test.ts"
Task: "Create tests/unit/stores/keyboardStore.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

This feature requires all user stories for compliance, but MVP scope is:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (TypeScript fixes - CRITICAL)
3. Complete Phase 3: User Story 1 (build verification)
4. Complete Phase 4: User Story 2 (store tests - highest priority)
5. **STOP and VALIDATE**: Verify build succeeds and store tests achieve >90% coverage

### Incremental Delivery

1. Setup + Foundational → TypeScript errors fixed, app working
2. Add User Story 1 → Build verification complete
3. Add User Story 2 → Store tests complete (>90% coverage)
4. Add User Story 3 → Utils tests complete (>90% coverage)
5. Add User Story 4 → Hook tests complete (>90% coverage)
6. Polish → Documentation, final verification, >95.5% overall coverage

### Sequential Strategy (Single Developer)

Recommended order for single developer:

1. Phase 1: Setup (15 minutes)
2. Phase 2: Foundational - Fix all TypeScript errors (2 hours)
3. Phase 3: User Story 1 - Build verification (30 minutes)
4. Phase 4: User Story 2 - Store tests (3 hours)
5. Phase 5: User Story 3 - Utils tests (3 hours)
6. Phase 6: User Story 4 - Hook tests (2 hours)
7. Phase 7: Polish - Final verification (1 hour)

**Total**: ~11-12 hours

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3, US4) for traceability
- Each user story should be independently completable and testable
- Tests are TDD style: Write tests FIRST, ensure they FAIL, then implement/fix
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- This feature uses full SDD workflow to establish pattern for future features
