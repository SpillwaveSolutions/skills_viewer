# Feature Specification: Intelligent Mermaid Diagram Generation

**Feature Branch**: `015-intelligent-diagram-generation`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "Implement intelligent diagram generation with Mermaid syntax validation, Claude-assisted generation via `claude -p`, and CRC-based caching to prevent blank diagram tabs and reduce errors from ~50% to <5%."

## User Scenarios & Testing

### User Story 1 - Syntax Validation Before Render (Priority: P1)

When a user views a skill's diagram tab, they should never see a blank screen due to syntax errors. Instead, the system automatically detects errors and provides clear feedback.

**Why this priority**: This is the foundation for all other diagram improvements. Without validation, we can't detect which diagrams need help, and users continue to see blank screens (current 50% error rate).

**Independent Test**: Can be fully tested by loading skills with known syntax errors and verifying that error messages appear instead of blank screens. Delivers immediate value by eliminating the #1 user complaint (blank diagrams).

**Acceptance Scenarios**:

1. **Given** a skill with invalid Mermaid syntax, **When** user clicks Diagram tab, **Then** system displays "Syntax error detected" message with error details instead of blank screen
2. **Given** a skill with valid Mermaid syntax, **When** user clicks Diagram tab, **Then** diagram renders successfully without validation errors
3. **Given** a skill with no diagram configured, **When** user clicks Diagram tab, **Then** system displays "No diagram configured for this skill" message
4. **Given** validation detects syntax error, **When** error message is shown, **Then** console logs include line number and error description for debugging

---

### User Story 2 - Automatic Diagram Generation (Priority: P1)

When syntax errors are detected, the system automatically attempts to generate a valid diagram using Claude Code CLI, eliminating manual fixes.

**Why this priority**: This directly solves the root cause of blank diagrams. Combined with validation (US1), this creates a self-healing system that achieves the goal of <5% diagram errors.

**Independent Test**: Can be tested by providing skills with syntax errors and verifying Claude generates valid Mermaid. Delivers value by automatically fixing broken diagrams without user intervention.

**Acceptance Scenarios**:

1. **Given** syntax validation fails for a diagram, **When** system attempts auto-generation, **Then** Claude CLI is called with skill content as context
2. **Given** Claude CLI generates valid Mermaid, **When** generation completes, **Then** diagram renders successfully and syntax validation passes
3. **Given** Claude CLI is unavailable, **When** generation is attempted, **Then** system displays "Install Claude Code CLI to enable auto-generation" with installation link
4. **Given** generation attempt fails or times out (>30s), **When** user views diagram tab, **Then** system displays "Generation failed" with option to retry and view raw Mermaid source
5. **Given** generation is in progress, **When** user views diagram tab, **Then** loading indicator displays "Generating diagram..." status

---

### User Story 3 - CRC-Based Caching (Priority: P2)

When diagrams are generated, they are cached with a hash of skill files, so unchanged skills load instantly without regeneration.

**Why this priority**: Improves performance and reduces Claude API calls. Not critical for MVP (diagrams still work without caching), but dramatically improves user experience for repeated loads.

**Independent Test**: Can be tested by generating a diagram, then reloading the same skill and verifying instant load without calling Claude. Delivers value through sub-second load times (target: <100ms).

**Acceptance Scenarios**:

1. **Given** a diagram has been generated for a skill, **When** user revisits the same skill, **Then** cached diagram loads in <100ms without calling Claude
2. **Given** skill files are modified (content, references, or scripts change), **When** user views diagram tab, **Then** CRC hash changes and new diagram is generated
3. **Given** cached diagram exists for old CRC, **When** new diagram is generated for new CRC, **Then** old cache entry is deleted
4. **Given** cache directory exceeds 100MB, **When** new diagram is cached, **Then** oldest entries are auto-deleted to stay under limit
5. **Given** user clicks "Clear Cache" button in diagram toolbar, **When** button is clicked, **Then** all cached diagrams are deleted and regenerate on next view

---

### User Story 4 - Graceful Error Handling (Priority: P3)

When diagram generation or loading fails, users receive helpful, actionable error messages instead of confusing blank screens.

**Why this priority**: Enhances user experience but diagrams still function without perfect error messages. Can be refined post-MVP.

**Independent Test**: Can be tested by simulating each error condition (syntax error, CLI unavailable, timeout, etc.) and verifying appropriate messages appear.

**Acceptance Scenarios**:

1. **Given** syntax error is detected, **When** system displays error, **Then** message includes "Attempting auto-fix..." status
2. **Given** Claude CLI is not installed, **When** auto-generation fails, **Then** error message includes installation instructions and link to Claude Code download
3. **Given** generation fails, **When** error is displayed, **Then** "Retry" button allows re-attempting generation without page reload
4. **Given** "View Source" button is clicked, **When** user clicks it, **Then** raw Mermaid syntax is displayed with syntax error highlighting
5. **Given** previous valid diagram exists, **When** regeneration fails, **Then** previous diagram continues to display with warning banner about failed update

---

### Edge Cases

- What happens when CRC calculation fails (missing file permissions)? → Log warning, skip caching, generate diagram normally
- How does system handle very large skill files (>10MB)? → Implement size limit check, warn user if exceeding Claude context window
- What happens when cache directory is not writable? → Fall back to in-memory caching for session only, log warning
- How does system handle rapid skill edits (CRC changing frequently)? → Debounce regeneration requests (wait 2s after last edit)
- What happens when Mermaid library itself has errors? → Catch library errors, display "Diagram rendering failed" with option to report bug
- How does system handle diagrams that are syntactically valid but visually broken? → Allow manual override in skill.md with explicit Mermaid block

## Requirements

### Functional Requirements

- **FR-001**: System MUST validate Mermaid syntax using mermaid.parse() API before attempting to render diagrams
- **FR-002**: System MUST display clear error messages when validation detects syntax errors, including line number and error description when available
- **FR-003**: System MUST automatically attempt diagram generation via `claude -p` CLI when syntax validation fails
- **FR-004**: System MUST pass complete skill context (skill.md, references, scripts) to Claude CLI for diagram generation
- **FR-005**: System MUST parse Claude CLI response to extract valid Mermaid syntax from generated output
- **FR-006**: System MUST calculate CRC32 hash of concatenated skill files (skill.md + all references + all scripts) for cache keys
- **FR-007**: System MUST store generated diagrams in `~/.cache/skill-debugger/diagrams/` directory with naming format `{skill_name}-{crc_hash}.mmd`
- **FR-008**: System MUST check cache for matching CRC before regenerating diagrams, loading from cache if CRC matches
- **FR-009**: System MUST delete stale cache entries (different CRC) when generating new diagrams for a skill
- **FR-010**: System MUST enforce 100MB maximum cache size, auto-deleting oldest entries when limit is exceeded
- **FR-011**: System MUST provide "Clear Cache" button in diagram toolbar that deletes all cached diagrams
- **FR-012**: System MUST timeout Claude CLI calls after 30 seconds maximum
- **FR-013**: System MUST display loading indicator while diagram generation is in progress
- **FR-014**: System MUST provide "Retry" button when generation fails, allowing re-attempt without page reload
- **FR-015**: System MUST provide "View Source" button to display raw Mermaid syntax with error highlighting
- **FR-016**: System MUST handle gracefully when Claude CLI is unavailable, displaying installation instructions
- **FR-017**: System MUST log all validation errors and generation attempts to console for debugging
- **FR-018**: System MUST maintain previous valid diagram when regeneration fails, showing warning banner

### Key Entities

- **DiagramCache**: Represents cached Mermaid diagram data with attributes: skill_name, crc_hash, diagram_source, timestamp
- **ValidationResult**: Represents outcome of Mermaid syntax validation with attributes: is_valid, error_message, line_number (optional)
- **GenerationRequest**: Represents a Claude CLI generation request with attributes: skill_content, timeout, retry_count
- **CacheMetadata**: Represents cache directory state with attributes: total_size_bytes, entry_count, oldest_entry_timestamp

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero blank diagram tabs - all skills display either valid diagram, loading state, or error message with actionable guidance
- **SC-002**: Diagram error rate reduced from current ~50% to <5% through automatic validation and generation
- **SC-003**: Cache hit rate exceeds 80% for repeated skill visits, eliminating redundant generation
- **SC-004**: First-time diagram generation completes in <30 seconds (Claude CLI timeout limit)
- **SC-005**: Cached diagram loads complete in <100ms (sub-second user experience)
- **SC-006**: Claude-generated diagrams achieve >95% validity rate (pass Mermaid syntax validation)
- **SC-007**: Users can recover from generation failures via "Retry" button without reloading page
- **SC-008**: Clear error messages reduce support requests related to diagram issues by >80%

## Assumptions

- Users have Node.js installed (required for Tauri app)
- Users can install Claude Code CLI if they want auto-generation (graceful degradation if not installed)
- Skill files are text-based and can be concatenated for CRC hashing
- Mermaid library (v11.12.1) supports parse() API for validation
- Cache directory `~/.cache/skill-debugger/` is writable by the application
- CRC32 hash collisions are statistically negligible for cache invalidation purposes
- 100MB cache limit provides sufficient storage for typical usage patterns
- Claude CLI `-p` flag returns complete response via stdout (non-interactive mode)

## Dependencies

- **External**: Claude Code CLI (optional - feature degrades gracefully without it)
- **Library**: Mermaid v11.12.1 (already installed)
- **Library**: crc-32 npm package (needs to be added to package.json)
- **Internal**: Tauri file system commands for cache directory access
- **Internal**: Skill scanning and content loading system

## Out of Scope

- Real-time diagram editing within the Skill Debugger UI (read-only viewer only)
- Manual Mermaid syntax correction UI or inline editor
- Diagram style customization beyond Mermaid default themes
- Diagram versioning or history tracking across skill edits
- Multi-user cache synchronization or sharing
- Diagram export to formats other than PNG/SVG (already supported via existing DiagramToolbar)
- Performance profiling or optimization beyond cache hit rate metrics
