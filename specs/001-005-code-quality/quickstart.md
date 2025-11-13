# Code Quality Tools - Developer Quickstart

**Feature**: Code Quality Tools (ESLint + Prettier)
**Branch**: `001-005-code-quality`
**Last Updated**: 2025-01-12

## Overview

This guide helps developers get started with the code quality tooling (ESLint + Prettier) for the Skill Debugger project. All code must pass linting and formatting checks before being committed.

## Prerequisites

- Node.js 18+ and npm installed
- Git configured for the repository
- VS Code (recommended editor)

## Initial Setup

### 1. Install Dependencies

All required dependencies are in `package.json`. Install with:

```bash
npm install
```

This installs:

- ESLint 9.x (TypeScript, React, Accessibility plugins)
- Prettier 3.x
- Husky 9.x (git hooks)
- lint-staged 15.x (selective file processing)

### 2. Configure VS Code (Recommended)

Install the recommended extensions when prompted by VS Code, or manually install:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)

VS Code settings are already configured in `.vscode/settings.json`:

- Format on save: enabled
- Default formatter: Prettier
- ESLint auto-fix on save: enabled

### 3. Verify Pre-commit Hooks

Husky hooks are automatically installed during `npm install` via the `prepare` script.

Verify the hook exists:

```bash
ls -la .husky/pre-commit
```

You should see the pre-commit hook file.

## Daily Workflow

### Running Linting

**Check all files for linting errors**:

```bash
npm run lint
```

**Auto-fix linting issues**:

```bash
npm run lint:fix
```

### Running Formatting

**Format all files**:

```bash
npm run format
```

**Check formatting without changes**:

```bash
npm run format:check
```

### Making Commits

Pre-commit hooks automatically run when you commit. The workflow is:

1. Stage your changes: `git add .`
2. Attempt commit: `git commit -m "Your message"`
3. Pre-commit hook runs:
   - Prettier formats staged files
   - ESLint checks formatted files
   - If errors found: commit blocked
   - If all pass: commit succeeds

**Example of blocked commit**:

```bash
$ git commit -m "Add feature"
✖ eslint --fix:

  /path/to/file.ts
    15:7  error  'foo' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)

✗ lint-staged failed
```

Fix the error, stage the changes again, and retry the commit.

### VS Code Integration

If you installed the recommended extensions:

- **Real-time linting**: Errors appear inline as you type
- **Format on save**: Code auto-formats when you save files
- **Quick fixes**: Click the lightbulb icon or press `Cmd+.` (macOS) / `Ctrl+.` (Windows/Linux)

## Common Issues

### Issue 1: Pre-commit Hook Not Running

**Symptom**: Commits succeed without linting/formatting

**Solution**:

```bash
# Reinstall Husky hooks
npx husky install
```

### Issue 2: Linting Errors on Existing Code

**Symptom**: Many linting errors when first running `npm run lint`

**Solution**:

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Manually fix remaining errors
# Then verify
npm run lint
```

### Issue 3: Prettier and ESLint Conflict

**Symptom**: ESLint complains about formatting issues

**Solution**: This shouldn't happen because `eslint-config-prettier` is configured. If it does:

```bash
# Run Prettier first
npm run format

# Then run ESLint
npm run lint:fix
```

### Issue 4: Windows Line Ending Issues

**Symptom**: Every file shows as modified due to CRLF vs LF

**Solution**: Prettier normalizes to LF automatically. Run:

```bash
npm run format
git add -u
git commit -m "Normalize line endings"
```

### Issue 5: Slow Pre-commit Hooks

**Symptom**: Commits take >5 seconds

**Solution**: `lint-staged` only processes staged files. If still slow:

```bash
# Check which files are being processed
git diff --cached --name-only

# If >20 files, consider splitting into smaller commits
```

## Configuration Files

### ESLint Configuration

**File**: `eslint.config.js`

**Key Rules**:

- TypeScript: No unused variables, no `any` types
- React: Hooks rules, prop-types disabled (using TypeScript)
- Accessibility: WCAG 2.1 AA compliance (jsx-a11y)

**Customization**: Edit `eslint.config.js` and add rules under the `rules` object.

### Prettier Configuration

**File**: `.prettierrc.json`

**Key Settings**:

- Print width: 100 characters
- Tab width: 2 spaces
- Single quotes: enabled
- Trailing commas: ES5-compatible
- Line endings: LF (Unix-style)

**Customization**: Edit `.prettierrc.json`. See [Prettier options](https://prettier.io/docs/en/options.html).

### Ignore Files

**ESLint Ignore** (`.eslintignore`):

- `dist/`, `build/` (generated code)
- `node_modules/` (dependencies)
- `*.config.js`, `vite.config.ts` (build configs)

**Prettier Ignore** (`.prettierignore`):

- `dist/`, `build/` (generated code)
- `node_modules/` (dependencies)
- `*.min.js` (minified files)
- `CHANGELOG.md` (keep-a-changelog format)

## npm Scripts Reference

| Script                 | Purpose                  | When to Use                    |
| ---------------------- | ------------------------ | ------------------------------ |
| `npm run lint`         | Check for linting errors | Before committing, in CI/CD    |
| `npm run lint:fix`     | Auto-fix linting issues  | When linting errors found      |
| `npm run format`       | Format all files         | Initial setup, bulk formatting |
| `npm run format:check` | Verify formatting        | In CI/CD to gate merges        |

## CI/CD Integration

The `npm run lint` and `npm run format:check` commands are designed for CI/CD pipelines.

**Example GitHub Actions workflow**:

```yaml
- name: Install dependencies
  run: npm ci

- name: Check code quality
  run: |
    npm run lint
    npm run format:check
```

This gates PR merges on code quality.

## Getting Help

- **ESLint Documentation**: https://eslint.org/docs/latest/
- **Prettier Documentation**: https://prettier.io/docs/en/
- **Husky Documentation**: https://typicode.github.io/husky/
- **Project Constitution**: `.specify/memory/constitution.md`
- **Feature Specification**: `specs/001-005-code-quality/spec.md`

## Next Steps

After completing this feature:

1. All existing code passes linting: `npm run lint` exits with code 0
2. All existing code is formatted: `npm run format:check` exits with code 0
3. Pre-commit hooks prevent bad commits
4. VS Code integration provides real-time feedback
5. Ready to implement new features with quality enforcement
