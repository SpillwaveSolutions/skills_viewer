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

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
