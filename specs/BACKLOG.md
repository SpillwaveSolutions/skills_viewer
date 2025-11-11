# Product Backlog: Skill Debugger

**Last Updated**: 2025-11-10
**Current Version**: v0.1.0
**Status**: Post-MVP Backfill

---

## Purpose

This document consolidates all deferred, skipped, and future-planned features from v0.1.0 implementation. Tasks are organized by priority and target version.

**Sources**:
- [specs/001-core-skill-explorer/tasks.md](./001-core-skill-explorer/tasks.md)
- [specs/002-ui-redesign/tasks.md](./002-ui-redesign/tasks.md)
- [specs/IMPLEMENTATION_REALITY.md](./IMPLEMENTATION_REALITY.md)
- [specs/001-core-skill-explorer/DEVIATIONS.md](./001-core-skill-explorer/DEVIATIONS.md)

---

## Backlog Summary

| Priority | v0.2.0 | v0.3.0 | v0.4.0+ | Total |
|----------|--------|--------|---------|-------|
| **P0 (Critical)** | 12 | 8 | 0 | 20 |
| **P1 (High)** | 8 | 6 | 2 | 16 |
| **P2 (Medium)** | 6 | 10 | 4 | 20 |
| **P3 (Low)** | 2 | 4 | 8 | 14 |
| **Total** | **28** | **28** | **14** | **70** |

---

## P0: Critical (Must Have)

### 🚨 Testing Infrastructure (20 tasks)

**Why Critical**: Constitutional requirement (>80% coverage), prevents regressions

#### v0.2.0 Target: Establish Patterns + 50% Coverage

**Feature/002: Keyboard Shortcuts (Establish TDD Patterns)**
- [ ] BACK-001: Set up Vitest for frontend unit tests
- [ ] BACK-002: Set up Rust cargo test infrastructure
- [ ] BACK-003: Configure test coverage reporting
- [ ] BACK-004: Add pre-commit hook for test runs

**Backfill Priority 1: Critical Paths**
- [ ] BACK-005: Unit tests for skill scanner (T022)
  - Test directory scanning
  - Test skill parsing
  - Test error handling

- [ ] BACK-006: Unit tests for YAML parser (T038)
  - Test frontmatter extraction
  - Test malformed YAML handling
  - Test edge cases

- [ ] BACK-007: Unit tests for Zustand store (useSkillStore)
  - Test state mutations
  - Test actions
  - Test derived state

- [ ] BACK-008: Component tests for SkillList (T024)
  - Test rendering
  - Test selection
  - Test empty states

#### v0.3.0 Target: 80% Coverage

**Backfill Priority 2: User Stories**
- [ ] BACK-009: Unit tests for file reader (T037)
- [ ] BACK-010: Component tests for SkillViewer (T039)
- [ ] BACK-011: Unit tests for trigger analyzer (T070)
- [ ] BACK-012: Component tests for TriggerAnalysis (T071)
- [ ] BACK-013: Unit tests for diagram generator (T079)
- [ ] BACK-014: Component tests for DiagramView (T080)
- [ ] BACK-015: Component tests for SearchBar (T089)

**Backfill Priority 3: E2E Tests**
- [ ] BACK-016: Set up Playwright for E2E testing
- [ ] BACK-017: E2E test for skill discovery (T025)
- [ ] BACK-018: E2E test for skill viewing (T040)
- [ ] BACK-019: E2E test for navigation (T058)
- [ ] BACK-020: E2E test for search (T090)

**Success Criteria**:
- [ ] v0.2.0: >50% test coverage
- [ ] v0.3.0: >80% test coverage
- [ ] All new features: 100% test coverage from day 1

---

## P1: High Priority (Should Have)

### Keyboard Shortcuts (Feature/002) - 8 tasks

**Target**: v0.2.0 (Next Feature)
**Status**: In planning

**Using Proper SDD Workflow**:
- [ ] FEAT-002-001: `/speckit.specify` - Define keyboard shortcut requirements
- [ ] FEAT-002-002: `/speckit.clarify` - Ask clarifying questions
- [ ] FEAT-002-003: `/speckit.plan` - Technical implementation plan
- [ ] FEAT-002-004: `/speckit.tasks` - Generate task list
- [ ] FEAT-002-005: `/speckit.analyze` - Validate consistency
- [ ] FEAT-002-006: `/speckit.implement` - Execute tasks with TDD
- [ ] FEAT-002-007: Add keyboard shortcut help overlay
- [ ] FEAT-002-008: Document shortcuts in README

**Shortcuts to Implement**:
- Cmd/Ctrl+F: Focus search
- Cmd/Ctrl+1-6: Switch tabs
- Arrow keys: Navigate skill list
- Enter: Select skill
- Escape: Clear/close
- Cmd/Ctrl+K: Command palette (future)

---

### Navigation System Enhancement - 6 tasks

**Target**: v0.3.0
**Dependencies**: Feature/002 complete

- [ ] NAV-001: Implement navigation store (T062)
  - History stack
  - goBack/goForward actions
  - Navigation state

- [ ] NAV-002: Create Breadcrumbs component (T064)
  - Show navigation path
  - Clickable breadcrumb items
  - Responsive design

- [ ] NAV-003: Add keyboard navigation (T068)
  - Alt+Left: Back
  - Alt+Right: Forward
  - Cmd/Ctrl+B: Toggle breadcrumbs

- [ ] NAV-004: Implement reference navigation (T066-T067)
  - Click reference to view content
  - Display reference markdown
  - Back to skill functionality

- [ ] NAV-005: Navigation history UI (T065)
  - Back/forward buttons
  - Visual disabled states
  - Tooltip with destination

- [ ] NAV-006: Add navigation tests
  - Unit tests for navigation store
  - Component tests for Breadcrumbs
  - E2E tests for navigation flows

---

### Code Quality Tools - 2 tasks

**Target**: v0.2.0
**Priority**: High (prevents technical debt)

- [ ] QUAL-001: Configure ESLint (T006)
  - TypeScript rules
  - React rules
  - Accessibility rules (jsx-a11y)
  - Pre-commit hook

- [ ] QUAL-002: Configure Prettier (T006)
  - Consistent formatting
  - Pre-commit hook
  - Editor integration docs

---

## P2: Medium Priority (Nice to Have)

### Accessibility Audit & Compliance - 6 tasks

**Target**: v0.2.0-v0.3.0
**Goal**: WCAG 2.1 AA compliance

- [ ] A11Y-001: Run automated accessibility audit
  - axe DevTools
  - WAVE
  - Lighthouse

- [ ] A11Y-002: Add missing ARIA labels (T106)
  - Button labels
  - Icon labels
  - Live regions

- [ ] A11Y-003: Improve focus management (T106)
  - Focus visible styles
  - Focus trap in modals (future)
  - Skip links

- [ ] A11Y-004: Screen reader testing
  - NVDA (Windows)
  - JAWS (Windows)
  - VoiceOver (macOS)

- [ ] A11Y-005: Keyboard navigation enhancement
  - Tab order optimization
  - Keyboard shortcuts discoverable
  - No keyboard traps

- [ ] A11Y-006: Color contrast validation
  - Check all text/background combinations
  - Test with color blindness simulators

---

### Advanced Diagram Features - 10 tasks

**Target**: v0.3.0
**Dependencies**: Core diagram working

- [ ] DIAG-001: Add zoom controls (T086)
  - Zoom in/out buttons
  - Zoom to fit
  - Mouse wheel zoom

- [ ] DIAG-002: Add pan controls (T086)
  - Click and drag
  - Pan buttons
  - Mini-map (optional)

- [ ] DIAG-003: Click handlers on diagram nodes (T087)
  - Navigate to skill/reference/script
  - Highlight related nodes
  - Context menu (right-click)

- [ ] DIAG-004: Export diagram as PNG (T088)
  - High-resolution export
  - Transparent background option
  - Download button

- [ ] DIAG-005: Export diagram as SVG (T088)
  - Scalable export
  - Editable in design tools

- [ ] DIAG-006: Export Mermaid source (T088)
  - Copy to clipboard
  - Download as .mmd file

- [ ] DIAG-007: Diagram layout options
  - Top-to-bottom (current)
  - Left-to-right
  - Radial

- [ ] DIAG-008: Node styling customization
  - Color schemes
  - Icon types
  - Label formatting

- [ ] DIAG-009: Lazy load Mermaid library (T084)
  - Code splitting
  - Only load when diagram tab opened
  - Loading placeholder

- [ ] DIAG-010: Diagram performance optimization
  - Simplify large diagrams
  - Progressive rendering
  - Caching

---

### Search & Filter Enhancements - 4 tasks

**Target**: v0.2.0-v0.3.0

- [ ] SEARCH-001: Add location filter (T093)
  - Filter by ~/.claude/skills
  - Filter by ~/.config/opencode/skills
  - Combined view (default)

- [ ] SEARCH-002: Add tag filtering
  - Filter by skill tags (from metadata)
  - Multiple tag selection
  - Tag cloud visualization

- [ ] SEARCH-003: Advanced search operators
  - Boolean operators (AND, OR, NOT)
  - Field-specific search (name:, description:)
  - Fuzzy matching

- [ ] SEARCH-004: Search result highlighting
  - Highlight matching text
  - Show context snippets
  - Result ranking

---

## P3: Low Priority (Future Enhancements)

### Performance Optimization - 4 tasks

**Target**: v0.3.0+
**Trigger**: User reports performance issues

- [ ] PERF-001: Add virtual scrolling (T032)
  - @tanstack/react-virtual
  - For skill lists >100 items

- [ ] PERF-002: Parallel directory scanning (T026)
  - tokio::join! for concurrent scans
  - For large skill collections

- [ ] PERF-003: Performance benchmarks (T112)
  - Startup time measurement
  - Scan time benchmarks
  - Rendering performance
  - Memory profiling

- [ ] PERF-004: Bundle size optimization (T105)
  - Analyze with Vite build analyzer
  - Tree shaking verification
  - Lazy loading opportunities

---

### Cross-Platform Support - 4 tasks

**Target**: v0.3.0
**Goal**: Ensure consistent behavior

- [ ] PLATFORM-001: Manual testing on Windows (T111)
  - All features work
  - Keyboard shortcuts (Ctrl vs Cmd)
  - Path handling

- [ ] PLATFORM-002: Manual testing on Linux (T111)
  - All features work
  - Window manager compatibility
  - Path handling

- [ ] PLATFORM-003: Automated cross-platform tests
  - GitHub Actions matrix
  - Windows, macOS, Linux

- [ ] PLATFORM-004: Platform-specific documentation
  - Installation per platform
  - Known platform issues
  - Platform-specific shortcuts

---

### Polish & UX Improvements - 8 tasks

**Target**: v0.3.0-v0.4.0

- [ ] POLISH-001: Application icons (T098)
  - macOS .icns
  - Windows .ico
  - Linux .png

- [ ] POLISH-002: Keyboard shortcut help menu (T101)
  - ? key to show shortcuts
  - Searchable command palette
  - Grouped by context

- [ ] POLISH-003: Global error boundary (T102)
  - Catch React errors
  - User-friendly error messages
  - Error reporting (optional)

- [ ] POLISH-004: Performance monitoring (T103)
  - Startup time logging
  - Scan time measurement
  - Performance dashboard

- [ ] POLISH-005: Dark mode support
  - Toggle in settings
  - Respect system preference
  - Persistent choice

- [ ] POLISH-006: Settings/preferences
  - Default skill directory
  - UI theme
  - Keyboard shortcuts customization

- [ ] POLISH-007: Skill refresh button
  - Manual refresh (T020)
  - Auto-refresh toggle
  - File system watcher (advanced)

- [ ] POLISH-008: Export/import features
  - Export skill inventory as JSON
  - Export reports
  - Bookmark skills

---

### Documentation & Onboarding - 2 tasks

**Target**: v0.2.0

- [ ] DOCS-001: Create CONTRIBUTING.md (T108)
  - Development setup
  - Code style guide
  - PR process
  - Testing requirements

- [ ] DOCS-002: Add LICENSE file (T109)
  - Choose license (MIT recommended)
  - Add license headers to source files

---

### Security & Compliance - 4 tasks

**Target**: v0.4.0

- [ ] SEC-001: Security audit (T113)
  - Verify CSP
  - Path sanitization review
  - XSS vulnerability check
  - Dependency audit

- [ ] SEC-002: Content Security Policy hardening (T100)
  - Strict CSP directives
  - Nonce-based script loading
  - Report-only mode testing

- [ ] SEC-003: Dependency security scanning
  - npm audit automation
  - cargo audit automation
  - Automated updates (Dependabot)

- [ ] SEC-004: Privacy audit
  - No telemetry
  - No network requests
  - Local-only data

---

## Version Roadmap

### v0.1.1 (Documentation Release)
**Goal**: Document current state, prepare for proper SDD
**Timeline**: Complete

- [x] IMPLEMENTATION_REALITY.md
- [x] DEVIATIONS.md (001, 002)
- [x] This BACKLOG.md
- [x] Constitution updates
- [x] README and CLAUDE.md SDD notes

---

### v0.2.0 (Testing & Keyboard Shortcuts)
**Goal**: Establish TDD patterns, >50% coverage, keyboard shortcuts
**Timeline**: 2-3 weeks
**Target Tasks**: 28

**Focus Areas**:
1. Feature/002: Keyboard shortcuts (full TDD)
2. Testing infrastructure setup
3. Backfill critical tests (scanner, parser, store)
4. ESLint + Prettier
5. Basic accessibility improvements

**Success Criteria**:
- [ ] Feature/002 complete with 100% test coverage
- [ ] Overall project >50% test coverage
- [ ] ESLint and Prettier configured
- [ ] No known critical accessibility issues

---

### v0.3.0 (Quality & Navigation)
**Goal**: >80% test coverage, full navigation, WCAG 2.1 AA
**Timeline**: 4-6 weeks
**Target Tasks**: 28

**Focus Areas**:
1. Achieve >80% test coverage (constitutional compliance)
2. Full navigation system with breadcrumbs
3. Accessibility compliance (WCAG 2.1 AA)
4. Advanced diagram features
5. Cross-platform validation

**Success Criteria**:
- [ ] >80% test coverage across frontend and backend
- [ ] WCAG 2.1 AA compliance verified
- [ ] Navigation system complete
- [ ] Tested on all platforms

---

### v0.4.0+ (Polish & Advanced Features)
**Goal**: Production-ready, advanced features
**Timeline**: TBD
**Target Tasks**: 14

**Focus Areas**:
1. Security audit and hardening
2. Performance optimization
3. Advanced UX features (dark mode, settings)
4. Export/import capabilities
5. File system watching

---

## SDD Workflow for New Features

All new features MUST follow this workflow:

```bash
# 1. Create feature branch
git checkout -b feature/XXX-feature-name

# 2. Use SDD commands in order
/speckit.specify <requirements>
/speckit.clarify  # Ask questions
/speckit.plan <tech choices with constraints>
/speckit.tasks
/speckit.analyze
/speckit.implement  # Follow tasks strictly

# 3. Validation
- All tasks marked [x]
- Tests pass (>80% coverage for new code)
- Manual testing complete
- No accessibility regressions

# 4. Merge
- Create PR
- Review
- Merge to main
```

**No exceptions** to this workflow.

---

## Test Backfill Strategy

See [TEST_BACKFILL_STRATEGY.md](./TEST_BACKFILL_STRATEGY.md) for detailed plan.

**Summary**:
1. Feature/002: Establish TDD patterns (100% coverage)
2. Feature/003: Backfill + new feature (priority 1 backfill)
3. Feature/004: Backfill + new feature (priority 2 backfill)
4. v0.3.0: Achieve >80% overall coverage

**Hybrid Approach**: Learn from doing it right (feature/002), then incrementally backfill while building new features.

---

## Prioritization Criteria

**P0 (Critical)**:
- Blocks other work
- Constitutional requirement
- Security/reliability impact

**P1 (High)**:
- Significant user value
- Enables other features
- Quality/maintainability impact

**P2 (Medium)**:
- Nice-to-have user value
- Minor quality improvements
- Deferred optimizations

**P3 (Low)**:
- Future enhancements
- Edge cases
- Speculative features

---

## Review Cycle

This backlog will be reviewed and updated:
- After each feature completion
- At version milestones (v0.2.0, v0.3.0, etc.)
- When priorities change based on user feedback

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Next Review**: After feature/002 completion
