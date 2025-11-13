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
│   ├── ⚛️ FRONTEND_DOCUMENTATION.md       ← React/TypeScript frontend (52KB)
│   ├── 🦀 BACKEND_DOCUMENTATION.md        ← Rust/Tauri backend (41KB)
│   │
│   └── 📊 diagrams/                       ← Mermaid architecture diagrams (8 files)
│       ├── README.md                      ← Diagram index & viewing guide
│       ├── system-architecture.mmd        ← C4 Container diagram
│       ├── component-hierarchy.mmd        ← React component tree
│       ├── data-flow.mmd                  ← Sequence diagram
│       ├── state-management.mmd           ← Zustand stores
│       ├── skill-scanning-flow.mmd        ← Backend scanning
│       ├── build-pipeline.mmd             ← Build & CI/CD
│       ├── security-architecture.mmd      ← Security layers
│       └── testing-strategy.mmd           ← Test pyramid
│
├── 📄 requirements/                       ← PRODUCT REQUIREMENTS
│   ├── README.md                          ← Requirements directory index
│   ├── main.md                            ← REQUIREMENTS ENTRY POINT
│   ├── functional-requirements.md         ← FR-001 through FR-020
│   ├── non-functional-requirements.md     ← Performance, security, usability
│   ├── user-stories.md                    ← US1-US6 with acceptance criteria
│   ├── technical-architecture.md          ← System architecture decisions
│   ├── data-model.md                      ← Entity definitions
│   ├── ui-ux-requirements.md              ← Interface design specs
│   │
│   └── features/                          ← Feature-specific requirements
│       ├── skill-discovery.md
│       ├── skill-viewing.md
│       ├── navigation.md
│       ├── trigger-analysis.md
│       ├── visualization.md
│       └── search-filtering.md
│
├── 🚀 v0.2-enhancement-suite/            ← v0.2.0 RELEASE PLANNING
│   ├── 00-OVERVIEW.md                     ← Release overview
│   ├── FEATURE_ROADMAP.md                 ← 4 features (004-007)
│   ├── ARCHITECTURE.md                    ← v0.2 technical architecture
│   └── QUALITY_RUBRIC.md                  ← Skill scoring (0-100)
│
└── 🎯 FEATURE_BRAINSTORM.md               ← Future feature ideas
```

## Primary Navigation Paths

**Path 1: New Developer Onboarding**

```
README.md
  → docs/TECHNICAL_DOCUMENTATION.md (Overview)
    → docs/design/README.md (Master index)
      → docs/design/ARCHITECTURE_OVERVIEW.md (Deep dive)
        → .claude/CLAUDE.md (Build & run)
```

**Path 2: Understanding Requirements**

```
docs/requirements/main.md (Entry point)
  → docs/requirements/user-stories.md (What users need)
    → docs/requirements/functional-requirements.md (What system does)
      → docs/design/ARCHITECTURE_OVERVIEW.md (How it's built)
```

**Path 3: Contributing Code**

```
.claude/CLAUDE.md (Developer guide)
  → SDD Methodology section
    → /speckit commands
      → specs/004-ui-ux-polish/ (Example spec)
        → Submit PR
```

**Path 4: Architecture Review**

```
docs/TECHNICAL_DOCUMENTATION.md (High-level)
  → docs/design/ARCHITECTURE_OVERVIEW.md (Detailed)
    → docs/design/diagrams/ (Visual)
```

## Documentation by Audience

### For New Developers

1. [README.md](../README.md) - Project introduction
2. [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Technical overview
3. [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Setup & build
4. [design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) - Deep dive

### For Contributors

1. [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Developer guide
2. [design/FRONTEND_DOCUMENTATION.md](./design/FRONTEND_DOCUMENTATION.md) - Component APIs
3. [design/BACKEND_DOCUMENTATION.md](./design/BACKEND_DOCUMENTATION.md) - Rust modules

### For Architects

1. [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Overview
2. [design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) - Detailed architecture
3. [design/diagrams/](./design/diagrams/) - Visual architecture

### For Product Managers

1. [requirements/main.md](./requirements/main.md) - Product requirements
2. [requirements/user-stories.md](./requirements/user-stories.md) - User needs
3. [v0.2-enhancement-suite/FEATURE_ROADMAP.md](./v0.2-enhancement-suite/FEATURE_ROADMAP.md) - Roadmap

## Quick Reference

### Most Important Documents

| Document                                                             | Purpose              | Audience               |
| -------------------------------------------------------------------- | -------------------- | ---------------------- |
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)           | High-level overview  | Everyone               |
| [design/README.md](./design/README.md)                               | Master index         | Everyone               |
| [design/ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md) | System architecture  | Developers, Architects |
| [requirements/main.md](./requirements/main.md)                       | Product requirements | PMs, Developers        |
| [.claude/CLAUDE.md](../.claude/CLAUDE.md)                            | Developer guide      | Developers             |

### Common Tasks

**"I want to..."**:

- **Understand the system**: [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- **Build the application**: [.claude/CLAUDE.md](../.claude/CLAUDE.md#build-and-development-commands)
- **Add a feature**: [SDD workflow](../.claude/CLAUDE.md#specification-driven-development-sdd)
- **Review architecture**: [ARCHITECTURE_OVERVIEW.md](./design/ARCHITECTURE_OVERVIEW.md)
- **Check requirements**: [requirements/main.md](./requirements/main.md)
- **View diagrams**: [design/diagrams/](./design/diagrams/)
- **See roadmap**: [v0.2-enhancement-suite/FEATURE_ROADMAP.md](./v0.2-enhancement-suite/FEATURE_ROADMAP.md)

---

**Document Version**: 1.0.0
**Created**: 2025-11-13
**Maintained By**: Skill Debugger Development Team
