# Implementation Plan: UI/UX Polish and Fixes

**Branch**: `004-ui-ux-polish` | **Date**: 2025-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ui-ux-polish/spec.md`

## Summary

This feature addresses critical UI/UX issues affecting the entire Skill Debugger application: text crowded against borders (needs 8px minimum margins), illogical Overview tab information order, text overflow in labels/buttons, and a Python syntax highlighting bug that only works on first visit to Scripts tab. The technical approach involves updating TailwindCSS utility classes for proper spacing, restructuring the Overview tab component to display information in the correct order (name → description → version → triggers → stats), adding CSS text truncation with tooltips, and fixing the highlight.js re-initialization bug in the Scripts tab.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 19.1.0
**Primary Dependencies**: TailwindCSS 4.1.17, react-markdown 10.1.0, highlight.js (syntax highlighting), Zustand 5.0.8 (state management)
**Storage**: N/A (read-only file system access)
**Testing**: Vitest for unit tests, Playwright for E2E tests
**Target Platform**: Desktop (macOS, Linux, Windows via Tauri 2.x)
**Project Type**: Desktop application with web frontend (React + Tauri)
**Performance Goals**: 60fps UI rendering, <100ms markdown rendering per document
**Constraints**: Must maintain cross-platform consistency, no performance regression, read-only file access
**Scale/Scope**: ~15 React components affected, 4 main user workflows (spacing, Overview tab, text overflow, syntax highlighting)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Native Desktop Experience
✅ **PASS** - This feature improves native feel by fixing visual polish issues (proper margins, consistent spacing)
- Fixes cramped interface that feels web-like
- Improves 60fps rendering through proper CSS (no layout thrashing from overflow)
- Maintains <2s startup (no new dependencies, only CSS/component changes)

### Principle II: Developer-First Design
✅ **PASS** - Enhances developer UX by improving readability and information hierarchy
- Proper margins reduce eye strain during long debugging sessions
- Logical Overview order (name → description → version → triggers) follows developer mental model
- Consistent syntax highlighting maintains code readability

### Principle III: Read-Only Safety
✅ **PASS** - No file write operations introduced
- Only UI rendering changes
- All changes are visual, no data mutations

### Principle IV: Cross-Platform Consistency
✅ **PASS** - TailwindCSS and React changes work identically across all platforms
- TailwindCSS utility classes are platform-agnostic
- highlight.js works consistently on macOS/Linux/Windows
- Text truncation CSS properties supported universally

### Principle V: Performance and Efficiency
✅ **PASS** - No performance degradation, potential improvements
- TailwindCSS class changes have zero runtime overhead (compile-time)
- Fixing syntax highlighting bug prevents unnecessary re-renders
- Text truncation prevents expensive layout recalculations from overflow
- All changes maintain 60fps target

### Principle VI: Visualization-First Understanding
✅ **PASS** - No changes to visualization features
- This feature doesn't affect Mermaid diagrams or graph rendering
- Maintains existing visualization capabilities

### Principle VII: Testability and Quality
⚠️ **REQUIRES ATTENTION** - Must add tests for all changes (>80% coverage)
- **Testing Requirements**:
  - Unit tests for Overview tab reordering logic
  - Visual regression tests for margin spacing (Playwright screenshots)
  - Integration tests for syntax highlighting persistence
  - E2E tests for text truncation with tooltips
- **Action**: Follow TDD workflow - write tests BEFORE implementation
- **Validation**: CI must enforce >80% coverage for changed files

### Constitutional Compliance Summary
- **Status**: ✅ APPROVED with test requirements
- **Conditions**: Must achieve >80% test coverage per Principle VII
- **TDD Enforcement**: Write tests first, then implement

## Project Structure

### Documentation (this feature)

```text
specs/004-ui-ux-polish/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0: Technology decisions and best practices
├── data-model.md        # Phase 1: Component structure and state model
├── quickstart.md        # Phase 1: Developer setup and testing guide
├── contracts/           # Phase 1: Component prop interfaces
│   ├── OverviewTab.interface.ts
│   ├── SkillList.interface.ts
│   └── ScriptsTab.interface.ts
├── checklists/          # Quality validation checklists
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks output)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── OverviewTab.tsx          # [MODIFY] Restructure information order
│   ├── SkillList.tsx            # [MODIFY] Add margin/padding, text truncation
│   ├── ScriptsTab.tsx           # [MODIFY] Fix syntax highlighting bug
│   ├── ReferencesTab.tsx        # [MODIFY] Add proper margins
│   ├── SearchBar.tsx            # [MODIFY] Text truncation
│   └── SkillViewer.tsx          # [MODIFY] Container margin adjustments
├── hooks/
│   └── useSyntaxHighlight.ts    # [NEW] Extract syntax highlighting logic
├── utils/
│   └── textTruncation.ts        # [NEW] Reusable text truncation utilities
└── styles/
    └── spacing.css              # [NEW] Custom spacing utilities (if TailwindCSS insufficient)

tests/
├── unit/
│   ├── OverviewTab.test.tsx     # [NEW] Test information ordering
│   ├── textTruncation.test.ts   # [NEW] Test truncation utilities
│   └── useSyntaxHighlight.test.ts # [NEW] Test highlight hook
├── integration/
│   ├── spacing.test.tsx         # [NEW] Test margin consistency
│   └── syntax-highlighting.test.tsx # [NEW] Test highlighting persistence
└── e2e/
    ├── ui-polish.spec.ts        # [NEW] Visual regression tests
    └── text-overflow.spec.ts    # [NEW] Test truncation + tooltips
```

**Structure Decision**: This is a Single Project (Option 1) with React frontend and Tauri backend. All UI changes are in `src/components/` with corresponding tests in `tests/`. No backend changes required since this is purely a frontend UI polish feature.

## Complexity Tracking

> **No constitutional violations requiring justification**

All constitutional gates pass. The only requirement is test coverage (Principle VII), which is addressed through TDD workflow in the implementation tasks.

---

## Phase 0: Research & Technology Decisions

### Research Questions

1. **TailwindCSS Margin Strategy**: What is the best approach for applying consistent 8px margins?
   - Research TailwindCSS spacing scale and identify appropriate utility classes
   - Determine if custom spacing values are needed
   - Document approach for margin vs padding vs gap

2. **Syntax Highlighting Lifecycle**: Why does highlight.js fail after first render?
   - Research highlight.js React integration patterns
   - Identify re-initialization requirements
   - Document proper useEffect dependencies

3. **Text Truncation Best Practices**: What is the most accessible way to handle text overflow?
   - Research CSS truncation techniques (ellipsis, fade, clip)
   - Document tooltip library options (native title vs React components)
   - Ensure WCAG 2.1 compliance for truncated text

4. **React Component Restructuring**: How to reorder Overview tab without breaking existing functionality?
   - Review current OverviewTab component structure
   - Document metadata field dependencies
   - Plan graceful handling of missing fields

### Technology Decisions (to be researched)

- **TailwindCSS Spacing**: Confirm which utility classes to use (p-6, px-6, space-y-4, gap-4)
- **Syntax Highlighting**: Determine if highlight.js needs replacement or just proper React integration
- **Tooltip Library**: Choose between native browser tooltips vs library (Radix UI Tooltip, Headless UI)
- **Testing Strategy**: Visual regression tool selection (Playwright built-in screenshots vs Percy vs Chromatic)

---

## Phase 1: Design & Contracts

### Components to Modify

1. **OverviewTab.tsx**
   - Restructure JSX to render fields in order: name → description → version → triggers → stats
   - Remove duplicate description rendering
   - Add graceful handling for missing metadata

2. **SkillList.tsx**
   - Add proper padding classes (TailwindCSS)
   - Implement text truncation for skill names
   - Add tooltips for truncated text

3. **ScriptsTab.tsx**
   - Extract syntax highlighting to custom hook
   - Fix re-initialization bug with proper useEffect dependencies
   - Add loading state during highlighting

4. **All Tab Components**
   - Apply consistent margin/padding utilities
   - Ensure minimum 8px spacing from borders

### New Utilities

1. **useSyntaxHighlight.ts** (custom hook)
   - Encapsulates highlight.js initialization logic
   - Handles cleanup on unmount
   - Returns highlighting state (loading, ready, error)

2. **textTruncation.ts** (utility functions)
   - `truncateText(text: string, maxLength: number): string`
   - `shouldTruncate(element: HTMLElement): boolean`
   - Type definitions for truncation options

### State Changes

- No global state changes required (Zustand store unchanged)
- Local component state only:
  - ScriptsTab: Add `highlightingReady: boolean` state
  - SkillList: Add `hoveredItem: string | null` for tooltips

---

## Phase 2: Tasks Breakdown (Generated by `/speckit.tasks`)

*This section will be populated by the `/speckit.tasks` command. Do not manually edit.*

The tasks.md file will include:
- TDD workflow: Write tests first for each component change
- Implementation tasks for margin updates (TailwindCSS classes)
- Overview tab restructuring tasks
- Text truncation implementation
- Syntax highlighting bug fix
- E2E test scenarios
- Manual testing checklist

---

## Success Validation

### Test Coverage Requirements (Principle VII)
- Unit tests: >80% coverage for modified components
- Integration tests: All 4 user stories covered
- E2E tests: Visual regression baseline established
- Manual testing: Cross-platform validation (macOS, Linux, Windows)

### Quality Gates
- ✅ All tests pass (unit, integration, E2E)
- ✅ No performance regression (60fps maintained)
- ✅ Visual regression tests pass (margins, spacing, truncation)
- ✅ Syntax highlighting works on 20+ consecutive tab visits
- ✅ No accessibility regressions (WCAG 2.1 AA)

### Acceptance Criteria (from spec.md)
- SC-001: All text has minimum 8px margins (verified by visual tests)
- SC-002: Overview order correct with zero duplicates (verified by unit tests)
- SC-003: Text truncation works for 50, 100, 200 character names (verified by E2E)
- SC-004: Syntax highlighting 100% reliable (verified by integration test with 20 iterations)
- SC-005: User satisfaction improvement (manual testing feedback)
- SC-006: Zero layout breaks with edge cases (verified by E2E edge case suite)

---

**Status**: Phase 0 (Research) in progress
**Next Command**: Complete research.md, then proceed to data-model.md generation
