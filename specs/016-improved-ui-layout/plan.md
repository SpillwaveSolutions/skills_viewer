# Implementation Plan: Improved UI Layout with Top Tabs

**Branch**: `016-improved-ui-layout` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-improved-ui-layout/spec.md` with HTML mockups

## Summary

Redesign the Skill Debugger UI to position tabs at the top (instead of bottom), consolidate overview content into a dedicated tab, add breadcrumb navigation, and provide compact layout mode. This addresses critical UX issues: bottom tabs waste 200+ vertical pixels needed for diagrams, duplicate content between header and Overview tab confuses users, and missing spatial navigation makes it hard to understand current location.

**Primary Technical Approach**:

- Refactor SkillViewer.tsx to move tab bar from bottom to top (below header, above content)
- Consolidate OverviewPanel.tsx content into dedicated Overview tab (remove header duplication)
- Add BreadcrumbNavigation component to top bar showing "Home › Skill › Tab"
- Extend keyboardStore with layout mode state (standard/compact) and persist to localStorage
- Use TailwindCSS utility classes for all styling (no custom CSS)
- Achieve >80% test coverage via TDD: write tests first, then implement

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode)
**Framework**: React 19.1.0 (functional components, hooks)
**Styling**: TailwindCSS 4.1.17 (utility classes only, no custom CSS)
**State Management**: Zustand 5.0.8 (extend keyboardStore with layoutMode, add layoutStore)
**Markdown**: react-markdown 10.1.0 with syntax highlighting
**Testing**: Vitest (unit tests) + Playwright (E2E tests)
**Desktop**: Tauri 2.x (Chromium webview, native window events)

**Performance Goals**:

- Breadcrumb updates: <50ms after tab change (FR-020)
- Tab transitions: <200ms smooth animation (FR-037)
- Additional vertical space: +200px minimum for content area (FR-003)
- Compact mode space gain: +80-120px header height reduction (FR-027)

**Constraints**:

- Must achieve >80% test coverage (constitutional Principle VII)
- Must use TDD approach: write failing tests before implementation
- Must not break existing keyboard shortcuts (Cmd/Ctrl+1-6)
- Must maintain diagram interactivity (zoom, pan, font controls)
- Must use only TailwindCSS utilities (no custom CSS classes)
- Must persist layout mode preference in localStorage (FR-028)
- Must update breadcrumb within 50ms of navigation (FR-020)

**Scale/Scope**:

- 6 tabs total (Overview, Content, Triggers, Diagram, References, Scripts)
- 2 layout modes (standard with description, compact with inline stats)
- 3-level breadcrumb hierarchy (Home › Skill › Tab)
- ~50 skills in typical installation (performance tested at this scale)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Native Desktop Experience ✅

- Uses TailwindCSS utilities for smooth transitions (<200ms tab switching)
- Leverages Tauri window resize events for responsive layout
- Maintains 60fps performance during tab transitions
- Persists layout preference via localStorage (native web API)

### Principle II: Developer-First Design ✅

- Top tabs provide maximum vertical space for diagrams (+200px)
- Breadcrumb navigation improves spatial awareness
- Compact mode maximizes content density for power users
- Keyboard shortcuts remain fully functional (Cmd/Ctrl+1-6)
- Consolidated overview eliminates duplicate information

### Principle III: Read-Only Safety ✅

- Layout mode changes only affect UI state (no file modifications)
- localStorage writes are limited to user preferences (reversible)
- No skill file operations involved in this feature

### Principle IV: Cross-Platform Consistency ✅

- TailwindCSS utilities work identically across platforms
- Keyboard shortcuts use existing platform detection (keyboardStore)
- localStorage is supported in all Tauri targets (macOS, Linux, Windows)

### Principle V: Performance and Efficiency ✅

- Tab switching targets <200ms (FR-037)
- Breadcrumb updates target <50ms (FR-020)
- Memory usage: minimal increase (layout state ~1KB)
- No performance regression for existing features

### Principle VI: Visualization-First Understanding ✅

- Breadcrumb provides visual hierarchy (Home › Skill › Tab)
- Top tabs improve diagram viewability (+200px vertical space)
- Visual feedback for tab states (hover, active, focus)

### Principle VII: Testability and Quality ✅ (CRITICAL)

- **MUST achieve >80% test coverage** (constitutional requirement)
- **TDD approach**: Write tests before implementation
- Unit tests for layout state management (Zustand store)
- Integration tests for tab switching, breadcrumb updates
- E2E tests for compact mode toggle, keyboard navigation
- Performance tests for breadcrumb updates (<50ms), transitions (<200ms)

**Compliance Status**: ✅ All 7 principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/016-improved-ui-layout/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (React patterns, TailwindCSS, localStorage)
├── data-model.md        # Phase 1 output (LayoutMode, BreadcrumbNav, TabConfig entities)
├── quickstart.md        # Phase 1 output (developer setup, refactoring guide)
├── contracts/           # Phase 1 output (API contracts for layout, breadcrumb, tabs)
│   ├── layout-mode-api.md
│   ├── breadcrumb-navigation-api.md
│   └── tab-system-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SkillViewer.tsx            # [REFACTOR] Move tabs to top, remove OverviewPanel from header
│   ├── OverviewPanel.tsx          # [REFACTOR] Convert to OverviewTab component
│   ├── BreadcrumbNavigation.tsx   # [NEW] Top bar breadcrumb (Home › Skill › Tab)
│   ├── SkillHeader.tsx            # [NEW] Consolidated header (title + badge, optional inline stats)
│   ├── TabBar.tsx                 # [NEW] Reusable tab bar component
│   ├── OverviewTab.tsx            # [NEW] Consolidated metadata tab content
│   └── index.ts                   # [UPDATE] Export new components
├── stores/
│   ├── keyboardStore.ts           # [EXISTING] Already has activeTabIndex, platform detection
│   ├── layoutStore.ts             # [NEW] Layout mode state (standard/compact), localStorage sync
│   └── navigationStore.ts         # [EXISTING] Already tracks navigation history
├── hooks/
│   ├── useKeyboardShortcuts.ts    # [EXISTING] Already handles Cmd/Ctrl+1-6
│   └── useLayoutMode.ts           # [NEW] Hook for layout mode with localStorage persistence
├── types/
│   └── layout.ts                  # [NEW] LayoutMode, BreadcrumbSegment types
└── utils/
    └── localStorage.ts            # [NEW] Type-safe localStorage wrapper

tests/
├── unit/
│   ├── stores/
│   │   └── layoutStore.test.ts   # [NEW] Layout mode state tests
│   ├── hooks/
│   │   └── useLayoutMode.test.ts # [NEW] Layout mode hook tests
│   └── utils/
│       └── localStorage.test.ts  # [NEW] localStorage wrapper tests
├── integration/
│   ├── TabSwitching.test.tsx     # [NEW] Tab navigation integration tests
│   ├── BreadcrumbUpdate.test.tsx # [NEW] Breadcrumb sync tests
│   └── LayoutModeToggle.test.tsx # [NEW] Compact mode tests
└── e2e/
    ├── top-tabs.spec.ts          # [NEW] E2E tests for tab positioning
    ├── breadcrumb-navigation.spec.ts # [NEW] E2E tests for breadcrumb clicks
    ├── compact-mode.spec.ts      # [NEW] E2E tests for layout mode persistence
    └── keyboard-shortcuts.spec.ts # [UPDATE] Verify shortcuts still work with new layout
```

**Structure Decision**: This is a single-project Tauri desktop application. Using **Option 1: Single project** structure with `src/` for all source code and `tests/` for all test categories (unit, integration, E2E). Frontend and backend are already separated (React frontend in `src/`, Rust backend in `src-tauri/`). This feature only modifies frontend components and state management.

## Complexity Tracking

> **No constitutional violations - this section is empty**

All complexity is justified by constitutional principles:

- Multiple components (BreadcrumbNavigation, SkillHeader, TabBar, OverviewTab) serve Principle II (developer-first design with maximum information density)
- Layout state management via Zustand serves Principle V (performance) and VII (testability)
- localStorage persistence serves Principle I (native desktop experience)
- TDD approach with >80% coverage serves Principle VII (testability and quality)

No simpler alternatives rejected - this is the minimal implementation to satisfy FR-001 through FR-052.
