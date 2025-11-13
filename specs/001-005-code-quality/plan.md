# Implementation Plan: Code Quality Tools

**Branch**: `001-005-code-quality` | **Date**: 2025-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-005-code-quality/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature establishes automated code quality tooling (ESLint + Prettier) with pre-commit hooks to enforce TypeScript, React, and accessibility standards. The primary requirement is to prevent code quality issues from being committed while maintaining fast developer workflows (<5s for typical commits).

**Technical Approach**:

- ESLint 9.x with flat config (eslint.config.js)
- Prettier 3.x with unified formatting rules
- Husky 9.x for git hook management
- lint-staged for selective file processing
- eslint-config-prettier to prevent rule conflicts

## Technical Context

**Language/Version**: TypeScript 5.8.3, Node.js 18+
**Primary Dependencies**: ESLint 9.x, Prettier 3.x, Husky 9.x, lint-staged 15.x
**Storage**: N/A (configuration files only)
**Testing**: Vitest (existing), npm scripts for lint/format validation
**Target Platform**: Desktop (macOS, Linux, Windows) via Tauri + Vite
**Project Type**: Single project (React frontend + Tauri backend)
**Performance Goals**: <5s for linting/formatting typical commit (3-5 files)
**Constraints**:

- Must not break existing Vite build pipeline
- Pre-commit hooks must be fast enough not to disrupt workflow
- Must handle Windows CRLF line endings gracefully
- Zero linting errors on existing codebase after setup
  **Scale/Scope**:
- ~20 TypeScript/TSX files (src/)
- 5 configuration files (JSON, YAML, MD)
- Typical commit: 3-5 files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle VII: Testability and Quality

**Requirement**: "All core logic must have unit tests (>80% coverage)"

**Compliance**:

- ✅ This feature adds tooling to ENFORCE quality (ESLint, Prettier)
- ✅ Pre-commit hooks prevent low-quality code from being committed
- ✅ `npm run lint` can be run in CI/CD to gate merges
- ⚠️ Current codebase has 0% test coverage (needs backfill - separate feature)
- ✅ This feature establishes foundation for code quality enforcement

**Gate Status**: **PASS** - Feature aligns with constitutional principle of quality enforcement. Test coverage backfill is tracked separately in BACKLOG.md.

### Code Quality Standards

**Requirement**: "ESLint with React and TypeScript plugins, Prettier for formatting"

**Compliance**:

- ✅ Directly implements constitutional requirement
- ✅ TypeScript strict mode enforcement
- ✅ React plugin for component best practices
- ✅ jsx-a11y plugin for accessibility (WCAG 2.1 AA)

**Gate Status**: **PASS** - Feature directly fulfills constitutional code quality standards.

### Development Workflow

**Requirement**: "Feature Development Process" (steps 1-6)

**Compliance**:

- ✅ Following SDD workflow (/speckit.specify, /speckit.plan, /speckit.tasks)
- ✅ Spec created in specs/001-005-code-quality/
- ✅ Quality checklist validated (all items pass)
- ✅ Tasks.md will be generated next (/speckit.tasks)
- ✅ TDD approach for configuration validation

**Gate Status**: **PASS** - Proper SDD workflow being followed.

### No Violations

All gates pass. No complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-005-code-quality/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (tool selection, best practices)
├── data-model.md        # Phase 1 output (N/A - no data model)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (N/A - configuration-only feature)
├── checklists/
│   └── requirements.md  # Quality validation (COMPLETE)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
skill-debugger/
├── .husky/                     # Git hooks (new)
│   ├── pre-commit             # Runs lint-staged
│   └── _/                     # Husky internal
├── .vscode/                   # VS Code settings (modified)
│   ├── extensions.json        # Add ESLint/Prettier extensions
│   └── settings.json          # Enable format-on-save
├── src/                       # React frontend (existing)
│   ├── components/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── hooks/
├── tests/                     # Test suite (existing)
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── eslint.config.js           # ESLint flat config (new)
├── .prettierrc.json           # Prettier config (new)
├── .prettierignore            # Prettier exclusions (new)
├── .eslintignore              # ESLint exclusions (new)
├── package.json               # Updated with lint/format scripts
└── package-lock.json          # Updated dependencies
```

**Structure Decision**: Single project structure (React + Tauri). Configuration files added at repository root. Git hooks managed via `.husky/` directory. VS Code workspace settings updated for editor integration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is not needed.

## Phase 0: Research & Technology Decisions

**Status**: Complete (no unknowns in Technical Context)

### Decision 1: ESLint Flat Config vs Legacy Config

**Decision**: Use ESLint 9.x flat config format (`eslint.config.js`)

**Rationale**:

- Flat config is the future (legacy config deprecated in ESLint 9.0)
- Simpler mental model (single config file vs multiple .eslintrc.\* files)
- Better TypeScript support
- Project is greenfield for ESLint (no migration burden)

**Alternatives Considered**:

- Legacy .eslintrc.json: Rejected because it's deprecated
- eslintrc.js: Rejected in favor of modern flat config

### Decision 2: Prettier Configuration

**Decision**: Use Prettier defaults with minimal overrides

**Rationale**:

- Prettier's defaults are industry-standard
- Fewer configuration options = less bikeshedding
- Only override: `printWidth: 100` (vs default 80) for modern displays

**Alternatives Considered**:

- Extensive customization: Rejected to avoid configuration complexity
- No Prettier (ESLint only): Rejected because ESLint formatting rules are less comprehensive

### Decision 3: Pre-commit Hook Tool

**Decision**: Husky 9.x + lint-staged 15.x

**Rationale**:

- Husky: De facto standard for git hooks in Node.js ecosystem
- lint-staged: Only processes staged files (performance requirement: <5s)
- Zero-config install via `npx husky init`
- Cross-platform support (Windows, macOS, Linux)

**Alternatives Considered**:

- pre-commit (Python): Rejected because team uses Node.js tooling
- Manual git hooks: Rejected because not portable across team
- Lefthook: Rejected because less mature ecosystem

### Decision 4: ESLint Plugin Selection

**Decision**:

- @typescript-eslint/parser + @typescript-eslint/eslint-plugin
- eslint-plugin-react + eslint-plugin-react-hooks
- eslint-plugin-jsx-a11y
- eslint-config-prettier (conflict prevention)

**Rationale**:

- TypeScript plugins: Required for TypeScript-specific rules
- React plugins: Constitutional requirement (Code Quality Standards)
- jsx-a11y: Constitutional requirement (accessibility enforcement)
- eslint-config-prettier: Prevents ESLint/Prettier conflicts (edge case from spec)

**Alternatives Considered**:

- Standard.js: Rejected because it's opinionated and conflicts with Prettier
- XO: Rejected because too opinionated for existing codebase
- Airbnb config: Rejected because too strict for existing code (would require rewrites)

### Decision 5: VS Code Integration

**Decision**: Update `.vscode/extensions.json` and `.vscode/settings.json`

**Rationale**:

- Real-time feedback in editor (US1 acceptance scenario #4)
- Format-on-save eliminates manual formatting (US2 acceptance scenario #3)
- Recommended extensions ensure consistent team experience

**Alternatives Considered**:

- No VS Code integration: Rejected because it's the primary editor used
- Individual user settings: Rejected because not portable across team

### Decision 6: Ignore Patterns

**Decision**:

- `.prettierignore`: dist/, build/, node_modules/, \*.min.js, CHANGELOG.md
- `.eslintignore`: dist/, build/, node_modules/, \*.config.js, vite.config.ts

**Rationale**:

- Exclude generated/built code (dist/, build/)
- Exclude dependencies (node_modules/)
- Exclude minified code (not editable)
- Exclude CHANGELOG.md (Prettier breaks keep-a-changelog format)
- Exclude build configs from linting (vite.config.ts uses dynamic imports)

**Alternatives Considered**:

- No ignore files: Rejected because would lint generated code (slow + noisy)
- Extensive ignore patterns: Rejected to avoid accidentally excluding source files

## Phase 1: Design & Contracts

### Data Model

**N/A** - This is a configuration-only feature. No data model required.

### API Contracts

**N/A** - No APIs required. This feature adds:

1. Configuration files (eslint.config.js, .prettierrc.json)
2. Git hooks (.husky/pre-commit)
3. npm scripts (lint, lint:fix, format, format:check)

### Configuration Schema

**ESLint Configuration** (`eslint.config.js`):

```javascript
export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // React rules
      'react/prop-types': 'off', // Using TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
    },
  },
];
```

**Prettier Configuration** (`.prettierrc.json`):

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "endOfLine": "lf"
}
```

**lint-staged Configuration** (`package.json`):

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### npm Scripts

**New Scripts** (add to `package.json`):

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "lint:fix": "eslint 'src/**/*.{ts,tsx}' --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx,json,css,md}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,json,css,md}'",
    "prepare": "husky"
  }
}
```

### Quickstart Guide

See [quickstart.md](./quickstart.md) (generated in Phase 1).

## Implementation Milestones

**Milestone 1: Dependency Installation** (T001-T004)

- Install ESLint packages
- Install Prettier packages
- Install Husky + lint-staged
- Verify no version conflicts

**Milestone 2: Configuration** (T005-T012)

- Create eslint.config.js
- Create .prettierrc.json
- Create ignore files (.eslintignore, .prettierignore)
- Configure lint-staged in package.json
- Add npm scripts
- Update VS Code settings

**Milestone 3: Pre-commit Hooks** (T013-T016)

- Initialize Husky
- Create pre-commit hook
- Test hook prevents bad commits
- Verify performance (<5s for 3-5 files)

**Milestone 4: Existing Codebase Remediation** (T017-T020)

- Run `npm run format` on all files
- Run `npm run lint:fix` on all files
- Manually fix remaining linting errors (if any)
- Verify zero errors: `npm run lint` passes

**Milestone 5: Testing & Validation** (T021-T024)

- Test pre-commit hook with intentional errors
- Test format-on-save in VS Code
- Test cross-platform (macOS, Linux, Windows)
- Document edge cases and workarounds

**Milestone 6: Documentation** (T025-T026)

- Update README.md with lint/format instructions
- Create quickstart.md for new developers

## Risk Assessment

**Risk 1: Existing Code Linting Errors**

- **Likelihood**: Medium
- **Impact**: High (blocks feature completion)
- **Mitigation**: Run `lint:fix` first to auto-fix, then manually fix remaining errors
- **Contingency**: If >20 errors, create separate backfill task and adjust rules

**Risk 2: Pre-commit Hook Performance**

- **Likelihood**: Low
- **Impact**: Medium (developer experience degradation)
- **Mitigation**: Use lint-staged to only process staged files
- **Contingency**: If >5s for typical commit, adjust lint-staged config to skip large files

**Risk 3: Windows Line Ending Issues**

- **Likelihood**: Medium (Windows users on team)
- **Impact**: Low (Prettier can fix automatically)
- **Mitigation**: Prettier config sets `endOfLine: "lf"` to normalize
- **Contingency**: Add .gitattributes file to enforce LF on commit

**Risk 4: ESLint/Prettier Rule Conflicts**

- **Likelihood**: Low (using eslint-config-prettier)
- **Impact**: Medium (confusing error messages)
- **Mitigation**: Install eslint-config-prettier last in config
- **Contingency**: Run `eslint-config-prettier` CLI to detect conflicts

## Success Validation

**SC-001**: All existing code passes ESLint with zero errors after running `npm run lint:fix`

- **Test**: `npm run lint` exits with code 0
- **Evidence**: CI logs showing zero linting errors

**SC-002**: All existing code passes Prettier formatting checks after running `npm run format`

- **Test**: `npm run format:check` exits with code 0
- **Evidence**: CI logs showing zero formatting differences

**SC-003**: Pre-commit hooks prevent commits with linting errors 100% of the time

- **Test**: Create file with intentional errors, attempt commit, verify hook blocks
- **Evidence**: Manual testing checklist + screenshot of blocked commit

**SC-004**: Linting and formatting of typical commit (3-5 files) completes in under 5 seconds

- **Test**: Stage 3-5 files, run `time git commit`, measure elapsed time
- **Evidence**: Terminal screenshot with timing output

**SC-005**: Zero accessibility violations (jsx-a11y errors) detected in existing codebase

- **Test**: `npm run lint` shows no jsx-a11y errors
- **Evidence**: CI logs filtered for jsx-a11y violations

**SC-006**: Developers can run `npm run lint` in CI/CD to gate code merges

- **Test**: Add `npm run lint` to CI workflow, verify it gates PRs
- **Evidence**: CI configuration + PR blocked by linting errors

**SC-007**: All npm scripts complete successfully on macOS, Linux, and Windows

- **Test**: Run all scripts on each platform, verify exit code 0
- **Evidence**: Platform-specific CI runs (GitHub Actions matrix)

**SC-008**: VS Code integration works with recommended extensions

- **Test**: Open project in VS Code, verify real-time linting + format-on-save
- **Evidence**: Screenshot of VS Code showing inline errors + auto-formatting

## Next Steps

1. Generate `research.md` (complete - captured in Phase 0 above)
2. Generate `quickstart.md` (next - developer onboarding guide)
3. Run `/speckit.tasks` to break down into executable tasks
4. Run `/speckit.implement` to execute tasks sequentially
