# Functional Requirements

**Document Version**: 1.0.0
**Last Updated**: 2025-11-10
**Status**: Active

## Overview

This document specifies all functional requirements for the Skill Debugger application. Each requirement is uniquely identified, traceable to user stories, and includes implementation status.

## Requirements Organization

Requirements are organized by functional area:
1. Skill Discovery & Loading
2. Skill Display & Rendering
3. Navigation & UI
4. Analysis & Insights
5. Search & Filtering
6. Error Handling & Resilience

---

## 1. Skill Discovery & Loading

### FR-001: Multi-Directory Skill Scanning

**ID**: FR-001
**Priority**: P1 (Must Have)
**User Story**: US1
**Status**: ✅ Implemented

**Description**: The system MUST scan both `~/.claude/skills` and `~/.config/opencode/skills` directories for skill subdirectories.

**Detailed Requirements**:
- Scan both directories on application startup
- Scan directories in parallel for performance
- Complete scanning within 500ms for up to 50 skills
- Handle missing directories gracefully (no errors if directory doesn't exist)
- Detect all subdirectories that contain a `skill.md` file

**Acceptance Criteria**:
- All skills from both directories are discovered
- Parallel scanning completes in <500ms
- Missing directories don't cause errors or crashes

**Dependencies**: None

**Testing**:
- Unit test: Directory scanning logic
- Integration test: Scanning both existing and missing directories
- Performance test: Scanning 50 skills in <500ms

---

### FR-002: YAML Frontmatter Parsing

**ID**: FR-002
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST parse skill.md files and extract YAML frontmatter (name, description, location tags, and other metadata).

**Detailed Requirements**:
- Parse YAML frontmatter from skill.md files
- Extract standard fields: name, description, location, gitignored
- Extract custom metadata fields as key-value pairs
- Handle missing frontmatter gracefully (use defaults)
- Handle malformed YAML gracefully (show warning, continue operation)

**Acceptance Criteria**:
- Valid YAML frontmatter is parsed 100% correctly
- Missing frontmatter defaults to skill name from filename
- Malformed YAML shows warning but doesn't crash application

**Dependencies**: FR-001

**Testing**:
- Unit test: YAML parsing with various frontmatter formats
- Unit test: Missing frontmatter handling
- Unit test: Malformed YAML handling

---

### FR-003: Reference File Detection

**ID**: FR-003
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST detect and list all files in the skill's `references/` subdirectory.

**Detailed Requirements**:
- Scan for `references/` directory within each skill directory
- List all files in references directory (recursive if nested)
- Capture filename, relative path, and file extension
- Support markdown (.md) and other file types
- Handle missing references directory gracefully

**Acceptance Criteria**:
- All files in references/ directory are detected
- File information includes name, path, and type
- Missing references/ directory doesn't cause errors

**Dependencies**: FR-001

**Testing**:
- Unit test: Reference file detection
- Integration test: Various directory structures
- Edge case test: Empty references directory

---

### FR-004: Script File Detection

**ID**: FR-004
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST detect and list all files in the skill's `scripts/` subdirectory.

**Detailed Requirements**:
- Scan for `scripts/` directory within each skill directory
- List all files in scripts directory (recursive if nested)
- Capture filename, relative path, and file extension
- Support various script types (.sh, .py, .js, etc.)
- Identify file type for appropriate icon/display
- Handle missing scripts directory gracefully

**Acceptance Criteria**:
- All files in scripts/ directory are detected
- File type is correctly identified from extension
- Missing scripts/ directory doesn't cause errors

**Dependencies**: FR-001

**Testing**:
- Unit test: Script file detection
- Integration test: Multiple script types
- Edge case test: Empty scripts directory

---

## 2. Skill Display & Rendering

### FR-005: Markdown Rendering with Syntax Highlighting

**ID**: FR-005
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST render markdown content with syntax highlighting for code blocks.

**Detailed Requirements**:
- Render markdown using react-markdown
- Support GitHub-flavored markdown (GFM)
- Apply syntax highlighting to code blocks using rehype-highlight
- Auto-detect language for code blocks
- Support common languages: JavaScript, TypeScript, Python, Rust, Bash, JSON, YAML
- Render in <100ms per file
- Handle markdown files up to 1MB

**Acceptance Criteria**:
- Markdown renders with proper formatting (headings, lists, links, tables)
- Code blocks have appropriate syntax highlighting
- Rendering completes in <100ms for typical files
- Large files (>500KB) show performance warning or lazy load

**Dependencies**: FR-001, FR-002

**Testing**:
- Unit test: Markdown rendering with various elements
- Performance test: Rendering speed for various file sizes
- Visual test: Code highlighting for different languages

---

### FR-006: Skill Metadata Display

**ID**: FR-006
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST display skill metadata (name, description, location, gitignore status) in a structured format.

**Detailed Requirements**:
- Display skill name prominently at top of viewer
- Show location badge ("claude" or "opencode")
- Display description if available from frontmatter
- Show all YAML frontmatter metadata in Overview tab
- Format metadata for readability (proper spacing, labels)
- Handle nested metadata structures

**Acceptance Criteria**:
- Skill name is visible and prominent
- Location is clearly indicated with badge
- All frontmatter metadata is displayed in Overview tab
- Metadata is well-formatted and readable

**Dependencies**: FR-002

**Testing**:
- Unit test: Metadata display component
- Visual test: Various metadata configurations
- Edge case test: Missing or minimal metadata

---

### FR-007: Unified Skill List Display

**ID**: FR-007
**Priority**: P1 (Must Have)
**User Story**: US1
**Status**: ✅ Implemented

**Description**: The system MUST provide a list view showing all discovered skills with their names and locations.

**Detailed Requirements**:
- Display all skills in a scrollable list
- Show skill name for each item
- Show location badge for each item
- Sort skills alphabetically by name
- Highlight selected skill
- Support virtual scrolling for large lists (100+ skills)
- Show skill count at top or bottom of list

**Acceptance Criteria**:
- All discovered skills appear in the list
- Skills are sorted alphabetically
- Location badges are visible and distinct
- Selected skill is highlighted
- List is performant with 100+ skills

**Dependencies**: FR-001

**Testing**:
- Unit test: List rendering with various skill sets
- Performance test: Rendering 100+ skills
- Visual test: Selection highlighting

---

### FR-008: Skill Detail View

**ID**: FR-008
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST provide a detail view showing full skill content when a skill is selected.

**Detailed Requirements**:
- Display skill details in main content area
- Provide tabbed interface for different views:
  - Overview: Metadata and frontmatter
  - Content: Rendered markdown
  - References: List of reference files
  - Scripts: List of script files
  - Triggers: Trigger analysis
  - Diagram: Visual representation
- Maintain tab state when switching between skills
- Show "Back to Skills" navigation button

**Acceptance Criteria**:
- Skill details display when skill is selected
- All tabs are accessible and functional
- Tab content loads appropriately
- Navigation back to list works correctly

**Dependencies**: FR-001, FR-002, FR-005, FR-006

**Testing**:
- Integration test: Skill selection and detail display
- Unit test: Each tab component
- UX test: Tab switching and navigation

---

## 3. Navigation & UI

### FR-009: Reference File Navigation

**ID**: FR-009
**Priority**: P2 (Should Have)
**User Story**: US3
**Status**: ✅ Implemented

**Description**: The system MUST allow navigation from skill view to reference file view.

**Detailed Requirements**:
- Make reference filenames clickable in References tab
- Load and display reference content when clicked
- Render reference markdown with syntax highlighting
- Show reference filename in header or breadcrumb
- Maintain skill context for easy return

**Acceptance Criteria**:
- Clicking reference opens its content
- Reference content is rendered properly
- User knows which reference they're viewing
- Navigation to reference completes in <100ms

**Dependencies**: FR-003, FR-005

**Testing**:
- Integration test: Navigation to reference files
- Unit test: Reference content loading
- UX test: Navigation flow

---

### FR-010: Return Navigation

**ID**: FR-010
**Priority**: P2 (Should Have)
**User Story**: US3
**Status**: ✅ Implemented

**Description**: The system MUST allow navigation from reference file view back to skill view.

**Detailed Requirements**:
- Provide "Back" button or breadcrumb navigation
- Return to previous view state (same tab)
- Preserve scroll position if possible
- Support keyboard shortcut (Alt+Left or equivalent)

**Acceptance Criteria**:
- Back navigation returns to skill view
- Previous state is preserved
- Navigation feels natural and responsive

**Dependencies**: FR-009

**Testing**:
- Integration test: Back navigation flow
- UX test: Keyboard shortcuts
- State test: Preservation of previous view state

---

## 4. Analysis & Insights

### FR-011: Trigger Keyword Extraction

**ID**: FR-011
**Priority**: P2 (Should Have)
**User Story**: US4
**Status**: ✅ Implemented

**Description**: The system MUST extract trigger keywords from skill description field and display them visually.

**Detailed Requirements**:
- Parse description field for trigger indicators:
  - "when..." phrases
  - "use this..." phrases
  - Action verbs
  - Tool/technology names
  - Topic keywords
- Categorize keywords by type
- Highlight keywords in visual display
- Generate example queries that would activate the skill
- Show confidence/relevance indicators

**Acceptance Criteria**:
- Keywords are extracted from description
- Keywords are categorized appropriately
- Visual display is clear and informative
- Example queries are relevant and helpful

**Dependencies**: FR-002

**Testing**:
- Unit test: Keyword extraction algorithm
- Unit test: Categorization logic
- Visual test: Trigger display formatting

---

### FR-012: Skill Structure Diagram Generation

**ID**: FR-012
**Priority**: P3 (Nice to Have)
**User Story**: US5
**Status**: ✅ Implemented

**Description**: The system MUST generate Mermaid diagrams showing skill structure (skill → references → scripts).

**Detailed Requirements**:
- Generate Mermaid flowchart syntax from skill data
- Show skill as root node
- Show references as child nodes connected to skill
- Show scripts as distinct child nodes
- Use different node shapes/colors for references vs scripts
- Generate diagram in <1 second for skills with up to 20 references

**Acceptance Criteria**:
- Mermaid syntax is generated correctly
- Diagram structure reflects skill relationships
- Generation completes in <1 second
- Diagram is visually clear and readable

**Dependencies**: FR-003, FR-004

**Testing**:
- Unit test: Mermaid syntax generation
- Visual test: Diagram rendering
- Performance test: Generation time for large skills

---

### FR-013: Mermaid Diagram Rendering

**ID**: FR-013
**Priority**: P3 (Nice to Have)
**User Story**: US5
**Status**: ✅ Implemented

**Description**: The system MUST render Mermaid diagrams within the application interface.

**Detailed Requirements**:
- Render Mermaid diagrams using mermaid.js library
- Lazy load mermaid library (code splitting)
- Display diagram in Diagram tab
- Handle rendering errors gracefully
- Support zoom/pan if diagram is large (optional)

**Acceptance Criteria**:
- Diagrams render correctly
- Rendering completes in <1 second
- Mermaid library is lazy loaded
- Rendering errors don't crash application

**Dependencies**: FR-012

**Testing**:
- Integration test: Diagram rendering
- Performance test: Rendering time
- Error test: Handling invalid Mermaid syntax

---

## 5. Search & Filtering

### FR-014: Real-Time Search Filtering

**ID**: FR-014
**Priority**: P3 (Nice to Have)
**User Story**: US6
**Status**: ✅ Implemented

**Description**: The system MUST provide real-time search filtering across skill names and descriptions.

**Detailed Requirements**:
- Provide search input box above skill list
- Filter skills as user types (debounced at 300ms)
- Search across:
  - Skill name
  - Description
  - Location
- Show filtered results instantly
- Highlight matching text (optional)
- Show result count
- Provide clear/reset button

**Acceptance Criteria**:
- Search filters skill list in real-time
- Results update within 50ms of input
- Search is case-insensitive
- All matching skills are shown

**Dependencies**: FR-007

**Testing**:
- Unit test: Search filtering logic
- Performance test: Search response time
- UX test: Debouncing and user experience

---

## 6. Error Handling & Resilience

### FR-015: Missing Directory Handling

**ID**: FR-015
**Priority**: P1 (Must Have)
**User Story**: US1
**Status**: ✅ Implemented

**Description**: The system MUST handle missing skill directories gracefully with informative messages.

**Detailed Requirements**:
- Detect when skill directories don't exist
- Continue operation without crashing
- Show user-friendly message explaining:
  - Which directories are missing
  - Where skills should be installed
  - How to create the directories
- Still display skills from any existing directory

**Acceptance Criteria**:
- Application doesn't crash when directories are missing
- User sees clear, helpful error message
- Skills from existing directories still work

**Dependencies**: FR-001

**Testing**:
- Integration test: Missing directory handling
- UX test: Error message clarity
- Edge case test: Both directories missing

---

### FR-016: Malformed Content Handling

**ID**: FR-016
**Priority**: P1 (Must Have)
**User Story**: US2
**Status**: ✅ Implemented

**Description**: The system MUST handle malformed markdown or YAML gracefully without crashing.

**Detailed Requirements**:
- Detect invalid YAML frontmatter
- Show warning message about YAML errors
- Display raw markdown content as fallback
- Detect unparseable markdown
- Continue displaying other skill components
- Log errors for debugging (without exposing to user)

**Acceptance Criteria**:
- Malformed YAML doesn't crash application
- User sees warning but can still view content
- Other tabs/features remain functional
- Error is logged appropriately

**Dependencies**: FR-002, FR-005

**Testing**:
- Unit test: Error handling for invalid YAML
- Unit test: Error handling for malformed markdown
- Integration test: Graceful degradation

---

### FR-017: Permission Error Handling

**ID**: FR-017
**Priority**: P1 (Must Have)
**User Story**: US1
**Status**: ✅ Implemented

**Description**: The system MUST respect file system permissions and show appropriate errors when access is denied.

**Detailed Requirements**:
- Detect file permission errors
- Show clear error message with:
  - Path that couldn't be accessed
  - Reason (permission denied)
  - Suggestion to fix (check permissions)
- Don't crash or hang on permission errors
- Continue with accessible files

**Acceptance Criteria**:
- Permission errors are caught and handled
- User sees clear error message with path
- Application continues working for accessible files
- No security vulnerabilities from permission checks

**Dependencies**: FR-001

**Testing**:
- Integration test: Permission denied scenarios
- Security test: No privilege escalation attempts
- UX test: Error message clarity

---

### FR-018: Offline-Only Operation

**ID**: FR-018
**Priority**: P1 (Must Have)
**User Story**: All
**Status**: ✅ Implemented

**Description**: The system MUST operate entirely offline with no network requests.

**Detailed Requirements**:
- No HTTP/HTTPS requests
- No external API calls
- No telemetry or analytics
- All resources bundled with application
- All data from local file system only

**Acceptance Criteria**:
- Application works without internet connection
- No network requests in production build
- All features functional offline

**Dependencies**: None

**Testing**:
- Integration test: Application in offline environment
- Network test: Verify no requests made
- Security audit: No external dependencies at runtime

---

### FR-019: Cross-Platform Compatibility

**ID**: FR-019
**Priority**: P1 (Must Have)
**User Story**: All
**Status**: ✅ Implemented

**Description**: The system MUST run as a native desktop application on macOS, Linux, and Windows.

**Detailed Requirements**:
- Build native binaries for:
  - macOS (11+)
  - Linux (GTK 3+)
  - Windows (10+)
- Use platform-appropriate path separators
- Handle home directory paths correctly on all platforms
- Consistent UI across platforms
- Platform-specific installer formats

**Acceptance Criteria**:
- Application builds successfully for all platforms
- UI is consistent across platforms
- File paths work correctly on all platforms
- All features work identically

**Dependencies**: All functional requirements

**Testing**:
- Integration test: Build and run on each platform
- UI test: Visual consistency across platforms
- Path test: File operations on different platforms

---

### FR-020: Manual Refresh

**ID**: FR-020
**Priority**: P2 (Should Have)
**User Story**: US1
**Status**: Planned (not yet implemented)

**Description**: The system MUST refresh skill list when directories change (with manual refresh button at minimum).

**Detailed Requirements**:
- Provide "Refresh" button to rescan directories
- Optionally: Auto-detect file system changes (watch mode)
- Reload skill list without restarting application
- Preserve current selection if possible
- Show loading indicator during refresh

**Acceptance Criteria**:
- Refresh button rescans directories
- New/deleted skills are detected
- Current selection is preserved if skill still exists
- Refresh completes in <500ms

**Dependencies**: FR-001

**Testing**:
- Integration test: Manual refresh flow
- UX test: Loading states during refresh
- Edge case test: Refresh while viewing skill details

---

## Requirements Summary

### By Priority

| Priority | Count | Status |
|----------|-------|--------|
| P1 (Must Have) | 13 | 12 implemented, 1 planned |
| P2 (Should Have) | 4 | 3 implemented, 1 planned |
| P3 (Nice to Have) | 3 | 3 implemented |
| **Total** | **20** | **18 implemented, 2 planned** |

### By Category

| Category | Count |
|----------|-------|
| Skill Discovery & Loading | 4 |
| Skill Display & Rendering | 4 |
| Navigation & UI | 2 |
| Analysis & Insights | 3 |
| Search & Filtering | 1 |
| Error Handling & Resilience | 6 |

### Implementation Status

- ✅ Implemented: 18
- 🚧 In Progress: 0
- 📋 Planned: 2 (FR-020 optional)

---

## Traceability to User Stories

| Requirement | User Story | Priority |
|-------------|-----------|----------|
| FR-001, FR-007, FR-015, FR-017 | US1: Skill Discovery | P1 |
| FR-002, FR-003, FR-004, FR-005, FR-006, FR-008, FR-016 | US2: Skill Viewing | P1 |
| FR-009, FR-010 | US3: Navigation | P2 |
| FR-011 | US4: Trigger Analysis | P2 |
| FR-012, FR-013 | US5: Visualization | P3 |
| FR-014 | US6: Search & Filter | P3 |
| FR-018, FR-019 | All stories | P1 |
| FR-020 | US1: Skill Discovery | P2 |

---

**Document Maintenance Note**: When adding new functional requirements:
1. Assign unique FR-XXX identifier
2. Link to relevant user story
3. Specify priority (P1/P2/P3)
4. Define detailed requirements and acceptance criteria
5. Identify dependencies
6. Update traceability matrix
7. Update summary counts
