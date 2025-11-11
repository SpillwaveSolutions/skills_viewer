# Implementation Plan: Core Skill Explorer

**Branch**: `001-core-skill-explorer` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-skill-explorer/spec.md`

## Summary

Build a native desktop application using Tauri 2.x (Rust backend + React/TypeScript frontend) that discovers, displays, and analyzes Claude Code skills from `~/.claude/skills` and `~/.config/opencode/skills`. The application provides skill browsing, markdown rendering with syntax highlighting, reference navigation, trigger pattern analysis, and Mermaid diagram visualization of skill architecture. Performance targets: <2s startup, <500ms skill scanning, <100ms markdown rendering, <200MB memory usage.

## Technical Context

**Language/Version**:
- Rust 1.75+ (Tauri backend)
- TypeScript 5.3+ (React frontend)
- Node.js 20+ (build tooling)

**Primary Dependencies**:
- **Backend (Rust)**:
  - `tauri` 2.x - Desktop application framework
  - `serde` / `serde_json` - JSON serialization
  - `walkdir` - Directory traversal
  - `yaml-rust2` - YAML frontmatter parsing
  - `tokio` - Async runtime
- **Frontend (React/TypeScript)**:
  - `react` 18.x - UI framework
  - `react-markdown` - Markdown rendering
  - `react-syntax-highlighter` - Code syntax highlighting
  - `mermaid` - Diagram rendering
  - `@tanstack/react-query` - Data fetching/caching
  - `zustand` - State management (lightweight)
  - `@radix-ui/react-*` - Accessible UI primitives
  - `tailwindcss` - Styling

**Storage**: File system only (read-only access to skill directories). No database required.

**Testing**:
- Rust: `cargo test` with `rstest` for parameterized tests
- TypeScript: `vitest` for unit tests, `@testing-library/react` for component tests
- E2E: `@playwright/test` for cross-platform integration tests

**Target Platform**: Desktop (macOS 11+, Linux with GTK 3+, Windows 10+)

**Project Type**: Desktop application (hybrid Rust/TypeScript)

**Performance Goals**:
- Cold start: <2 seconds
- Skill directory scan: <500ms for 50 skills
- Markdown render: <100ms per document
- UI: 60fps animations, <16ms frame time
- Memory: <200MB during typical use

**Constraints**:
- Offline-only (no network requests)
- Read-only file operations
- Cross-platform UI consistency
- Native look and feel (not web-like)

**Scale/Scope**:
- Support 5-100 skills
- Handle skills with up to 50 reference files
- Markdown files up to 1MB
- Real-time search across all skill content

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Native Desktop Experience ✅
- **Compliance**: Tauri provides native window management, system integration
- **Verification**: <2s startup target specified, 60fps UI target defined
- **Platform-specific**: Will use Tauri's platform APIs for native menus, file dialogs

### II. Developer-First Design ✅
- **Compliance**: Keyboard navigation planned (arrow keys, shortcuts)
- **Verification**: Information density prioritized (list + detail view)
- **Power-user features**: Search, filtering, breadcrumb navigation specified

### III. Read-Only Safety ✅
- **Compliance**: No file write operations in requirements
- **Verification**: Rust backend uses read-only file system APIs
- **Safety**: No mutation of skill files, only visualization

### IV. Cross-Platform Consistency ✅
- **Compliance**: Tauri supports macOS, Linux, Windows
- **Verification**: Same React UI across all platforms
- **Path handling**: Rust `std::path` handles platform-specific paths

### V. Performance and Efficiency ✅
- **Compliance**: All performance targets specified in Success Criteria
- **Verification**:
  - Startup: <2s (SC-007)
  - Scan: <500ms (SC-002)
  - Render: <100ms (SC-003)
  - Memory: <200MB (SC-006)
- **Optimization**: Async file I/O, virtual scrolling, lazy loading

### VI. Visualization-First Understanding ✅
- **Compliance**: Mermaid diagrams for skill architecture (FR-012, FR-013)
- **Verification**: Automatic diagram generation from skill structure
- **Interactive**: Click nodes to navigate (User Story 5)

### VII. Testability and Quality ✅
- **Compliance**: Testing frameworks specified (cargo test, vitest, playwright)
- **Verification**: Unit tests for Rust file operations, React components
- **Coverage**: >80% target per constitution
- **Error handling**: Graceful degradation specified (FR-015, FR-016, FR-017)

**Gate Status**: ✅ PASSED - All principles addressed

## Project Structure

### Documentation (this feature)

```text
specs/001-core-skill-explorer/
├── plan.md              # This file
├── research.md          # Phase 0: Technology evaluation
├── data-model.md        # Phase 1: Type definitions
├── quickstart.md        # Phase 1: Development setup
└── contracts/           # Phase 1: Rust-TypeScript IPC contracts
    ├── skill-scanner.json
    ├── markdown-parser.json
    └── file-reader.json
```

### Source Code (repository root)

```text
src-tauri/              # Rust backend
├── src/
│   ├── main.rs         # Tauri entry point
│   ├── commands/       # Tauri commands (IPC handlers)
│   │   ├── mod.rs
│   │   ├── skill_scanner.rs    # Scan skill directories
│   │   ├── file_reader.rs      # Read markdown files
│   │   └── metadata_parser.rs  # Parse YAML frontmatter
│   ├── models/         # Data structures
│   │   ├── mod.rs
│   │   ├── skill.rs
│   │   ├── reference.rs
│   │   └── script.rs
│   ├── services/       # Business logic
│   │   ├── mod.rs
│   │   └── skill_service.rs
│   └── utils/          # Helpers
│       ├── mod.rs
│       ├── path_utils.rs
│       └── yaml_parser.rs
├── Cargo.toml
└── tauri.conf.json

src/                    # React frontend
├── main.tsx            # Entry point
├── App.tsx             # Root component
├── components/         # React components
│   ├── SkillList/
│   │   ├── SkillList.tsx
│   │   ├── SkillListItem.tsx
│   │   └── SkillListSearch.tsx
│   ├── SkillViewer/
│   │   ├── SkillViewer.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── ReferenceList.tsx
│   │   └── ScriptList.tsx
│   ├── TriggerAnalyzer/
│   │   ├── TriggerAnalyzer.tsx
│   │   └── KeywordHighlighter.tsx
│   ├── DiagramView/
│   │   ├── DiagramView.tsx
│   │   └── MermaidRenderer.tsx
│   └── Navigation/
│       ├── Breadcrumbs.tsx
│       └── NavigationHistory.tsx
├── hooks/              # Custom React hooks
│   ├── useSkills.ts
│   ├── useMarkdown.ts
│   └── useNavigation.ts
├── services/           # Frontend services
│   ├── tauriCommands.ts    # Tauri IPC wrappers
│   └── triggerAnalyzer.ts  # Keyword extraction logic
├── stores/             # Zustand stores
│   ├── skillStore.ts
│   └── navigationStore.ts
├── types/              # TypeScript types
│   ├── skill.ts
│   ├── reference.ts
│   └── script.ts
└── utils/              # Utilities
    └── pathUtils.ts

tests/                  # Tests
├── rust/               # Rust unit tests (in src-tauri/src/)
│   └── (colocated with source files)
├── unit/               # TypeScript unit tests
│   ├── components/
│   ├── hooks/
│   └── services/
└── e2e/                # Playwright tests
    ├── skill-discovery.spec.ts
    ├── skill-viewing.spec.ts
    └── navigation.spec.ts

public/                 # Static assets
└── icons/              # Application icons
```

**Structure Decision**: Hybrid Tauri application with clear separation between Rust backend (file I/O, parsing) and React frontend (UI, visualization). Rust handles all platform-specific file operations, React handles all UI rendering. Communication via Tauri's IPC command system.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Tauri Window (Native)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │          React Frontend (WebView)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │  SkillList   │  │ SkillViewer  │  │ Diagram  │ │ │
│  │  │  Component   │  │  Component   │  │   View   │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │ │
│  │         │                 │                │       │ │
│  │  ┌──────┴─────────────────┴────────────────┴─────┐ │ │
│  │  │         Zustand Stores (State Mgmt)           │ │ │
│  │  └──────┬─────────────────────────────────┬──────┘ │ │
│  │         │                                 │        │ │
│  │  ┌──────┴─────────────┐   ┌──────────────┴──────┐ │ │
│  │  │  Tauri Commands    │   │  React Query Cache  │ │ │
│  │  │  (IPC Bridge)      │   │  (Data Fetching)    │ │ │
│  │  └──────┬─────────────┘   └─────────────────────┘ │ │
│  └─────────┼──────────────────────────────────────────┘ │
│            │ IPC (JSON over WebSocket-like)             │
│  ┌─────────┴──────────────────────────────────────────┐ │
│  │              Rust Backend                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │ Skill        │  │ File         │  │ Metadata │ │ │
│  │  │ Scanner      │  │ Reader       │  │ Parser   │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │ │
│  │         │                 │                │       │ │
│  │  ┌──────┴─────────────────┴────────────────┴─────┐ │ │
│  │  │          Skill Service (Business Logic)       │ │ │
│  │  └──────┬─────────────────────────────────────────┘ │ │
│  │         │                                           │ │
│  │  ┌──────┴─────────────────────────────────────┐   │ │
│  │  │       File System (Read-Only Access)       │   │ │
│  │  │  ~/.claude/skills  ~/.config/opencode/skills│  │ │
│  │  └────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Skill Discovery** (on app startup):
   - React: Calls `invoke('scan_skills')`
   - Rust: Scans both directories, returns `Vec<Skill>`
   - React: Updates Zustand store, displays list

2. **Skill Viewing** (on skill selection):
   - React: Calls `invoke('read_skill', { skillPath })`
   - Rust: Reads skill.md, parses frontmatter, lists references/scripts
   - React: Renders markdown, displays metadata

3. **Reference Navigation** (on reference click):
   - React: Calls `invoke('read_reference', { refPath })`
   - Rust: Reads reference markdown
   - React: Updates navigation history, renders content

4. **Trigger Analysis** (computed in frontend):
   - React: Extracts keywords from skill description (in-memory)
   - No backend call needed

5. **Diagram Generation** (computed in frontend):
   - React: Generates Mermaid syntax from skill structure
   - Mermaid.js: Renders diagram in browser

### Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   ├── SkillListSearch
│   │   └── SkillList
│   │       └── SkillListItem (×N)
│   └── MainContent
│       ├── Breadcrumbs
│       ├── TabBar
│       │   ├── Tab: Overview
│       │   ├── Tab: Triggers
│       │   └── Tab: Diagram
│       └── TabContent
│           ├── SkillViewer (Overview tab)
│           │   ├── MetadataDisplay
│           │   ├── MarkdownRenderer
│           │   ├── ReferenceList
│           │   └── ScriptList
│           ├── TriggerAnalyzer (Triggers tab)
│           │   └── KeywordHighlighter
│           └── DiagramView (Diagram tab)
│               └── MermaidRenderer
```

## Technology Stack Rationale

### Tauri 2.x
- **Why**: Native performance, small bundle size (<10MB vs Electron's 100MB+), Rust security
- **Alternative considered**: Electron - Rejected due to large bundle and memory overhead
- **Risk**: Newer ecosystem than Electron, fewer third-party libraries
- **Mitigation**: Well-documented, active community, stable 2.x release

### React + TypeScript
- **Why**: Familiar to most developers, excellent tooling, large ecosystem
- **Alternative considered**: Svelte - Rejected to match user's TypeScript preference
- **Benefit**: Type safety prevents runtime errors, IntelliSense support

### Zustand (State Management)
- **Why**: Lightweight (<1KB), simpler than Redux, sufficient for this app's needs
- **Alternative considered**: Redux - Rejected as over-engineering for this scope
- **Benefit**: Minimal boilerplate, easy testing

### React Markdown + Syntax Highlighter
- **Why**: Standard solution, supports GitHub-flavored markdown, extensible
- **Alternative considered**: Building custom parser - Rejected due to complexity
- **Benefit**: Handles edge cases, maintained library

### Mermaid.js
- **Why**: Industry-standard diagram library, text-based, renders in browser
- **Alternative considered**: D3.js custom - Rejected due to development time
- **Benefit**: Declarative syntax, built-in zoom/pan

### Radix UI
- **Why**: Unstyled, accessible by default, composable primitives
- **Alternative considered**: Material UI - Rejected as too opinionated for native feel
- **Benefit**: Full keyboard navigation, ARIA attributes, screen reader support

### Tailwind CSS
- **Why**: Utility-first, fast development, consistent design tokens
- **Alternative considered**: CSS Modules - Rejected for slower iteration
- **Benefit**: No runtime cost, purges unused styles, responsive utilities

## Key Design Decisions

### 1. File System Access Pattern
**Decision**: Rust backend handles all file I/O, frontend only receives data

**Rationale**:
- Security: Tauri's permission model restricts frontend file access
- Performance: Rust async I/O is faster than JavaScript
- Cross-platform: Rust stdlib handles path differences

**Implementation**:
```rust
#[tauri::command]
async fn scan_skills() -> Result<Vec<Skill>, String> {
    // Scan both directories in parallel
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    // Read with proper error handling
}
```

### 2. YAML Frontmatter Parsing
**Decision**: Parse YAML in Rust, send JSON to frontend

**Rationale**:
- Rust YAML parser is more robust
- Validation happens backend-side
- Frontend receives clean, typed data

**Implementation**:
```rust
pub struct SkillMetadata {
    pub name: String,
    pub description: String,
    pub location: String, // "project" | "user"
}
```

### 3. Markdown Rendering Strategy
**Decision**: Send raw markdown to frontend, render client-side

**Rationale**:
- Syntax highlighting needs browser APIs
- Future extensibility (custom renderers, plugins)
- Keeps backend simple

**Trade-off**: Larger IPC payload, but acceptable for typical skill sizes

### 4. Trigger Keyword Extraction
**Decision**: Frontend-only logic (no ML, simple regex/keyword extraction)

**Rationale**:
- Skill descriptions already contain trigger keywords
- Simple pattern matching sufficient
- No need for complex NLP

**Implementation**:
```typescript
function extractTriggers(description: string): Trigger[] {
  // Extract "when...", "use this...", keywords
}
```

### 5. Navigation State Management
**Decision**: Zustand store for navigation history + breadcrumbs

**Rationale**:
- Need undo/redo for back/forward
- Share state across components
- Persist during session

**Implementation**:
```typescript
type NavigationState = {
  history: string[];     // Paths visited
  currentIndex: number;
  goBack: () => void;
  goForward: () => void;
  navigate: (path: string) => void;
};
```

### 6. Diagram Generation Timing
**Decision**: Generate Mermaid syntax on-demand (when diagram tab opened)

**Rationale**:
- Not all users need diagrams
- Diagram generation is fast (<10ms)
- Saves memory for unused diagrams

### 7. Search Implementation
**Decision**: Client-side search with debounced filtering

**Rationale**:
- Small dataset (5-100 skills)
- Instant results
- No backend needed

**Implementation**:
- Load all skill metadata on startup
- Filter in-memory with 300ms debounce

### 8. Error Handling Strategy
**Decision**: Graceful degradation with user-friendly messages

**Examples**:
- Missing directory → Show setup instructions
- Malformed YAML → Display raw markdown, log error
- Permission denied → Show error banner with path

## Performance Optimizations

### 1. Virtual Scrolling (Skill List)
- Render only visible items (20-30 at a time)
- Library: `@tanstack/react-virtual`
- Benefit: Handles 1000+ skills smoothly

### 2. Lazy Loading (References)
- Don't load reference content until clicked
- Load on-demand via `invoke('read_reference')`
- Benefit: Faster skill viewing

### 3. Parallel Directory Scanning
```rust
use tokio::task;

async fn scan_skills() -> Vec<Skill> {
    let (claude_skills, opencode_skills) = tokio::join!(
        scan_directory("~/.claude/skills"),
        scan_directory("~/.config/opencode/skills"),
    );
    // Merge results
}
```

### 4. React Query Caching
- Cache skill data with 5-minute stale time
- Invalidate on manual refresh
- Benefit: Instant navigation back to previously viewed skills

### 5. Code Splitting
- Load Mermaid.js only when diagram tab is opened
- Use React.lazy() for diagram component
- Benefit: Faster initial load

## Security Considerations

### 1. File System Access
- **Tauri Permission**: Restrict to skill directories only
- **Validation**: Sanitize all paths before file access
- **No Writes**: Read-only access enforced

### 2. XSS Prevention
- **Markdown**: Use `react-markdown` with safe defaults (no raw HTML)
- **Code Blocks**: Syntax highlighter escapes content
- **User Input**: Search query sanitized before regex

### 3. Content Security Policy
```json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

## Testing Strategy

### Unit Tests (Rust)
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_skill_frontmatter() {
        let content = "---\nname: test\n---\n# Content";
        let skill = parse_skill(content).unwrap();
        assert_eq!(skill.name, "test");
    }
}
```

### Component Tests (React)
```typescript
describe('SkillList', () => {
  it('displays skills from both directories', () => {
    const skills = [/* mock skills */];
    render(<SkillList skills={skills} />);
    expect(screen.getByText('skill-name')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```typescript
test('navigate from skill to reference', async ({ page }) => {
  await page.goto('http://localhost:1420');
  await page.click('[data-testid="skill-plantuml"]');
  await page.click('[data-testid="ref-sequence-diagrams"]');
  await expect(page.locator('h1')).toContainText('Sequence Diagrams');
});
```

### Performance Benchmarks
- Measure startup time: `performance.now()`
- Measure scan time: Rust `std::time::Instant`
- Memory profiling: Chrome DevTools heap snapshots

## Complexity Tracking

> **No constitutional violations - no complexity justification needed**

All design decisions align with constitutional principles. No exceptions required.

## Next Steps

After this plan approval:
1. **Phase 0**: Create `research.md` (if needed - technology choices already documented)
2. **Phase 1**: Create `data-model.md`, `contracts/`, and `quickstart.md`
3. **Phase 2**: Generate `tasks.md` with `/speckit.tasks`
4. **Phase 3**: Implementation with `/speckit.implement`
