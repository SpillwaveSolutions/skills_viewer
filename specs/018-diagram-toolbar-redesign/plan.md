# Implementation Plan: Diagram Toolbar Redesign

**Branch**: `018-diagram-toolbar-redesign` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-diagram-toolbar-redesign/spec.md`

## Summary

This feature redesigns the diagram toolbar in the InteractiveDiagram component to provide professional button grouping, clear visual hierarchy, and modern design patterns. The redesign preserves all existing functionality from Feature 016 (layout switching, zoom controls, fit to view, SVG/Mermaid export, cache-busting regenerate) while enhancing the visual presentation with grouped controls, integrated zoom display, purple accent on primary action, and responsive layout.

**Technical Approach**: Refactor existing toolbar JSX in InteractiveDiagram.tsx using TailwindCSS utility classes to create visually grouped button sets without changing underlying functionality or state management.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode), React 19.1.0
**Primary Dependencies**: TailwindCSS 4.1.17, Zustand 5.0.8, @tauri-apps/api
**Storage**: LocalStorage (diagram cache via Zustand), N/A for toolbar state
**Testing**: Vitest (unit tests), Playwright (E2E tests), React Testing Library
**Target Platform**: Desktop (Tauri 2.x) - macOS, Linux, Windows
**Project Type**: Web (React frontend + Rust backend via Tauri)
**Performance Goals**:

- Toolbar render: <50ms
- Button interactions: <100ms response
- Zero layout shifts during render
  **Constraints**:
- TailwindCSS only (no custom CSS files)
- Must work on viewports ≥800px width
- Preserve existing Zustand store structure
- Cannot break keyboard shortcuts
- Must achieve >80% test coverage
  **Scale/Scope**:
- Single component refactor (InteractiveDiagram.tsx)
- ~234 lines of existing toolbar code
- 5 button groups (Layout, Zoom, View, Actions, Regenerate)
- 17 functional requirements

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Native Desktop Experience ✅

- **Status**: PASS
- **Justification**: Pure UI polish - enhances professional appearance without changing native feel
- **Impact**: Positive - improves visual polish and perceived quality

### Principle II: Developer-First Design ✅

- **Status**: PASS
- **Justification**: Grouped controls improve information density and power-user workflows
- **Impact**: Positive - faster visual recognition of button groups

### Principle III: Read-Only Safety ✅

- **Status**: PASS
- **Justification**: UI-only change, no file operations involved
- **Impact**: Neutral - no safety implications

### Principle IV: Cross-Platform Consistency ✅

- **Status**: PASS
- **Justification**: TailwindCSS ensures identical rendering across platforms
- **Impact**: Neutral - maintains existing cross-platform compatibility

### Principle V: Performance and Efficiency ✅

- **Status**: PASS
- **Justification**: Toolbar render target <50ms aligns with constitutional <100ms markdown rendering
- **Impact**: Neutral - meets performance requirements

### Principle VI: Visualization-First Understanding ✅

- **Status**: PASS
- **Justification**: Visual grouping enhances diagram control comprehension
- **Impact**: Positive - clearer visual hierarchy

### Principle VII: Testability and Quality ✅

- **Status**: PASS
- **Justification**: >80% test coverage requirement matches constitutional mandate
- **Impact**: Positive - establishes TDD pattern for UI components

**Overall Assessment**: ✅ NO VIOLATIONS - Feature aligns with all constitutional principles

## Project Structure

### Documentation (this feature)

```text
specs/018-diagram-toolbar-redesign/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (design pattern research)
├── data-model.md        # Phase 1 output (N/A - no data model changes)
├── quickstart.md        # Phase 1 output (testing quickstart)
├── contracts/           # Phase 1 output (component prop contracts)
│   └── toolbar-props.ts # TypeScript interface contracts
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── diagram/
│       ├── InteractiveDiagram.tsx        # PRIMARY FILE - toolbar redesign here
│       ├── DiagramToolbar.tsx            # NEW - extracted toolbar component
│       └── __tests__/
│           ├── InteractiveDiagram.test.tsx   # MODIFY - add toolbar tests
│           └── DiagramToolbar.test.tsx       # NEW - toolbar unit tests
│
├── stores/
│   └── diagramCacheStore.ts              # UNCHANGED - existing cache store
│
├── types/
│   └── index.ts                          # UNCHANGED - existing Skill type
│
└── utils/
    └── diagramGenerator.ts               # UNCHANGED - existing diagram generation

tests/
├── unit/
│   └── components/
│       └── DiagramToolbar.test.tsx       # NEW - comprehensive unit tests
│
└── e2e/
    └── diagram-toolbar.spec.ts           # NEW - E2E toolbar tests

# Existing Tauri backend (unchanged)
src-tauri/
└── src/
    └── commands/
        └── diagram.rs                    # UNCHANGED - Rust Mermaid renderer
```

**Structure Decision**: Single project structure (Option 1). This is a pure frontend UI refactor of an existing component. The toolbar component will be extracted from InteractiveDiagram.tsx into a separate DiagramToolbar.tsx file for better separation of concerns and testability. No backend changes required - existing Rust Mermaid rendering remains unchanged.

## Complexity Tracking

> **No violations - this section intentionally left empty**

Feature aligns with all constitutional principles and adds no complexity justifications needed.

## Phase 0: Research & Design Patterns

### Research Questions

1. **Q1**: What are the best TailwindCSS patterns for creating integrated button groups with visual separators?
   - **Context**: Need to create [− | 100% | +] zoom control with no visible separation between elements
   - **Research task**: Analyze TailwindCSS documentation for button group patterns, border utilities, and focus ring handling

2. **Q2**: How should we handle disabled button states (zoom min/max limits) with clear visual feedback?
   - **Context**: FR-012 requires disabling zoom in/out at maximum/minimum zoom levels
   - **Research task**: Find accessible disabled button patterns with proper ARIA attributes

3. **Q3**: What's the recommended approach for responsive toolbar layouts when viewport narrows (<800px)?
   - **Context**: FR-011 requires responsive layout on narrow viewports
   - **Research task**: Research TailwindCSS responsive utilities and overflow menu patterns

4. **Q4**: How should tooltips be implemented for icon buttons to maintain accessibility?
   - **Context**: FR-009 requires tooltips for icon-only buttons (if implemented)
   - **Research task**: Evaluate tooltip libraries (Radix UI Tooltip, Headless UI) vs native title attributes

5. **Q5**: What are the performance best practices for preventing layout shifts during button hover states?
   - **Context**: FR-014 requires no layout shifts during rendering
   - **Research task**: Research CSS containment, will-change property, and TailwindCSS transition utilities

### Research Outputs

**Output File**: `research.md` will document decisions for each research question with rationale and code examples.

## Phase 1: Design & Contracts

### Data Model

**File**: `data-model.md`

**Content**: N/A - This feature has no data model changes. It's a pure UI refactor using existing state management (zoom, pan, layout from InteractiveDiagram component state).

### API Contracts

**Directory**: `contracts/`

**Files**:

- `toolbar-props.ts` - TypeScript interface for DiagramToolbar component props

**Example Contract**:

```typescript
// contracts/toolbar-props.ts

export interface DiagramToolbarProps {
  // Layout controls
  layout: DiagramLayout;
  onLayoutChange: (layout: DiagramLayout) => void;

  // Zoom controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToView: () => void;

  // Export controls
  svgContent: string;
  mermaidSource: string;
  onDownloadSVG: () => void;
  onDownloadMermaid: () => void;

  // Regenerate control
  isLoading: boolean;
  onRegenerate: () => void;

  // Skill context (for download filenames)
  skillName: string;
}

export type DiagramLayout = 'TD' | 'LR';

// Accessibility props for button components
export interface ButtonGroupProps {
  'aria-label': string;
  role?: string;
}

// Zoom button props with disabled states
export interface ZoomButtonProps {
  onClick: () => void;
  disabled?: boolean;
  'aria-label': string;
  title: string;
}
```

### Component Architecture

**File**: `quickstart.md`

**Content**: Testing quickstart guide covering:

1. How to run unit tests for toolbar component
2. How to run E2E tests for toolbar interactions
3. How to test accessibility with axe DevTools
4. How to measure component render performance with React DevTools Profiler

### Agent Context Updates

**Script**: `.specify/scripts/bash/update-agent-context.sh claude`

**Updates to add**:

- Technology: TailwindCSS 4.1.17 (if not already present)
- Technology: Vitest (if not already present)
- Technology: React Testing Library (if not already present)
- Technology: Playwright (if not already present)

## Implementation Phases Summary

### Phase 0: Research (Complete after /speckit.plan) ✅

- [x] Generate research.md with answers to 5 research questions
- [x] Document TailwindCSS button group patterns
- [x] Document disabled state patterns
- [x] Document responsive layout approaches
- [x] Document tooltip implementations
- [x] Document performance best practices

### Phase 1: Design & Contracts (Complete after /speckit.plan) ✅

- [x] Generate contracts/toolbar-props.ts
- [x] Generate quickstart.md (testing guide)
- [x] Update agent context (CLAUDE.md)
- [x] Mark data-model.md as N/A

### Phase 2: Task Generation (Next command: /speckit.tasks) ⏳

- [ ] Generate tasks.md with TDD task breakdown
- [ ] Create test-first task sequence
- [ ] Define acceptance criteria for each task
- [ ] Estimate task complexity

### Phase 3: Implementation (Next command: /speckit.implement) ⏳

- [ ] Execute tasks.md sequentially
- [ ] Write tests before implementation
- [ ] Mark tasks in real-time
- [ ] Validate against acceptance criteria

## Re-evaluation: Constitution Check (Post-Design)

**Status**: ✅ NO CHANGES

After completing design phase, all constitutional principles remain satisfied:

- No new violations introduced
- Performance targets achievable with TailwindCSS
- Test coverage strategy defined (>80% unit + E2E)
- Accessibility requirements mapped to WCAG 2.1 AA
- Cross-platform compatibility maintained

**Proceed to**: `/speckit.tasks` to generate task breakdown

## Notes

### Key Decisions

1. **Component Extraction**: Extract toolbar into separate DiagramToolbar.tsx component for better testability
2. **TailwindCSS Only**: Use only utility classes, no custom CSS files
3. **Preserve Functionality**: Zero changes to zoom/pan logic, export logic, or Rust backend
4. **Test Coverage**: Target >80% with mix of unit tests (toolbar component) and E2E tests (user workflows)

### Risks & Mitigations

| Risk                            | Impact                          | Mitigation                                                     |
| ------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| Toolbar layout shifts on hover  | Medium - violates FR-014        | Use CSS containment and will-change property (research.md)     |
| Responsive layout breaks <800px | Medium - violates FR-011        | Test on narrow viewports, use TailwindCSS responsive utilities |
| Accessibility regressions       | High - violates FR-005, FR-006  | Run axe DevTools audit before/after, maintain ARIA labels      |
| Test coverage <80%              | High - constitutional violation | TDD approach, write tests first before implementation          |

### Dependencies

**Feature 016 (Improved UI Layout)**: ✅ Complete

- Depends on existing InteractiveDiagram component
- Depends on existing diagramCacheStore
- Depends on existing Rust Mermaid renderer

**No Blocking Dependencies**: Feature can proceed to task generation immediately
