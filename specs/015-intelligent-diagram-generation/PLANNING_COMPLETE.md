# Feature 015 Planning - COMPLETE ✅

**Feature**: Intelligent Mermaid Diagram Generation  
**Branch**: `015-intelligent-diagram-generation`  
**Date**: 2025-11-14  
**Status**: Planning Complete - Ready for `/speckit.tasks`

## Planning Artifacts Created

### ✅ Phase 0: Research

- **File**: `research.md` (11KB)
- **Contents**:
  - Mermaid.parse() API research
  - Claude Code CLI non-interactive mode
  - CRC32 hashing for cache keys
  - Tauri file system API for cache management
  - Integration architecture workflow

### ✅ Phase 1: Technical Design

- **File**: `plan.md` (11KB)
- **Contents**:
  - Technical context (TypeScript 5.8.3, React 19.1.0, Tauri 2.x, Rust 1.75+)
  - Constitution compliance check (✅ all 7 principles satisfied)
  - Project structure (single-project Tauri app)
  - Performance goals (<100ms cached, <30s generation)
  - Pre-implementation checklist

### ✅ Phase 1: Data Models

- **File**: `data-model.md` (11KB)
- **Contents**:
  - Core entities: ValidationResult, DiagramCache, GenerationRequest, CacheMetadata
  - Supporting types: GenerationResult, SkillContent, DiagramError
  - Zustand store schema: DiagramStore (state + actions)
  - Service layer interfaces
  - Rust backend models
  - Data flow summary

### ✅ Phase 1: Developer Onboarding

- **File**: `quickstart.md` (11KB)
- **Contents**:
  - Quick setup guide (5 minutes)
  - Architecture overview (before/after comparison)
  - Key concepts (validation, caching, auto-generation)
  - File structure reference
  - Common development tasks
  - Testing checklist
  - Common pitfalls & solutions
  - Helpful commands

### ✅ Phase 1: API Contracts

- **Directory**: `contracts/` (4 files, 35KB total)

**1. mermaid-validation-api.md** (5.1KB)

- Interface: `IMermaidValidator`
- Behavior contract for `validate()` and `extractLineNumber()`
- Success/error cases with examples
- Performance requirements (<50ms)
- Testing requirements (>90% coverage)

**2. claude-cli-api.md** (8.7KB)

- Interface: `IClaudeCliService`
- Behavior contract for `isCliAvailable()`, `generateDiagram()`, `extractMermaid()`
- CLI invocation details (stdin/stdout handling)
- Prompt engineering best practices
- Timeout enforcement (30s)
- Testing requirements (>85% coverage)

**3. cache-operations-api.md** (12KB)

- Interface: `IDiagramCacheService`
- Behavior contract for cache CRUD operations
- LRU eviction logic (100MB limit)
- Tauri backend commands reference
- Cache file naming convention
- Testing requirements (>90% coverage)

**4. crc32-hashing-api.md** (9.8KB)

- Interface: `ICrcHasher`
- Behavior contract for CRC32 calculation
- Determinism requirements (cross-platform)
- Collision probability analysis
- Performance benchmarks (<100ms)
- Testing requirements (>95% coverage)

---

## Constitutional Compliance

### ✅ All 7 Principles Satisfied

**Principle I: Native Desktop Experience**

- Uses Tauri 2.x for native file system access
- Cache loads in <100ms (no web-like latency)

**Principle II: Developer-First Design**

- Clear error messages with actionable guidance
- "View Source" button for debugging
- Console logging for all operations

**Principle III: Read-Only Safety**

- No modification of skill files
- Cache directory separate from skills
- Claude CLI only reads, never writes

**Principle IV: Cross-Platform Consistency**

- Platform-agnostic cache paths (Tauri API)
- Deterministic CRC32 hashing (sorted files)

**Principle V: Performance and Efficiency**

- Cache hit: <100ms
- Cache miss: <30s
- Memory usage: <5MB for cache metadata

**Principle VI: Visualization-First Understanding**

- Auto-generated diagrams when errors detected
- Loading indicators during generation
- Never show blank diagram tabs

**Principle VII: Testability and Quality** 🔴 CRITICAL

- **Target**: >80% test coverage (MANDATORY)
- Unit tests for validation, CRC, cache ops
- Integration tests for Claude CLI
- E2E tests for all user scenarios

---

## Test Coverage Plan

### Unit Tests (>80% coverage required)

**Files to Create**:

- `tests/unit/mermaidValidator.test.ts` (>90% target)
- `tests/unit/crcHasher.test.ts` (>95% target)
- `tests/unit/diagramCache.test.ts` (>90% target)
- `tests/unit/skillContentExtractor.test.ts` (>80% target)

**Total Expected**: ~400 test cases, ~2000 lines of test code

### Integration Tests

**Files to Create**:

- `tests/integration/claudeCliService.test.ts` (>85% target)
  - Mock CLI responses
  - Test timeout enforcement
  - Test stdin/stdout handling

**Total Expected**: ~100 test cases, ~500 lines of test code

### E2E Tests (Playwright)

**Files to Create**:

- `tests/e2e/diagram-generation.spec.ts`
  - User Story 1: Syntax validation (4 scenarios)
  - User Story 2: Auto-generation (5 scenarios)
  - User Story 3: Caching (5 scenarios)
  - User Story 4: Error handling (5 scenarios)

**Total Expected**: 19 E2E test cases

---

## File Structure Summary

### New Files to Create (Implementation Phase)

**Frontend (TypeScript/React)**:

```
src/
├── components/diagram/
│   ├── DiagramErrorBoundary.tsx        # NEW
│   └── DiagramLoadingState.tsx         # NEW
├── services/
│   ├── mermaidValidator.ts             # NEW
│   ├── diagramCache.ts                 # NEW
│   └── claudeCliService.ts             # NEW
├── stores/
│   └── diagramStore.ts                 # NEW
├── types/
│   └── diagram.ts                      # NEW
└── utils/
    ├── crcHasher.ts                    # NEW
    └── skillContentExtractor.ts        # NEW
```

**Backend (Rust/Tauri)**:

```
src-tauri/src/
├── commands/
│   └── cache_manager.rs                # NEW
└── utils/
    └── cache_paths.rs                  # NEW
```

**Tests**:

```
tests/
├── unit/
│   ├── mermaidValidator.test.ts        # NEW
│   ├── crcHasher.test.ts               # NEW
│   ├── diagramCache.test.ts            # NEW
│   └── skillContentExtractor.test.ts   # NEW
├── integration/
│   └── claudeCliService.test.ts        # NEW
└── e2e/
    └── diagram-generation.spec.ts      # NEW
```

**Modified Files**:

```
src/components/diagram/
├── InteractiveDiagram.tsx              # MODIFY
└── DiagramToolbar.tsx                  # MODIFY
```

---

## Dependencies to Add

```bash
npm install crc-32 --save
npm install @types/crc-32 --save-dev
```

**No Rust dependencies needed** - uses `std::fs` (built-in)

---

## Next Steps

### 1. Generate Task Breakdown

```bash
/speckit.tasks
```

This will create `tasks.md` with ordered implementation tasks.

### 2. Validate Consistency

```bash
/speckit.analyze
```

Verify alignment between spec.md, plan.md, and tasks.md.

### 3. Implement Using TDD

```bash
/speckit.implement
```

Follow tasks.md strictly:

- Write tests BEFORE implementation
- Mark [x] only when fully done
- Mark [~] if simplified (with notes)
- Do NOT skip ahead
- Do NOT freelance

### 4. Verify Test Coverage

```bash
npm run test:coverage
```

**MANDATORY**: >80% coverage before merge (Constitutional requirement)

### 5. Cross-Platform Testing

**Manual testing required**:

- macOS: Verify cache paths, CLI integration
- Linux: Verify cache paths, file permissions
- Windows: Verify cache paths, path separators

---

## Performance Benchmarks (to verify after implementation)

| Operation                 | Target | Max   | Test Method      |
| ------------------------- | ------ | ----- | ---------------- |
| Cached diagram load       | <100ms | 200ms | Playwright       |
| CRC32 calculation         | <10ms  | 50ms  | Vitest           |
| Mermaid validation        | <50ms  | 100ms | Vitest           |
| Claude CLI generation     | <20s   | 30s   | Integration test |
| Cache eviction (10 files) | <300ms | 500ms | Vitest           |

---

## Risk Mitigation Status

✅ **Risk**: Claude CLI not installed  
**Mitigation**: Graceful degradation with installation instructions (FR-016)

✅ **Risk**: CRC32 hash collision  
**Mitigation**: Statistically negligible (<1 in 4B), acceptable for cache

✅ **Risk**: Cache directory not writable  
**Mitigation**: Fall back to in-memory caching, log warning

✅ **Risk**: Timeout during generation  
**Mitigation**: 30s timeout enforced, retry button available (FR-012, FR-014)

---

## Agent Context Updated

✅ **File**: `/Users/richardhightower/src/skill-debugger/CLAUDE.md`

Added language context:

- TypeScript 5.8.3 (strict mode enabled)
- Project type: Single-project Tauri desktop application

---

## Constitutional Amendment Compliance

This feature implements **NO** banned practices from v0.2.0+ requirements:

- ✅ Following SDD workflow strictly (this planning phase)
- ✅ Will implement with TDD (tests first)
- ✅ Will mark tasks in real-time (not retroactively)
- ✅ Will use `/speckit` commands for all phases
- ✅ Will NOT merge without >80% test coverage

---

## Lessons Applied from v0.1.0 Mistakes

**What we did wrong in v0.1.0**:

- ❌ Created specs but implemented based on intuition
- ❌ Marked tasks complete retroactively
- ❌ Skipped all testing tasks (0% coverage)

**What we're doing right in v0.2.0+**:

- ✅ Created comprehensive planning artifacts BEFORE implementation
- ✅ Will follow tasks.md strictly (generated by `/speckit.tasks`)
- ✅ Will write tests BEFORE code (TDD approach)
- ✅ Will mark tasks in real-time during implementation
- ✅ Will validate with `/speckit.analyze` before implementing

---

**Status**: ✅ Ready for `/speckit.tasks` command

**Estimated LOC**:

- Implementation: ~1500 lines (TypeScript + Rust)
- Tests: ~2500 lines (unit + integration + E2E)
- Total: ~4000 lines

**Estimated Duration**: 2-3 days (with proper TDD workflow)

**Blocked By**: Nothing - ready to proceed

**Next Command**: `/speckit.tasks`
