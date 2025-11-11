# Changelog

All notable changes to the Skill Debugger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-10

### Added

#### Core Features
- **Skill Discovery System**: Automatic scanning of `~/.claude/skills` and `~/.config/opencode/skills` directories
- **Skill List Viewer**: Sidebar display of all discovered skills with search functionality
- **Multi-Tab Detail Viewer**: Six-tab interface for comprehensive skill exploration:
  - Overview: YAML frontmatter metadata display
  - Content: Markdown rendering with syntax highlighting
  - References: Master-detail view of skill reference files
  - Scripts: Master-detail view of skill scripts
  - Triggers: Keyword analysis for debugging skill activation
  - Diagram: Interactive Mermaid visualization of skill structure

#### Technical Implementation
- **Frontend Stack**: React 19.1.0 with TypeScript 5.8.3
- **State Management**: Zustand 5.0.8 for global state
- **Styling System**: TailwindCSS 4.1.17 with custom design tokens
- **Markdown Processing**: react-markdown 10.1.0 with GitHub-flavored markdown
- **Code Highlighting**: highlight.js 11.11.1 with GitHub theme
- **Diagram Rendering**: Mermaid 11.12.1 for flowcharts
- **Desktop Framework**: Tauri 2.x (Rust backend + React frontend)

#### Backend Components
- Rust-based skill scanner with parallel directory traversal
- YAML frontmatter parser with error handling
- File system commands for safe read-only operations
- Type-safe models for Skill, Reference, and Script entities
- Path utilities with home directory expansion

#### Documentation
- Comprehensive requirements documentation (100% coverage)
- Technical architecture specification v1.1.0
- UI/UX requirements with 94 acceptance criteria
- 6 feature-specific requirement documents
- Component hierarchy and data flow diagrams
- Complete design system specification

### Technical Details

**Architecture Decisions**:
- Tauri for native desktop performance and security
- Zustand for lightweight state management
- Sequential directory scanning for simplicity
- Client-side filtering with useMemo optimization
- Read-only file operations for safety

**Performance Targets**:
- Cold start: <2 seconds
- Skill scanning: <500ms for 50 skills
- UI rendering: 60fps
- Memory usage: <200MB

**Supported Platforms**:
- macOS (tested on Apple Silicon)
- Linux (Ubuntu 20.04+)
- Windows 10/11

### Security

- No network requests (fully offline operation)
- Sandboxed file access limited to skill directories
- No arbitrary code execution
- Content Security Policy enforced
- Input sanitization for all user data

### Known Limitations

- No virtual scrolling (assumes <100 skills)
- Sequential directory scanning (not parallelized)
- No lazy loading of components
- Manual refresh required for file system changes
- No skill editing capabilities (read-only by design)

### Future Enhancements (Planned)

**Phase 2**:
- Breadcrumb navigation history
- Keyboard shortcuts for power users
- Export functionality for diagrams
- Advanced search with filters

**Phase 3**:
- File system watcher for auto-refresh
- Skill editing capabilities
- Trigger testing simulator
- Performance profiler

---

[0.1.0]: https://github.com/SpillwaveSolutions/skills_viewer/releases/tag/v0.1.0
