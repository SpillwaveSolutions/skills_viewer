# Phase 1: Data Model - Intelligent Mermaid Diagram Generation

**Feature**: 015-intelligent-diagram-generation  
**Date**: 2025-11-14  
**Status**: Draft

## Overview

This document defines the TypeScript data models and interfaces for diagram validation, caching, and generation.

## Core Entities

### 1. ValidationResult

Represents the outcome of Mermaid syntax validation.

```typescript
// src/types/diagram.ts

/**
 * Result of Mermaid syntax validation using mermaid.parse()
 */
export interface ValidationResult {
  /**
   * Whether the Mermaid syntax is valid
   */
  isValid: boolean;

  /**
   * Error message if validation failed, null otherwise
   */
  error: string | null;

  /**
   * Line number where error occurred (if available from error message)
   * Example: "Parse error on line 5" -> lineNumber = 5
   */
  lineNumber: number | null;

  /**
   * Timestamp when validation was performed (for debugging/logging)
   */
  timestamp: number;
}
```

**Usage Example**:

```typescript
const result: ValidationResult = {
  isValid: false,
  error: "Parse error on line 3: Expecting 'SEMI', got 'IDENTIFIER'",
  lineNumber: 3,
  timestamp: Date.now(),
};
```

---

### 2. DiagramCache

Represents a cached Mermaid diagram with metadata.

```typescript
// src/types/diagram.ts

/**
 * Cached diagram data stored in ~/.cache/skill-debugger/diagrams/
 */
export interface DiagramCache {
  /**
   * Name of the skill (used in cache filename)
   */
  skillName: string;

  /**
   * CRC32 hash of concatenated skill files (8 hex characters)
   * Example: "a3f4b2c1"
   */
  crcHash: string;

  /**
   * Mermaid diagram source code
   */
  diagramSource: string;

  /**
   * Timestamp when diagram was generated/cached (Unix epoch seconds)
   */
  timestamp: number;

  /**
   * Size of diagram source in bytes (for cache size calculations)
   */
  sizeBytes: number;

  /**
   * Full path to cache file
   * Example: "/Users/name/.cache/skill-debugger/diagrams/sdd-a3f4b2c1.mmd"
   */
  cachePath: string;
}
```

**File System Representation**:

```
~/.cache/skill-debugger/diagrams/
├── sdd-a3f4b2c1.mmd               # CRC32 hash in filename
├── pdf-12345678.mmd
└── notion-uploader-deadbeef.mmd
```

**Cache Key Generation**:

```typescript
function getCacheKey(skillName: string, crcHash: string): string {
  return `${skillName}-${crcHash}.mmd`;
}
```

---

### 3. GenerationRequest

Represents a request to generate a diagram via Claude CLI.

```typescript
// src/types/diagram.ts

/**
 * Request to generate Mermaid diagram via Claude CLI
 */
export interface GenerationRequest {
  /**
   * Skill name (for logging and error messages)
   */
  skillName: string;

  /**
   * Complete skill content (skill.md + references + scripts)
   * Passed to Claude CLI as context
   */
  skillContent: string;

  /**
   * Timeout in milliseconds (default: 30000)
   */
  timeout: number;

  /**
   * Number of retry attempts (default: 0, max: 3)
   */
  retryCount: number;

  /**
   * Prompt template for Claude CLI
   */
  prompt: string;
}
```

**Default Values**:

```typescript
const DEFAULT_GENERATION_REQUEST: Partial<GenerationRequest> = {
  timeout: 30000, // 30 seconds
  retryCount: 0,
  prompt: `Generate a Mermaid flowchart diagram for this Claude Code skill.
Output ONLY valid Mermaid syntax (no markdown fences, no explanations).`,
};
```

---

### 4. CacheMetadata

Represents overall cache directory state for size management.

```typescript
// src/types/diagram.ts

/**
 * Metadata about cache directory state (for LRU eviction)
 */
export interface CacheMetadata {
  /**
   * Total size of all cached diagrams in bytes
   */
  totalSizeBytes: number;

  /**
   * Number of cached diagram files
   */
  entryCount: number;

  /**
   * Timestamp of oldest cache entry (Unix epoch seconds)
   * Used for LRU eviction when cache exceeds 100MB
   */
  oldestEntryTimestamp: number;

  /**
   * List of all cache entries (for eviction sorting)
   */
  entries: DiagramCache[];
}
```

**Usage for LRU Eviction**:

```typescript
async function evictOldestEntries(metadata: CacheMetadata, maxSizeBytes: number): Promise<void> {
  if (metadata.totalSizeBytes <= maxSizeBytes) return;

  // Sort by timestamp (oldest first)
  const sorted = [...metadata.entries].sort((a, b) => a.timestamp - b.timestamp);

  let currentSize = metadata.totalSizeBytes;
  for (const entry of sorted) {
    if (currentSize <= maxSizeBytes) break;

    await deleteCacheFile(entry.cachePath);
    currentSize -= entry.sizeBytes;
  }
}
```

---

## Supporting Types

### 5. GenerationResult

Result of diagram generation attempt (success or failure).

```typescript
// src/types/diagram.ts

export type GenerationStatus = 'success' | 'timeout' | 'error' | 'cli_not_found';

export interface GenerationResult {
  /**
   * Status of generation attempt
   */
  status: GenerationStatus;

  /**
   * Generated Mermaid source (if successful)
   */
  diagramSource: string | null;

  /**
   * Error message (if failed)
   */
  error: string | null;

  /**
   * Duration of generation in milliseconds
   */
  durationMs: number;

  /**
   * Validation result of generated diagram (if successful)
   */
  validation: ValidationResult | null;
}
```

---

### 6. SkillContent

Structured representation of skill files for CRC32 calculation.

```typescript
// src/types/diagram.ts

/**
 * Skill content for CRC32 hash calculation
 */
export interface SkillContent {
  /**
   * Contents of skill.md file
   */
  skillMd: string;

  /**
   * Array of reference file contents (sorted alphabetically)
   */
  references: string[];

  /**
   * Array of script file contents (sorted alphabetically)
   */
  scripts: string[];
}
```

**CRC32 Calculation Flow**:

```typescript
// 1. Extract skill content
const skillContent: SkillContent = {
  skillMd: await readFile(skill.path),
  references: await Promise.all(skill.references.map((r) => readFile(r.path))),
  scripts: await Promise.all(skill.scripts.map((s) => readFile(s.path))),
};

// 2. Concatenate in deterministic order
const concatenated = [
  skillContent.skillMd,
  ...skillContent.references.sort(),
  ...skillContent.scripts.sort(),
].join('\n---\n');

// 3. Calculate CRC32 hash
const crcHash = calculateCrc32(concatenated);
```

---

## Zustand Store Schema

### DiagramStore

State management for diagram caching and generation.

```typescript
// src/stores/diagramStore.ts

interface DiagramState {
  /**
   * In-memory cache of loaded diagrams (skill name -> diagram source)
   */
  diagrams: Map<string, string>;

  /**
   * Validation results (skill name -> validation result)
   */
  validationResults: Map<string, ValidationResult>;

  /**
   * Generation status (skill name -> status)
   */
  generationStatus: Map<string, GenerationStatus>;

  /**
   * Cache metadata (updated periodically)
   */
  cacheMetadata: CacheMetadata | null;
}

interface DiagramActions {
  /**
   * Load diagram from cache or generate new one
   */
  loadDiagram: (skillName: string) => Promise<string>;

  /**
   * Validate Mermaid syntax
   */
  validateDiagram: (source: string) => Promise<ValidationResult>;

  /**
   * Generate diagram via Claude CLI
   */
  generateDiagram: (request: GenerationRequest) => Promise<GenerationResult>;

  /**
   * Clear all cached diagrams
   */
  clearCache: () => Promise<void>;

  /**
   * Get cache metadata
   */
  getCacheMetadata: () => Promise<CacheMetadata>;

  /**
   * Evict old entries to stay under size limit
   */
  evictOldEntries: (maxSizeBytes: number) => Promise<void>;
}

export type DiagramStore = DiagramState & DiagramActions;
```

---

## Service Layer Interfaces

### MermaidValidator

```typescript
// src/services/mermaidValidator.ts

export interface IMermaidValidator {
  /**
   * Validate Mermaid syntax using mermaid.parse()
   */
  validate(source: string): Promise<ValidationResult>;

  /**
   * Extract line number from error message
   */
  extractLineNumber(errorMessage: string): number | null;
}
```

---

### DiagramCacheService

```typescript
// src/services/diagramCache.ts

export interface IDiagramCacheService {
  /**
   * Get cache directory path
   */
  getCacheDir(): Promise<string>;

  /**
   * Read diagram from cache
   */
  readCache(skillName: string, crcHash: string): Promise<DiagramCache | null>;

  /**
   * Write diagram to cache
   */
  writeCache(cache: DiagramCache): Promise<void>;

  /**
   * Delete specific cache entry
   */
  deleteCache(skillName: string, crcHash: string): Promise<void>;

  /**
   * Clear all cached diagrams
   */
  clearAll(): Promise<void>;

  /**
   * Get cache metadata
   */
  getMetadata(): Promise<CacheMetadata>;

  /**
   * Evict oldest entries to stay under size limit
   */
  evictOldest(maxSizeBytes: number): Promise<void>;
}
```

---

### ClaudeCliService

```typescript
// src/services/claudeCliService.ts

export interface IClaudeCliService {
  /**
   * Check if Claude CLI is installed
   */
  isCliAvailable(): Promise<boolean>;

  /**
   * Generate diagram via Claude CLI
   */
  generateDiagram(request: GenerationRequest): Promise<GenerationResult>;

  /**
   * Extract Mermaid syntax from Claude response
   */
  extractMermaid(response: string): string;
}
```

---

### CrcHasher

```typescript
// src/utils/crcHasher.ts

export interface ICrcHasher {
  /**
   * Calculate CRC32 hash of skill content
   */
  calculateSkillCrc(content: SkillContent): string;

  /**
   * Concatenate skill files in deterministic order
   */
  concatenateSkillContent(content: SkillContent): string;

  /**
   * Calculate CRC32 hash of string
   */
  calculateCrc32(input: string): string;
}
```

---

## Tauri Backend Models

### Rust CacheMetadata (mirrors TypeScript)

```rust
// src-tauri/src/models/cache.rs

use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheMetadata {
    pub total_size_bytes: u64,
    pub entry_count: usize,
    pub oldest_entry_timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagramCacheEntry {
    pub skill_name: String,
    pub crc_hash: String,
    pub cache_path: String,
    pub size_bytes: u64,
    pub timestamp: u64,
}
```

---

## Error Types

### DiagramError

```typescript
// src/types/diagram.ts

export enum DiagramErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  GENERATION_FAILED = 'GENERATION_FAILED',
  CLI_NOT_FOUND = 'CLI_NOT_FOUND',
  CACHE_READ_FAILED = 'CACHE_READ_FAILED',
  CACHE_WRITE_FAILED = 'CACHE_WRITE_FAILED',
  CRC_CALCULATION_FAILED = 'CRC_CALCULATION_FAILED',
}

export class DiagramError extends Error {
  constructor(
    public code: DiagramErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DiagramError';
  }
}
```

---

## Data Flow Summary

```
User Opens Diagram Tab
  ↓
1. Extract SkillContent (skill.md + refs + scripts)
  ↓
2. Calculate CRC32 hash → crcHash
  ↓
3. Check cache: getCacheKey(skillName, crcHash)
  ↓
  ├─ Cache Hit → Load DiagramCache → Render
  │
  └─ Cache Miss
       ↓
     4. Generate via Claude CLI (GenerationRequest)
       ↓
     5. Validate generated diagram (ValidationResult)
       ↓
       ├─ Valid → Cache (DiagramCache) → Render
       │
       └─ Invalid → Show error + retry
```

---

**Phase 1 Data Model Complete**: Ready for API contract design and quickstart guide.
