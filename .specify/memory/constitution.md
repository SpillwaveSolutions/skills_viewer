<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Modified Principles: Initial creation
Added Sections: All sections (initial constitution)
Removed Sections: None
Templates Requiring Updates: None (initial creation)
Follow-up TODOs: None
-->

# Skill Debugger Desktop Application Constitution

## Core Principles

### I. Native Desktop Experience
The application MUST provide a truly native desktop experience, not a web app in disguise. All UI components must follow platform-specific design guidelines (macOS Human Interface Guidelines, Windows Design, Linux Desktop patterns). Performance must be optimized for desktop usage with instant startup (<2s), smooth 60fps animations, and efficient resource utilization. The application should feel lightweight and responsive at all times.

**Rationale**: Users expect desktop applications to be fast, native-feeling, and integrated with their operating system. A web-like experience defeats the purpose of a desktop application.

### II. Developer-First Design
Every feature must serve the primary goal: helping developers debug, understand, and optimize their Claude Code skills. The UI should prioritize information density, keyboard navigation, and power-user workflows. All data presentations must be scannable, filterable, and searchable. The tool should make implicit relationships explicit through visualization.

**Rationale**: This is a developer tool for developers. It must respect developer workflows and provide professional-grade debugging capabilities.

### III. Read-Only Safety
The application MUST operate in read-only mode by default. All skill file reads are non-destructive. Any future write operations (editing skills, generating reports) must be explicitly opt-in, clearly marked, and provide undo/rollback mechanisms. The application should never modify user's skill files without explicit confirmation.

**Rationale**: Developers need confidence that debugging tools won't corrupt their work. Trust is established through safe, predictable behavior.

### IV. Cross-Platform Consistency
The application must work identically on macOS, Linux, and Windows. Platform-specific features are acceptable only when they enhance the native experience without breaking cross-platform functionality. All file path handling must respect platform conventions (case-sensitivity, path separators, home directory expansion).

**Rationale**: Developers work across multiple platforms. The tool should provide consistent functionality everywhere.

### V. Performance and Efficiency
- Cold start: <2 seconds to main window
- Skill directory scanning: <500ms for typical installations (20-50 skills)
- UI rendering: 60fps for all interactions
- Memory usage: <200MB for typical use
- Markdown rendering: <100ms per document
- Diagram rendering: Progressive loading with placeholders

**Rationale**: Slow tools interrupt flow. Performance is a feature that enables productivity.

### VI. Visualization-First Understanding
Complex relationships (skill dependencies, reference chains, trigger patterns) must be visualized graphically, not just listed textually. Mermaid diagrams should be generated automatically to show skill architecture. Interactive graphs should allow drilling down into details. Color coding must convey meaning (skill types, trigger confidence, reference depth).

**Rationale**: Visual representations reveal patterns that text lists obscure. Developers understand systems faster through diagrams.

### VII. Testability and Quality
- All core logic must have unit tests (>80% coverage)
- UI components must have integration tests
- File system operations must be mockable for testing
- Manual testing checklists required before releases
- Error handling must be comprehensive with user-friendly messages

**Rationale**: A buggy debugging tool is worse than no tool. Quality assurance prevents wasted developer time.

## Technical Standards

### Technology Stack Requirements
- **Frontend**: React 18+ with TypeScript 5+, strict mode enabled
- **Desktop Framework**: Tauri 2.x (Rust backend, web frontend hybrid)
- **State Management**: React Context API or Zustand (avoid over-engineering)
- **UI Components**: Headless UI libraries (Radix UI, Headless UI) for accessibility
- **Markdown Rendering**: react-markdown with syntax highlighting (Prism/Highlight.js)
- **Diagram Rendering**: Mermaid.js for flowcharts, D3.js for custom visualizations
- **Build Tool**: Vite 5+ for fast development and optimized production builds
- **Testing**: Vitest for unit tests, Playwright for E2E tests

### Code Quality Standards
- TypeScript strict mode with no `any` types (use `unknown` where necessary)
- ESLint with React and TypeScript plugins, Prettier for formatting
- Component modularity: max 250 lines per component file
- Function purity: prefer pure functions, isolate side effects
- Dependency injection for testability
- Comprehensive JSDoc comments for public APIs

### Security Requirements
- No network requests without explicit user consent
- All file operations confined to skill directories (~/.claude/skills, ~/.config/opencode/skills)
- No execution of arbitrary code from skill files
- Input sanitization for all user-provided data
- Content Security Policy for webview

## Development Workflow

### Feature Development Process
1. Write specification in `.specify/features/[feature-name]/specify.md`
2. Create implementation plan in `plan.md`
3. Break down into tasks in `tasks.md`
4. Implement with tests (TDD where applicable)
5. Perform manual testing against checklist
6. Create pull request with screenshots/demo

### Testing Requirements
- Unit tests for all utility functions and hooks
- Integration tests for critical user workflows
- E2E tests for main application paths
- Performance benchmarks for file operations and rendering
- Manual testing on all three platforms before release

### Code Review Standards
- All PRs require review before merge
- Reviewers must verify tests pass and cover new code
- UI changes require screenshots or video demonstration
- Performance regressions must be justified and documented
- Accessibility checks for all interactive elements

## Governance

### Constitutional Authority
This constitution represents the foundational principles and standards for the Skill Debugger project. All design decisions, architecture choices, and implementation details must align with these principles. In cases of conflict between convenience and constitutional principles, principles prevail.

### Amendment Process
- Amendments require documentation of rationale and impact analysis
- Version bumping follows semantic versioning:
  - MAJOR: Backward-incompatible principle changes or removals
  - MINOR: New principles added or significant expansions
  - PATCH: Clarifications, wording improvements, typo fixes
- All amendments must update this document and propagate changes to templates

### Compliance Verification
- All pull requests must include a constitutional compliance statement
- Reviewers must verify alignment with principles
- Complexity must be justified with reference to specific principles
- Deviations require explicit documentation and approval

## Lessons Learned (v0.1.0)

### What Went Wrong

During v0.1.0 implementation (features 001 and 002), we **violated the Specification-Driven Development (SDD) methodology** in critical ways:

**Critical Deviation #1: Ignored Tasks During Implementation**
- Created spec artifacts (spec.md, plan.md, tasks.md)
- Then **implemented features based on intuition**, not the task list
- Retroactively marked tasks as complete after implementation
- Result: 42% of tasks skipped or simplified without documentation

**Critical Deviation #2: Zero Test Coverage**
- Skipped all 24 testing tasks from tasks.md
- Final test coverage: 0% (violates Principle VII requiring >80%)
- No TDD practices established
- Result: Cannot refactor safely, no regression detection

**Critical Deviation #3: Treated Specs as Documentation, Not Executable Artifacts**
- SDD principle: Specs drive implementation
- What we did: Implemented first, documented after
- Tasks.md became retrospective record, not work queue
- Result: Spec-implementation drift, unclear what was actually built

### Proper SDD Workflow

All future features **MUST** follow this workflow from the [SDD skill](~/.claude/skills/sdd/):

```bash
# 1. Create feature branch
git checkout -b feature/XXX-feature-name

# 2. Initialize feature specification
/speckit.specify <detailed requirements>

# 3. Clarify ambiguities (MANDATORY if spec unclear)
/speckit.clarify

# 4. Create implementation plan with constraints
/speckit.plan <technical decisions, architecture, constraints>

# 5. Generate task breakdown
/speckit.tasks

# 6. Validate consistency across artifacts
/speckit.analyze

# 7. Implement by following tasks.md STRICTLY
/speckit.implement
# - Read tasks.md sequentially
# - Complete each task in order
# - Mark [x] ONLY when fully done
# - Mark [~] if simplified (with notes)
# - Do NOT skip ahead
# - Do NOT freelance
```

### Mandatory Process Improvements (v0.2.0+)

**1. Test-Driven Development (TDD) Enforcement**
- Write tests BEFORE implementation code
- Each task in tasks.md must specify test requirements
- CI must enforce test coverage >80% for new code
- Feature branches cannot merge without passing tests

**2. Real-Time Task Tracking**
- Mark tasks [x]/[~]/[ ] DURING implementation, not after
- Document deviations immediately when they occur
- Use [~] for simplifications with inline rationale notes
- Tasks.md is the single source of truth for progress

**3. Checkpoint Validation**
- After each SDD command (/speckit.specify, .plan, .tasks), STOP
- Review artifacts before proceeding
- Use /speckit.analyze to validate consistency
- Do not implement until tasks.md is approved

**4. Constitutional Compliance Checks**
- Every PR must include compliance statement
- Reference which principles are satisfied
- Document any deviations with justification
- Reviewers must verify alignment

**5. SDD Skill Reference**
- Location: `~/.claude/skills/sdd/`
- Contains: Greenfield workflow, brownfield strategies, command reference
- Consult before starting ANY new feature
- Follow examples in `references/` directory

### Remediation Plan

**v0.1.1 (Documentation Release)**
- ✅ Document actual implementation (IMPLEMENTATION_REALITY.md)
- ✅ Track all deviations (DEVIATIONS.md for 001, 002)
- ✅ Consolidate backlog (BACKLOG.md)
- ✅ Update constitution (this section)

**v0.2.0 (Testing + TDD Patterns)**
- Feature/002: Keyboard shortcuts using PROPER SDD workflow
- Establish TDD patterns (100% coverage for feature/002)
- Backfill critical tests (target >50% overall coverage)
- Configure ESLint/Prettier
- Accessibility audit

**v0.3.0 (Constitutional Compliance)**
- Achieve >80% test coverage (Principle VII)
- WCAG 2.1 AA compliance
- Full E2E test suite
- Cross-platform validation

### Never Again

The following practices are **BANNED** from v0.2.0 forward:

- ❌ Implementing without approved tasks.md
- ❌ Skipping /speckit commands
- ❌ Marking tasks complete retroactively
- ❌ Deferring tests "for later"
- ❌ Treating specs as documentation instead of executable artifacts
- ❌ Freelancing features not in tasks.md
- ❌ Merging without test coverage

**Enforcement**: Any PR violating these rules will be rejected immediately.

**Version**: 1.1.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
