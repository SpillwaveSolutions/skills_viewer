# Implementation Plan: TypeScript Error Fixes + Unit Test Backfill

**Branch**: `014-typescript-test-fixes` | **Date**: 2025-01-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-typescript-test-fixes/spec.md`

## Summary

Fix 8 TypeScript compilation errors blocking production builds and complete unit test coverage for stores (useSkillStore, navigationStore, keyboardStore), utilities (searchOperators, keyboardUtils, diagramGenerator, triggerAnalyzer), and hooks (useKeyboardShortcuts, useNavigationShortcuts, usePlatformModifier, useListNavigation). This is a technical debt repair feature that fixes regressions from parallel implementation (Features 009-013) and establishes proper QA baseline.

**Technical Approach**:

- **Phase 1**: Fix TypeScript errors with type annotations (no logic changes)
- **Phase 2**: Write Zustand store tests using act() and state verification
- **Phase 3**: Write utility tests focusing on business logic (parsing, matching, generation)
- **Phase 4**: Write hook tests using @testing-library/react renderHook()
- **Phase 5**: Verify coverage targets (>95% overall, >90% per module) and production build success

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode), React 19.1.0
**Primary Dependencies**:

- Vitest 4.0.8 (testing framework)
- @testing-library/react (component/hook testing)
- Zustand 5.0.8 (state management)
- react-zoom-pan-pinch 5.4.0 (diagram interaction)

**Storage**: N/A (no data storage changes)
**Testing**: Vitest with v8 coverage provider, @testing-library/react for hooks
**Target Platform**: Desktop (Tauri 2.x app - macOS, Linux, Windows)
**Project Type**: Desktop application (Tauri + React hybrid)
**Performance Goals**:

- Build time: <60 seconds
- Test execution: <5 seconds total
- No runtime performance impact

**Constraints**:

- No logic changes (type annotations only)
- No new dependencies
- Maintain all existing functionality
- TypeScript strict mode stays enabled
- > 80% coverage required (constitution mandate)

**Scale/Scope**:

- 8 TypeScript errors to fix
- 4 Zustand stores to test
- 4 utility modules to test
- 4 custom hooks to test
- Target: >95% overall coverage

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle VII: Testability and Quality ✅

**Requirement**: "All core logic must have unit tests (>80% coverage)"

**Status**: **COMPLIANT** - This feature specifically addresses test coverage gaps

- Current: 95.02% overall (exceeds 80%)
- Target: >95.5% overall with >90% per module
- Approach: Unit tests for all stores, utils, hooks

### Code Quality Standards ✅

**Requirement**: "TypeScript strict mode with no `any` types"

**Status**: **COMPLIANT** - Fixes type errors while maintaining strict mode

- Will resolve all 8 TypeScript compilation errors
- No relaxing of compiler settings
- Type annotations added, not `any` types

### Testing Requirements ✅

**Requirement**: "Unit tests for all utility functions and hooks"

**Status**: **PARTIALLY COMPLIANT** → **FULL COMPLIANCE**

- Current: Component tests exist (95.02%), but store/util/hook tests incomplete
- This feature: Adds missing unit tests for all stores, utils, hooks
- Post-feature: Full compliance with testing requirements

### Development Workflow ✅

**Requirement**: Follow SDD workflow (specify → plan → tasks → implement)

**Status**: **COMPLIANT** - First feature using full SDD since constitution v1.1.0

- ✅ Specification created with `/speckit.specify`
- ✅ Quality checklist validated (all items passed)
- ✅ Implementation plan being created with `/speckit.plan`
- Next: `/speckit.tasks` then `/speckit.implement`

**GATE STATUS**: ✅ **PASSED** - No violations, all constitutional requirements met

## Project Structure

### Documentation (this feature)

```text
specs/014-typescript-test-fixes/
├── spec.md                      # Feature specification (complete)
├── plan.md                      # This file (in progress)
├── checklists/
│   └── requirements.md          # Spec quality checklist (complete)
├── research.md                  # Phase 0 output (to be created)
├── quickstart.md                # Phase 1 output (to be created)
└── tasks.md                     # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

**Note**: `data-model.md` and `contracts/` are **not applicable** for this feature (no new entities, no API changes)

### Source Code (repository root)

```text
src/
├── components/              # React components (TypeScript fixes needed)
│   ├── DescriptionSection.tsx      # Fix: Type '{}' → ReactNode
│   ├── ErrorBoundary.tsx           # Fix: Remove unused React import
│   ├── OverviewPanel.tsx           # Fix: Type 'unknown' → ReactNode
│   └── diagram/
│       └── InteractiveDiagram.tsx  # Fix: react-zoom-pan-pinch types
│
├── stores/                  # Zustand stores (tests needed)
│   ├── useSkillStore.ts           # Test: actions, selectors, filters
│   ├── navigationStore.ts         # Test: history, breadcrumbs, navigation
│   └── keyboardStore.ts           # Test: shortcut registration, execution
│
├── utils/                   # Utility functions (tests needed)
│   ├── searchOperators.ts         # Test: query parsing, matching
│   ├── keyboardUtils.ts           # Test: platform detection, modifiers
│   ├── diagramGenerator.ts        # Test: Mermaid syntax generation
│   └── triggerAnalyzer.ts         # Test: trigger extraction, matching
│
└── hooks/                   # Custom React hooks (tests needed + TypeScript fix)
    ├── useKeyboardShortcuts.ts    # Test: keyboard events, callbacks
    ├── useNavigationShortcuts.ts  # Test: navigation shortcuts
    ├── usePlatformModifier.ts     # Test: platform detection
    └── useListNavigation.ts       # Fix + Test: setState types, arrow navigation

tests/
├── unit/
│   ├── stores/              # NEW: Store unit tests (to be created)
│   │   ├── useSkillStore.test.ts
│   │   ├── navigationStore.test.ts
│   │   └── keyboardStore.test.ts
│   │
│   ├── utils/               # NEW: Utility unit tests (to be created)
│   │   ├── searchOperators.test.ts
│   │   ├── keyboardUtils.test.ts
│   │   ├── diagramGenerator.test.ts
│   │   └── triggerAnalyzer.test.ts
│   │
│   └── hooks/               # NEW: Hook unit tests (to be created)
│       ├── useKeyboardShortcuts.test.ts
│       ├── useNavigationShortcuts.test.ts
│       ├── usePlatformModifier.test.ts
│       └── useListNavigation.test.ts
│
└── components/              # EXISTING: Component tests (already complete)
    └── [45 existing test files with 95.02% coverage]
```

**Structure Decision**: Desktop application using existing Tauri + React structure. All changes are additive (new test files) or corrective (type annotations). No architectural changes needed.

## Complexity Tracking

**No constitutional violations** - This section intentionally left empty as all gates passed.
