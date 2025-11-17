# Phase 0: Research - Intelligent Mermaid Diagram Generation

**Feature**: 015-intelligent-diagram-generation  
**Date**: 2025-11-14  
**Status**: Draft

## Research Objectives

This document captures technical research for implementing Mermaid syntax validation, Claude CLI integration, CRC32 caching, and Tauri file system operations.

## 1. Mermaid.parse() API for Validation

### Research Question

How do we validate Mermaid syntax before rendering to detect errors and prevent blank diagrams?

### Findings

**Mermaid.parse() Method** (v11.12.1):

```typescript
import mermaid from 'mermaid';

// Type signature (from @types/mermaid or inferred)
interface ParseOptions {
  suppressErrors?: boolean;
}

interface ParseResult {
  // Success case: returns void (no error)
  // Failure case: throws Error with message
}

// Usage
try {
  await mermaid.parse(diagramSource: string, options?: ParseOptions);
  // If no error thrown, syntax is valid
  return { isValid: true, error: null };
} catch (error) {
  // Syntax error detected
  return {
    isValid: false,
    error: error.message,
    // Line number extraction (if available in error.message)
    lineNumber: extractLineNumber(error.message)
  };
}
```

**Key Insights**:

- `mermaid.parse()` is **asynchronous** (returns Promise<void>)
- Throws exception on syntax errors (try/catch pattern required)
- Error messages may include line numbers (e.g., "Parse error on line 5: Expecting 'SEMI', got 'EOF'")
- `suppressErrors: true` option prevents console spam during validation
- Must initialize mermaid before calling parse() (already done in InteractiveDiagram.tsx)

**Example Error Messages**:

```
"Parse error on line 3: Expecting 'SEMI', got 'IDENTIFIER'"
"Syntax error in graph definition"
"Unknown diagram type: 'foobar'"
```

**Line Number Extraction Strategy**:

```typescript
function extractLineNumber(errorMessage: string): number | null {
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}
```

**Implementation Notes**:

- Wrap in service module: `src/services/mermaidValidator.ts`
- Return typed `ValidationResult` object (see data-model.md)
- Always use `suppressErrors: true` to prevent console pollution
- Cache validation results to avoid redundant parsing

**References**:

- Mermaid GitHub: https://github.com/mermaid-js/mermaid
- Parse API docs: https://mermaid.js.org/config/setup/modules/mermaidAPI.html#parse

---

## 2. Claude Code CLI Non-Interactive Mode

### Research Question

How do we call Claude Code CLI non-interactively to generate Mermaid diagrams from skill content?

### Findings

**Claude CLI `-p` (Prompt) Flag**:

```bash
# Non-interactive mode: returns response via stdout
claude -p "Generate a Mermaid flowchart showing the workflow of this skill" < skill-content.txt
```

**Node.js Integration** (via `child_process`):

```typescript
import { spawn } from 'child_process';

interface ClaudeCliOptions {
  prompt: string;
  input: string; // Skill content
  timeout: number; // milliseconds (30000 = 30s)
}

async function callClaudeCli(options: ClaudeCliOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn('claude', ['-p', options.prompt], {
      timeout: options.timeout,
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write skill content to stdin
    process.stdin.write(options.input);
    process.stdin.end();

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Claude CLI failed with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
    });
  });
}
```

**Prompt Engineering Best Practices**:
The diagram generation prompt should be clear and constrained to Mermaid syntax output only.

**Mermaid Extraction from Response**:

````typescript
function extractMermaidFromResponse(response: string): string {
  // Remove markdown code fences if present
  const cleanResponse = response
    .replace(/```mermaid\n/g, '')
    .replace(/```\n?$/g, '')
    .trim();

  // Validate it starts with graph/flowchart/etc
  if (!cleanResponse.match(/^(graph|flowchart|sequenceDiagram|classDiagram)/)) {
    throw new Error('Response does not contain valid Mermaid syntax');
  }

  return cleanResponse;
}
````

**Error Handling**:

- Claude CLI not installed → Return graceful error with installation link
- Timeout (>30s) → Return timeout error with retry option
- Invalid response → Attempt to extract Mermaid, fallback to error
- Network errors → N/A (Claude CLI is local, no network required)

**Implementation Notes**:

- Wrap in service: `src/services/claudeCliService.ts`
- Check if `claude` command exists before calling (via `which claude`)
- Implement 30s timeout (FR-012)
- Log all CLI calls to console (FR-017)
- Provide mock implementation for tests (avoid actual CLI calls in CI)

**References**:

- Claude Code CLI docs: https://claude.com/claude-code
- Node.js child_process: https://nodejs.org/api/child_process.html

---

## 3. CRC32 Hashing for Cache Keys

### Research Question

How do we generate consistent cache keys from skill file contents to detect changes and invalidate cache?

### Findings

**CRC32 Algorithm**:

- Fast, non-cryptographic checksum algorithm
- 32-bit output (8 hex characters)
- Deterministic (same input = same output)
- Collision rate negligible for small datasets (<1M files)
- Widely used for cache keys, file integrity checks

**Node.js Library: `crc-32`**:

```bash
npm install crc-32 --save
npm install @types/crc-32 --save-dev
```

```typescript
import CRC32 from 'crc-32';

// Calculate CRC32 of string
const hash = CRC32.str(content); // Returns signed 32-bit integer

// Convert to unsigned hex string (for filenames)
const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
// Example: "a3f4b2c1"
```

**Skill Content Concatenation Strategy**:

```typescript
interface SkillContent {
  skillMd: string; // Contents of skill.md
  references: string[]; // Array of reference file contents
  scripts: string[]; // Array of script file contents
}

function concatenateSkillContent(skill: SkillContent): string {
  // Deterministic order: skill.md first, then refs, then scripts (both sorted)
  const parts = [skill.skillMd, ...skill.references.sort(), ...skill.scripts.sort()];
  return parts.join('\n---\n'); // Separator to prevent accidental concatenation
}

function calculateSkillCrc(skill: SkillContent): string {
  const concatenated = concatenateSkillContent(skill);
  const hash = CRC32.str(concatenated);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
```

**Cache Key Format**:

```
{skill_name}-{crc32_hash}.mmd

Examples:
- "sdd-a3f4b2c1.mmd"
- "pdf-12345678.mmd"
- "notion-uploader-downloader-deadbeef.mmd"
```

**Alternative Considered: MD5**:

- Pros: Stronger collision resistance, industry standard
- Cons: Slower, cryptographic overhead unnecessary for cache keys
- Decision: CRC32 sufficient for this use case (small dataset, performance priority)

**Implementation Notes**:

- Wrap in utility: `src/utils/crcHasher.ts`
- Ensure deterministic ordering of references/scripts (sort before concat)
- Use separator (`\n---\n`) to prevent false matches
- Handle empty files (empty string has CRC32 = 0x00000000)

**References**:

- CRC32 npm package: https://www.npmjs.com/package/crc-32
- CRC32 algorithm: https://en.wikipedia.org/wiki/Cyclic_redundancy_check

---

## 4. Tauri File System API for Cache Management

### Research Question

How do we create, read, write, and manage cache files in the cache directory using Tauri?

### Findings

**Tauri File System API** (Tauri 2.x):

Tauri does not expose direct file system APIs to frontend for security. Must create Rust commands.

**Rust Backend Commands**:

```rust
// src-tauri/src/commands/cache_manager.rs
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[tauri::command]
pub fn get_cache_dir(app_handle: AppHandle) -> Result<String, String> {
    // Platform-agnostic cache directory
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?;

    let diagrams_dir = cache_dir.join("diagrams");

    // Create directory if it doesn't exist
    fs::create_dir_all(&diagrams_dir)
        .map_err(|e| format!("Failed to create cache dir: {}", e))?;

    Ok(diagrams_dir.to_string_lossy().to_string())
}
```

**Frontend Integration** (TypeScript):

```typescript
import { invoke } from '@tauri-apps/api/core';

async function getCacheDir(): Promise<string> {
  return await invoke<string>('get_cache_dir');
}

async function readCacheFile(path: string): Promise<string> {
  return await invoke<string>('read_cache_file', { path });
}

async function writeCacheFile(path: string, content: string): Promise<void> {
  await invoke<void>('write_cache_file', { path, content });
}
```

**Platform-Specific Cache Paths**:

- macOS: `~/Library/Caches/com.skilldebuggr.app/diagrams/`
- Linux: `~/.cache/skill-debugger/diagrams/`
- Windows: `C:\Users\{user}\AppData\Local\com.skilldebuggr.app\cache\diagrams\`

**Implementation Notes**:

- Use `app_handle.path().app_cache_dir()` for platform-agnostic paths
- Create `diagrams/` subdirectory on first access
- Implement LRU eviction when total size exceeds 100MB (FR-010)
- Log all cache operations to console (FR-017)
- Handle missing directories gracefully (create on demand)

**References**:

- Tauri path resolver: https://tauri.app/v1/api/rust/tauri/path/
- Tauri commands: https://tauri.app/v1/guides/features/command
- Rust std::fs: https://doc.rust-lang.org/std/fs/

---

## Research Summary

### Key Decisions

1. **Validation**: Use `mermaid.parse()` with try/catch error handling
2. **Generation**: Call Claude CLI via `child_process.spawn` with 30s timeout
3. **Caching**: CRC32 hashing with `{skill_name}-{crc}.mmd` naming
4. **Storage**: Tauri Rust commands for cross-platform cache directory management
5. **Eviction**: LRU policy when cache exceeds 100MB

### Next Steps (Phase 1)

- Design data models (DiagramCache, ValidationResult, etc.)
- Design API contracts (mermaid validation, Claude CLI, cache ops)
- Design error handling strategy (graceful degradation)
- Design testing strategy (unit, integration, E2E)

### Risks & Mitigations

**Risk**: Claude CLI not installed on user's system  
**Mitigation**: Graceful degradation with clear installation instructions (FR-016)

**Risk**: CRC32 hash collision (two different skill versions same hash)  
**Mitigation**: Statistically negligible (<1 in 4 billion for random data), acceptable for cache invalidation

**Risk**: Cache directory not writable (permissions issue)  
**Mitigation**: Fall back to in-memory caching for session, log warning (Edge case from spec.md)

**Risk**: Timeout during diagram generation (>30s)  
**Mitigation**: Display timeout error with retry button (FR-012, FR-014)

---

**Phase 0 Complete**: Ready to proceed to Phase 1 (Data Model Design)
