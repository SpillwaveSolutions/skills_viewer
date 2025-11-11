# Deviations from Specification: Core Skill Explorer

**Feature**: 001-core-skill-explorer
**Specification**: [spec.md](./spec.md)
**Implementation Plan**: [plan.md](./plan.md)
**Tasks**: [tasks.md](./tasks.md)
**Date**: 2025-11-10

---

## Purpose

This document tracks all deviations between the original specification and actual implementation. Each deviation includes:
- Task ID that was skipped or modified
- What was specified
- What was actually implemented
- Rationale for the deviation
- Impact assessment
- Remediation plan (if needed)

---

## Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| Tasks Completed as Specified | 47 | 42% |
| Tasks Completed with Modifications | 18 | 16% |
| Tasks Skipped/Deferred | 48 | 42% |
| **Total Tasks** | **113** | **100%** |

---

## Critical Deviations

### 🚨 DEV-001: No Testing Infrastructure

**Category**: Critical Gap
**Tasks Affected**: T022-T025, T037-T040, T055-T058, T070-T071, T079-T080, T089-T090
**Phase**: All phases (3-8)

**What Was Specified**:
```markdown
- [ ] T022 [P] [US1] Unit test for skill scanner
- [ ] T023 [P] [US1] Unit test for useSkills hook
- [ ] T024 [P] [US1] Component test for SkillList
- [ ] T025 [US1] E2E test for skill discovery
... (24 total test tasks)
```

**What Was Implemented**:
- ❌ Zero tests written
- ❌ No test infrastructure set up
- ❌ No Vitest configuration
- ❌ No Playwright configuration

**Rationale**:
- Focused on delivering working MVP first
- Planned to add tests "later" (anti-pattern)
- Time pressure to demonstrate functionality

**Impact**:
- 🚨 **Critical**: Current test coverage: 0%
- 🚨 **Constitutional violation**: Principle VII requires >80% coverage
- ⚠️ High risk of regressions during refactoring
- ⚠️ No confidence in code changes
- ⚠️ Difficult to onboard new developers

**Remediation Plan**:
1. **Feature/002**: Establish testing patterns with TDD
2. **Feature/003**: Backfill critical US1 tests (skill scanner, store)
3. **Feature/004**: Backfill US2 tests (file reader, YAML parser)
4. **v0.2.0 Target**: 50% test coverage
5. **v0.3.0 Target**: >80% test coverage (constitutional compliance)

**Priority**: P0 (Highest)
**Target**: Begin remediation with feature/002

---

### 🚨 DEV-002: No React Query Caching

**Category**: Architectural Simplification
**Tasks Affected**: T020, T030
**Phase**: 2 (Foundational), 3 (US1)

**What Was Specified**:
```markdown
- [ ] T020 Configure React Query provider in `src/main.tsx`
- [ ] T030 [P] [US1] Create useSkills hook in `src/hooks/useSkills.ts` using React Query
```

**What Was Implemented**:
```typescript
// No React Query
// Direct Tauri invocation in useSkills hook
export const useSkills = () => {
  const { skills, setSkills, setLoading, setError } = useSkillStore();

  useEffect(() => {
    const loadSkills = async () => {
      setLoading(true);
      try {
        const result = await invoke<Skill[]>('scan_skills');
        setSkills(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSkills();
  }, []);

  return { skills, isLoading, error };
};
```

**Rationale**:
- Simpler mental model for v0.1.0
- No caching requirements identified
- Skills loaded once per session (acceptable)
- Fewer dependencies to manage

**Impact**:
- ✅ Simplified codebase
- ✅ Adequate performance for use case
- ⚠️ No automatic refetching on window focus
- ⚠️ No background updates
- ⚠️ Manual reload required for skill changes

**Remediation Plan**:
- ✅ Keep simple approach for v0.1.x
- Consider React Query for v0.2.0 if needed
- Add manual refresh button (deferred)

**Priority**: P3 (Low)
**Status**: Accepted deviation

---

### ⚠️ DEV-003: Sequential vs. Parallel Directory Scanning

**Category**: Performance Optimization Skipped
**Task Affected**: T026
**Phase**: 3 (US1)

**What Was Specified**:
```rust
// T026: Scan both directories in parallel using tokio::join!
let (claude_skills, opencode_skills) = tokio::join!(
    scan_directory("~/.claude/skills"),
    scan_directory("~/.config/opencode/skills")
);
```

**What Was Implemented**:
```rust
// Sequential scanning
let mut skills = Vec::new();
skills.extend(scan_directory("~/.claude/skills")?);
skills.extend(scan_directory("~/.config/opencode/skills")?);
```

**Rationale**:
- Simpler error handling
- Negligible performance difference for typical use (<100 skills)
- Measured: ~300ms for 20 skills (well under 500ms target)

**Impact**:
- ✅ Meets performance target (<500ms)
- ✅ Simpler code, easier to understand
- ⚠️ Slightly slower with large skill counts (>100)

**Remediation Plan**:
- ✅ Monitor performance in production
- If users report slow scans (>500ms), add parallel scanning
- Not urgent for v0.1.x

**Priority**: P4 (Very Low)
**Status**: Accepted deviation

---

### ⚠️ DEV-004: No Virtual Scrolling

**Category**: Performance Optimization Skipped
**Task Affected**: T032
**Phase**: 3 (US1)

**What Was Specified**:
```tsx
// T032: Create SkillList with virtual scrolling (@tanstack/react-virtual)
import { useVirtualizer } from '@tanstack/react-virtual';

export const SkillList = ({ skills }) => {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: skills.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64
  });
  // ... virtual scrolling implementation
};
```

**What Was Implemented**:
```tsx
// Regular React rendering
export const SkillList = ({ skills, onSelectSkill }) => {
  return (
    <div className="overflow-y-auto">
      {skills.map(skill => (
        <SkillListItem key={skill.name} skill={skill} onClick={onSelectSkill} />
      ))}
    </div>
  );
};
```

**Rationale**:
- Assumption: Users have <100 skills
- Performance acceptable for expected usage
- Simpler implementation
- Can add later if needed

**Impact**:
- ✅ Adequate performance for typical use
- ✅ Simpler codebase
- ⚠️ Potential lag with 100+ skills
- ⚠️ Increased memory usage with large lists

**Remediation Plan**:
- Monitor user feedback
- If >100 skill use cases emerge, add virtual scrolling
- Target: v0.3.0 if needed

**Priority**: P4 (Very Low)
**Status**: Accepted deviation

---

### ⚠️ DEV-005: No Navigation Store

**Category**: Feature Simplification
**Tasks Affected**: T019, T062-T069
**Phase**: 2 (Foundational), 5 (US3)

**What Was Specified**:
```typescript
// T019: Setup Zustand navigation store with history management
interface NavigationStore {
  history: string[];
  currentIndex: number;
  goBack: () => void;
  goForward: () => void;
  navigate: (path: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
}
```

**What Was Implemented**:
```typescript
// Simple back button logic in SkillViewer
const handleBackClick = () => {
  setSelectedSkill(null);  // Just clear selection
};
```

**Rationale**:
- MVP doesn't need complex navigation
- Single-level navigation sufficient
- No reference drilling planned for v0.1.0

**Impact**:
- ✅ Adequate for current features
- ⚠️ No breadcrumb navigation
- ⚠️ No forward/back history
- ⚠️ Can't navigate references yet

**Remediation Plan**:
- Add navigation store in v0.2.0
- Implement breadcrumbs (T064)
- Add keyboard shortcuts (Alt+Left/Right) in feature/002

**Priority**: P2 (Medium)
**Target**: v0.2.0

---

## Moderate Deviations

### DEV-006: No Separate MetadataDisplay Component

**Task Affected**: T046
**Phase**: 4 (US2)

**Specified**: Separate component `src/components/SkillViewer/MetadataDisplay.tsx`
**Actual**: Metadata display integrated in SkillViewer component
**Rationale**: Reduced component nesting, not reused elsewhere
**Impact**: Slightly larger SkillViewer component (acceptable)
**Status**: Accepted

---

### DEV-007: No Separate TabBar Component

**Task Affected**: T051
**Phase**: 4 (US2)

**Specified**: Dedicated TabBar component `src/components/Navigation/TabBar.tsx`
**Actual**: Tab navigation integrated in SkillViewer
**Rationale**: Tabs not reused elsewhere
**Impact**: More coupled code (acceptable for v0.1.0)
**Status**: Accepted

---

### DEV-008: No Service Layer

**Task Affected**: T027
**Phase**: 3 (US1)

**Specified**: Business logic in `src-tauri/src/services/skill_service.rs`
**Actual**: Business logic directly in commands
**Rationale**: Simple use cases, no need for extra layer
**Impact**: Less separation of concerns (acceptable)
**Status**: Accepted

---

### DEV-009: No KeywordHighlighter Component

**Task Affected**: T073
**Phase**: 6 (US4)

**Specified**: Separate component for keyword highlighting
**Actual**: Highlighting logic integrated in TriggerAnalysis
**Rationale**: Not reused elsewhere
**Impact**: Minor - component is still manageable
**Status**: Accepted

---

### DEV-010: Simplified Confidence Levels

**Task Affected**: T077
**Phase**: 6 (US4)

**Specified**: Detailed confidence scoring algorithm
**Actual**: Basic categorization only (action, technology, format, topic)
**Rationale**: v0.1.0 MVP doesn't need sophisticated scoring
**Impact**: Less granular insights (acceptable)
**Status**: Accepted

---

## Minor Deviations

### DEV-011: No Lazy Loading of Mermaid

**Task**: T084
**Specified**: `React.lazy()` for code splitting
**Actual**: Mermaid loaded eagerly
**Impact**: Slightly larger initial bundle
**Priority**: P3

---

### DEV-012: No Debounced Search Input

**Task**: T091
**Specified**: 300ms debounced search input
**Actual**: Immediate filtering with useMemo
**Impact**: None - fast enough
**Priority**: P4

---

### DEV-013: No Location Filter

**Task**: T093
**Specified**: Filter by claude/opencode location
**Actual**: Search by name/description only
**Impact**: Minor UX gap
**Priority**: P3

---

### DEV-014: No ESLint/Prettier Configuration

**Task**: T006
**Specified**: Configure ESLint and Prettier
**Actual**: Not configured
**Impact**: Code formatting inconsistencies
**Priority**: P2

---

## Completely Skipped Features

### SKP-001: Advanced Diagram Features

**Tasks**: T086-T088
**Features**:
- Zoom/pan controls
- Click handlers on nodes
- Export to PNG/Mermaid source

**Status**: Deferred to v0.2.0
**Priority**: P3

---

### SKP-002: Keyboard Shortcuts

**Task**: T097
**Feature**: Cmd/Ctrl+F for search focus
**Status**: Being added in feature/002
**Priority**: P1

---

### SKP-003: Full Accessibility

**Task**: T106
**Features**:
- Complete ARIA labels
- Focus management
- Screen reader testing

**Status**: Deferred to v0.2.0
**Priority**: P2

---

### SKP-004: Cross-Platform Testing

**Task**: T111
**Status**: Deferred to v0.2.0
**Priority**: P2

---

### SKP-005: Performance Benchmarks

**Task**: T112
**Status**: Deferred to v0.2.0
**Priority**: P3

---

### SKP-006: Security Audit

**Task**: T113
**Status**: Deferred to v0.3.0
**Priority**: P2

---

## Deviation Patterns

### Pattern 1: Testing Deferred
**Tasks**: All test tasks (24 total)
**Why**: Focus on functionality first
**Lesson**: Should follow TDD from start

### Pattern 2: Performance Optimizations Skipped
**Examples**: Virtual scrolling, parallel scanning, lazy loading
**Why**: "Good enough" performance without them
**Lesson**: Valid for MVP, premature optimization avoided

### Pattern 3: Component Nesting Reduced
**Examples**: No separate MetadataDisplay, TabBar, KeywordHighlighter
**Why**: Not reused, simpler structure
**Lesson**: YAGNI principle applied correctly

### Pattern 4: Advanced Features Deferred
**Examples**: Navigation history, diagram zoom, export
**Why**: Not needed for core value proposition
**Lesson**: Good MVP scoping

---

## Lessons for Future Features

### 1. **Write Tests First** (TDD)
Don't defer testing - it never happens

### 2. **Document Deviations Real-Time**
Mark [~] with notes immediately when simplifying

### 3. **Validate "Good Enough"**
Performance shortcuts acceptable if target met

### 4. **Apply YAGNI**
Don't create abstractions until needed

### 5. **Stop at Checkpoints**
Don't skip validation gates

---

## Remediation Roadmap

### v0.1.1 (Documentation)
- ✅ This document
- ✅ IMPLEMENTATION_REALITY.md
- ✅ Updated tasks.md with [x]/[~]/[ ] markers

### v0.2.0 (Testing + Navigation)
- Add keyboard shortcuts (feature/002) with full TDD
- Backfill critical tests (>50% coverage)
- Add navigation store and breadcrumbs
- Configure ESLint/Prettier

### v0.3.0 (Quality)
- Achieve >80% test coverage
- Full accessibility audit
- Cross-platform testing
- Advanced diagram features

### v0.4.0 (Polish)
- Performance benchmarks
- Security audit
- Production hardening

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Next Review**: After feature/002 completion
