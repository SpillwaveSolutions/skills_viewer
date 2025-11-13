# Tasks: UI/UX Polish and Fixes

**Feature**: 004-ui-ux-polish
**Input**: Design documents from `/specs/004-ui-ux-polish/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Following TDD workflow per Constitution Principle VII - tests written BEFORE implementation

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- React components in `src/components/`
- Tests in `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify development environment and dependencies

- [x] T001 Verify all dependencies are installed (tailwindcss, react-markdown, rehype-highlight)
- [x] T002 [P] Create test fixtures for mock skills in tests/fixtures/mockSkills.ts
- [x] T003 [P] Setup Playwright E2E test configuration if not already configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and helpers that user stories will depend on

**⚠️ CRITICAL**: These tasks must complete before user story implementation begins

- [x] T004 [P] Read current OverviewPanel.tsx to understand existing structure
- [x] T005 [P] Read current SkillList.tsx to understand existing structure
- [x] T006 [P] Read current ScriptsTab.tsx to understand existing syntax highlighting implementation
- [x] T007 [P] Read current ReferencesTab.tsx to see working rehype-highlight example

**Checkpoint**: Codebase understanding complete - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Readable Content with Proper Spacing (Priority: P1) 🎯 MVP

**Goal**: Fix cramped text by applying minimum 8px margins throughout the application

**Independent Test**: Open any tab, verify all text has visible spacing from borders/lines (minimum 8px)

### Tests for User Story 1

> **TDD: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Unit test for margin spacing validation in tests/unit/spacing.test.tsx
- [ ] T009 [P] [US1] E2E visual regression test for margins in tests/e2e/ui-polish.spec.ts

### Implementation for User Story 1

- [x] T010 [P] [US1] REVISED: Fixed OverviewPanel gap-4 and title mr-4 (was space-y-4 bug)
- [x] T011 [P] [US1] REVISED: Fixed DescriptionSection px-2 margin on <p> tag
- [x] T012 [P] [US1] Fixed SkillList selected item pl-3.5 compensation + skill name mr-2
- [x] T013 [P] [US1] Fixed ScriptsTab list p-3, script name mr-1, content pt-8, removed ml-8
- [x] T014 [P] [US1] Fixed ReferencesTab list p-3, ref name mr-1, content pt-8
- [x] T015 [P] [US1] Fixed SearchBar wrapper mt-2 for top breathing room
- [x] T016 [P] [US1] Fixed TriggerAnalysis section titles mt-2 (defensive spacing)
- [ ] T017 [US1] Run visual regression tests, update baselines if changes are correct
- [ ] T018 [US1] Manual testing: Verify margins on all tabs at different window sizes

**Checkpoint**: All text should now have minimum 8px margins. Story 1 is independently testable.

---

## Phase 4: User Story 2 - Logical Information Hierarchy in Overview (Priority: P2)

**Goal**: Reorder Overview tab to show name → description → version → triggers → remaining metadata

**Independent Test**: Select any skill, verify Overview tab shows information in correct order with no duplicates

### Tests for User Story 2

> **TDD: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US2] Unit test for Overview tab information order in tests/unit/OverviewTab.test.tsx
- [ ] T020 [P] [US2] Unit test for duplicate description detection in tests/unit/OverviewTab.test.tsx
- [ ] T021 [P] [US2] E2E test for Overview layout in tests/e2e/overview-tab.spec.ts

### Implementation for User Story 2

- [ ] T022 [US2] Read OverviewTab.tsx and identify current JSX structure (lines 19-101)
- [ ] T023 [US2] Restructure OverviewTab.tsx JSX to render in correct order:
  - Skill name (h1)
  - Location badge (claude/opencode)
  - Description (if present)
  - Version (from metadata, if present)
  - Triggers preview (first 5)
  - Stats grid (references, scripts, triggers count, lines)
  - Remaining metadata (filtered to exclude name/description/version)
- [ ] T024 [US2] Implement metadata filtering logic to prevent duplicate descriptions
- [ ] T025 [US2] Add graceful handling for missing fields (description, version, triggers)
- [ ] T026 [US2] Update styling to maintain proper spacing between sections (use space-y-4)
- [ ] T027 [US2] Run unit tests to verify order and no duplicates
- [ ] T028 [US2] Manual testing: Test with skills that have all fields, missing fields, no triggers

**Checkpoint**: Overview tab should display information logically. Story 2 is independently testable.

---

## Phase 5: User Story 3 - Graceful Text Overflow Handling (Priority: P3)

**Goal**: Truncate long text with ellipsis in buttons/labels, show full text in tooltips

**Independent Test**: Create skill with 200-character name, verify truncation with ellipsis and tooltip

### Tests for User Story 3

> **TDD: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T029 [P] [US3] Unit test for text truncation utility in tests/unit/textTruncation.test.ts
- [ ] T030 [P] [US3] E2E test for truncation with tooltips in tests/e2e/text-overflow.spec.ts
- [ ] T031 [P] [US3] E2E test with 50, 100, 200 character skill names in tests/e2e/text-overflow.spec.ts

### Implementation for User Story 3

- [ ] T032 [P] [US3] Create textTruncation.ts utility in src/utils/textTruncation.ts (if complex logic needed)
- [ ] T033 [P] [US3] Update SkillList.tsx: Add truncate class to skill name elements
- [ ] T034 [P] [US3] Update SkillList.tsx: Add title attribute with full skill name for tooltips
- [ ] T035 [P] [US3] Update SkillList.tsx: Add hoveredSkillPath state for future enhancements
- [ ] T036 [P] [US3] Update SearchBar.tsx: Add truncate class if needed for search results
- [ ] T037 [P] [US3] Update OverviewTab.tsx: Ensure trigger keywords truncate if very long
- [ ] T038 [P] [US3] Ensure parent containers have defined widths (w-full or max-w-*)
- [ ] T039 [US3] Test with edge cases: 50, 100, 200 character names
- [ ] T040 [US3] Manual testing: Hover over truncated text, verify tooltip shows full text

**Checkpoint**: Text truncation should work for all long text. Story 3 is independently testable.

---

## Phase 6: User Story 4 - Consistent Syntax Highlighting (Priority: P2)

**Goal**: Fix Python syntax highlighting bug so it works on every visit to Scripts tab

**Independent Test**: Navigate to Scripts tab 20+ times, verify highlighting works every time

### Tests for User Story 4

> **TDD: Write these tests FIRST, ensure they FAIL before implementation (highlighting will fail on 2nd+ visit)**

- [ ] T041 [P] [US4] Integration test for syntax highlighting persistence in tests/integration/syntax-highlighting.test.tsx
- [ ] T042 [P] [US4] Integration test: Navigate to Scripts tab 20 times, verify highlighting each time
- [ ] T043 [P] [US4] Unit test for useSyntaxHighlight hook (if extracting) in tests/unit/useSyntaxHighlight.test.ts

### Implementation for User Story 4

- [ ] T044 [US4] Read ScriptsTab.tsx current implementation (lines 44-51)
- [ ] T045 [US4] Read ReferencesTab.tsx to see working rehype-highlight approach (reference example)
- [ ] T046 [US4] Remove buggy useEffect with hljs.highlightAll() from ScriptsTab.tsx
- [ ] T047 [US4] Remove highlightedCode state from ScriptsTab.tsx
- [ ] T048 [US4] Replace with ReactMarkdown component using rehype-highlight plugin
- [ ] T049 [US4] Format script content as markdown code block: ```python\n{content}\n```
- [ ] T050 [US4] Test highlighting works on first visit
- [ ] T051 [US4] Test highlighting works on 20 consecutive visits (run integration test)
- [ ] T052 [US4] Manual testing: Navigate between tabs multiple times, verify highlighting persists

**Checkpoint**: Syntax highlighting should work reliably on every visit. Story 4 is independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T053 [P] Run full E2E test suite (npm run test:e2e)
- [ ] T054 [P] Run unit test suite with coverage (npm run test:coverage)
- [ ] T055 Verify >80% test coverage for modified files (OverviewTab, SkillList, ScriptsTab)
- [ ] T056 [P] Manual cross-platform testing: macOS (if available)
- [ ] T057 [P] Manual cross-platform testing: Linux (if available)
- [ ] T058 [P] Manual cross-platform testing: Windows (if available)
- [ ] T059 Performance check: Verify 60fps rendering with React DevTools Profiler
- [ ] T060 [P] Accessibility audit: Run Playwright axe tests (no new violations)
- [ ] T061 Update CHANGELOG.md with user-visible improvements
- [ ] T062 [P] Update quickstart.md if any setup steps changed
- [ ] T063 Code cleanup: Remove unused imports and commented code
- [ ] T064 Final visual inspection: Check all tabs for consistent spacing and polish

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if multiple developers)
  - Or sequentially in priority order: US1 (P1) → US4 (P2) → US2 (P2) → US3 (P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Spacing)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2 - Overview Order)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P3 - Text Truncation)**: Can start after Foundational - Should do after US1 (spacing) for visual consistency
- **User Story 4 (P2 - Syntax Highlighting)**: Can start after Foundational - No dependencies on other stories

**Recommended Order**: US1 → US4 → US2 → US3 (by priority and visual impact)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD workflow)
- Multiple component updates within a story can be done in parallel (marked with [P])
- Manual testing comes after all implementation tasks for that story
- Story must be independently testable before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T003 can all run in parallel

**Phase 2 (Foundational)**:
- T004, T005, T006, T007 can all run in parallel (reading different files)

**Phase 3 (User Story 1 - Spacing)**:
- Tests T008, T009 can run in parallel
- Component updates T010-T016 can ALL run in parallel (different files)

**Phase 4 (User Story 2 - Overview Order)**:
- Tests T019, T020, T021 can run in parallel
- T023-T026 are sequential (same file modifications)

**Phase 5 (User Story 3 - Text Truncation)**:
- Tests T029, T030, T031 can run in parallel
- Component updates T032-T037 can ALL run in parallel (different files)

**Phase 6 (User Story 4 - Syntax Highlighting)**:
- Tests T041, T042, T043 can run in parallel
- T044-T049 are sequential (same file modifications)

**Phase 7 (Polish)**:
- T053, T054, T056-T058, T060, T062 can run in parallel

**Multiple User Stories in Parallel**:
- Once Foundational completes, ALL user stories (US1, US2, US3, US4) can be worked on simultaneously by different developers

---

## Parallel Example: User Story 1 (Spacing)

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for margin spacing validation in tests/unit/spacing.test.tsx"
Task: "E2E visual regression test for margins in tests/e2e/ui-polish.spec.ts"

# Launch all component updates for User Story 1 together:
Task: "Update OverviewTab.tsx: Change container padding from p-4 to p-6"
Task: "Update SkillList.tsx: Change list item padding from p-3 to px-4 py-3"
Task: "Update ScriptsTab.tsx: Change container padding from p-4 to p-6"
Task: "Update ReferencesTab.tsx: Change container padding from p-4 to p-6"
Task: "Update SearchBar.tsx: Add proper padding/margins if needed"
Task: "Update SkillViewer.tsx: Ensure tab containers have consistent spacing"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - read all existing code first)
3. Complete Phase 3: User Story 1 (Spacing) - Most critical usability issue
4. **STOP and VALIDATE**: Test spacing improvements independently
5. Deploy/demo if ready - users immediately see improved readability

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Codebase understanding ready
2. Add User Story 1 (Spacing) → Test independently → Deploy/Demo ✅ (MVP - Immediate visual improvement)
3. Add User Story 4 (Syntax Highlighting) → Test independently → Deploy/Demo ✅ (High priority, different files)
4. Add User Story 2 (Overview Order) → Test independently → Deploy/Demo ✅ (Improves information architecture)
5. Add User Story 3 (Text Truncation) → Test independently → Deploy/Demo ✅ (Polish refinement)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 2-4 developers:

1. Team completes Setup + Foundational together (read all code)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Spacing) - Highest priority
   - **Developer B**: User Story 4 (Syntax Highlighting) - Different files, no conflicts
   - **Developer C**: User Story 2 (Overview Order) - Can start in parallel
   - **Developer D**: User Story 3 (Text Truncation) - Can start in parallel
3. Stories complete and integrate independently
4. Each developer owns their story's tests and implementation

---

## Task Statistics

- **Total Tasks**: 64
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 4 tasks (blocking)
- **User Story 1 (P1 - Spacing)**: 11 tasks (2 tests + 9 implementation)
- **User Story 2 (P2 - Overview)**: 10 tasks (3 tests + 7 implementation)
- **User Story 3 (P3 - Truncation)**: 12 tasks (3 tests + 9 implementation)
- **User Story 4 (P2 - Highlighting)**: 12 tasks (3 tests + 9 implementation)
- **Polish Phase**: 12 tasks

**Parallelizable Tasks**: 35 tasks marked [P] (55% can run in parallel)

**Test Coverage**: 11 test tasks ensuring >80% coverage per Constitution Principle VII

**Independent Stories**: All 4 user stories can be tested and deployed independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story is independently completable and testable
- TDD workflow: Tests written FIRST, must FAIL before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution Principle VII: >80% test coverage REQUIRED for all modified files
- Use `npm run dev` frequently to visually verify changes
- Use `npm run test:e2e` to catch visual regressions
- Avoid: vague tasks, same file conflicts (only T023-T026 sequential)

---

## Success Validation Checklist

After completing all tasks:

- [ ] SC-001: All text has minimum 8px margins (verified by visual tests) ✅
- [ ] SC-002: Overview order correct with zero duplicates (verified by unit tests) ✅
- [ ] SC-003: Text truncation works for 50, 100, 200 character names (verified by E2E) ✅
- [ ] SC-004: Syntax highlighting 100% reliable (verified by 20-iteration test) ✅
- [ ] SC-005: User satisfaction improvement (manual testing feedback) ✅
- [ ] SC-006: Zero layout breaks with edge cases (verified by E2E edge case suite) ✅
- [ ] Test coverage >80% for OverviewTab.tsx, SkillList.tsx, ScriptsTab.tsx ✅
- [ ] No accessibility regressions (Playwright axe tests pass) ✅
- [ ] Performance maintained: 60fps rendering (React DevTools Profiler) ✅
- [ ] Cross-platform validation complete (macOS, Linux, Windows) ✅
