# Documentation Map

**Project**: Skill Debugger
**Last Updated**: 2025-11-13

## Overview

This document provides a visual map of all documentation in the Skill Debugger project, showing relationships and navigation paths.

## Documentation Tree

```
docs/
│
├── 📋 TECHNICAL_DOCUMENTATION.md          ← START HERE (High-level overview)
│   ├── Links to → design/README.md        (Master index)
│   ├── Links to → requirements/main.md    (Product requirements)
│   └── Links to → .claude/CLAUDE.md       (Developer guide)
│
├── 🎨 design/                             ← ARCHITECTURE & DESIGN
│   │
│   ├── 📖 README.md                       ← Master Documentation Index
│   │   ├── Architecture docs overview
│   │   ├── Quick navigation guide
│   │   └── Maintenance guidelines
│   │
│   ├── 🏗️ ARCHITECTURE_OVERVIEW.md       ← Complete system architecture (54KB)
│   │   ├── Technology stack
│   │   ├── Component catalog (15+ components)
│   │   ├── State management (Zustand)
│   │   ├── IPC communication patterns
│   │   ├── Data flow diagrams
│   │   ├── Design patterns
│   │   ├── Performance optimization
│   │   └── Security architecture
│   │
│   ├── ⚛️ FRONTEND_DOCUMENTATION.md       ← React/TypeScript frontend (52KB)
│   │   ├── Component library (15+ components)
│   │   ├── Props & API reference
│   │   ├── Zustand store architecture
│   │   ├── Hooks usage patterns
│   │   ├── TailwindCSS styling
│   │   ├── Markdown rendering pipeline
│   │   ├── Mermaid diagram integration
│   │   └── Performance optimization
│   │
│   ├── 🦀 BACKEND_DOCUMENTATION.md        ← Rust/Tauri backend (41KB)
│   │   ├── Rust module organization
│   │   ├── Tauri command catalog (10+ commands)
│   │   ├── Data models (Skill, Reference, Script)
│   │   ├── File system utilities
│   │   ├── Skill scanning algorithm
│   │   ├── YAML parser implementation
│   │   ├── Error handling strategies
│   │   └── Async runtime patterns (Tokio)
│   │
│   └── 📊 diagrams/                       ← Mermaid architecture diagrams (8 files)
│       ├── README.md                      ← Diagram index & viewing guide
│       ├── system-architecture.mmd        ← C4 Container diagram
│       ├── component-hierarchy.mmd        ← React component tree
│       ├── data-flow.mmd                  ← Sequence diagram (startup → interaction)
│       ├── state-management.mmd           ← Zustand store architecture
│       ├── skill-scanning-flow.mmd        ← Backend scanning flowchart
│       ├── build-pipeline.mmd             ← Build & CI/CD process
│       ├── security-architecture.mmd      ← Security layers & threats
│       └── testing-strategy.mmd           ← Test pyramid & coverage
│
├── 📄 requirements/                       ← PRODUCT REQUIREMENTS
│   │
│   ├── 📖 README.md                       ← Requirements directory index
│   ├── 📋 main.md                         ← REQUIREMENTS ENTRY POINT
│   │   ├── Project overview
│   │   ├── Technology stack
│   │   ├── 6 user stories (US1-US6)
│   │   ├── Success metrics
│   │   └── Links to all requirement docs
│   │
│   ├── ✅ functional-requirements.md      ← FR-001 through FR-020
│   ├── ⚡ non-functional-requirements.md ← Performance, security, usability
│   ├── 📝 user-stories.md                 ← US1-US6 with acceptance criteria
│   ├── 🏗️ technical-architecture.md      ← System architecture decisions
│   ├── 🗂️ data-model.md                   ← Entity definitions & relationships
│   ├── 🎨 ui-ux-requirements.md           ← Interface design specs
│   ├── 📊 UI_UX_SUMMARY.md                ← UI/UX quick reference
│   │
│   ├── features/                          ← Feature-specific requirements
│   │   ├── skill-discovery.md             ← US1: Discover & list skills
│   │   ├── skill-viewing.md               ← US2: Multi-tab detail viewer
│   │   ├── navigation.md                  ← US3: Navigate between skills
│   │   ├── trigger-analysis.md            ← US4: Debug skill activation
│   │   ├── visualization.md               ← US5: Mermaid diagrams
│   │   └── search-filtering.md            ← US6: Real-time search
│   │
│   └── diagrams/
│       └── ui-component-hierarchy.md      ← UI component structure
│
├── 🚀 v0.2-enhancement-suite/            ← v0.2.0 RELEASE PLANNING
│   ├── 00-OVERVIEW.md                     ← Release overview & timeline
│   ├── FEATURE_ROADMAP.md                 ← 4 features (004-007)
│   │   ├── Feature 004: UI/UX Polish (P0)
│   │   ├── Feature 005: AI Analysis (P1)
│   │   ├── Feature 006: Quality Wizard (P2)
│   │   └── Feature 007: Skill Sync (P3)
│   ├── ARCHITECTURE.md                    ← v0.2 technical architecture
│   │   ├── Multi-CLI integration
│   │   ├── Write operations safety
│   │   └── Performance considerations
│   └── QUALITY_RUBRIC.md                  ← Skill scoring system (0-100)
│
├── 💡 future/                             ← FUTURE PLANNING
│   └── future_feature_brainstorm_roadmap.md ← Long-term ideas
│
└── 🎯 FEATURE_BRAINSTORM.md               ← Feature ideas & brainstorming
```

## Root-Level Documentation

```
skill-debugger/
│
├── 📖 README.md                           ← Project overview & quick start
├── 📝 CHANGELOG.md                        ← Version history & release notes
├── 📄 .claude/CLAUDE.md                   ← Developer guide & build commands
│   ├── Build commands
│   ├── Task automation (Taskfile)
│   ├── SDD methodology
│   ├── QA protocol
│   └── Project conventions
│
├── specs/                                 ← SDD SPECIFICATIONS
│   ├── 001-core-skill-explorer/          ← v0.1.0 (Core features)
│   │   ├── spec.md                        ← User stories & requirements
│   │   ├── plan.md                        ← Technical implementation plan
│   │   ├── tasks.md                       ← Task breakdown
│   │   ├── DEVIATIONS.md                  ← What was changed
│   │   └── IMPLEMENTATION_NOTES.md        ← Post-implementation insights
│   │
│   └── 004-ui-ux-polish/                  ← v0.2.0 (UI/UX fixes)
│       ├── spec.md                        ← User stories & requirements
│       ├── plan.md                        ← Technical implementation plan
│       ├── tasks.md                       ← Task breakdown
│       ├── DEVIATIONS.md                  ← What was changed
│       └── IMPLEMENTATION_NOTES.md        ← Post-implementation insights
│
├── Taskfile.yml                           ← Task automation (build, test, etc.)
├── package.json                           ← npm dependencies
├── tsconfig.json                          ← TypeScript configuration
├── vite.config.ts                         ← Vite build configuration
└── tailwind.config.js                     ← TailwindCSS configuration
```

## Documentation Relationships

### Primary Navigation Paths

**Path 1: New Developer Onboarding**

```
README.md
  → docs/TECHNICAL_DOCUMENTATION.md (Overview)
    → docs/design/README.md (Master index)
      → docs/design/ARCHITECTURE_OVERVIEW.md (Deep dive)
        → docs/design/FRONTEND_DOCUMENTATION.md (Frontend)
        → docs/design/BACKEND_DOCUMENTATION.md (Backend)
          → .claude/CLAUDE.md (Build & run)
```

**Path 2: Understanding Requirements**

```
docs/requirements/main.md (Entry point)
  → docs/requirements/user-stories.md (What users need)
    → docs/requirements/functional-requirements.md (What system does)
      → docs/requirements/features/ (Feature details)
        → docs/design/ARCHITECTURE_OVERVIEW.md (How it's built)
```

**Path 3: Contributing Code**

```
.claude/CLAUDE.md (Developer guide)
  → SDD Methodology section
    → /speckit commands
      → specs/004-ui-ux-polish/ (Example spec)
        → docs/design/FRONTEND_DOCUMENTATION.md (Component APIs)
          → Submit PR
```

**Path 4: Architecture Review**

```
docs/TECHNICAL_DOCUMENTATION.md (High-level)
  → docs/design/ARCHITECTURE_OVERVIEW.md (Detailed)
    → docs/design/diagrams/system-architecture.mmd (Visual)
      → docs/design/diagrams/component-hierarchy.mmd
        → docs/design/diagrams/data-flow.mmd
          → Complete understanding
```

**Path 5: Planning New Features**

```
docs/v0.2-enhancement-suite/00-OVERVIEW.md (Current roadmap)
  → docs/v0.2-enhancement-suite/FEATURE_ROADMAP.md (Feature details)
    → docs/v0.2-enhancement-suite/ARCHITECTURE.md (Technical approach)
      → /speckit.specify (Start SDD workflow)
        → specs/[new-feature]/ (Create spec)
```

## Documentation by Audience

### For New Developers

**Start Here**:

1. [README.md](../README.md) - Project introduction
2. [docs/TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Technical overview
3. [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Setup & build commands
4. [docs/design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) - Deep dive

**Key Concepts**:

- Tauri hybrid architecture (React + Rust)
- IPC communication patterns
- Zustand state management
- Read-only design principle

### For Contributors

**Start Here**:

1. [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Developer guide
2. [docs/design/FRONTEND_DOCUMENTATION.md](./design/FRONTEND_DOCUMENTATION.md) - Component APIs
3. [docs/design/BACKEND_DOCUMENTATION.md](./design/BACKEND_DOCUMENTATION.md) - Rust modules
4. [CHANGELOG.md](../CHANGELOG.md) - Recent changes

**Workflow**:

- Follow SDD methodology (see .claude/CLAUDE.md)
- Write tests first (TDD)
- Update documentation with changes
- Run `task test` before submitting PR

### For Architects

**Start Here**:

1. [docs/TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - High-level overview
2. [docs/design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) - Detailed architecture
3. [docs/design/diagrams/](./design/diagrams/) - Visual architecture
4. [docs/v0.2-enhancement-suite/ARCHITECTURE.md](./v0.2-enhancement-suite/ARCHITECTURE.md) - Future plans

**Key Sections**:

- Design decisions & trade-offs
- Performance benchmarks
- Security model
- Scalability considerations

### For Product Managers

**Start Here**:

1. [docs/requirements/main.md](./requirements/main.md) - Product requirements entry
2. [docs/requirements/user-stories.md](./requirements/user-stories.md) - User needs
3. [docs/v0.2-enhancement-suite/FEATURE_ROADMAP.md](./v0.2-enhancement-suite/FEATURE_ROADMAP.md) - Roadmap
4. [CHANGELOG.md](../CHANGELOG.md) - What's shipped

**Planning Tools**:

- User stories with acceptance criteria
- Success metrics
- Feature prioritization
- Release timeline

### For QA Engineers

**Start Here**:

1. [docs/design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md#testing-strategy) - Testing approach
2. [docs/design/diagrams/testing-strategy.mmd](./design/diagrams/testing-strategy.mmd) - Test pyramid
3. [.claude/CLAUDE.md](../.claude/CLAUDE.md#quality-assurance-protocol) - QA protocol
4. [Taskfile.yml](../Taskfile.yml) - Test commands

**Test Categories**:

- Unit tests (Vitest + cargo test)
- Integration tests (IPC)
- E2E tests (Playwright)
- Coverage requirements (>80%)

## Documentation Standards

### File Naming Conventions

**Capitalization**:

- `README.md` - Directory index files
- `ARCHITECTURE_OVERVIEW.md` - Major design documents
- `feature-name.md` - Requirement documents
- `diagram-name.mmd` - Mermaid diagrams

**Organization**:

- `docs/design/` - Architecture & design
- `docs/requirements/` - Product requirements
- `docs/v0.2-enhancement-suite/` - Release planning
- `specs/` - SDD specifications

### Maintenance Schedule

**Update Frequency**:

- **After every PR**: CHANGELOG.md
- **After feature completion**: Relevant requirement docs
- **After major changes**: Architecture docs
- **Quarterly**: Review entire documentation suite

**Version Control**:

- Update version numbers in document headers
- Update "Last Updated" dates
- Document breaking changes prominently

## Quick Reference

### Most Important Documents

| Document                                                             | Purpose                          | Audience                 |
| -------------------------------------------------------------------- | -------------------------------- | ------------------------ |
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)           | High-level technical overview    | Everyone                 |
| [design/README.md](./design/README.md)                               | Master documentation index       | Everyone                 |
| [design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) | Complete system architecture     | Developers, Architects   |
| [requirements/main.md](./requirements/main.md)                       | Product requirements entry point | PMs, Developers          |
| [.claude/CLAUDE.md](../.claude/CLAUDE.md)                            | Developer guide & workflows      | Developers, Contributors |
| [CHANGELOG.md](../CHANGELOG.md)                                      | Version history                  | Everyone                 |

### Common Tasks

**"I want to..."**:

- **Understand the system**: Start with [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- **Build the application**: See [.claude/CLAUDE.md](../.claude/CLAUDE.md#build-and-development-commands)
- **Add a feature**: Follow [SDD workflow](../.claude/CLAUDE.md#specification-driven-development-sdd)
- **Review architecture**: Read [ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md)
- **Check requirements**: Browse [requirements/main.md](./requirements/main.md)
- **View diagrams**: Explore [design/diagrams/](./design/diagrams/)
- **See roadmap**: Check [v0.2-enhancement-suite/FEATURE_ROADMAP.md](./v0.2-enhancement-suite/FEATURE_ROADMAP.md)

---

**Document Version**: 1.0.0
**Created**: 2025-11-13
**Last Updated**: 2025-11-13
**Maintained By**: Skill Debugger Development Team
