# Implementation Tasks: Test Backfill - Critical Paths

**Feature**: 020-test-backfill-critical-paths
**Branch**: `020-test-backfill-critical-paths`
**Status**: Ready for Implementation
**Generated**: 2025-11-17

## Overview

This feature backfills comprehensive unit tests for critical code paths to achieve >80% test coverage and satisfy constitutional Principle VII requirements. Organized by user story for independent, incremental delivery.

**Target Coverage**:

- Skill Scanner (Rust): >80% line coverage
- YAML Parser (Rust): >80% line coverage
- useSkillStore (Zustand): 100% line coverage
- SkillList (React): >90% line coverage

**Test Approach**: Backfill tests for existing implementations (TDD-modified workflow)

---

## Phase 1: Setup (Infrastructure)

**Goal**: Install coverage tools and verify test configuration

- [ ] T001 Install cargo-llvm-cov for Rust coverage: `cargo install cargo-llvm-cov`
- [ ] T002 Verify Vitest frontend test configuration in `vitest.config.ts`
- [ ] T003 [P] Verify tempfile crate in `src-tauri/Cargo.toml` dev-dependencies
- [ ] T004 [P] Create test fixtures directory structure: `mkdir -p tests/fixtures/skills`
- [ ] T005 Add reset() action to useSkillStore in `src/stores/useSkillStore.ts`

**Completion Criteria**: Coverage tools installed, test infrastructure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Create reusable test utilities and mock data

- [ ] T006 [P] Create mock skill data in `tests/fixtures/mockSkills.ts`
- [ ] T007 [P] Create test skill fixtures in `tests/fixtures/skills/valid-skill/SKILL.md`
- [ ] T008 [P] Create malformed YAML fixture in `tests/fixtures/skills/malformed-yaml/SKILL.md`
- [ ] T009 [P] Create empty frontmatter fixture in `tests/fixtures/skills/empty-frontmatter/SKILL.md`

**Completion Criteria**: Test fixtures and mock data available for all test modules

**Parallel Opportunity**: All tasks in this phase can run concurrently (different files)

---

## Phase 3: User Story 1 - Skill Scanner Test Coverage (P1)

**Story Goal**: Comprehensive tests for Rust skill scanner module (directory traversal, file discovery, error handling)

**Independent Test**: Run `cargo test` in `src-tauri/` directory. All 6 acceptance scenarios pass. Coverage >80% for `src-tauri/src/commands/skill_scanner.rs`.

### Setup

- [ ] T010 [US1] Add #[cfg(test)] module to end of `src-tauri/src/commands/skill_scanner.rs`
- [ ] T011 [US1] Create helper function create_test_skill_fixture() in `src-tauri/src/commands/skill_scanner.rs`

### Test Implementation (6 Scenarios)

- [ ] T012 [US1] Test: scan valid skills in ~/.claude/skills in `src-tauri/src/commands/skill_scanner.rs`
- [ ] T013 [US1] Test: scan skills in ~/.config/opencode/skills in `src-tauri/src/commands/skill_scanner.rs`
- [ ] T014 [US1] Test: handle non-existent directory gracefully in `src-tauri/src/commands/skill_scanner.rs`
- [ ] T015 [US1] Test: handle permission errors and log appropriately in `src-tauri/src/commands/skill_scanner.rs`
- [ ] T016 [US1] Test: isolate errors for malformed SKILL.md files in `src-tauri/src/commands/skill_scanner.rs`
- [ ] T017 [US1] Test: recursively discover nested skill directories in `src-tauri/src/commands/skill_scanner.rs`

### Verification

- [ ] T018 [US1] Run `cargo test` and verify all skill_scanner tests pass
- [ ] T019 [US1] Generate coverage report: `cargo llvm-cov --html` for skill_scanner module
- [ ] T020 [US1] Verify >80% line coverage for skill_scanner.rs

**Story Completion Criteria**:

- ✅ All 6 test scenarios pass
- ✅ Coverage >80% for skill_scanner.rs
- ✅ Tests run in <1.5 seconds
- ✅ Zero flaky test failures

**Parallel Opportunities**: T012-T017 can be written concurrently (same file, different test functions)

---

## Phase 4: User Story 2 - YAML Parser Test Coverage (P1)

**Story Goal**: Comprehensive tests for Rust YAML frontmatter parser (extraction, error handling, edge cases)

**Independent Test**: Run `cargo test` in `src-tauri/` directory. All 7 acceptance scenarios pass. Coverage >80% for `src-tauri/src/utils/yaml_parser.rs`.

### Setup

- [ ] T021 [US2] Add #[cfg(test)] module to end of `src-tauri/src/utils/yaml_parser.rs`
- [ ] T022 [US2] Create helper function create_yaml_test_content() in `src-tauri/src/utils/yaml_parser.rs`

### Test Implementation (7 Scenarios)

- [ ] T023 [US2] Test: extract valid YAML frontmatter correctly in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T024 [US2] Test: handle missing opening delimiter (---) in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T025 [US2] Test: handle missing closing delimiter in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T026 [US2] Test: catch and log invalid YAML syntax errors in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T027 [US2] Test: handle empty frontmatter without crashing in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T028 [US2] Test: correctly decode UTF-8 characters in frontmatter in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T029 [US2] Test: parse various data types (arrays, objects, booleans) in `src-tauri/src/utils/yaml_parser.rs`

### Edge Cases

- [ ] T030 [US2] Test: handle UTF-8 BOM encoded files in `src-tauri/src/utils/yaml_parser.rs`
- [ ] T031 [US2] Test: handle extremely large frontmatter (>10KB) in `src-tauri/src/utils/yaml_parser.rs`

### Verification

- [ ] T032 [US2] Run `cargo test` and verify all yaml_parser tests pass
- [ ] T033 [US2] Generate coverage report: `cargo llvm-cov --html` for yaml_parser module
- [ ] T034 [US2] Verify >80% line coverage for yaml_parser.rs

**Story Completion Criteria**:

- ✅ All 7 test scenarios + 2 edge cases pass
- ✅ Coverage >80% for yaml_parser.rs
- ✅ Tests run in <1.5 seconds
- ✅ Zero flaky test failures

**Parallel Opportunities**: T023-T031 can be written concurrently (same file, different test functions)

---

## Phase 5: User Story 3 - Zustand Store Test Coverage (P1)

**Story Goal**: Comprehensive tests for Zustand useSkillStore (state management, actions, selectors, immutability)

**Independent Test**: Run `npm test useSkillStore` in project root. All 6 acceptance scenarios pass. Coverage 100% for `src/stores/useSkillStore.ts`.

### Setup

- [ ] T035 [US3] Create test file `tests/unit/stores/useSkillStore.test.ts`
- [ ] T036 [US3] Import renderHook, act from @testing-library/react in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T037 [US3] Add beforeEach() with store reset in `tests/unit/stores/useSkillStore.test.ts`

### Test Implementation - Initial State

- [ ] T038 [US3] Test: store initializes with null selectedSkill in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T039 [US3] Test: store initializes with empty skills array in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T040 [US3] Test: store initializes with default search filters in `tests/unit/stores/useSkillStore.test.ts`

### Test Implementation - Actions

- [ ] T041 [US3] Test: selectSkill updates state with valid skill in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T042 [US3] Test: selectSkill with null clears selection in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T043 [US3] Test: setSkills replaces skills array in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T044 [US3] Test: setSearchFilters merges partial filters in `tests/unit/stores/useSkillStore.test.ts`

### Test Implementation - Immutability

- [ ] T045 [US3] Test: setSkills creates new array reference (not.toBe) in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T046 [US3] Test: setSearchFilters creates new object reference in `tests/unit/stores/useSkillStore.test.ts`

### Test Implementation - Selectors

- [ ] T047 [US3] Test: getFilteredSkills filters by location in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T048 [US3] Test: getFilteredSkills filters by tags in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T049 [US3] Test: getFilteredSkills filters by search query in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T050 [US3] Test: getAvailableTags returns unique sorted tags in `tests/unit/stores/useSkillStore.test.ts`
- [ ] T051 [US3] Test: getLocationCounts counts skills by location in `tests/unit/stores/useSkillStore.test.ts`

### Verification

- [ ] T052 [US3] Run `npm test useSkillStore` and verify all tests pass
- [ ] T053 [US3] Generate coverage: `npm run test:coverage` and check useSkillStore coverage
- [ ] T054 [US3] Verify 100% line coverage for useSkillStore.ts

**Story Completion Criteria**:

- ✅ All 6 acceptance scenarios pass (15 total tests)
- ✅ Coverage 100% for useSkillStore.ts
- ✅ Tests run in <1 second
- ✅ Zero flaky test failures

**Parallel Opportunities**: T038-T051 can be written concurrently (same file, different test functions)

---

## Phase 6: User Story 4 - SkillList Component Test Coverage (P2)

**Story Goal**: Comprehensive tests for SkillList React component (rendering, selection, keyboard nav, accessibility)

**Independent Test**: Run `npm test SkillList` in project root. All 7 acceptance scenarios pass. Coverage >90% for `src/components/SkillList.tsx`.

### Setup

- [ ] T055 [US4] Create test file `tests/unit/components/SkillList.test.tsx`
- [ ] T056 [US4] Import render, screen, userEvent from testing libraries in `tests/unit/components/SkillList.test.tsx`
- [ ] T057 [US4] Setup vi.mock() for useSkillStore in `tests/unit/components/SkillList.test.tsx`
- [ ] T058 [US4] Create beforeEach() to reset mocks in `tests/unit/components/SkillList.test.tsx`

### Test Implementation - Rendering

- [ ] T059 [US4] Test: render empty state message when skills array empty in `tests/unit/components/SkillList.test.tsx`
- [ ] T060 [US4] Test: render 5 skill items when skills array has 5 in `tests/unit/components/SkillList.test.tsx`

### Test Implementation - User Interaction

- [ ] T061 [US4] Test: clicking skill dispatches selectSkill action in `tests/unit/components/SkillList.test.tsx`
- [ ] T062 [US4] Test: Down arrow highlights next skill in `tests/unit/components/SkillList.test.tsx`
- [ ] T063 [US4] Test: Enter key selects highlighted skill in `tests/unit/components/SkillList.test.tsx`

### Test Implementation - Filtering & States

- [ ] T064 [US4] Test: search filter shows only matching skills in `tests/unit/components/SkillList.test.tsx`
- [ ] T065 [US4] Test: loading spinner displays when isLoading true in `tests/unit/components/SkillList.test.tsx`
- [ ] T066 [US4] Test: error message displays when error set in `tests/unit/components/SkillList.test.tsx`

### Test Implementation - Accessibility

- [ ] T067 [US4] Test: listbox has correct ARIA attributes in `tests/unit/components/SkillList.test.tsx`
- [ ] T068 [US4] Test: skill items have aria-selected attributes in `tests/unit/components/SkillList.test.tsx`
- [ ] T069 [US4] Test: no accessibility violations with vitest-axe in `tests/unit/components/SkillList.test.tsx`

### Verification

- [ ] T070 [US4] Run `npm test SkillList` and verify all tests pass
- [ ] T071 [US4] Generate coverage: `npm run test:coverage` and check SkillList coverage
- [ ] T072 [US4] Verify >90% line coverage for SkillList.tsx

**Story Completion Criteria**:

- ✅ All 7 acceptance scenarios pass (14 total tests)
- ✅ Coverage >90% for SkillList.tsx
- ✅ Tests run in <1 second
- ✅ Zero flaky test failures
- ✅ Zero accessibility violations (vitest-axe)

**Parallel Opportunities**: T059-T069 can be written concurrently (same file, different test functions)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final validation, documentation, CI/CD integration

### Coverage Validation

- [ ] T073 Run complete backend test suite: `cd src-tauri && cargo test`
- [ ] T074 Generate backend coverage report: `cargo llvm-cov --all-features --workspace --html`
- [ ] T075 Verify backend coverage thresholds: `cargo llvm-cov --fail-under-lines 80`
- [ ] T076 Run complete frontend test suite: `npm test`
- [ ] T077 Generate frontend coverage report: `npm run test:coverage`
- [ ] T078 Verify all coverage thresholds met (80%/100%/90%)

### Performance Validation

- [ ] T079 Measure backend test execution time (must be <3 seconds)
- [ ] T080 Measure frontend test execution time (must be <2 seconds)
- [ ] T081 Run tests 10 times to verify zero flaky failures

### Documentation

- [ ] T082 Update CLAUDE.md with test coverage information
- [ ] T083 [P] Add test coverage badges to README.md (optional)
- [ ] T084 [P] Document test execution in quickstart.md (already done)

### Taskfile Integration

- [ ] T085 Add test:coverage:backend task to Taskfile.yml
- [ ] T086 Add test:coverage:backend:check task to Taskfile.yml
- [ ] T087 Update ci task to include coverage checks in Taskfile.yml

**Phase Completion Criteria**:

- ✅ All coverage targets achieved
- ✅ Performance goals met (<5s total)
- ✅ Zero flaky test failures
- ✅ Documentation updated

---

## Dependencies & Execution Order

### Story Dependencies

```
Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phases 3-6) → Polish (Phase 7)
                                                ↓
                                      US1 (P1) ←→ US2 (P1) ←→ US3 (P1) ←→ US4 (P2)
                                      (Independent - can run in parallel)
```

**Story Independence**:

- ✅ US1 (Skill Scanner): Independent - Rust backend only
- ✅ US2 (YAML Parser): Independent - Rust backend only
- ✅ US3 (Zustand Store): Independent - Frontend only
- ✅ US4 (SkillList): Depends on US3 (needs mock store patterns)

**Recommended Order**:

1. Setup + Foundational (Phases 1-2)
2. US1 + US2 + US3 in parallel (Phases 3-5)
3. US4 (Phase 6) - benefits from US3 patterns
4. Polish (Phase 7)

### Task Dependencies Within Phases

- **Phase 1**: T001 blocks T019/T033/T075 (coverage tool needed)
- **Phase 2**: All tasks independent (parallel execution)
- **Phase 3-6**: Setup tasks (T010-T011, T021-T022, T035-T037, T055-T058) block test tasks
- **Phase 7**: T073-T078 block T079-T081 (need tests to measure performance)

---

## Parallel Execution Examples

### Phase 2: Foundational (All Parallel)

```bash
# Terminal 1
touch tests/fixtures/mockSkills.ts  # T006

# Terminal 2
mkdir -p tests/fixtures/skills/valid-skill && echo "# Test" > tests/fixtures/skills/valid-skill/SKILL.md  # T007

# Terminal 3
mkdir -p tests/fixtures/skills/malformed-yaml && echo "---\ninvalid" > tests/fixtures/skills/malformed-yaml/SKILL.md  # T008

# Terminal 4
mkdir -p tests/fixtures/skills/empty-frontmatter && echo "---\n---" > tests/fixtures/skills/empty-frontmatter/SKILL.md  # T009
```

### Phases 3-5: User Stories (Parallel Execution)

```bash
# Terminal 1: US1 - Skill Scanner (Rust)
cd src-tauri && cargo test skill_scanner

# Terminal 2: US2 - YAML Parser (Rust)
cd src-tauri && cargo test yaml_parser

# Terminal 3: US3 - Zustand Store (Frontend)
npm test useSkillStore
```

### Within a Story: Test Functions (Parallel Writing)

```bash
# Multiple developers can write different test functions concurrently
# Example: US3 - Zustand Store

# Developer 1: T038-T040 (initial state tests)
# Developer 2: T041-T044 (action tests)
# Developer 3: T045-T046 (immutability tests)
# Developer 4: T047-T051 (selector tests)
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Target**: User Story 1 Only (Skill Scanner)

- Tasks: T001-T020 (20 tasks)
- Deliverable: >80% coverage for skill_scanner.rs
- Value: Tests core backend functionality
- Timeline: 2-3 hours

### Incremental Delivery

1. **MVP**: US1 (Skill Scanner) - 20 tasks
2. **v0.2.1**: US1 + US2 (Scanner + Parser) - 34 tasks
3. **v0.2.2**: US1 + US2 + US3 (Backend + Store) - 54 tasks
4. **v0.2.0**: All stories + Polish - 87 tasks

### TDD Workflow (Modified for Backfill)

1. **Understand**: Read existing implementation
2. **Red**: Write test for existing behavior (may pass immediately)
3. **Green**: Verify test passes (code already exists)
4. **Refactor** (optional): Improve code with tests as safety net
5. **Repeat**: Next test scenario

If bugs found:

1. **Red**: Write failing test demonstrating bug
2. **Green**: Fix bug until test passes
3. **Refactor**: Clean up fix

---

## Progress Tracking

### Task Status Legend

- `[ ]` Not started
- `[~]` In progress or simplified (add note)
- `[x]` Completed

### Coverage Progress

| Module           | Target | Current | Status |
| ---------------- | ------ | ------- | ------ |
| skill_scanner.rs | >80%   | TBD     | ⏳     |
| yaml_parser.rs   | >80%   | TBD     | ⏳     |
| useSkillStore.ts | 100%   | TBD     | ⏳     |
| SkillList.tsx    | >90%   | TBD     | ⏳     |

### Phase Completion

- [ ] Phase 1: Setup (5 tasks)
- [ ] Phase 2: Foundational (4 tasks)
- [ ] Phase 3: US1 - Skill Scanner (11 tasks)
- [ ] Phase 4: US2 - YAML Parser (14 tasks)
- [ ] Phase 5: US3 - Zustand Store (20 tasks)
- [ ] Phase 6: US4 - SkillList (18 tasks)
- [ ] Phase 7: Polish (15 tasks)

**Total Tasks**: 87

---

## Success Criteria

✅ **All user stories independently testable**
✅ **Coverage targets achieved** (>80% / 100% / >90%)
✅ **Performance goals met** (<5s total execution)
✅ **Zero flaky test failures**
✅ **Constitutional Principle VII compliance**
✅ **Tests run on all platforms** (macOS, Linux, Windows)

---

## Notes

- This is a **backfill feature** - tests added to existing code
- No breaking changes to production code allowed
- Tests must adapt to current implementation
- If bugs found: treat as features (write failing test, then fix)
- Priority: P1 stories before P2 (US1, US2, US3 before US4)
- Each story delivers independent value (can be deployed separately)
