# Quickstart Guide: Testing Feature 020

**Feature**: Test Backfill - Critical Paths
**Branch**: 020-test-backfill-critical-paths

## Developer Setup

### Prerequisites

- Rust 1.75+ with cargo
- Node.js 18+ with npm
- cargo-llvm-cov for backend coverage

### Install Coverage Tools

```bash
# Rust coverage tool
cargo install cargo-llvm-cov

# Verify installation
cargo llvm-cov --version

# Frontend coverage (already configured)
npm install  # Vitest already in dependencies
```

## Running Tests

### Frontend Tests

```bash
# Run all frontend tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm test useSkillStore.test.ts

# Run in watch mode
npm test -- --watch
```

### Backend Tests

```bash
# Run all Rust tests
cd src-tauri && cargo test

# Run with coverage (HTML report)
cd src-tauri && cargo llvm-cov --all-features --workspace --html

# Open coverage report
open src-tauri/target/llvm-cov/html/index.html

# Check coverage threshold (>80%)
cd src-tauri && cargo llvm-cov --all-features --workspace --fail-under-lines 80
```

### Using Taskfile (Recommended)

```bash
# Run all tests
task test

# Backend coverage
task test:coverage:backend

# Full CI pipeline
task ci
```

## Test File Organization

```
skill-debugger/
├── src-tauri/src/
│   ├── commands/
│   │   └── skill_scanner.rs      # Tests at bottom: #[cfg(test)] mod tests
│   └── utils/
│       └── yaml_parser.rs         # Tests at bottom: #[cfg(test)] mod tests
│
├── tests/
│   ├── unit/
│   │   ├── stores/
│   │   │   └── useSkillStore.test.ts    # Zustand store tests
│   │   └── components/
│   │       └── SkillList.test.tsx       # React component tests
│   ├── fixtures/
│   │   ├── skills/              # Test skill directories
│   │   └── mockSkills.ts        # TypeScript mock data
│   └── setup.ts                 # Vitest global setup
```

## Debugging Tests

### Frontend (Vitest)

```bash
# Run single test
npm test -- -t "should initialize with empty skills"

# Run only tests in one file
npm test useSkillStore.test.ts

# Debug with Chrome DevTools
npm run test:ui
# Then click "Debug" in UI

# Use test.only() to focus
it.only('should test this only', () => { /* ... */ });
```

### Backend (Rust)

```bash
# Run specific test
cargo test test_scan_directory

# Run tests matching pattern
cargo test yaml

# Show println! output
cargo test -- --nocapture

# Run single test with output
cargo test test_malformed_yaml -- --nocapture --exact
```

## Coverage Reports

### Frontend Coverage

```bash
# Generate HTML report
npm run test:coverage

# Open report
open coverage/index.html

# Coverage output locations:
# - HTML: coverage/index.html
# - LCOV: coverage/lcov.info
# - JSON: coverage/coverage-final.json
```

### Backend Coverage

```bash
cd src-tauri

# HTML report
cargo llvm-cov --all-features --workspace --html

# Text summary
cargo llvm-cov --all-features --workspace

# LCOV for CI
cargo llvm-cov --all-features --workspace --lcov --output-path lcov.info

# Coverage output locations:
# - HTML: target/llvm-cov/html/index.html
# - LCOV: lcov.info
```

## Test Fixtures

### Rust Test Fixtures

Located in test functions using tempfile:

```rust
use tempfile::TempDir;

let fixture = TempDir::new()?;
let skill_dir = fixture.path().join("test-skill");
fs::create_dir(&skill_dir)?;
fs::write(skill_dir.join("SKILL.md"), "content")?;

// Fixture auto-deletes when dropped
```

### Frontend Test Fixtures

Located in `tests/fixtures/`:

```typescript
import { mockSkills } from '@/tests/fixtures/mockSkills';

const testSkill = mockSkills[0];
```

## Common Issues

### Issue: Tests fail with "cannot find module"

**Solution**: Check import paths use `@/` alias:

```typescript
// ✅ Correct
import { useSkillStore } from '@/stores/useSkillStore';

// ❌ Wrong
import { useSkillStore } from '../../../src/stores/useSkillStore';
```

### Issue: Rust test fixtures not cleaning up

**Solution**: Use tempfile::TempDir (auto-cleanup):

```rust
let temp_dir = TempDir::new()?;
// NO NEED for fs::remove_dir_all() - automatic on drop
```

### Issue: Zustand store state persists between tests

**Solution**: Add reset() action and call in beforeEach:

```typescript
beforeEach(() => {
  const { result } = renderHook(() => useSkillStore());
  act(() => result.current.reset());
});
```

### Issue: Coverage report shows 0%

**Frontend**: Check vitest.config.ts excludes test files:

```typescript
coverage: {
  exclude: ['**/*.test.ts', '**/*.spec.ts'],
}
```

**Backend**: Ensure llvm-tools-preview component installed:

```bash
rustup component add llvm-tools-preview
```

### Issue: Platform-specific path failures

**Solution**: Use Path::join(), never hardcode `/` or `\`:

```rust
// ✅ Correct
let path = base_dir.join("subdir").join("file.md");

// ❌ Wrong
let path = format!("{}/subdir/file.md", base_dir);
```

## Coverage Thresholds

| Module           | Target     | Command                                                  |
| ---------------- | ---------- | -------------------------------------------------------- |
| skill_scanner.rs | >80% lines | `cargo llvm-cov --fail-under-lines 80`                   |
| yaml_parser.rs   | >80% lines | `cargo llvm-cov --fail-under-lines 80`                   |
| useSkillStore    | 100% lines | `npm run test:coverage` (configured in vitest.config.ts) |
| SkillList.tsx    | >90% lines | `npm run test:coverage`                                  |

## CI/CD Integration

Coverage runs automatically in GitHub Actions on every PR. To run locally:

```bash
# Complete CI pipeline
task ci

# This runs:
# 1. Clean build
# 2. Install dependencies
# 3. Build frontend + backend
# 4. Run all tests
# 5. Check coverage thresholds
# 6. Lint (clippy)
# 7. Format check
```

## Quick Reference

```bash
# Most common commands
npm test                         # Run frontend tests
npm run test:coverage            # Frontend coverage
cargo test                       # Run backend tests
task test:coverage:backend       # Backend coverage with HTML
task ci                          # Full CI pipeline locally
```

## Resources

- Vitest docs: https://vitest.dev
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro
- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- Rust Book Testing: https://doc.rust-lang.org/book/ch11-00-testing.html
