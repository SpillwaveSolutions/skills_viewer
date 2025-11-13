# Changelog

All notable changes to the Skill Debugger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-12

### Fixed

#### UI/UX Polish (Feature 004)

**Spacing Improvements (US1 - P1)**:
- Fixed cramped text throughout application - all text now has minimum 8px margins
- Added horizontal padding (px-2) to description text for breathing room
- Fixed skill list item padding compensation when selected (pl-3.5 accounts for 4px border)
- Added margin-right (mr-2) to skill names to prevent touching location badges
- Fixed SearchBar top margin (mt-2) for proper spacing from container
- Updated ScriptsTab and ReferencesTab list padding (p-3) and content spacing (pt-8)
- Added defensive top margins (mt-2) to TriggerAnalysis section titles
- Fixed flex layout bug in OverviewPanel (changed space-y-4 to gap-4)
- Removed asymmetric margin (ml-8) from ScriptsTab code block

**Overview Information Hierarchy (US2 - P2)**:
- Restructured Overview tab to display information in logical order:
  1. Skill name + location badge
  2. Description (no duplicates)
  3. Version (from metadata)
  4. Trigger preview (first 5 keywords)
  5. Stats grid (references, scripts, triggers, lines)
  6. Additional metadata (filtered to exclude duplicates)
- Integrated DescriptionSection into OverviewPanel for better hierarchy
- Added metadata filtering to prevent duplicate descriptions and versions
- Graceful handling of missing fields (description, version)
- Consistent vertical spacing (space-y-6) between all sections

**Syntax Highlighting Reliability (US4 - P2)**:
- Fixed Python syntax highlighting bug that broke on 2nd+ visit to Scripts tab
- Replaced buggy hljs.highlightElement() approach with ReactMarkdown + rehype-highlight
- Highlighting now persists reliably across all tab navigations
- Uses same declarative rendering pattern as ReferencesTab

**Text Overflow Handling (US3 - P3)**:
- Added truncation with ellipsis for long skill names in sidebar
- Added native browser tooltips (title attribute) showing full text on hover
- Trigger keywords truncate with max-w-xs and show full text in tooltips
- Proper flex layout (flex-1 min-w-0) ensures truncation works correctly

### Changed

#### Infrastructure Improvements

**TailwindCSS v4 Configuration**:
- Fixed App.css to use correct v4 syntax (@import "tailwindcss" instead of @tailwind directives)
- Replaced aggressive universal CSS reset with modern, targeted reset
- New reset compatible with Tailwind utility-first approach
- Preserves utility classes while resetting browser defaults

**Development Tools**:
- Added clean-up-app-run task to Taskfile.yml for killing zombie processes
- Automated cleanup runs before npm run tauri dev to prevent port 1420 conflicts

### Technical Details

**Files Modified**:
- src/App.css - TailwindCSS v4 syntax + modern CSS reset
- src/components/DescriptionSection.tsx - Added px-2 margin
- src/components/SkillList.tsx - Truncation, tooltips, padding fixes (4 changes)
- src/components/OverviewPanel.tsx - Complete restructure + truncation
- src/components/SkillViewer.tsx - Removed duplicate DescriptionSection
- src/components/ScriptsTab.tsx - ReactMarkdown for syntax highlighting
- src/components/ReferencesTab.tsx - (unchanged, provided working example)
- src/components/TriggerAnalysis.tsx - Defensive top margins
- Taskfile.yml - Added clean-up-app-run task

**Critical Bug Fixes**:
1. TailwindCSS v4 compilation pipeline (all utilities were failing)
2. CSS cascade override (universal reset was killing all Tailwind classes)
3. Syntax highlighting persistence (DOM manipulation causing React conflicts)

**Accessibility**:
- Maintained WCAG 2.1 AA compliance for touch target sizes
- Added tooltips for truncated text (screen reader accessible via title attribute)
- No impact to keyboard navigation or focus indicators

**Performance**:
- CSS bundle increased by ~1KB due to modern reset (negligible impact)
- ReactMarkdown syntax highlighting has zero runtime performance impact
- No layout thrashing or forced reflows

### Documentation

**SDD Compliance** (Feature 004):
- DEVIATIONS.md - Documented infrastructure fixes and time impact
- IMPLEMENTATION_NOTES.md - Technical decisions and 15 margin fixes
- tasks.md - Updated with actual work performed
- All documentation uploaded to Notion with proper hierarchy

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
