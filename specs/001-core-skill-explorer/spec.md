# Feature Specification: Core Skill Explorer

**Feature Branch**: `001-core-skill-explorer`
**Created**: 2025-11-10
**Status**: Draft
**Input**: User description: "Desktop application to explore, debug, and optimize Claude Code skills by discovering skills from ~/.claude/skills and ~/.config/opencode/skills, displaying skill metadata and structure, visualizing relationships, and analyzing trigger patterns"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and Browse All Installed Skills (Priority: P1)

As a Claude Code skill developer, I want to see a complete list of all my installed skills from both directories so I can quickly understand what skills I have available and select one to explore in detail.

**Why this priority**: This is the foundation - users must first see what skills exist before they can debug or analyze them. Without this, the application has no value.

**Independent Test**: Can be fully tested by launching the application and verifying that all skills from both `~/.claude/skills` and `~/.config/opencode/skills` appear in a list view, and delivers immediate value by showing the complete skill inventory.

**Acceptance Scenarios**:

1. **Given** I have skills installed in `~/.claude/skills`, **When** I launch the application, **Then** I see all skills from that directory listed with their names
2. **Given** I have skills installed in `~/.config/opencode/skills`, **When** I launch the application, **Then** I see all skills from that directory listed with their names
3. **Given** I have skills in both directories, **When** I launch the application, **Then** I see skills from both locations in a unified list
4. **Given** I have no skills installed, **When** I launch the application, **Then** I see a helpful empty state message explaining where to install skills
5. **Given** skill list is displayed, **When** I click on a skill name, **Then** the skill details panel opens showing full information

---

### User Story 2 - View Skill Details and Structure (Priority: P1)

As a Claude Code skill developer, I want to view the complete structure of a selected skill including its main markdown file, references directory, and scripts directory so I can understand how the skill is organized and what resources it uses.

**Why this priority**: Understanding skill structure is essential for debugging and optimization. This delivers core value by making skill internals transparent.

**Independent Test**: Can be tested independently by selecting any skill from the list and verifying that the viewer displays the skill.md content, lists all reference files, and lists all script files with accurate paths.

**Acceptance Scenarios**:

1. **Given** a skill is selected, **When** the details panel loads, **Then** I see the rendered markdown content from skill.md with proper formatting and syntax highlighting
2. **Given** a skill has a references/ directory, **When** viewing skill details, **Then** I see a list of all reference files with their names and paths
3. **Given** a skill has a scripts/ directory, **When** viewing skill details, **Then** I see a list of all script files with their names, paths, and file types
4. **Given** a skill has metadata in frontmatter (name, description), **When** viewing details, **Then** I see the metadata displayed prominently
5. **Given** a skill markdown contains code blocks, **When** viewing the rendered content, **Then** code blocks are syntax highlighted appropriately

---

### User Story 3 - Navigate Between Skills and References (Priority: P2)

As a Claude Code skill developer, I want to easily navigate from a skill to its references and from one reference to another so I can trace dependencies and understand how skill knowledge is organized.

**Why this priority**: Navigation enables deep exploration and understanding of complex skills with many references. Critical for debugging skills that don't trigger as expected.

**Independent Test**: Can be tested by opening a skill with references, clicking on a reference to view its content, and using navigation to return to the skill or jump to related references.

**Acceptance Scenarios**:

1. **Given** I'm viewing a skill's reference list, **When** I click on a reference file, **Then** the reference markdown content is displayed in the viewer
2. **Given** I'm viewing a reference file, **When** I want to return to the main skill, **Then** I can click a "back to skill" button or use breadcrumb navigation
3. **Given** multiple reference files are open, **When** I navigate between them, **Then** I see a navigation history or breadcrumb trail showing my path
4. **Given** a reference file mentions another reference, **When** viewing that content, **Then** I can identify and navigate to related references easily

---

### User Story 4 - Analyze Skill Trigger Patterns (Priority: P2)

As a Claude Code skill developer, I want to see what keywords and phrases trigger my skill and what triggers specific references to load so I can optimize trigger descriptions and debug skills that aren't activating when expected.

**Why this priority**: Trigger analysis is the key debugging feature - helping developers understand WHY a skill does or doesn't activate. This differentiates the tool from a simple file browser.

**Independent Test**: Can be tested by selecting a skill and viewing a highlighted analysis showing trigger keywords extracted from the description field, with explanations of what phrases would activate the skill.

**Acceptance Scenarios**:

1. **Given** a skill has a description field, **When** I view trigger analysis, **Then** I see extracted trigger keywords and phrases highlighted and categorized
2. **Given** a skill's description mentions specific use cases, **When** viewing triggers, **Then** I see example queries that would activate this skill
3. **Given** references have specific topics or keywords, **When** viewing trigger analysis, **Then** I see what contextual keywords would cause those references to load
4. **Given** I want to test a trigger, **When** I enter a sample query, **Then** the application highlights which skills would likely trigger based on keyword matching

---

### User Story 5 - Visualize Skill Relationships and Dependencies (Priority: P3)

As a Claude Code skill developer, I want to see a visual diagram showing how my skill connects to its references and scripts so I can understand the skill architecture at a glance and identify potential issues.

**Why this priority**: Visualization helps with understanding complex skills, but the skill is still usable without it. This enhances the experience for power users.

**Independent Test**: Can be tested by selecting a skill and viewing an automatically generated Mermaid diagram that shows the skill, its references, and scripts as connected nodes.

**Acceptance Scenarios**:

1. **Given** a skill is selected, **When** I switch to diagram view, **Then** I see a Mermaid flowchart with the skill as the root node
2. **Given** a skill has references, **When** viewing the diagram, **Then** references appear as child nodes connected to the skill
3. **Given** a skill has scripts, **When** viewing the diagram, **Then** scripts appear as distinct nodes with appropriate visual distinction
4. **Given** the diagram is complex, **When** I interact with it, **Then** I can zoom, pan, and click on nodes to navigate to those files
5. **Given** I want to export the diagram, **When** I use export functionality, **Then** the diagram can be saved as an image or Mermaid source code

---

### User Story 6 - Search and Filter Skills (Priority: P3)

As a Claude Code skill developer with many installed skills, I want to search and filter the skill list by name, keywords, or location so I can quickly find specific skills without scrolling through a long list.

**Why this priority**: Search improves usability for users with many skills but isn't essential for the core value proposition. Can be added later without affecting fundamental functionality.

**Independent Test**: Can be tested by typing in a search box and verifying that the skill list filters in real-time to show only matching results.

**Acceptance Scenarios**:

1. **Given** many skills are installed, **When** I type in the search box, **Then** the list filters in real-time to show only skills matching the query
2. **Given** I want to filter by location, **When** I use a location filter, **Then** I see only skills from ~/.claude/skills or ~/.config/opencode/skills as selected
3. **Given** search results are displayed, **When** I clear the search, **Then** the full skill list is restored
4. **Given** no skills match my search, **When** viewing results, **Then** I see a helpful message suggesting how to refine my search

---

### Edge Cases

- What happens when skill directories don't exist (never used Claude Code with skills)?
- How does the system handle corrupted or malformed skill.md files (invalid YAML frontmatter)?
- What happens when a skill.md file is missing but references/ directory exists?
- How does the application handle very large skill files (>1MB markdown)?
- What happens when file permissions prevent reading a skill directory?
- How does the system handle skills with circular reference dependencies?
- What happens when references contain non-markdown files (.sh, .py, .txt)?
- How does the application handle skill names with special characters or Unicode?
- What happens when both directories contain skills with identical names?
- How does the system perform with 100+ installed skills?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST scan both `~/.claude/skills` and `~/.config/opencode/skills` directories for skill subdirectories
- **FR-002**: System MUST parse skill.md files and extract YAML frontmatter (name, description, location tags)
- **FR-003**: System MUST detect and list all files in the skill's references/ subdirectory
- **FR-004**: System MUST detect and list all files in the skill's scripts/ subdirectory
- **FR-005**: System MUST render markdown content with syntax highlighting for code blocks
- **FR-006**: System MUST display skill metadata (name, description, location, gitignore status) in a structured format
- **FR-007**: System MUST provide a list view showing all discovered skills with their names and locations
- **FR-008**: System MUST provide a detail view showing full skill content when a skill is selected
- **FR-009**: System MUST allow navigation from skill view to reference file view
- **FR-010**: System MUST allow navigation from reference file view back to skill view
- **FR-011**: System MUST extract trigger keywords from skill description field and display them visually
- **FR-012**: System MUST generate Mermaid diagrams showing skill structure (skill → references → scripts)
- **FR-013**: System MUST render Mermaid diagrams within the application interface
- **FR-014**: System MUST provide real-time search filtering across skill names and descriptions
- **FR-015**: System MUST handle missing skill directories gracefully with informative messages
- **FR-016**: System MUST handle malformed markdown or YAML gracefully without crashing
- **FR-017**: System MUST respect file system permissions and show appropriate errors when access is denied
- **FR-018**: System MUST operate entirely offline with no network requests
- **FR-019**: System MUST run as a native desktop application on macOS, Linux, and Windows
- **FR-020**: System MUST refresh skill list when directories change (with manual refresh button at minimum)

### Key Entities

- **Skill**: Represents a Claude Code skill with properties:
  - Name (from frontmatter or directory name)
  - Description (from frontmatter)
  - Location (path: ~/.claude/skills or ~/.config/opencode/skills)
  - Gitignore status (project vs global)
  - Main markdown content (skill.md file contents)
  - Collection of reference files
  - Collection of script files

- **Reference File**: Represents a markdown file in the references/ directory with properties:
  - File name
  - File path relative to skill
  - Markdown content
  - Relationship to parent skill

- **Script File**: Represents an executable file in the scripts/ directory with properties:
  - File name
  - File path relative to skill
  - File type/extension (.sh, .py, .js, etc.)
  - Relationship to parent skill

- **Trigger Pattern**: Represents extracted trigger information with properties:
  - Trigger keywords (extracted from description)
  - Example queries that would activate the skill
  - Confidence level (how likely Claude would invoke this skill)
  - Associated reference triggers (what causes specific references to load)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete skill inventory within 2 seconds of launching the application
- **SC-002**: Application scans and indexes up to 50 skills in under 500 milliseconds
- **SC-003**: Markdown rendering displays skill content in under 100 milliseconds per file
- **SC-004**: Users can navigate from a skill to any of its references in under 2 clicks
- **SC-005**: Search filtering updates results in real-time with no perceptible lag (<50ms)
- **SC-006**: Application memory usage remains under 200MB during typical use (browsing 20-30 skills)
- **SC-007**: Application startup time is under 2 seconds from launch to displaying skill list
- **SC-008**: Mermaid diagrams generate and render in under 1 second for skills with up to 20 references
- **SC-009**: 90% of users can successfully find a specific skill using search within 10 seconds
- **SC-010**: Users can identify why a skill isn't triggering by reviewing trigger analysis in under 30 seconds
- **SC-011**: Application handles malformed skill files without crashing (graceful error display)
- **SC-012**: Application works identically on macOS, Linux, and Windows with consistent UI and functionality

## Assumptions *(mandatory)*

- Users have Claude Code installed with at least one skill directory created
- Skill structure follows Claude Code conventions (skill.md, optional references/, optional scripts/)
- Skill frontmatter uses valid YAML format when present
- Reference files are primarily markdown (.md) though other file types may exist
- Users have read permissions for their skill directories
- Typical users have between 5-50 skills installed
- Skills use UTF-8 encoding for text files
- Users are familiar with markdown syntax and rendering
- Mermaid diagram syntax is suitable for representing skill relationships
- Users want read-only exploration (no editing functionality required in v1)
