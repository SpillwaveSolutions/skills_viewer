# Implementation Plan: Intelligent Mermaid Diagram Generation

**Branch**: `015-intelligent-diagram-generation` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-intelligent-diagram-generation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements intelligent Mermaid diagram generation with syntax validation, Claude-assisted auto-generation via `claude -p` CLI, and CRC32-based caching. The goal is to eliminate blank diagram tabs (current ~50% error rate) and reduce diagram errors to <5% through automatic validation, generation, and caching. The system will validate Mermaid syntax using `mermaid.parse()` API before rendering, automatically call Claude Code CLI to regenerate diagrams when errors are detected, and cache generated diagrams using CRC32 hashes of skill file contents to avoid redundant regeneration.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode enabled)  
**Primary Dependencies**:

- Frontend: React 19.1.0, Mermaid 11.12.1, Zustand 5.0.8
- Backend: Rust 1.75+ (Tauri 2.x)
- Testing: Vitest 4.0.8, Playwright 1.56.1
- New: crc-32 npm package (for cache keys)

**Storage**:

- Cache Directory: `~/.cache/skill-debugger/diagrams/` (managed via Tauri file system API)
- Cache Format: `{skill_name}-{crc32_hash}.mmd` (Mermaid source files)
- Cache Limit: 100MB maximum, LRU eviction policy

**Testing**:

- Frontend: Vitest (unit tests for validation, cache logic, CRC calculation)
- Backend: Rust `cargo test` (Tauri command tests for file system operations)
- E2E: Playwright (diagram rendering, error handling, Claude CLI integration)
- Target Coverage: >80% (Constitutional Principle VII requirement)

**Target Platform**: Desktop (macOS, Linux, Windows) via Tauri 2.x

**Project Type**: Single-project Tauri desktop application (React frontend + Rust backend)

**Performance Goals**:

- Cached diagram load: <100ms (target: sub-second UX)
- First-time generation: <30s (Claude CLI timeout limit)
- Cache hit rate: >80% for repeated skill visits
- Validation overhead: <50ms per diagram

**Constraints**:

- Read-only safety: No modification of skill files (Constitutional Principle III)
- Offline-first: Graceful degradation when Claude CLI unavailable (Constitutional Principle III)
- Desktop-native performance: 60fps UI interactions (Constitutional Principle V)
- Cross-platform: Identical behavior on macOS/Linux/Windows (Constitutional Principle IV)
- Claude CLI dependency: Optional (feature must degrade gracefully if not installed)
- Cache size limit: 100MB maximum, auto-cleanup oldest entries

**Scale/Scope**:

- Typical usage: 20-50 skills per installation
- Large installations: Up to 200 skills (stress test target)
- Cache entries: ~10-20 diagrams per installation (100MB / ~5MB avg diagram)
- Concurrent operations: Single-threaded diagram generation (Claude CLI calls serialized)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Compliance with Constitutional Principles

**✅ Principle I: Native Desktop Experience**

- Uses Tauri 2.x for native file system access
- Cache directory managed via Rust backend (native performance)
- No web-like latency or artificial delays
- **Gate**: Cached diagrams must load in <100ms (measured via Performance API)

**✅ Principle II: Developer-First Design**

- Clear error messages with line numbers and actionable guidance (FR-002)
- "View Source" button exposes raw Mermaid for debugging (FR-015)
- Console logging for all validation/generation attempts (FR-017)
- "Retry" button for recovery without page reload (FR-014)
- **Gate**: All error messages must include actionable next steps

**✅ Principle III: Read-Only Safety**

- No modification of skill files (skill.md, references, scripts remain untouched)
- Cache directory is separate from skill directories
- Claude CLI only reads skill content, never writes
- **Gate**: All file operations must use read-only Tauri commands

**✅ Principle IV: Cross-Platform Consistency**

- Cache directory uses platform-agnostic Tauri API (`app_cache_dir()`)
- CRC32 calculation identical across platforms (deterministic hashing)
- Claude CLI invocation respects platform shell differences (bash vs cmd)
- **Gate**: Cache keys must match across platforms for identical skill content

**✅ Principle V: Performance and Efficiency**

- Cache hit path: <100ms (no Claude CLI call, direct file read)
- Cache miss path: <30s (Claude CLI timeout enforced)
- Memory usage: <5MB for cache metadata (in-memory index)
- **Gate**: Performance benchmarks required before merge (Vitest + Playwright)

**✅ Principle VI: Visualization-First Understanding**

- Diagrams auto-generated when manual diagrams have errors
- Loading indicators during generation (FR-013)
- Error states with fallback to previous valid diagram (FR-018)
- **Gate**: Never show blank diagram tabs (100% coverage of error/loading states)

**🔴 Principle VII: Testability and Quality**

- **CRITICAL**: This feature MUST achieve >80% test coverage (Constitutional requirement)
- All validation logic must have unit tests (mermaid.parse() wrapper, ValidationResult)
- All cache operations must have unit tests (CRC calculation, file I/O, LRU eviction)
- All Claude CLI integration must have integration tests (mocked CLI responses)
- E2E tests for all user scenarios (US1-US4 from spec.md)
- **Gate**: CI must enforce >80% coverage threshold before merge

**No Violations**: This feature adds functionality within existing architecture. No complexity violations.

### Pre-Implementation Checklist

- [ ] Phase 0: Research mermaid.parse() API, Claude CLI non-interactive mode, CRC32 libraries
- [ ] Phase 1: Design data models (DiagramCache, ValidationResult, GenerationRequest, CacheMetadata)
- [ ] Phase 1: Design Tauri commands for cache directory management
- [ ] Phase 1: Design cache invalidation strategy (CRC32 hashing, LRU eviction)
- [ ] Phase 2: Write unit tests for validation logic (TDD approach)
- [ ] Phase 2: Write unit tests for CRC32 calculation and cache operations (TDD approach)
- [ ] Phase 2: Write integration tests for Claude CLI calls (mocked responses)
- [ ] Phase 2: Write E2E tests for all user scenarios (Playwright)
- [ ] Phase 3: Implement validation wrapper around mermaid.parse()
- [ ] Phase 3: Implement CRC32 hashing for skill content
- [ ] Phase 3: Implement cache read/write/eviction logic
- [ ] Phase 3: Implement Claude CLI integration
- [ ] Phase 4: Verify >80% test coverage via CI
- [ ] Phase 4: Performance benchmarks (cached vs. generated diagrams)
- [ ] Phase 5: Cross-platform testing (macOS, Linux, Windows)

## Project Structure

### Documentation (this feature)

```text
specs/015-intelligent-diagram-generation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── mermaid-validation-api.md    # Mermaid.parse() contract
│   ├── claude-cli-api.md            # Claude CLI -p flag contract
│   ├── cache-operations-api.md      # Cache read/write/evict operations
│   └── crc32-hashing-api.md         # CRC32 calculation contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# TypeScript/React Frontend
src/
├── components/
│   └── diagram/
│       ├── InteractiveDiagram.tsx        # MODIFY: Add validation, caching, generation
│       ├── DiagramToolbar.tsx            # MODIFY: Wire "Regenerate" and "Clear Cache" buttons
│       ├── DiagramErrorBoundary.tsx      # NEW: Error handling component
│       └── DiagramLoadingState.tsx       # NEW: Loading indicator component
├── services/
│   ├── mermaidValidator.ts               # NEW: Wrapper around mermaid.parse()
│   ├── diagramCache.ts                   # NEW: Cache operations (read/write/evict)
│   ├── claudeCliService.ts               # NEW: Claude CLI invocation
│   └── crcHasher.ts                      # NEW: CRC32 calculation for skill content
├── stores/
│   └── diagramStore.ts                   # NEW: Zustand store for diagram state/cache
├── types/
│   └── diagram.ts                        # NEW: DiagramCache, ValidationResult, etc.
└── utils/
    └── skillContentExtractor.ts          # NEW: Concatenate skill files for CRC hashing

# Rust/Tauri Backend
src-tauri/
├── src/
│   ├── commands/
│   │   ├── cache_manager.rs              # NEW: Cache directory operations (create/delete/list)
│   │   └── mod.rs                        # MODIFY: Export cache_manager commands
│   └── utils/
│       └── cache_paths.rs                # NEW: Platform-agnostic cache directory resolution
└── Cargo.toml                            # MODIFY: Add dependencies (if needed)

# Tests
tests/
├── unit/
│   ├── mermaidValidator.test.ts          # NEW: Validation logic tests
│   ├── crcHasher.test.ts                 # NEW: CRC32 calculation tests
│   ├── diagramCache.test.ts              # NEW: Cache operations tests
│   └── skillContentExtractor.test.ts     # NEW: File concatenation tests
├── integration/
│   └── claudeCliService.test.ts          # NEW: Mocked Claude CLI integration
└── e2e/
    └── diagram-generation.spec.ts        # NEW: E2E tests for US1-US4

src-tauri/src/commands/
└── cache_manager.rs                      # NEW: Rust tests for Tauri cache commands
```

**Structure Decision**: This is a single-project Tauri desktop application (Option 1 from template). Frontend logic lives in `src/` (TypeScript/React), backend logic lives in `src-tauri/` (Rust). Testing follows Tauri conventions: frontend tests in `tests/`, backend tests in `src-tauri/src/` (Rust standard). Cache directory is managed by Rust backend via Tauri commands, exposed to frontend via IPC. The architecture maintains separation of concerns: validation/caching in frontend services, file system operations in Rust commands.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This feature operates within existing architecture and does not introduce forbidden complexity.
