# Skill Debugger Design Documentation

**Version**: 1.0.0
**Last Updated**: 2025-11-13
**Project Repository**: [SpillwaveSolutions/skills_viewer](https://github.com/SpillwaveSolutions/skills_viewer)

## Overview

This directory contains comprehensive design and architecture documentation for the Skill Debugger project. The documentation is organized to support developers, architects, contributors, and new team members in understanding the system's structure, design decisions, and implementation details.

**What is Skill Debugger?**

Skill Debugger is a native desktop application built with Tauri 2.x and React that enables Claude Code skill developers to explore, analyze, and debug their installed skills. The application provides comprehensive visibility into skill structure, content, relationships, and trigger patterns.

## Documentation Structure

### Quick Navigation

```
docs/
├── design/                          # Architecture & Technical Design (you are here)
│   ├── README.md                    # This file - master index
│   ├── ARCHITECTURE_OVERVIEW.md     # Complete system architecture
│   ├── FRONTEND_DOCUMENTATION.md    # React/TypeScript frontend
│   ├── BACKEND_DOCUMENTATION.md     # Rust/Tauri backend
│   └── diagrams/                    # Mermaid architecture diagrams
├── requirements/                    # Product Requirements
│   └── main.md                      # Requirements entry point
├── v0.2-enhancement-suite/          # v0.2 Release Planning
│   └── 00-OVERVIEW.md               # Feature roadmap & architecture
├── TECHNICAL_DOCUMENTATION.md       # High-level technical summary
└── FEATURE_BRAINSTORM.md            # Future feature ideas
```

---

## Core Architecture Documentation

### 1. [Complete Architecture Overview](./ARCHITECTURE_OVERVIEW.md)

**Purpose**: Comprehensive system architecture reference

**Contents**:

- System overview and technology stack
- Architecture layers (Frontend, Backend, IPC, File System)
- Component catalog with 15+ components
- State management with Zustand
- Data flow and IPC communication
- Design patterns and best practices
- Performance optimization strategies
- Security architecture
- Testing strategy

**When to Use**:

- Onboarding new developers
- Understanding system design decisions
- Planning architectural changes
- Reviewing system-wide patterns

**Key Sections**:

- Technology Stack (React 19, Tauri 2.x, Rust, TypeScript)
- Component hierarchy and relationships
- Zustand store architecture
- Tauri IPC command reference
- Performance benchmarks

---

### 2. [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)

**Purpose**: Deep dive into React/TypeScript frontend implementation

**Contents**:

- React component library (15+ components)
- Component API specifications
- Props, state, and hooks reference
- Zustand store architecture
- UI patterns and conventions
- Styling with TailwindCSS 4.x
- Markdown rendering pipeline
- Mermaid diagram integration
- Performance optimization techniques

**When to Use**:

- Implementing new UI features
- Debugging React component issues
- Understanding state management
- Styling components with Tailwind

**Component Categories**:

- **Core Components**: App, SkillViewer, SkillList
- **Tab Components**: OverviewPanel, ContentTab, ReferencesTab, ScriptsTab, TriggersTab, DiagramTab
- **UI Components**: SearchBar, SkillListItem, ErrorBoundary
- **Analysis Components**: TriggerAnalysis, DescriptionSection

---

### 3. [Backend Documentation](./BACKEND_DOCUMENTATION.md)

**Purpose**: Complete Rust/Tauri backend reference

**Contents**:

- Rust module organization
- Tauri command catalog (10+ commands)
- Data models (Skill, Reference, Script, TriggerAnalysis)
- File system utilities
- Skill scanning algorithm
- YAML frontmatter parser
- Error handling strategies
- Path resolution logic
- Async runtime (Tokio) patterns

**When to Use**:

- Adding new Tauri commands
- Modifying skill scanning logic
- Understanding file system operations
- Debugging backend errors

**Key Modules**:

- `commands/` - Tauri IPC command handlers
- `models/` - Rust data structures
- `utils/` - Path utilities and helpers
- Main application setup and configuration

---

## Architecture Diagrams

### [Diagram Directory](./diagrams/)

Complete set of 8 Mermaid diagrams visualizing system architecture

#### System & Architecture Diagrams

**1. [System Architecture](./diagrams/system-architecture.mmd)** (C4 Container Diagram)

- High-level system overview
- User → Tauri App → Frontend/Backend separation
- File system integration points
- IPC communication channels

**2. [Component Hierarchy](./diagrams/component-hierarchy.mmd)**

- React component tree structure
- Parent-child relationships
- Layout organization
- Modal and boundary components

**3. [Security Architecture](./diagrams/security-architecture.mmd)**

- Security layers (OS, Tauri, Application)
- Read-only access enforcement
- Input validation pipeline
- Vulnerability analysis

#### Flow & Process Diagrams

**4. [Data Flow](./diagrams/data-flow.mmd)** (Sequence Diagram)

- Complete user interaction flows
- Startup and initialization sequence
- Skill loading pipeline
- IPC request/response patterns
- Reference file loading

**5. [Skill Scanning Flow](./diagrams/skill-scanning-flow.mmd)** (Flowchart)

- Backend scanning algorithm
- Directory traversal logic
- SKILL.md detection
- YAML frontmatter parsing
- Error handling paths

**6. [State Management](./diagrams/state-management.mmd)**

- Zustand store architecture
- Component subscriptions
- State update patterns
- Store relationships

#### Development & Testing Diagrams

**7. [Build Pipeline](./diagrams/build-pipeline.mmd)**

- Development workflow (task dev)
- Build process (frontend + backend)
- Test execution (Unit, Integration, E2E)
- Release packaging (.dmg, .deb, .exe)
- CI/CD pipeline

**8. [Testing Strategy](./diagrams/testing-strategy.mmd)**

- Test pyramid (Unit, Integration, E2E)
- Coverage targets (>80%)
- Test execution commands
- Current implementation status

### Viewing Diagrams

**Option 1: Mermaid Live Editor**

1. Visit [mermaid.live](https://mermaid.live/)
2. Copy content from `.mmd` files
3. View interactive diagram

**Option 2: VS Code**

- Install "Mermaid Preview" extension
- Open `.mmd` file → View preview pane

**Option 3: GitHub/GitLab**

- Automatically rendered in markdown files
- Wrap in triple backticks with `mermaid` language

**Option 4: Generate Images**

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i system-architecture.mmd -o system-architecture.svg

# Generate all diagrams
for file in *.mmd; do
  mmdc -i "$file" -o "${file%.mmd}.svg"
done
```

---

## Requirements Documentation

### [Product Requirements Main](../requirements/main.md)

**Entry point for all product requirements documentation**

**Contents**:

- Project overview and value proposition
- Technology stack reference
- 6 user stories (US1-US6)
- 20 functional requirements (FR-001 to FR-020)
- Success metrics and quality criteria
- Constitutional principles

**Key Requirement Documents**:

#### Core Requirements

- **[Functional Requirements](../requirements/functional-requirements.md)** - FR-001 through FR-020
- **[Non-Functional Requirements](../requirements/non-functional-requirements.md)** - Performance, security, usability
- **[User Stories](../requirements/user-stories.md)** - US1-US6 with acceptance criteria
- **[Technical Architecture](../requirements/technical-architecture.md)** - System architecture decisions
- **[Data Model](../requirements/data-model.md)** - Entity definitions (Skill, Reference, Script)
- **[UI/UX Requirements](../requirements/ui-ux-requirements.md)** - Interface design specifications

#### Feature Requirements

- **[Skill Discovery](../requirements/features/skill-discovery.md)** - US1: Discover and list skills
- **[Skill Viewing](../requirements/features/skill-viewing.md)** - US2: Multi-tab detail viewer
- **[Navigation](../requirements/features/navigation.md)** - US3: Navigate between skills/references
- **[Trigger Analysis](../requirements/features/trigger-analysis.md)** - US4: Debug skill activation
- **[Visualization](../requirements/features/visualization.md)** - US5: Mermaid diagram generation
- **[Search & Filtering](../requirements/features/search-filtering.md)** - US6: Real-time search

---

## Release Planning Documentation

### [v0.2 Enhancement Suite](../v0.2-enhancement-suite/00-OVERVIEW.md)

**Planning documentation for the next major release**

**Contents**:

- **[Feature Roadmap](../v0.2-enhancement-suite/FEATURE_ROADMAP.md)** - 4 major features
  - Feature 004: UI/UX Polish & Fixes (P0)
  - Feature 005: AI-Powered Skill Analysis (P1)
  - Feature 006: Skill Quality Wizard (P2)
  - Feature 007: Skill Sync & Management (P3)
- **[Technical Architecture](../v0.2-enhancement-suite/ARCHITECTURE.md)** - Multi-CLI integration, write operations
- **[Quality Rubric](../v0.2-enhancement-suite/QUALITY_RUBRIC.md)** - Skill scoring system (0-100 points)

**Implementation Approach**: Spec-Driven Development (SDD) methodology

---

## Implementation Guides

### For New Developers

**Getting Started**:

1. Read [../TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md) - Quick technical overview
2. Review [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) - System architecture primer
3. Set up development environment (see [/.claude/CLAUDE.md](../../.claude/CLAUDE.md#build-and-development-commands))
4. Run the application: `task dev` or `npm run dev`

**Key Concepts**:

- Tauri hybrid architecture (Rust backend + React frontend)
- IPC communication pattern (frontend ↔ backend)
- Zustand state management (global stores)
- Read-only design principle (safety first)

**Development Workflow**:

```bash
# Start development mode
task dev              # or npm run dev

# Run tests
task test             # or npm test

# Build application
task build            # or npm run build

# Format and lint
task format clippy
```

---

### For Contributors

**Code Structure**:

```
skill-debugger/
├── src/                    # React frontend
│   ├── components/         # UI components (15+)
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Frontend utilities
│   └── hooks/             # React hooks
├── src-tauri/             # Rust backend
│   └── src/
│       ├── commands/      # Tauri IPC commands
│       ├── models/        # Data models
│       └── utils/         # Rust utilities
└── docs/                  # Documentation (you are here)
```

**Testing Strategy**:

- **Unit Tests**: Vitest for React components, `cargo test` for Rust
- **Integration Tests**: Tauri IPC communication
- **E2E Tests**: Playwright for full application flows
- **Coverage Target**: >80% (constitutional requirement)

**PR Process**:

1. Create feature branch: `git checkout -b feature/descriptive-name`
2. Follow SDD workflow (see [/.claude/CLAUDE.md](../../.claude/CLAUDE.md#specification-driven-development-sdd))
3. Write tests BEFORE implementation (TDD)
4. Ensure tests pass: `task test`
5. Run linters: `task clippy format`
6. Create PR against `main` branch
7. Update documentation if needed

---

### For Architects

**Design Decisions**:

**Why Tauri?**

- Native desktop performance (no Electron overhead)
- Rust security guarantees
- Small binary size (~10MB vs 100MB+)
- OS-level integration
- Cross-platform consistency

**Why Zustand over Redux?**

- Minimal boilerplate (no actions/reducers)
- TypeScript-first design
- <1KB bundle size
- No Context Provider wrapping needed
- Perfect for read-heavy applications

**Why Sequential Scanning?**

- Simplicity over parallelization complexity
- <500ms for 50 skills (performance acceptable)
- Easier error handling and debugging
- Room for optimization if needed

**Trade-offs**:

- ✅ Native performance vs ❌ More complex build
- ✅ Read-only safety vs ❌ No editing in v0.1
- ✅ Offline-first vs ❌ No cloud sync
- ✅ Developer-focused vs ❌ Non-technical users excluded

**Future Considerations**:

- Write operations (v0.2.0) - See [../v0.2-enhancement-suite/ARCHITECTURE.md](../v0.2-enhancement-suite/ARCHITECTURE.md)
- AI integration (multi-CLI support)
- File system watcher for auto-refresh
- Virtual scrolling for 100+ skills
- Plugin architecture for extensibility

---

## Project Documentation

### Additional Resources

**Project Root Documentation**:

- [/CHANGELOG.md](../../CHANGELOG.md) - Version history and release notes
- [/README.md](../../README.md) - Project overview and quick start
- [/.claude/CLAUDE.md](../../.claude/CLAUDE.md) - Developer guide and build commands

**Specification Documents** (SDD Methodology):

- [/specs/001-core-skill-explorer/](../../specs/001-core-skill-explorer/) - v0.1.0 implementation specs
- [/specs/004-ui-ux-polish/](../../specs/004-ui-ux-polish/) - v0.2.0 UI/UX fixes

**Future Planning**:

- [../FEATURE_BRAINSTORM.md](../FEATURE_BRAINSTORM.md) - Long-term feature ideas
- [../future/future_feature_brainstorm_roadmap.md](../future/future_feature_brainstorm_roadmap.md) - Roadmap brainstorming

---

## Documentation Maintenance

### Update Guidelines

**When to Update This Documentation**:

- Major architectural changes (new layers, patterns, technologies)
- New components or modules added
- Security measures updated
- Build process changes
- Design decisions changed or new decisions made

**Documentation Standards**:

- Use clear, concise language (developer audience)
- Include code examples where helpful
- Update version numbers and dates
- Link to related documents
- Keep diagrams synchronized with code

**Version Control**:

- All documentation is version-controlled in Git
- Update version numbers using Semantic Versioning
- Document breaking changes prominently
- Archive outdated documentation (don't delete)

### Contributing to Documentation

**Improving This Documentation**:

1. Identify gaps or outdated information
2. Create issue describing needed changes
3. Create branch: `docs/improve-architecture-docs`
4. Make updates (maintain consistent style)
5. Update version number and last updated date
6. Create PR with clear description

**Style Guide**:

- Use Markdown formatting consistently
- Headings: Title Case for Major Sections
- Code blocks: Always specify language
- Links: Use relative paths within repo
- File paths: Use absolute paths in examples

---

## Quick Reference

### Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Zustand 5.0, TailwindCSS 4.1
- **Backend**: Rust 1.75+, Tauri 2.x, Tokio (async)
- **Rendering**: react-markdown, highlight.js, Mermaid 11.12
- **Build Tools**: Vite 6.0, Task automation

### Performance Targets

- Cold start: <2 seconds
- Skill scanning: <500ms for 50 skills
- UI rendering: 60fps
- Markdown rendering: <100ms per file
- Memory usage: <200MB

### Platform Support

- macOS 11+ (Apple Silicon + Intel)
- Linux (Ubuntu 20.04+, GTK 3+)
- Windows 10/11

### Key Commands

```bash
task dev              # Start development mode
task build            # Build entire project
task test             # Run all tests
task clean            # Clean build artifacts
task --list           # Show all available tasks
```

---

## Document Information

**Version**: 1.0.0
**Created**: 2025-11-13
**Last Updated**: 2025-11-13
**Maintained By**: Skill Debugger Development Team
**Related**: [TECHNICAL_DOCUMENTATION.md](../TECHNICAL_DOCUMENTATION.md), [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)

**Questions or Issues**: Create an issue in the [GitHub repository](https://github.com/SpillwaveSolutions/skills_viewer/issues)
