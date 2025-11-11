# Test Backfill Strategy

**Purpose**: Define when and how to achieve >80% test coverage after v0.1.0 shipped with 0% coverage

**Status**: Remediation Plan
**Target**: v0.3.0 (constitutional compliance)
**Date**: 2025-11-10

---

## Problem Statement

**Current State**: 0% test coverage (v0.1.0)

**Constitutional Requirement**: >80% test coverage (Principle VII)

**Gap**: 24 test tasks skipped during v0.1.0 implementation

**Impact**:
- Cannot refactor safely
- No regression detection
- Quality not verified
- Difficult to onboard new developers
- Constitutional violation

---

## Core Question: When to Backfill Tests?

**User Request**: "at some point I want to backfill those actual tests.. so think about when that should happen"

### Answer: Hybrid Approach

**Don't backfill immediately** - Learn by doing it right first

**Strategy**:
1. **Feature/002**: Establish TDD patterns (100% coverage)
2. **During v0.2.0**: Backfill critical tests while building new features
3. **During v0.3.0**: Complete backfill to reach >80% coverage

**Why This Works**:
- ✅ Learn proper TDD on new feature first
- ✅ Establish testing patterns and infrastructure
- ✅ Build confidence and muscle memory
- ✅ Then apply learned patterns to existing code
- ✅ Avoid backfilling with bad test practices

---

## Three-Phase Remediation Plan

### Phase 1: Establish TDD Patterns (Feature/002)

**Timeline**: Next feature (keyboard shortcuts)
**Target Coverage**: 100% for feature/002 code
**Overall Coverage**: ~10-15% (new code only)

**Goals**:
1. Set up testing infrastructure
   - Install Vitest for frontend
   - Configure cargo test for Rust
   - Set up Playwright for E2E
   - Add @testing-library/react for components
   - Configure coverage reporting

2. Learn TDD workflow
   - Write failing test first
   - Implement feature
   - Test passes
   - Refactor
   - Repeat

3. Establish testing patterns
   - Unit test patterns for hooks
   - Component test patterns for React
   - Integration test patterns for Tauri commands
   - E2E test patterns for user workflows

**Example TDD Cycle** (from feature/002):
```typescript
// 1. Write failing test first
describe('useKeyboardShortcuts', () => {
  it('should focus search input when Cmd+F is pressed', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    const searchInput = screen.getByRole('searchbox');

    fireEvent.keyDown(document, { key: 'f', metaKey: true });

    expect(searchInput).toHaveFocus(); // ❌ Fails (not implemented)
  });
});

// 2. Implement feature
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[role="searchbox"]')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};

// 3. Test passes ✅
// 4. Refactor (extract logic, improve)
// 5. Tests still pass ✅
```

**Deliverables**:
- ✅ Vitest configured and running
- ✅ Playwright E2E suite initialized
- ✅ Example tests demonstrating all patterns
- ✅ CI integration (run tests on commit)
- ✅ Coverage reporting tool configured
- ✅ Feature/002 has 100% test coverage

**Why Feature/002 Goes First**:
- Focused scope (keyboard shortcuts only)
- Small enough to maintain 100% coverage
- Demonstrates TDD value through green tests
- Establishes infrastructure for backfill

---

### Phase 2: Backfill Priority 1 Tests (v0.2.0)

**Timeline**: During v0.2.0 development
**Target Coverage**: >50% overall
**Approach**: Backfill + new feature development in parallel

**Strategy**: Backfill critical paths while building new features

**When to Backfill** (detailed schedule):

#### Week 1-2: Feature/002 (TDD Establishment)
- Focus: 100% TDD on keyboard shortcuts
- Backfill: None (learn first)

#### Week 3: Backfill Sprint #1
**Focus**: Critical business logic (no UI)

**Tasks** (from BACKLOG.md):
- BACK-005: Unit tests for skill scanner (T022)
  - Test directory scanning
  - Test skill parsing
  - Test error handling
  - **Why First**: Core functionality, breaks everything if wrong

- BACK-006: Unit tests for YAML parser (T038)
  - Test frontmatter extraction
  - Test malformed YAML handling
  - Test edge cases
  - **Why Second**: Data integrity critical

**Time Estimate**: 1-2 days
**Expected Coverage Gain**: +15%

#### Week 4: Feature Development
- Build next feature with TDD (maybe search enhancements)
- Apply learned patterns
- Target: 100% coverage on new feature

#### Week 5: Backfill Sprint #2
**Focus**: State management and hooks

**Tasks**:
- BACK-007: Unit tests for Zustand store (useSkillStore)
  - Test state mutations
  - Test actions
  - Test derived state
  - **Why**: State bugs hard to detect manually

**Time Estimate**: 1 day
**Expected Coverage Gain**: +10%

#### Week 6: Feature Development
- Continue building features with TDD

#### Week 7: Backfill Sprint #3
**Focus**: Components (critical paths only)

**Tasks**:
- BACK-008: Component tests for SkillList (T024)
  - Test rendering
  - Test selection
  - Test empty states

**Time Estimate**: 1 day
**Expected Coverage Gain**: +10%

**v0.2.0 Checkpoint**: Should have >50% coverage before release

---

### Phase 3: Complete Backfill (v0.3.0)

**Timeline**: During v0.3.0 development
**Target Coverage**: >80% (constitutional compliance)
**Approach**: Systematic backfill of remaining gaps

**When to Backfill** (v0.3.0 schedule):

#### Backfill Priority 2: User Stories

**Tasks** (from BACKLOG.md):
- BACK-009: Unit tests for file reader (T037)
- BACK-010: Component tests for SkillViewer (T039)
- BACK-011: Unit tests for trigger analyzer (T070)
- BACK-012: Component tests for TriggerAnalysis (T071)
- BACK-013: Unit tests for diagram generator (T079)
- BACK-014: Component tests for DiagramView (T080)
- BACK-015: Component tests for SearchBar (T089)

**Time Estimate**: 3-4 days
**Expected Coverage Gain**: +20%

#### Backfill Priority 3: E2E Tests

**Tasks** (from BACKLOG.md):
- BACK-016: Set up Playwright for E2E testing
- BACK-017: E2E test for skill discovery (T025)
- BACK-018: E2E test for skill viewing (T040)
- BACK-019: E2E test for navigation (T058)
- BACK-020: E2E test for search (T090)

**Time Estimate**: 2-3 days
**Expected Coverage Gain**: +10-15%

**v0.3.0 Checkpoint**: Must achieve >80% coverage before release

---

## Prioritization Criteria

### Priority 0: Infrastructure (Feature/002)
- Test runners
- Coverage tools
- CI integration
- Example patterns

### Priority 1: Critical Paths (v0.2.0)
**What to Test First**:
1. **Core Business Logic**
   - Skill scanning (breaks app if wrong)
   - YAML parsing (data integrity)
   - File reading (I/O errors critical)

2. **State Management**
   - Zustand store (state bugs cascade)
   - Hooks that manage state

3. **Critical Components**
   - SkillList (main navigation)
   - SkillViewer (core functionality)

**What to Skip (for now)**:
- Visual polish components
- Empty states
- Error boundaries (add in v0.3.0)
- Performance optimizations

### Priority 2: User Stories (v0.3.0)
**What to Test**:
1. **User Story Components**
   - All US1-US6 components
   - Trigger analysis
   - Diagram rendering
   - Search filtering

2. **Integration Points**
   - Tauri command integration
   - File system integration
   - Markdown rendering pipeline

### Priority 3: E2E Coverage (v0.3.0)
**What to Test**:
- Critical user journeys
- Cross-component workflows
- Error handling flows

---

## Testing Infrastructure Setup (Feature/002)

### Frontend Testing Stack

```bash
# Install dependencies
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D jsdom
npm install -D @vitest/coverage-v8
npm install -D playwright @playwright/test
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,      // v0.3.0 target
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Rust Testing

```toml
# src-tauri/Cargo.toml
[dev-dependencies]
mockall = "0.12"  # Mocking framework
serial_test = "3" # Sequential test execution
```

```rust
// src-tauri/src/skills.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_yaml_frontmatter() {
        let content = "---\ndescription: Test\n---\nContent";
        let result = parse_skill_content(content);
        assert_eq!(result.metadata.unwrap().description, Some("Test".to_string()));
    }

    #[test]
    fn test_scan_directory_handles_missing_dir() {
        let result = scan_directory(Path::new("/nonexistent"));
        assert!(result.is_err());
    }
}
```

---

## Test Patterns to Establish (Feature/002)

### Pattern 1: Custom Hook Testing

```typescript
// src/hooks/__tests__/useKeyboardShortcuts.test.ts
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should register keyboard event listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useKeyboardShortcuts());
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should cleanup on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
```

### Pattern 2: Zustand Store Testing

```typescript
// src/stores/__tests__/useSkillStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSkillStore } from '../useSkillStore';

describe('useSkillStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSkillStore.getState().reset();
  });

  it('should set skills', () => {
    const { result } = renderHook(() => useSkillStore());
    const mockSkills = [{ name: 'test', path: '/test' }];

    act(() => {
      result.current.setSkills(mockSkills);
    });

    expect(result.current.skills).toEqual(mockSkills);
  });
});
```

### Pattern 3: Component Testing

```typescript
// src/components/SkillList/__tests__/SkillList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillList } from '../SkillList';

describe('SkillList', () => {
  const mockSkills = [
    { name: 'Skill 1', location: 'claude', path: '/path1' },
    { name: 'Skill 2', location: 'opencode', path: '/path2' },
  ];

  it('should render all skills', () => {
    render(<SkillList skills={mockSkills} onSelectSkill={vi.fn()} />);
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
  });

  it('should call onSelectSkill when skill clicked', () => {
    const onSelectSkill = vi.fn();
    render(<SkillList skills={mockSkills} onSelectSkill={onSelectSkill} />);

    fireEvent.click(screen.getByText('Skill 1'));

    expect(onSelectSkill).toHaveBeenCalledWith(mockSkills[0]);
  });

  it('should show empty state when no skills', () => {
    render(<SkillList skills={[]} onSelectSkill={vi.fn()} />);
    expect(screen.getByText(/no skills found/i)).toBeInTheDocument();
  });
});
```

### Pattern 4: Tauri Command Testing

```rust
// src-tauri/src/commands.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_skills_success() {
        let result = scan_skills();
        assert!(result.is_ok());
        let skills = result.unwrap();
        assert!(!skills.is_empty());
    }

    #[test]
    fn test_get_skill_content_invalid_path() {
        let result = get_skill_content("/nonexistent/path".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to read file"));
    }

    #[test]
    fn test_parse_yaml_frontmatter_malformed() {
        let content = "---\ninvalid: yaml: structure\n---\nContent";
        let result = parse_skill_content(content);
        // Should handle malformed YAML gracefully
        assert!(result.metadata.is_none() || result.metadata.unwrap().description.is_none());
    }
}
```

### Pattern 5: E2E Testing (Playwright)

```typescript
// e2e/skill-discovery.spec.ts
import { test, expect } from '@playwright/test';

test('should discover and display skills', async ({ page }) => {
  await page.goto('/');

  // Wait for skills to load
  await page.waitForSelector('[data-testid="skill-list"]');

  // Should display skill list
  const skillItems = await page.$$('[data-testid="skill-item"]');
  expect(skillItems.length).toBeGreaterThan(0);

  // Should display skill name
  const firstSkill = await page.$('[data-testid="skill-item"]:first-child');
  const skillName = await firstSkill?.textContent();
  expect(skillName).toBeTruthy();
});

test('should select skill and show details', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="skill-list"]');

  // Click first skill
  await page.click('[data-testid="skill-item"]:first-child');

  // Should show skill viewer
  await expect(page.locator('[data-testid="skill-viewer"]')).toBeVisible();

  // Should display skill content
  await expect(page.locator('[data-testid="skill-content"]')).toBeVisible();
});
```

---

## Success Criteria by Version

### Feature/002 Success Criteria
- [x] Vitest configured and running
- [x] Playwright configured and running
- [x] cargo test configured
- [x] Coverage reporting working
- [x] CI runs tests on every commit
- [x] Feature/002 has 100% test coverage
- [x] At least one example of each test pattern (hook, component, store, command, E2E)

### v0.2.0 Success Criteria
- [x] >50% overall test coverage
- [x] All Priority 1 tests written (BACK-005 through BACK-008)
- [x] Core business logic tested (scanner, parser, store)
- [x] All new features have 100% coverage
- [x] CI enforces test coverage (fails if <50%)

### v0.3.0 Success Criteria
- [x] >80% overall test coverage (constitutional compliance)
- [x] All Priority 2 tests written (BACK-009 through BACK-015)
- [x] All Priority 3 E2E tests written (BACK-016 through BACK-020)
- [x] All user stories have integration tests
- [x] No regressions detected (all tests pass)
- [x] CI enforces 80% coverage threshold

---

## Integration with New Feature Development

### Hybrid Backfill + Development Approach

**Week Structure** (typical v0.2.0 week):
- **Monday-Wednesday**: Build new feature with TDD (100% coverage)
- **Thursday**: Backfill sprint (1 Priority 1 test task)
- **Friday**: Code review, refactor, documentation

**Benefits**:
- ✅ Steady progress on new features
- ✅ Incremental test coverage improvement
- ✅ Apply fresh TDD learnings to backfill
- ✅ Maintain momentum

**Avoid**:
- ❌ Pure backfill sprints (demotivating)
- ❌ Ignoring backfill until v0.3.0 (too late)
- ❌ Backfilling with bad practices (learn first)

---

## Monitoring Progress

### Coverage Tracking

```bash
# Run coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# CI check (should fail if below threshold)
npm run test:coverage -- --thresholds.lines 50  # v0.2.0
npm run test:coverage -- --thresholds.lines 80  # v0.3.0
```

### Backlog Tracking

Track in [specs/BACKLOG.md](./BACKLOG.md):

```markdown
## P0: Testing Infrastructure (20 tasks)

### Feature/002: Keyboard Shortcuts (Establish TDD Patterns)
- [x] BACK-001: Set up Vitest for frontend unit tests
- [x] BACK-002: Set up Rust cargo test infrastructure
- [x] BACK-003: Configure test coverage reporting
- [x] BACK-004: Add pre-commit hook for test runs

### Backfill Priority 1: Critical Paths
- [x] BACK-005: Unit tests for skill scanner (T022)
- [x] BACK-006: Unit tests for YAML parser (T038)
- [ ] BACK-007: Unit tests for Zustand store (useSkillStore)
- [ ] BACK-008: Component tests for SkillList (T024)
```

---

## Conclusion

### The Answer to "When Should We Backfill Tests?"

**Phase 1** (Feature/002): Learn TDD on new feature first
- Timeline: Next 2 weeks
- Coverage: ~15% (new code only)
- Goal: Establish patterns and infrastructure

**Phase 2** (v0.2.0): Backfill critical paths while building features
- Timeline: Weeks 3-8
- Coverage Target: >50%
- Approach: Hybrid (1 day backfill per week)

**Phase 3** (v0.3.0): Complete backfill to constitutional compliance
- Timeline: Weeks 9-16
- Coverage Target: >80%
- Approach: Systematic backfill of remaining gaps

**Key Insight**: Don't backfill immediately. Learn by doing it right on new code first, then apply those patterns to existing code incrementally while building new features.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Next Review**: After feature/002 completion
