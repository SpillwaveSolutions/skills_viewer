# Developer Quickstart - Intelligent Mermaid Diagram Generation

**Feature**: 015-intelligent-diagram-generation  
**Date**: 2025-11-14  
**For**: New developers implementing or testing this feature

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ and npm installed
- ✅ Rust 1.75+ and Cargo installed (for Tauri)
- ✅ Claude Code CLI installed (optional, for testing generation)
  - Install: https://claude.com/claude-code
  - Verify: `claude --version`
- ✅ Skill Debugger repository cloned and dependencies installed:
  ```bash
  cd ~/src/skill-debugger
  npm install
  ```

---

## Quick Setup (5 minutes)

### 1. Install New Dependencies

```bash
# Add CRC32 hashing library
npm install crc-32 --save
npm install @types/crc-32 --save-dev
```

### 2. Verify Project Structure

```bash
# Ensure you're on the feature branch
git checkout 015-intelligent-diagram-generation

# Verify branch status
git status

# Expected output: On branch 015-intelligent-diagram-generation
```

### 3. Run Development Server

```bash
# Start Vite dev server + Tauri in dev mode
npm run dev

# OR use Task (recommended)
task dev
```

The app should launch with the existing diagram viewer. You'll be implementing validation, caching, and generation on top of this.

---

## Architecture Overview (3-Minute Read)

### Current State (Before Feature 015)

```
User clicks Diagram tab
  ↓
InteractiveDiagram.tsx
  ↓
generateSkillDiagram() (utils/diagramGenerator.ts)
  ↓
mermaid.render() → SVG
```

**Problems**:

- No validation before rendering (syntax errors → blank screen)
- No caching (regenerates diagram every time)
- No auto-generation when diagrams are broken

---

### Target State (After Feature 015)

```
User clicks Diagram tab
  ↓
InteractiveDiagram.tsx
  ↓
DiagramStore.loadDiagram()
  ↓
  ├─ Check cache (CRC32-based)
  │   ↓
  │   ├─ Cache hit → Load cached diagram (<100ms)
  │   │
  │   └─ Cache miss
  │       ↓
  │       Validate existing diagram (mermaid.parse())
  │       ↓
  │       ├─ Valid → Render + cache
  │       │
  │       └─ Invalid
  │           ↓
  │           Call Claude CLI (generateDiagram())
  │           ↓
  │           Validate generated diagram
  │           ↓
  │           ├─ Valid → Cache + render
  │           │
  │           └─ Invalid → Show error + retry
```

---

## Key Concepts

### 1. Validation Before Rendering

**Problem**: ~50% of diagrams fail to render due to syntax errors.

**Solution**: Use `mermaid.parse()` to validate syntax **before** attempting to render.

**Code Location**: `src/services/mermaidValidator.ts` (NEW)

**Example**:

```typescript
import mermaid from 'mermaid';

async function validate(source: string): Promise<ValidationResult> {
  try {
    await mermaid.parse(source, { suppressErrors: true });
    return { isValid: true, error: null, lineNumber: null, timestamp: Date.now() };
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      lineNumber: extractLineNumber(error.message),
      timestamp: Date.now(),
    };
  }
}
```

---

### 2. CRC32-Based Caching

**Problem**: Regenerating diagrams on every page load is slow.

**Solution**: Cache diagrams with a hash of skill file contents. If files unchanged, load from cache.

**Code Location**: `src/utils/crcHasher.ts` (NEW), `src/services/diagramCache.ts` (NEW)

**How it works**:

1. Concatenate all skill files (skill.md + references + scripts)
2. Calculate CRC32 hash → `a3f4b2c1` (8 hex characters)
3. Cache filename: `{skill_name}-{crc_hash}.mmd`
4. On next load: Calculate CRC32 again → If matches, load from cache

**Example**:

```typescript
import CRC32 from 'crc-32';

const skillContent = `${skillMd}\n---\n${ref1}\n---\n${script1}`;
const hash = CRC32.str(skillContent);
const cacheKey = `sdd-${(hash >>> 0).toString(16).padStart(8, '0')}.mmd`;
// Result: "sdd-a3f4b2c1.mmd"
```

---

### 3. Claude CLI Auto-Generation

**Problem**: When diagrams have syntax errors, users see blank screens.

**Solution**: Automatically call Claude Code CLI to regenerate diagram with valid Mermaid syntax.

**Code Location**: `src/services/claudeCliService.ts` (NEW)

**How it works**:

1. Detect validation failure
2. Call `claude -p "Generate Mermaid diagram..."` with skill content as input
3. Extract Mermaid syntax from response
4. Validate generated diagram
5. Cache if valid, show error if invalid

**Example**:

```typescript
import { spawn } from 'child_process';

async function generateDiagram(request: GenerationRequest): Promise<GenerationResult> {
  const process = spawn('claude', ['-p', request.prompt], { timeout: 30000 });

  // Write skill content to stdin
  process.stdin.write(request.skillContent);
  process.stdin.end();

  // Read stdout
  const stdout = await readStream(process.stdout);

  // Extract Mermaid syntax
  const mermaid = extractMermaid(stdout);

  return { status: 'success', diagramSource: mermaid, ... };
}
```

---

## File Structure Reference

### New Files You'll Create

```
src/
├── services/
│   ├── mermaidValidator.ts        # Validate Mermaid syntax
│   ├── diagramCache.ts            # Cache read/write/evict operations
│   └── claudeCliService.ts        # Claude CLI integration
├── stores/
│   └── diagramStore.ts            # Zustand store for diagram state
├── types/
│   └── diagram.ts                 # TypeScript types (ValidationResult, DiagramCache, etc.)
├── utils/
│   └── crcHasher.ts               # CRC32 calculation
│   └── skillContentExtractor.ts  # Extract skill files for CRC hashing
└── components/
    └── diagram/
        ├── DiagramErrorBoundary.tsx   # Error handling UI
        └── DiagramLoadingState.tsx    # Loading indicator UI

src-tauri/src/
├── commands/
│   └── cache_manager.rs           # Rust commands for cache directory ops
└── utils/
    └── cache_paths.rs             # Platform-agnostic cache path resolution

tests/
├── unit/
│   ├── mermaidValidator.test.ts
│   ├── crcHasher.test.ts
│   └── diagramCache.test.ts
├── integration/
│   └── claudeCliService.test.ts
└── e2e/
    └── diagram-generation.spec.ts
```

### Files You'll Modify

```
src/components/diagram/
├── InteractiveDiagram.tsx         # MODIFY: Add validation, caching, generation
└── DiagramToolbar.tsx             # MODIFY: Wire "Regenerate" and "Clear Cache" buttons
```

---

## Common Development Tasks

### Running Tests

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- mermaidValidator.test.ts
```

### Debugging

**Frontend Debugging**:

- Open Chrome DevTools in Tauri window
- Check console for validation/generation logs
- Inspect Zustand store: `window.__ZUSTAND_STORE__` (if devtools enabled)

**Backend Debugging**:

```bash
# Run Tauri with Rust logs
RUST_LOG=debug npm run tauri dev
```

**Cache Directory**:

```bash
# macOS
ls -lah ~/Library/Caches/com.skilldebuggr.app/diagrams/

# Linux
ls -lah ~/.cache/skill-debugger/diagrams/

# Windows
dir %LOCALAPPDATA%\com.skilldebuggr.app\cache\diagrams\
```

---

## Testing Checklist (Before Submitting PR)

### Unit Tests (must achieve >80% coverage)

- [ ] `mermaidValidator.test.ts` - Test validation logic (valid/invalid Mermaid)
- [ ] `crcHasher.test.ts` - Test CRC32 calculation (same input = same hash)
- [ ] `diagramCache.test.ts` - Test cache read/write/evict operations
- [ ] `skillContentExtractor.test.ts` - Test file concatenation logic

### Integration Tests

- [ ] `claudeCliService.test.ts` - Test CLI calls (mocked responses)
- [ ] Cache eviction (LRU) - Test 100MB limit enforcement

### E2E Tests (Playwright)

- [ ] User Story 1: Syntax validation (invalid diagram → error message, not blank)
- [ ] User Story 2: Auto-generation (syntax error → Claude CLI → valid diagram)
- [ ] User Story 3: Caching (diagram loads <100ms on second visit)
- [ ] User Story 4: Error handling (CLI not installed, timeout, retry)

### Manual Testing

- [ ] Test on macOS (if available)
- [ ] Test on Linux (if available)
- [ ] Test on Windows (if available)
- [ ] Test with Claude CLI installed
- [ ] Test with Claude CLI NOT installed (graceful degradation)
- [ ] Test with 50+ skills (stress test)
- [ ] Test cache eviction (manually fill cache to >100MB)

---

## Common Pitfalls & Solutions

### Pitfall 1: mermaid.parse() not catching all errors

**Problem**: Some syntax errors only appear during rendering, not parsing.

**Solution**: Wrap both `mermaid.parse()` AND `mermaid.render()` in try/catch. Validation is first line of defense, not complete solution.

---

### Pitfall 2: CRC32 hash changes unexpectedly

**Problem**: Cache keys keep changing even when skill files haven't changed.

**Solution**: Ensure deterministic ordering (sort references/scripts before concatenation). Watch for file encoding differences (CRLF vs LF).

---

### Pitfall 3: Claude CLI hangs during generation

**Problem**: Generation never completes, blocking UI.

**Solution**: Always enforce 30s timeout (FR-012). Kill process on timeout and show retry button.

---

### Pitfall 4: Cache directory not writable

**Problem**: Cache operations fail silently.

**Solution**: Implement fallback to in-memory caching for session. Log warning to console.

---

## Helpful Commands

```bash
# Clear cache manually (for testing)
rm -rf ~/Library/Caches/com.skilldebuggr.app/diagrams/*   # macOS
rm -rf ~/.cache/skill-debugger/diagrams/*                 # Linux

# Check cache size
du -sh ~/Library/Caches/com.skilldebuggr.app/diagrams/   # macOS
du -sh ~/.cache/skill-debugger/diagrams/                 # Linux

# Tail Tauri logs
tail -f ~/Library/Logs/com.skilldebuggr.app/main.log     # macOS

# Run single E2E test
npm run test:e2e -- diagram-generation.spec.ts

# Run tests in watch mode
npm test -- --watch
```

---

## Next Steps

1. ✅ Read `spec.md` (feature requirements)
2. ✅ Read `plan.md` (technical approach)
3. ✅ Read `research.md` (API details)
4. ✅ Read `data-model.md` (TypeScript types)
5. ✅ Read this quickstart
6. 🔲 Wait for `tasks.md` (generated by `/speckit.tasks` command)
7. 🔲 Start implementing tasks in order (TDD approach)

---

## Questions? Debugging Tips

**Q: Where do I start implementing?**  
A: Wait for `tasks.md` from `/speckit.tasks` command. It will have ordered task list with test requirements.

**Q: How do I test Claude CLI integration without making actual API calls?**  
A: Mock `claudeCliService.ts` in tests. See `tests/integration/claudeCliService.test.ts` for examples.

**Q: What if I encounter a requirement that doesn't make sense?**  
A: Ask for clarification! Better to clarify now than implement incorrectly.

**Q: How do I verify test coverage?**  
A: Run `npm run test:coverage`. Open `coverage/index.html` in browser to see detailed report.

---

**Ready to Code?** Wait for `tasks.md`, then start with tests (TDD)! 🚀
