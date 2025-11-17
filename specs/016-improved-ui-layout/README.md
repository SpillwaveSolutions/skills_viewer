# Feature 016: Improved UI Layout with Top Tabs

## Overview

This feature addresses critical UX issues in the current Skill Debugger layout by repositioning tabs from bottom to top, consolidating overview content, adding breadcrumb navigation, and providing two layout modes (standard/compact).

## Problem Statement

The current v0.1.0 design has several UX problems:

1. **Wasted Vertical Space**: Bottom tabs consume 200+ pixels that could be used for content (especially diagrams)
2. **Duplicate Content**: Description and metadata appear in both header and Overview tab, causing confusion
3. **Limited Diagram Space**: Architecture diagrams are cramped and require excessive scrolling
4. **Poor Navigation Context**: Users lack spatial awareness of their current location

## Solution

### 1. Top Tabs (Priority: P0)

- Move tabs from bottom to top (immediately below header)
- Gain 200+ pixels of vertical space for content
- Follow industry standards (VS Code, Chrome DevTools)
- Maintain keyboard shortcut compatibility (Cmd/Ctrl+1-6)

### 2. Consolidated Overview (Priority: P0)

- Header shows only: Skill title + location badge
- Overview tab shows all metadata: description, version, triggers, stats, additional metadata
- Zero duplicate content between header and tabs

### 3. Breadcrumb Navigation (Priority: P1)

- Top bar shows: "← → Home › [Skill Name] › [Tab Name]"
- Clickable breadcrumb segments for quick navigation
- Updates immediately when tab changes (<50ms)
- Integrates with keyboard shortcuts and browser history

### 4. Compact Layout Mode (Priority: P2)

- Optional compact mode for power users
- Header shows inline stats: "refs: 3 | scripts: 4 | triggers: 9 | lines: 417"
- Provides 80-120px additional vertical space
- Preference persisted in localStorage

### 5. Visual Feedback (Priority: P1)

- Hover state: Light gray background (#f3f4f6)
- Active state: Purple bottom border (#7c3aed, 2px)
- Tab icons: 📊 Overview, 📄 Content, ⚡ Triggers, 🔷 Diagram, 📚 References, 📜 Scripts
- Font: 14px, weight 500 (medium)

## User Stories

- **US1**: Maximum vertical space for diagrams (top tabs)
- **US2**: Consolidated overview content (no duplication)
- **US3**: Breadcrumb navigation (spatial awareness)
- **US4**: Compact layout mode (power users)
- **US5**: Visual feedback for tab interaction (usability)

## Key Metrics

- **200+ pixels**: Additional vertical space for content (measured at 1080p)
- **80-120 pixels**: Additional space in compact mode
- **<50ms**: Breadcrumb update latency
- **<200ms**: Tab transition time
- **>80%**: Test coverage (constitutional requirement)

## Technical Approach

### Components to Modify

- `SkillViewer.tsx` - Reposition tabs to top, add breadcrumb
- `OverviewPanel.tsx` - Convert to Overview tab content
- `App.tsx` - Add top bar with breadcrumb
- New: `BreadcrumbNavigation.tsx` - Breadcrumb component
- New: `LayoutModeToggle.tsx` - Compact mode toggle

### State Management

- Add layout mode state to Zustand store (or new `layoutStore.ts`)
- Add breadcrumb state to `navigationStore.ts`
- Persist layout preference in localStorage

### Testing Strategy (TDD)

1. Write failing tests for each user story
2. Implement features to pass tests
3. Write E2E tests for integration scenarios
4. Achieve >80% coverage before merging

## Visual Reference

See HTML mockups provided by user for pixel-perfect specifications.

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Top Bar (Dark #2d2d2d): ← → Home › Skill › Tab         │
├─────────────────────────────────────────────────────────┤
│ Header (White): [Skill Title] [📍 Badge]               │
│ Standard: Description below                            │
│ Compact: refs: 3 | scripts: 4 | triggers: 9 | lines: 417 │
├─────────────────────────────────────────────────────────┤
│ Tabs: 📊 Overview | 📄 Content | ⚡ Triggers | 🔷 Diagram | 📚 Refs | 📜 Scripts │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Content Area                        │
│              (Full height, scrollable)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Dependencies

- Existing React 19 + TypeScript stack
- TailwindCSS 4.1.17 (utility classes only)
- Zustand 5.0.8 (state management)
- Existing keyboard shortcut system
- Existing navigation store

## Timeline

- **Specification**: 2025-11-14 (Complete)
- **Planning**: TBD (run `/speckit.plan`)
- **Tasks**: TBD (run `/speckit.tasks`)
- **Implementation**: TBD (run `/speckit.implement`)

## Success Criteria

- ✅ Diagrams get 200+ pixels additional vertical space
- ✅ Zero duplicate content between header and Overview tab
- ✅ Breadcrumb updates <50ms on tab change
- ✅ Compact mode provides 80-120px additional space
- ✅ >80% test coverage (TDD approach)
- ✅ Zero accessibility regressions

## Files

- `spec.md` - Full feature specification
- `plan.md` - Implementation plan (TBD)
- `tasks.md` - Task breakdown (TBD)
- `DEVIATIONS.md` - Track implementation deviations (TBD)
- `IMPLEMENTATION_NOTES.md` - Post-implementation insights (TBD)

## Next Steps

1. Review specification with stakeholders
2. Run `/speckit.clarify` if any ambiguities exist
3. Run `/speckit.plan` to create implementation plan
4. Run `/speckit.tasks` to generate task breakdown
5. Run `/speckit.analyze` to validate consistency
6. Run `/speckit.implement` to execute tasks

---

**Status**: Ready for review and planning
**SDD Workflow**: Specification complete, awaiting clarification or planning phase
