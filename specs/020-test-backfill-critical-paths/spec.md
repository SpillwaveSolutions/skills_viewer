# Feature Specification: Test Backfill - Critical Paths

**Feature Branch**: `020-test-backfill-critical-paths`
**Created**: 2025-11-17
**Status**: Draft
**Input**: User description: "Feature 020: Test Backfill - Critical Paths - Backfill unit tests for critical backend and frontend paths to achieve >80% coverage and satisfy constitutional requirements"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Skill Scanner Test Coverage (Priority: P1)

As a developer contributing to Skill Debugger, I want comprehensive unit tests for the skill scanner module so that I can confidently make changes without breaking core directory scanning functionality.

**Why this priority**: The skill scanner is the foundation of the entire application. Without reliable tests for directory scanning, file discovery, and error handling, any refactoring or feature addition risks breaking the primary workflow. This is P1 because it tests the absolute core of the application.

**Independent Test**: Can be fully tested by running `cargo test` in the Rust backend. Tests verify directory traversal, skill.md discovery, error handling for missing directories and permission issues, and delivers confidence that the scanner works across different filesystem scenarios.

**Acceptance Scenarios**:

1. **Given** user has skills in ~/.claude/skills, **When** skill scanner runs, **Then** all skill.md files are discovered
2. **Given** user has skills in ~/.config/opencode/skills, **When** skill scanner runs, **Then** all skill.md files are discovered from alternate location
3. **Given** skill directory does not exist, **When** skill scanner runs, **Then** error is handled gracefully and empty result returned
4. **Given** skill directory has permission issues, **When** skill scanner attempts to read, **Then** permission error is caught and logged
5. **Given** skill.md file is malformed, **When** skill scanner processes it, **Then** error is isolated to that file and scanning continues
6. **Given** nested skill directories exist, **When** scanner traverses recursively, **Then** all nested skill.md files are discovered

---

### User Story 2 - YAML Parser Test Coverage (Priority: P1)

As a developer working on skill parsing, I want comprehensive unit tests for the YAML frontmatter parser so that I can trust that skill metadata extraction is robust and handles edge cases correctly.

**Why this priority**: YAML parsing is critical for extracting skill metadata (name, description, triggers). Malformed YAML can crash the parser or produce incorrect results. This is P1 because it's directly in the critical path of loading skills.

**Independent Test**: Can be fully tested by running `cargo test` targeting the YAML parser module. Tests verify frontmatter extraction, malformed YAML handling, empty frontmatter, various data types, and UTF-8 character support.

**Acceptance Scenarios**:

1. **Given** skill.md has valid YAML frontmatter, **When** parser extracts metadata, **Then** all fields are correctly parsed
2. **Given** skill.md has missing opening delimiter (---), **When** parser attempts extraction, **Then** error is handled and default metadata returned
3. **Given** skill.md has missing closing delimiter, **When** parser attempts extraction, **Then** error is handled gracefully
4. **Given** skill.md has invalid YAML syntax, **When** parser attempts extraction, **Then** parsing error is caught and logged
5. **Given** skill.md has empty frontmatter (--- ---), **When** parser extracts, **Then** empty object is returned without crashing
6. **Given** skill.md has UTF-8 characters in frontmatter, **When** parser extracts, **Then** characters are correctly decoded
7. **Given** frontmatter contains arrays, objects, booleans, **When** parser extracts, **Then** all data types are correctly parsed

---

### User Story 3 - Zustand Store Test Coverage (Priority: P1)

As a frontend developer, I want comprehensive unit tests for the Zustand skill store so that I can rely on state management behavior and prevent regression bugs in skill selection logic.

**Why this priority**: The Zustand store manages the core application state (selected skill, skills array). Bugs in state management can cause the entire UI to behave incorrectly. This is P1 because state management is foundational to the React frontend.

**Independent Test**: Can be fully tested by running `npm test` targeting the useSkillStore tests. Tests verify initial state, selectSkill/setSkills actions, derived selectors, immutability, and concurrent update scenarios.

**Acceptance Scenarios**:

1. **Given** store is initialized, **When** checked, **Then** selectedSkill is null and skills array is empty
2. **Given** skills array is populated, **When** selectSkill is called with valid ID, **Then** selectedSkill is updated
3. **Given** selectSkill is called with invalid ID, **When** action fires, **Then** selectedSkill remains null
4. **Given** skills array exists, **When** setSkills is called with new array, **Then** skills are replaced and immutability is maintained
5. **Given** multiple tabs are subscribed to store, **When** selectSkill is called, **Then** all subscribers receive updated state
6. **Given** store has derived selectors, **When** state changes, **Then** selectors recompute correctly

---

### User Story 4 - SkillList Component Test Coverage (Priority: P2)

As a UI developer, I want comprehensive component tests for SkillList so that I can confidently modify the UI without breaking rendering, selection, keyboard navigation, or search filtering.

**Why this priority**: SkillList is a critical UI component but less foundational than the backend scanner and parser. It's P2 because while important for user experience, UI bugs are less catastrophic than backend data pipeline failures.

**Independent Test**: Can be fully tested by running `npm test` targeting SkillList component tests using React Testing Library. Tests verify rendering with empty/populated arrays, click selection, keyboard navigation, search filtering, and loading/error states.

**Acceptance Scenarios**:

1. **Given** skills array is empty, **When** SkillList renders, **Then** empty state message is displayed
2. **Given** skills array has 5 skills, **When** SkillList renders, **Then** 5 skill items are displayed
3. **Given** SkillList is rendered, **When** user clicks a skill, **Then** selectSkill action is dispatched with correct ID
4. **Given** SkillList has focus, **When** user presses Down arrow, **Then** next skill is highlighted
5. **Given** search filter is "react", **When** SkillList renders, **Then** only skills matching "react" are displayed
6. **Given** loading state is true, **When** SkillList renders, **Then** loading spinner is displayed
7. **Given** error state is set, **When** SkillList renders, **Then** error message is displayed

---

### Edge Cases

- What happens when skill scanner encounters a circular symlink? (Should detect and skip to prevent infinite loop)
- How does YAML parser handle extremely large frontmatter (>10KB)? (Should impose size limits and warn)
- What happens when Zustand store receives concurrent setSkills calls? (Last write wins, immutability prevents corruption)
- How does SkillList handle rapidly changing skills array (>100 updates/sec)? (Should debounce re-renders)
- What happens when skill.md file is UTF-8 BOM encoded? (Parser should handle BOM correctly)
- How does scanner handle filesystem permission changes during scan? (Should catch errors per-file and continue)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Skill scanner tests MUST verify directory scanning for both ~/.claude/skills and ~/.config/opencode/skills paths
- **FR-002**: Skill scanner tests MUST verify recursive directory traversal to discover nested skill.md files
- **FR-003**: Skill scanner tests MUST verify error handling for missing directories, permission issues, and malformed files
- **FR-004**: Skill scanner tests MUST verify that errors in one skill file do not prevent scanning other files
- **FR-005**: YAML parser tests MUST verify frontmatter extraction from valid skill.md files
- **FR-006**: YAML parser tests MUST verify handling of malformed YAML (missing delimiters, invalid syntax)
- **FR-007**: YAML parser tests MUST verify handling of empty frontmatter, various data types (strings, arrays, objects, booleans), and UTF-8 characters
- **FR-008**: YAML parser tests MUST verify that parsing errors are caught and do not crash the application
- **FR-009**: Zustand store tests MUST verify initial state (selectedSkill: null, skills: [])
- **FR-010**: Zustand store tests MUST verify selectSkill and setSkills actions correctly update state
- **FR-011**: Zustand store tests MUST verify immutability of state objects (no mutations)
- **FR-012**: Zustand store tests MUST verify derived selectors recompute correctly when state changes
- **FR-013**: SkillList component tests MUST verify rendering with empty skills array
- **FR-014**: SkillList component tests MUST verify rendering with populated skills array
- **FR-015**: SkillList component tests MUST verify skill selection via click events
- **FR-016**: SkillList component tests MUST verify keyboard navigation (arrow keys) if implemented
- **FR-017**: SkillList component tests MUST verify search filtering if implemented
- **FR-018**: SkillList component tests MUST verify loading and error state rendering
- **FR-019**: All tests MUST achieve >80% line coverage for their respective modules (constitutional requirement)
- **FR-020**: All tests MUST run in under 5 seconds total (performance requirement)
- **FR-021**: All tests MUST be deterministic and produce zero flaky failures

### Key Entities

- **SkillScanner** (Rust backend): Module responsible for traversing directories and discovering skill.md files
- **YAMLParser** (Rust backend): Module responsible for extracting frontmatter metadata from skill.md files
- **useSkillStore** (Zustand): Frontend state store managing selectedSkill and skills array
- **SkillList** (React component): UI component rendering list of skills with selection, search, and keyboard navigation
- **Test Coverage Report**: Generated artifact showing line, branch, and statement coverage percentages

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Skill scanner module achieves >80% line coverage in cargo test coverage report
- **SC-002**: YAML parser module achieves >80% line coverage in cargo test coverage report
- **SC-003**: useSkillStore Zustand store achieves 100% line coverage in npm test coverage report
- **SC-004**: SkillList component achieves >90% line coverage in npm test coverage report
- **SC-005**: All backend tests (cargo test) complete in under 3 seconds
- **SC-006**: All frontend tests (npm test) complete in under 2 seconds
- **SC-007**: Zero flaky test failures in CI/CD pipeline (100% reliability)
- **SC-008**: Constitution Principle VII compliance verified (>80% coverage for all core logic)
- **SC-009**: All edge cases documented in spec are covered by at least one test
- **SC-010**: Test suite can be run locally by any developer with simple `npm test` and `cargo test` commands

## Constraints & Assumptions

### Technical Constraints

- Must use existing test frameworks: Vitest 2.1.8 for frontend, cargo test for Rust backend
- Must maintain compatibility with existing codebase (no breaking changes to modules being tested)
- Must follow TDD patterns established in Feature 019 (tests before implementation where applicable)
- Tests must run on all platforms (macOS, Linux, Windows) without platform-specific mocks

### Assumptions

- Skill scanner and YAML parser modules already have some existing implementation (we're backfilling tests, not implementing features)
- useSkillStore is already implemented and functional (backfilling tests)
- SkillList component is already implemented and functional (backfilling tests)
- Test coverage tools are already configured (Vitest coverage for frontend, cargo-tarpaulin or similar for backend)
- Developers have access to ~/.claude/skills and ~/.config/opencode/skills directories for test fixtures

## Dependencies

- Feature 019: Keyboard Shortcuts MVP (established TDD patterns and test infrastructure)
- Existing Vitest 2.1.8 configuration
- Existing cargo test configuration
- React Testing Library 16.1.0 for component tests
- @testing-library/user-event for simulating user interactions
- Zustand 5.0.8 store implementation

## Out of Scope (v0.2.0)

- Integration tests between frontend and backend (focus is unit tests)
- E2E tests for skill scanning workflow (covered in separate backlog item)
- Performance benchmarking beyond test execution time
- Visual regression testing for SkillList component
- Snapshot testing for React components
- Mutation testing or property-based testing
- Test coverage for UI components beyond SkillList (other components in future backlog)
