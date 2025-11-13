# Skill Debugger Architecture Diagrams

This directory contains comprehensive Mermaid architecture diagrams for the Skill Debugger project. These diagrams provide visual representations of the system's architecture, data flows, and design patterns.

## Diagram Index

### 1. System Architecture (C4 Container)

**File**: [system-architecture.mmd](./system-architecture.mmd)

Shows the high-level system architecture using C4 Container diagram notation:

- User interaction with Tauri Desktop App
- Frontend (React/TypeScript/Vite) components
- Backend (Rust/Tauri) services
- File System integration (~/.claude/skills, ~/.config/opencode/skills)
- IPC communication paths

### 2. Component Hierarchy

**File**: [component-hierarchy.mmd](./component-hierarchy.mmd)

Illustrates the React component tree structure:

- App root component
- Layout with sidebar and main content
- SearchBar and SkillList in sidebar
- SkillViewer with multi-tab interface
- Individual tab components (Overview, Content, Triggers, Diagram, References, Scripts)
- KeyboardShortcutHelp modal
- ErrorBoundary wrapper

### 3. Data Flow

**File**: [data-flow.mmd](./data-flow.mmd)

Detailed sequence diagram showing the complete data flow:

- Application startup and skill loading
- Frontend-Backend IPC communication
- File system scanning process
- User interaction flows
- Reference file loading
- Keyboard shortcut handling

### 4. State Management

**File**: [state-management.mmd](./state-management.mmd)

Zustand state management architecture:

- useSkillStore (skills, selectedSkill, loading, error)
- keyboardStore (shortcuts, platform, navigation state)
- Component subscriptions to stores
- State update actions
- Consumer component relationships

### 5. File System Scanning Flow

**File**: [skill-scanning-flow.mmd](./skill-scanning-flow.mmd)

Detailed backend scanning logic flowchart:

- Directory resolution (home directory → skill directories)
- Recursive directory scanning
- SKILL.md detection and parsing
- YAML frontmatter extraction
- References and scripts loading
- Error handling paths
- Skill object construction

### 6. Build and Deployment Pipeline

**File**: [build-pipeline.mmd](./build-pipeline.mmd)

Complete build process visualization:

- Development mode (task dev → Vite + Tauri)
- Build process (frontend + backend compilation)
- Test suite (Unit, Integration, E2E)
- Release packaging (.dmg, .deb, .exe)
- CI/CD pipeline steps

### 7. Security Architecture

**File**: [security-architecture.mmd](./security-architecture.mmd)

Security layers and considerations:

- User permissions (OS-level)
- Tauri security (IPC validation, capability system)
- Read-only access design
- Input validation layers
- Error handling
- Vulnerability points (path traversal, CSP)
- Recommended security enhancements

### 8. Testing Strategy

**File**: [testing-strategy.mmd](./testing-strategy.mmd)

Comprehensive testing approach:

- Unit tests (Vitest for React, cargo test for Rust)
- Integration tests (IPC communication)
- E2E tests (Playwright)
- Coverage targets (>80% per constitution)
- Current implementation status
- Test execution commands

## Viewing the Diagrams

### Option 1: Mermaid Live Editor

1. Visit [Mermaid Live Editor](https://mermaid.live/)
2. Copy the content of any `.mmd` file
3. Paste into the editor to view and interact with the diagram

### Option 2: VS Code Extension

1. Install the "Mermaid Preview" extension in VS Code
2. Open any `.mmd` file
3. Use the preview pane to view the rendered diagram

### Option 3: GitHub/GitLab

Both GitHub and GitLab automatically render Mermaid diagrams in markdown files. Simply wrap the diagram content in triple backticks with `mermaid` language identifier:

````markdown
```mermaid
[diagram content here]
```
````

### Option 4: Generate Images

Use the Mermaid CLI to generate PNG/SVG files:

```bash
# Install mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i system-architecture.mmd -o system-architecture.png

# Generate SVG
mmdc -i system-architecture.mmd -o system-architecture.svg

# Generate all diagrams
for file in *.mmd; do
  mmdc -i "$file" -o "${file%.mmd}.svg"
done
```

## Diagram Standards

All diagrams follow these standards:

- **Consistent color coding**: Components are color-coded by type/layer
- **Clear labeling**: All nodes and relationships are clearly labeled
- **Professional styling**: Uses Mermaid themes and custom styling
- **Hierarchical organization**: Top-down or left-right flow for clarity
- **Legend/Notes**: Complex diagrams include explanatory notes

## Maintenance

These diagrams should be updated when:

- Major architectural changes occur
- New components or layers are added
- Security measures are updated
- Build process changes
- Testing strategy evolves

Last Updated: 2025-11-13
Version: 1.0.0
