# Tasks: Code Quality Tools

**Input**: Design documents from `/specs/001-005-code-quality/`
**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: This feature focuses on tooling configuration. Testing tasks validate the tooling works correctly (pre-commit hooks, linting, formatting).

**Organization**: Tasks are grouped by user story (US1: Automated Linting, US2: Consistent Formatting) with shared setup/foundational work first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: configuration files at repository root
- Source code in `src/`
- VS Code settings in `.vscode/`
- Git hooks in `.husky/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install all required dependencies

- [x] T001 [P] Install ESLint core packages: `npm install -D eslint@^9.0.0`
- [x] T002 [P] Install TypeScript ESLint packages: `npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [x] T003 [P] Install React ESLint packages: `npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y`
- [x] T004 [P] Install Prettier packages: `npm install -D prettier eslint-config-prettier`
- [x] T005 [P] Install Husky and lint-staged: `npm install -D husky lint-staged`
- [x] T006 Verify all dependencies installed successfully: `npm list eslint prettier husky lint-staged`

---

## Phase 2: Foundational (Configuration Files)

**Purpose**: Core configuration that BOTH user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `.prettierrc.json` with configuration (printWidth: 100, singleQuote: true, endOfLine: lf)
- [x] T008 [P] Create `.prettierignore` excluding dist/, build/, node_modules/, \*.min.js, CHANGELOG.md
- [x] T009 [P] Create `.eslintignore` excluding dist/, build/, node_modules/, \*.config.js, vite.config.ts
- [x] T010 Add lint-staged configuration to `package.json` under "lint-staged" key
- [x] T011 [P] Add npm scripts to `package.json`: lint, lint:fix, format, format:check, prepare
- [x] T012 Initialize Husky: `npx husky init`
- [x] T013 Update `.vscode/extensions.json` to recommend dbaeumer.vscode-eslint and esbenp.prettier-vscode
- [x] T014 Update `.vscode/settings.json` to enable format-on-save and use Prettier as default formatter

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automated Code Linting (Priority: P1) 🎯 MVP

**Goal**: Prevent TypeScript errors, React anti-patterns, and accessibility violations from being committed

**Independent Test**: Commit TypeScript code with intentional errors (unused variables, missing prop-types, accessibility violations) and verify pre-commit hook blocks commit with clear error messages

### Configuration for User Story 1

- [x] T015 [US1] Create `eslint.config.js` with flat config structure and TypeScript parser configuration
- [x] T016 [US1] Add TypeScript rules to `eslint.config.js`: no-unused-vars, no-explicit-any
- [x] T017 [US1] Add React plugin configuration to `eslint.config.js`: react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
- [x] T018 [US1] Add jsx-a11y plugin configuration to `eslint.config.js`: alt-text, aria-props, aria-role rules
- [x] T019 [US1] Add eslint-config-prettier to `eslint.config.js` to disable conflicting rules

### Pre-commit Hook for User Story 1

- [x] T020 [US1] Create `.husky/pre-commit` hook that runs `npx lint-staged`
- [x] T021 [US1] Configure lint-staged to run eslint --fix on \*.{ts,tsx} files
- [x] T022 [US1] Make pre-commit hook executable: `chmod +x .husky/pre-commit`

### Validation for User Story 1

- [x] T023 [US1] Run `npm run lint:fix` on all existing files in src/
- [x] T024 [US1] Manually fix any remaining linting errors that auto-fix cannot resolve
- [x] T025 [US1] Verify zero linting errors: `npm run lint` exits with code 0
- [ ] T026 [US1] Test pre-commit hook: create file with unused variable, stage, attempt commit, verify hook blocks

**Checkpoint**: At this point, User Story 1 should be fully functional - linting prevents bad code from being committed

---

## Phase 4: User Story 2 - Consistent Code Formatting (Priority: P1)

**Goal**: Ensure all code follows consistent style without manual effort, reducing code review friction

**Independent Test**: Create files with inconsistent formatting (mixed quotes, irregular spacing) and verify `npm run format` reformats all files to match project standards

### Pre-commit Hook Integration for User Story 2

- [x] T027 [US2] Update lint-staged configuration in `package.json` to run prettier --write BEFORE eslint --fix on \*.{ts,tsx}
- [x] T028 [US2] Add lint-staged configuration for non-code files: prettier --write on \*.{json,md,css}

### Validation for User Story 2

- [x] T029 [US2] Run `npm run format` on all existing files (src/, tests/, _.json, _.md, \*.css)
- [x] T030 [US2] Verify zero formatting differences: `npm run format:check` exits with code 0
- [ ] T031 [US2] Test pre-commit hook: create file with mixed quotes, stage, commit, verify auto-formatted
- [ ] T032 [US2] Test format-on-save in VS Code: modify file, save, verify auto-formatting occurs

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - code is auto-formatted then linted on commit

---

## Phase 5: Cross-Platform Validation

**Purpose**: Ensure tooling works on all target platforms (macOS, Linux, Windows)

- [x] T033 [P] Test `npm run lint` on macOS, verify exit code 0
- [x] T034 [P] Test `npm run format:check` on macOS, verify exit code 0
- [ ] T035 [P] Test pre-commit hook on macOS: stage 3-5 files with errors, verify blocked in <5s
- [x] T036 [P] Test accessibility linting: verify jsx-a11y errors are caught (if any exist)
- [ ] T037 Document any platform-specific issues or workarounds in quickstart.md

**Note**: If team has Linux/Windows developers, repeat T033-T035 on those platforms. Otherwise, rely on CI/CD matrix testing.

---

## Phase 6: Documentation & Polish

**Purpose**: Ensure developers can onboard and use the tooling effectively

- [x] T038 [P] Update README.md with "Code Quality" section referencing quickstart.md
- [x] T039 [P] Add "Linting and Formatting" section to README.md with npm script examples
- [x] T040 Verify quickstart.md is accurate and complete (run through setup steps)
- [ ] T041 [P] Add troubleshooting entry to quickstart.md for common issues (if encountered during validation)
- [ ] T042 Commit all configuration files with comprehensive commit message documenting feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (T001-T006 all parallelizable)
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T006) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T007-T014) - Linting configuration
- **User Story 2 (Phase 4)**: Depends on Foundational (T007-T014) AND User Story 1 (T015-T026) - Formatting integrates with linting
- **Cross-Platform (Phase 5)**: Depends on User Stories 1 & 2 (T015-T032) - Validates complete tooling
- **Documentation (Phase 6)**: Depends on all validation (T033-T037) - Documents final state

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 - Prettier must run BEFORE ESLint in pre-commit hook to avoid conflicts

### Within Each User Story

**User Story 1 (Linting)**:

1. ESLint configuration (T015-T019) - can be done in sequence or parallel
2. Pre-commit hook setup (T020-T022) - depends on T015-T019
3. Validation (T023-T026) - depends on T020-T022

**User Story 2 (Formatting)**:

1. Integrate Prettier into lint-staged (T027-T028) - depends on US1 pre-commit hook
2. Validation (T029-T032) - depends on T027-T028

### Parallel Opportunities

- **Phase 1 (Setup)**: All T001-T005 can install in parallel (different packages)
- **Phase 2 (Foundational)**: T008, T009, T013, T014 can run in parallel (different files)
- **Phase 3 (US1)**: T015-T019 can be done together if editing single eslint.config.js file incrementally
- **Phase 5 (Validation)**: T033-T036 can run in parallel (independent test scenarios)
- **Phase 6 (Documentation)**: T038, T039, T041 can run in parallel (different files)

---

## Parallel Example: Setup Phase

```bash
# Launch all package installations together:
Task: "Install ESLint core packages"
Task: "Install TypeScript ESLint packages"
Task: "Install React ESLint packages"
Task: "Install Prettier packages"
Task: "Install Husky and lint-staged"
# Then sequentially:
Task: "Verify all dependencies installed successfully"
```

## Parallel Example: Foundational Phase

```bash
# Launch configuration file creation together:
Task: "Create .prettierignore"
Task: "Create .eslintignore"
Task: "Update .vscode/extensions.json"
Task: "Update .vscode/settings.json"
# Sequential dependencies:
Task: "Create .prettierrc.json" (first)
Task: "Add lint-staged to package.json" (depends on Prettier config)
Task: "Add npm scripts to package.json"
Task: "Initialize Husky"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T014) - CRITICAL
3. Complete Phase 3: User Story 1 (T015-T026)
4. **STOP and VALIDATE**: Test linting independently
   - Run `npm run lint` on existing code
   - Test pre-commit hook blocks bad commits
   - Verify VS Code shows inline errors
5. Deploy/commit if ready (MVP = automated linting)

### Full Feature Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Linting) → Test independently → Commit
3. Add User Story 2 (Formatting) → Test independently → Commit
4. Cross-platform validation → Document issues → Commit
5. Update documentation → Final commit

### Sequential Execution (Recommended)

Since this is a configuration feature with dependencies:

1. Install all packages (T001-T006) in parallel, then verify
2. Create all config files (T007-T014) - some in parallel
3. Configure ESLint (T015-T019) sequentially (same file)
4. Setup pre-commit hook (T020-T022) sequentially
5. Validate linting (T023-T026) sequentially
6. Integrate formatting (T027-T028) sequentially (modifies existing config)
7. Validate formatting (T029-T032) sequentially
8. Cross-platform tests (T033-T036) in parallel
9. Documentation (T038-T041) mostly in parallel

---

## Performance Validation

**Success Criteria** (from spec.md SC-004):

- Linting and formatting of typical commit (3-5 files) completes in under 5 seconds

**How to Test**:

```bash
# Stage 3-5 TypeScript files
git add src/components/FileA.tsx src/components/FileB.tsx src/utils/FileC.ts

# Time the commit
time git commit -m "Test commit performance"

# Elapsed time should be < 5s
```

If performance is >5s:

- Check lint-staged is only processing staged files (not all files)
- Verify .eslintignore and .prettierignore exclude build artifacts
- Consider adjusting lint-staged config to skip large files

---

## Risk Mitigation

Based on plan.md risk assessment:

**Risk 1: Existing Code Linting Errors**

- Mitigated by T023-T024 (auto-fix then manual fix)
- If >20 errors: adjust rules or create separate backfill task

**Risk 2: Pre-commit Hook Performance**

- Mitigated by T035 (performance test)
- If >5s: adjust lint-staged config

**Risk 3: Windows Line Ending Issues**

- Mitigated by Prettier config `endOfLine: "lf"` in T007
- Run T029 to normalize all files

**Risk 4: ESLint/Prettier Rule Conflicts**

- Mitigated by T019 (eslint-config-prettier)
- Run both tools in T025 and T030 to verify no conflicts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 2 depends on User Story 1 (Prettier must run before ESLint)
- Verify tests pass at each checkpoint before proceeding
- Commit after each phase or logical group
- Constitutional compliance: This feature implements Principle VII (Code Quality Standards)
- Avoid: skipping validation tasks, committing without running format/lint
