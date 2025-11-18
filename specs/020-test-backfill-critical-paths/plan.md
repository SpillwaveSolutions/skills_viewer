# Implementation Plan: Test Backfill - Critical Paths

**Branch**: `020-test-backfill-critical-paths` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-test-backfill-critical-paths/spec.md`

## Summary

Backfill comprehensive unit tests for four critical code paths to achieve >80% test coverage and satisfy constitutional Principle VII requirements. This feature targets (1) Rust backend skill scanner module for directory traversal and file discovery, (2) Rust YAML parser for frontmatter extraction with error handling, (3) Zustand useSkillStore for state management and immutability, and (4) React SkillList component for rendering and user interaction. Technical approach uses existing Vitest 2.1.8 for frontend testing with React Testing Library, cargo test for Rust backend with temporary test fixtures, and follows TDD patterns established in Feature 019. All tests must run in under 5 seconds total with zero flaky failures.

## Technical Context

**Language/Version**: Rust 1.75+ (backend), TypeScript 5.8.3 strict mode (frontend), React 19.1.0
**Primary Dependencies**:

- Backend: serde_yaml 0.9, serde_json 1.0 (already in use)
- Frontend: Vitest 2.1.8, @testing-library/react 16.1.0, @testing-library/user-event 14.5.2, happy-dom (already configured)
- State: Zustand 5.0.8

**Storage**: Test fixtures created in temporary directories (backend) and in-memory mocks (frontend)
**Testing**:

- Frontend: Vitest with V8 coverage provider (configured with 80% thresholds)
- Backend: cargo test with standard Rust test framework
- Coverage: `npm run test:coverage` for frontend, `cargo tarpaulin` or `cargo llvm-cov` for backend (to be verified)

**Target Platform**: Desktop (macOS, Linux, Windows via Tauri 2.x)
**Project Type**: Single desktop application (Tauri hybrid: Rust backend + React frontend)
**Performance Goals**:

- Backend tests: <3 seconds total execution time
- Frontend tests: <2 seconds total execution time
- Zero flaky tests (100% reliability)
- Coverage targets: >80% for scanner/parser, 100% for store, >90% for SkillList

**Constraints**:

- No breaking changes to existing modules (tests must adapt to current implementation)
- Tests must run on all platforms without platform-specific mocks
- Must use existing test infrastructure (no new test frameworks)
- Cannot modify production code except to export private functions for testing (if necessary)
- Test fixtures must be self-contained and cleanup after execution

**Scale/Scope**:

- ~26 test scenarios across 4 modules
- Estimated 200-300 LOC of test code
- 4 new test files (skill_scanner tests, yaml_parser tests, useSkillStore.test.ts, SkillList.test.tsx)
- Expected 40-50 tasks in tasks.md

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle VII: Testability and Quality

**Requirement**: All core logic must have >80% coverage, UI components must have integration tests

**Status**: ✅ **PASS** - This feature directly addresses Principle VII

**Justification**:

- **Primary Goal**: Achieve >80% coverage for skill scanner, YAML parser (backend)
- **Store Coverage**: Target 100% coverage for useSkillStore (state management is core logic)
- **Component Coverage**: Target >90% coverage for SkillList (exceeds UI component requirement)
- **Constitutional Compliance**: Feature 020 is specifically designed to remediate Principle VII violations from v0.1.0
- **Quality Standards**: All tests must be deterministic (zero flaky failures), fast (<5s total), and maintainable

### Principle II: Developer-First Design

**Requirement**: Prioritize developer workflows and keyboard navigation

**Status**: ✅ **PASS**

**Justification**:

- Test coverage enables confident refactoring for developers
- SkillList tests include keyboard navigation scenarios (arrow keys, Enter)
- Testing infrastructure established in Feature 019 (keyboard shortcuts) already supports developer-first workflows
- This feature enhances developer experience by providing safety net for code changes

### Principle V: Performance and Efficiency

**Requirement**: UI rendering 60fps, <100ms for interactions

**Status**: ✅ **PASS**

**Justification**:

- Performance goals: <3s backend tests, <2s frontend tests (well within interaction thresholds)
- Fast test execution encourages frequent testing (TDD workflow)
- No performance impact on production code (tests run separately)
- Test suite performance tracked as success criteria (SC-005, SC-006)

**Post-Phase 1 Re-check**: [Will validate after research/design complete - no anticipated issues]

## Project Structure

### Documentation (this feature)

```text
specs/020-test-backfill-critical-paths/
├── plan.md              # This file
├── research.md          # Phase 0: Testing patterns, mocking strategies
├── data-model.md        # Phase 1: Test fixture data model
├── quickstart.md        # Phase 1: Developer testing guide
├── contracts/           # Phase 1: Test interface contracts
│   ├── skill_scanner_tests.rs.contract  # Rust test module contract
│   ├── yaml_parser_tests.rs.contract    # Rust test module contract
│   ├── useSkillStore.test.ts.contract   # TS test file contract
│   └── SkillList.test.tsx.contract      # React component test contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Backend tests (Rust)
src-tauri/src/
├── commands/
│   ├── skill_scanner.rs      # EXISTING - to be tested
│   └── mod.rs
├── utils/
│   ├── yaml_parser.rs        # EXISTING - to be tested
│   └── mod.rs
└── # Tests will be added in same files using #[cfg(test)] modules

# Frontend tests (TypeScript + React)
src/
├── stores/
│   ├── useSkillStore.ts      # EXISTING - to be tested
│   └── __tests__/
│       └── useSkillStore.test.ts  # NEW - to be created
├── components/
│   ├── SkillList.tsx         # EXISTING - to be tested
│   └── __tests__/
│       └── SkillList.test.tsx     # NEW - to be created

tests/
├── unit/
│   ├── stores/
│   │   └── useSkillStore.test.ts  # NEW - comprehensive store tests
│   └── components/
│       └── SkillList.test.tsx     # NEW - component tests
├── fixtures/
│   ├── skills/               # NEW - test skill fixtures
│   │   ├── valid-skill/
│   │   │   └── SKILL.md      # Valid skill with frontmatter
│   │   ├── malformed-yaml/
│   │   │   └── SKILL.md      # Invalid YAML for error testing
│   │   └── empty-frontmatter/
│   │       └── SKILL.md      # Empty frontmatter edge case
│   └── mockSkills.ts         # NEW - TypeScript mock skill data
└── setup.ts                  # EXISTING - Vitest setup file
```

**Structure Decision**: Single desktop application structure. Backend tests will be co-located with source files using Rust's `#[cfg(test)]` convention. Frontend tests will follow existing structure in `tests/unit/` directory with separate `__tests__/` subdirectories for organization. Test fixtures will be isolated in `tests/fixtures/` to avoid polluting source directories.

## Complexity Tracking

**Status**: No constitutional violations - all gates pass.

This feature has zero complexity violations:

- Addresses constitutional requirement (Principle VII: >80% coverage)
- Uses existing test frameworks (no new dependencies)
- Follows established TDD patterns from Feature 019
- No architectural complexity introduced

No justifications needed.

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all technical unknowns for testing Rust backend modules, Zustand stores, and React components with mocking, fixtures, and coverage measurement.

### Research Tasks

1. **Rust Test Fixtures and Temporary Directories**
   - Decision needed: Best practices for creating test skill directories in Rust
   - How to use `std::env::temp_dir()` for temporary test fixtures
   - Cleanup strategies to avoid leftover test files
   - Cross-platform path handling in tests

2. **YAML Parsing Error Testing**
   - Decision needed: How to test error cases in Rust (missing delimiters, invalid syntax)
   - Best practices for asserting on error messages
   - Testing UTF-8 edge cases (BOM, special characters)
   - Mocking file system errors (permission denied)

3. **Zustand Store Testing Patterns**
   - Decision needed: How to test Zustand stores in isolation
   - Mocking vs. real store instances in tests
   - Testing immutability guarantees
   - Testing concurrent state updates
   - Best practices for selector testing

4. **React Component Testing with React Testing Library**
   - Decision needed: Best practices for testing SkillList with user interactions
   - Mocking Zustand store in component tests
   - Simulating keyboard events (arrow keys, Enter)
   - Testing loading and error states
   - Assertions for accessibility (ARIA attributes)

5. **Coverage Measurement for Rust**
   - Decision needed: cargo-tarpaulin vs. cargo-llvm-cov for coverage
   - Coverage thresholds configuration for Rust
   - Integration with CI/CD pipeline
   - Excluding test code from coverage metrics

### Expected Outputs

`research.md` containing:

- **Decision**: Use `tempfile` crate for Rust test fixtures (best practices for cleanup)
- **Decision**: Test YAML errors by asserting on `None` return values and stderr output
- **Decision**: Use real Zustand store instances in tests (avoid over-mocking)
- **Decision**: Use `@testing-library/user-event` for realistic user interactions in SkillList tests
- **Decision**: Use cargo-llvm-cov for Rust coverage (more accurate than tarpaulin, supports modern Rust)
- **Rationale**: For each decision, why chosen over alternatives
- **References**: Links to tempfile docs, React Testing Library best practices, Zustand testing guide, cargo-llvm-cov docs

## Phase 1: Design & Contracts

**Prerequisite**: `research.md` complete

### 1. Data Model (`data-model.md`)

**Test Fixture Entities**:

- **SkillTestFixture** (Rust)
  - `name`: Skill directory name
  - `content`: Full SKILL.md content (with frontmatter)
  - `expected_frontmatter`: Expected JSON after parsing
  - `expected_description`: Expected description text
  - `location`: "claude" or "opencode"

- **YAMLTestCase** (Rust)
  - `input`: YAML string to parse
  - `expected_output`: Optional<Value> (None for error cases)
  - `test_description`: Human-readable description of test case

- **MockSkill** (TypeScript)
  - Same structure as `Skill` type from `src/types.ts`
  - Predefined test data for component tests
  - Array of 10-20 skills for realistic testing

**State Transitions**:

```
Skill Scanner Test Flow:
  Empty Directory → scan_directory() → Empty Vec<Skill>
  Valid Skills → scan_directory() → Populated Vec<Skill>
  Permission Error → scan_directory() → Error logged, continues

YAML Parser Test Flow:
  Valid Frontmatter → extract_frontmatter() → Some(Value)
  Missing Delimiter → extract_frontmatter() → (None, original content)
  Invalid YAML → extract_frontmatter() → (None, content without FM)

Zustand Store Test Flow:
  Initial State → selectSkill(skill) → selectedSkill updated
  Skills Array → setSkills(new) → skills replaced, immutability maintained

SkillList Component Test Flow:
  Empty skills → render → "No skills found" message
  Populated skills → render → Skill items displayed
  Click skill → selectSkill called → State updated
```

### 2. API Contracts (`contracts/`)

**File**: `contracts/skill_scanner_tests.rs.contract`

```rust
/// Test module for skill_scanner.rs
///
/// Test coverage targets:
/// - scan_skills() function: directory discovery, error handling
/// - scan_directory() function: recursive traversal, skill.md detection
/// - load_skill() function: file reading, frontmatter extraction
///
/// Required test scenarios:
/// 1. Scan valid skill directories (both ~/.claude/skills and ~/.config/opencode/skills)
/// 2. Scan non-existent directory (graceful error handling)
/// 3. Scan directory with permission issues (error logged, continues)
/// 4. Scan directory with malformed SKILL.md (error isolated, scanning continues)
/// 5. Scan nested skill directories (recursive traversal)
/// 6. Load skill with valid frontmatter (metadata extracted correctly)
///
/// Fixtures needed:
/// - Temporary directory with test skills
/// - SKILL.md files with various frontmatter scenarios
/// - Invalid/malformed SKILL.md files
///
/// Cleanup:
/// - Remove all temporary directories after tests
/// - Ensure no leftover test files in system temp directory
```

**File**: `contracts/yaml_parser_tests.rs.contract`

```rust
/// Test module for yaml_parser.rs
///
/// Test coverage targets:
/// - extract_frontmatter() function: delimiter detection, YAML parsing
/// - parse_yaml_to_json() function: YAML to JSON conversion, error handling
/// - extract_description() function: first paragraph extraction
///
/// Required test scenarios:
/// 1. Valid YAML frontmatter (all fields parsed correctly)
/// 2. Missing opening delimiter (no frontmatter detected, full content returned)
/// 3. Missing closing delimiter (no frontmatter detected, full content returned)
/// 4. Invalid YAML syntax (parsing error caught, None returned)
/// 5. Empty frontmatter (empty JSON object returned)
/// 6. UTF-8 characters in frontmatter (characters decoded correctly)
/// 7. Frontmatter with various data types (strings, arrays, objects, booleans)
///
/// Test data:
/// - Sample YAML strings with valid/invalid syntax
/// - Edge case frontmatter (very large, special characters, nested objects)
/// - UTF-8 encoded strings with emojis, accented characters, CJK
```

**File**: `contracts/useSkillStore.test.ts.contract`

```typescript
/**
 * Test suite for useSkillStore Zustand store
 *
 * Test coverage targets:
 * - Initial state verification (selectedSkill: null, skills: [])
 * - selectSkill action (updates state correctly)
 * - setSkills action (replaces array, maintains immutability)
 * - Derived selectors (getFilteredSkills, getAvailableTags, getLocationCounts)
 * - Concurrent updates (last write wins, no corruption)
 *
 * Required test scenarios:
 * 1. Store initializes with correct default state
 * 2. selectSkill updates selectedSkill (valid ID)
 * 3. selectSkill with invalid ID (selectedSkill remains null)
 * 4. setSkills replaces skills array
 * 5. setSkills maintains immutability (original array not mutated)
 * 6. Multiple subscribers receive state updates
 * 7. Selectors recompute when state changes
 *
 * Mocking strategy:
 * - Use real Zustand store instances (create() in each test)
 * - Mock skill data defined in tests/fixtures/mockSkills.ts
 * - No external dependencies to mock
 *
 * Assertions:
 * - State shape matches interface
 * - Actions produce expected state changes
 * - Immutability: toBe vs. toEqual for object identity
 */
```

**File**: `contracts/SkillList.test.tsx.contract`

```typescript
/**
 * Test suite for SkillList React component
 *
 * Test coverage targets:
 * - Rendering with empty skills array
 * - Rendering with populated skills array
 * - Skill selection via click
 * - Keyboard navigation (arrow keys, Enter)
 * - Search filtering integration
 * - Loading state rendering
 * - Error state rendering
 *
 * Required test scenarios:
 * 1. Renders empty state message when skills array is empty
 * 2. Renders skill items when skills array has data
 * 3. Clicking a skill dispatches selectSkill action
 * 4. Down arrow highlights next skill (keyboard nav)
 * 5. Enter key selects highlighted skill
 * 6. Search filter shows only matching skills
 * 7. Loading spinner displays when isLoading is true
 * 8. Error message displays when error is set
 *
 * Mocking strategy:
 * - Mock useSkillStore with custom state for each test
 * - Use @testing-library/user-event for user interactions
 * - Mock skill data from tests/fixtures/mockSkills.ts
 *
 * Accessibility checks:
 * - Skill items have proper ARIA roles
 * - Keyboard focus is visible
 * - Error messages announced to screen readers
 */
```

### 3. Quickstart Guide (`quickstart.md`)

**Content**:

- **Developer Setup**: Installing coverage tools (cargo-llvm-cov for backend)
- **Running Tests**: `npm test` (frontend), `cargo test` (backend), `npm run test:coverage` (coverage report)
- **Test File Organization**: Where to find tests, naming conventions
- **Fixture Management**: How to create test fixtures, cleanup strategies
- **Debugging Tests**: Using `test.only()` in Vitest, `cargo test -- test_name` for specific Rust tests
- **Coverage Reports**: Interpreting HTML coverage reports, CI/CD integration
- **Common Issues**: Flaky tests troubleshooting, fixture cleanup failures, platform-specific path issues

### 4. Agent Context Update

After Phase 1 artifacts are generated, run:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `.claude/CLAUDE.md` with:

- Test framework versions (Vitest 2.1.8, cargo test)
- Coverage tools (V8 provider for frontend, cargo-llvm-cov for backend)
- Test coverage targets (>80% for scanner/parser, 100% for store, >90% for SkillList)

## Phase 2: Task Generation

**Note**: This phase is handled by `/speckit.tasks` command, not `/speckit.plan`.

The task list will be generated based on:

- 4 user stories (3 P1, 1 P2 prioritized)
- 26 acceptance scenarios from spec
- 21 functional requirements
- 10 success criteria to validate
- TDD methodology (tests written before any refactoring)

Expected task count: ~45-55 tasks covering:

- **Setup** (5-7 tasks): Verify test configuration, install cargo-llvm-cov, create fixture directories
- **US1: Skill Scanner** (10-12 tasks): Create test module, implement 6 scenarios, achieve >80% coverage
- **US2: YAML Parser** (12-14 tasks): Create test module, implement 7 scenarios with edge cases, achieve >80% coverage
- **US3: Zustand Store** (8-10 tasks): Create test file, implement 6 scenarios, achieve 100% coverage
- **US4: SkillList Component** (10-12 tasks): Create test file, implement 7 scenarios with mocks, achieve >90% coverage
- **Validation** (3-5 tasks): Run coverage reports, verify thresholds, document results

## Implementation Approach

### TDD Workflow

This is a **backfill feature** (tests added to existing code), so TDD workflow is modified:

1. **Understand**: Read existing implementation code (skill_scanner.rs, yaml_parser.rs, etc.)
2. **Red**: Write failing test for existing behavior
3. **Green**: Test should pass immediately (code already exists)
4. **Refactor** (optional): Improve existing code if needed (with tests as safety net)
5. **Repeat**: For each test scenario

**Note**: Traditional TDD (Red → Green → Refactor) applies if any bugs are discovered during testing. In that case:

- Write test that demonstrates the bug (Red)
- Fix the bug (Green)
- Refactor if needed

### Integration Points

**Rust Backend** (`src-tauri/src/`):

- Add `#[cfg(test)]` modules at bottom of `skill_scanner.rs` and `yaml_parser.rs`
- Use `tempfile` crate for test fixtures (add to `[dev-dependencies]` in Cargo.toml)
- Import existing functions with `use super::*;`
- Create helper functions for test fixture setup/cleanup

**Frontend Tests** (`tests/unit/`):

- Create `tests/unit/stores/useSkillStore.test.ts` (move from existing tests/)
- Create `tests/unit/components/SkillList.test.tsx`
- Use `vi.mock()` to mock Zustand store in SkillList tests
- Import mock data from `tests/fixtures/mockSkills.ts`

**Test Fixtures**:

- Create `tests/fixtures/skills/` directory with realistic skill examples
- Create `tests/fixtures/mockSkills.ts` with TypeScript mock data
- Ensure fixtures cover all edge cases (empty frontmatter, malformed YAML, UTF-8, etc.)

### Testing Strategy

**Unit Tests** (skill_scanner, yaml_parser):

- Test functions in isolation
- Mock file system where necessary (temporary directories)
- Assert on return values, error messages (stderr)
- Test edge cases (circular symlinks, permission errors)

**Store Tests** (useSkillStore):

- Test each action independently
- Test derived selectors with various state configurations
- Assert on state immutability (object identity checks)
- Test concurrent updates (rapid setState calls)

**Component Tests** (SkillList):

- Render with mocked store state
- Simulate user interactions (click, keyboard)
- Assert on DOM output (rendered text, ARIA attributes)
- Test loading and error states

**Coverage Measurement**:

- Frontend: `npm run test:coverage` generates HTML report in `coverage/`
- Backend: `cargo llvm-cov` generates HTML report (configure output directory)
- CI/CD: Fail build if coverage drops below thresholds (80%/100%/90%)

## Risk Assessment

### High Risk

None identified. This is low-risk test backfill work.

### Medium Risk

1. **Existing Code May Have Bugs**
   - **Mitigation**: If bugs found during testing, write failing test first, then fix
   - **Approach**: Treat bugs as features (TDD cycle for fixes)

2. **Test Flakiness (Filesystem Operations)**
   - **Mitigation**: Use `tempfile` crate for automatic cleanup, avoid hardcoded paths
   - **Testing**: Run tests 100 times in CI to catch flakiness

### Low Risk

1. **Coverage Tool Setup (cargo-llvm-cov)**
   - **Mitigation**: Document installation steps in quickstart.md
   - **Fallback**: Use cargo-tarpaulin if llvm-cov unavailable

2. **Mocking Zustand Store in Component Tests**
   - **Mitigation**: Follow established patterns from Feature 019 tests
   - **Testing**: Verify mocks in isolation before component tests

## Success Validation

After implementation, validate against spec's 10 success criteria:

- **SC-001**: Skill scanner module >80% coverage ✅ (run `cargo llvm-cov --html`)
- **SC-002**: YAML parser module >80% coverage ✅ (run `cargo llvm-cov --html`)
- **SC-003**: useSkillStore 100% coverage ✅ (run `npm run test:coverage`)
- **SC-004**: SkillList >90% coverage ✅ (run `npm run test:coverage`)
- **SC-005**: Backend tests <3 seconds ✅ (measure with `cargo test --release`)
- **SC-006**: Frontend tests <2 seconds ✅ (measure with `npm test --run`)
- **SC-007**: Zero flaky failures ✅ (run tests 100 times in CI)
- **SC-008**: Principle VII compliance ✅ (all coverage targets met)
- **SC-009**: Edge cases covered ✅ (26 scenarios implemented)
- **SC-010**: Simple test commands ✅ (`npm test`, `cargo test`)

## Next Steps

1. ✅ `/speckit.specify` - Specification complete
2. ✅ `/speckit.plan` - This document
3. ⏭️ **Phase 0**: Generate `research.md` (in progress)
4. ⏭️ **Phase 1**: Generate `data-model.md`, `contracts/`, `quickstart.md`
5. ⏭️ **Phase 1**: Run agent context update script
6. ⏭️ **Phase 1**: Re-check Constitutional compliance (expected PASS)
7. ⏭️ `/speckit.tasks` - Generate task breakdown
8. ⏭️ `/speckit.analyze` - Validate artifact consistency
9. ⏭️ `/speckit.implement` - Execute tasks with TDD

**Current Status**: Ready for Phase 0 research generation (next step in this command).
