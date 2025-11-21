# Research: Feature 021 - Skill Evaluation & PDA Analysis

**Date**: 2025-11-18
**Status**: Complete

---

## Overview

This document consolidates research findings for technology choices and implementation patterns for the Skill Evaluation & PDA Analysis feature.

---

## Research Task 1: CLI Integration Patterns (FR-008)

### Question

How should Rust execute CLI commands asynchronously without blocking other analyses?

### Options Evaluated

1. **std::process::Command**
   - Pros: Simple API, synchronous, built-in
   - Cons: Blocks thread during execution, not async-compatible
   - Pattern: `Command::new("claude").arg("-p").output()?`

2. **tokio::process::Command**
   - Pros: Non-blocking, async/await, integrates with tokio runtime
   - Cons: Requires tokio runtime (already in use)
   - Pattern: `Command::new("claude").arg("-p").output().await?`

3. **async-process crate**
   - Pros: Runtime-agnostic async process execution
   - Cons: Additional dependency, less mature than tokio
   - Pattern: Similar to tokio but more complex setup

### Decision: tokio::process::Command

**Rationale**:

- Tauri already uses tokio runtime (tokio 1.35)
- Non-blocking execution critical for 5 concurrent analyses (FR-007)
- Native integration with existing async patterns from Feature 016
- Timeout support via tokio::time::timeout
- Consistent with Tauri async command architecture

**Implementation Pattern**:

```rust
use tokio::process::Command;
use tokio::time::{timeout, Duration};

async fn execute_claude_cli(prompt: &str) -> Result<String, String> {
    let timeout_duration = Duration::from_secs(30);

    let output = timeout(
        timeout_duration,
        Command::new("claude")
            .arg("-p")
            .arg(prompt)
            .arg("--output-format")
            .arg("json")
            .output()
    ).await
    .map_err(|_| "CLI execution timeout".to_string())?
    .map_err(|e| format!("Command error: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

---

## Research Task 2: JSON Response Parsing (FR-002)

### Question

How should we structure and parse CLI JSON responses reliably?

### Options Evaluated

1. **Unstructured JSON (serde_json::Value)**
   - Pros: Flexible, handles unexpected fields
   - Cons: Runtime errors, no type safety, manual validation
   - Pattern: `let json: Value = serde_json::from_str(&output)?`

2. **Structured Deserialization (derive Deserialize)**
   - Pros: Type-safe, compile-time validation, automatic field mapping
   - Cons: Requires exact schema match, breaks on missing fields
   - Pattern: `let result: PDACliResponse = serde_json::from_str(&output)?`

3. **Hybrid Approach (serde_json with #[serde(default)])**
   - Pros: Type-safe with graceful degradation, optional fields supported
   - Cons: More complex struct definitions
   - Pattern: Mix of required and Option<T> fields

### Decision: Hybrid Approach with --output-format json

**Rationale**:

- Claude CLI supports `--output-format json` flag (documented)
- Structured types improve maintainability and IDE support
- Optional fields (#[serde(default)]) handle partial responses
- Better error messages than unstructured parsing
- Enables schema evolution (new fields don't break existing code)

**Implementation Pattern**:

```rust
#[derive(Debug, Deserialize)]
struct PDACliResponse {
    pub pda_score: u8,
    pub token_estimate: usize,
    pub tier_breakdown: TierBreakdown,
    pub recommendations: Vec<String>,
    #[serde(default)]  // Optional field with default
    pub violations: Vec<String>,
    #[serde(default)]
    pub suggested_structure: Vec<String>,
}

// Usage
let response: PDACliResponse = serde_json::from_str(&cli_output)
    .map_err(|e| format!("Failed to parse CLI response: {}", e))?;
```

**CLI Command Format**:

```bash
claude -p "Analyze PDA for this skill..." --output-format json --tools ""
```

---

## Research Task 3: Async State Management (FR-007)

### Question

How should we manage concurrent analysis state with caching (24hr TTL, 5 concurrent)?

### Options Evaluated

1. **std::sync::Mutex<HashMap>**
   - Pros: Simple, standard library, familiar
   - Cons: Lock contention, blocking, not async-friendly
   - Pattern: `let cache = Arc::new(Mutex::new(HashMap::new()))`

2. **tokio::sync::RwLock<HashMap>**
   - Pros: Async-aware, multiple readers, single writer
   - Cons: Lock acquisition is async, still has contention
   - Pattern: `let cache = Arc::new(RwLock::new(HashMap::new()))`

3. **DashMap**
   - Pros: Lock-free concurrent HashMap, no async/await overhead
   - Cons: External dependency (1.6.0), more complex internals
   - Pattern: `let cache = Arc::new(DashMap::new())`

4. **flurry (lock-free concurrent map)**
   - Pros: Even more performant than DashMap
   - Cons: Less mature, smaller ecosystem
   - Pattern: Similar to DashMap

### Decision: DashMap for Analysis Cache

**Rationale**:

- Lock-free design eliminates contention bottleneck
- No async overhead (get/insert are synchronous)
- Excellent performance under concurrent load (5 analyses)
- Mature crate (1M+ downloads, actively maintained)
- Supports TTL via entry() API with custom expiry logic
- Used in production by Tauri and other high-performance apps

**Implementation Pattern**:

```rust
use dashmap::DashMap;
use std::sync::Arc;
use chrono::{DateTime, Utc, Duration};

struct CachedResult {
    result: SkillAnalysisResult,
    expires_at: DateTime<Utc>,
}

struct AnalysisCache {
    cache: Arc<DashMap<String, CachedResult>>,  // analysis_id -> result
}

impl AnalysisCache {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(DashMap::new()),
        }
    }

    pub fn get(&self, analysis_id: &str) -> Option<SkillAnalysisResult> {
        self.cache.get(analysis_id).and_then(|entry| {
            if entry.expires_at > Utc::now() {
                Some(entry.result.clone())
            } else {
                drop(entry);  // Release read lock
                self.cache.remove(analysis_id);  // Evict expired
                None
            }
        })
    }

    pub fn insert(&self, analysis_id: String, result: SkillAnalysisResult) {
        let expires_at = Utc::now() + Duration::hours(24);
        self.cache.insert(analysis_id, CachedResult { result, expires_at });

        // LRU eviction (keep max 50 entries)
        if self.cache.len() > 50 {
            self.evict_oldest();
        }
    }

    fn evict_oldest(&self) {
        // Find and remove entry with earliest expires_at
        if let Some(oldest_key) = self.cache.iter()
            .min_by_key(|entry| entry.expires_at)
            .map(|entry| entry.key().clone()) {
            self.cache.remove(&oldest_key);
        }
    }
}
```

---

## Research Task 4: CLI Detection Best Practices (FR-008)

### Question

How should we detect CLI tool availability cross-platform (claude/opencode)?

### Options Evaluated

1. **which command via std::process::Command**
   - Pros: Respects PATH, cross-platform (which/where)
   - Cons: Requires external command, different on Windows
   - Pattern: `Command::new("which").arg("claude").output()`

2. **std::env::var("PATH") scanning**
   - Pros: Pure Rust, no external commands
   - Cons: Complex (parse PATH, check executability, platform-specific)
   - Pattern: Manual PATH parsing and file checks

3. **which crate (Rust library)**
   - Pros: Cross-platform abstraction, handles Windows/Unix differences
   - Cons: External dependency (6.0.3), adds complexity
   - Pattern: `which::which("claude")?`

### Decision: which crate for Cross-Platform Detection

**Rationale**:

- Abstracts platform differences (which on Unix, where on Windows)
- Handles executable permissions correctly
- Well-tested (10M+ downloads, widely used)
- Simple API: `which::which("claude").is_ok()`
- Small dependency (30KB compiled)
- Consistent with constitution Principle IV (cross-platform)

**Implementation Pattern**:

```rust
use which::which;

#[derive(Debug, Clone)]
pub struct CLIDetectionResult {
    pub claude_available: bool,
    pub opencode_available: bool,
    pub claude_path: Option<PathBuf>,
    pub opencode_path: Option<PathBuf>,
}

pub fn detect_available_clis() -> CLIDetectionResult {
    let claude_path = which("claude").ok();
    let opencode_path = which("opencode").ok();

    CLIDetectionResult {
        claude_available: claude_path.is_some(),
        opencode_available: opencode_path.is_some(),
        claude_path,
        opencode_path,
    }
}

pub async fn select_cli() -> Result<String, String> {
    let detection = detect_available_clis();

    if detection.claude_available {
        Ok("claude".to_string())
    } else if detection.opencode_available {
        Ok("opencode".to_string())
    } else {
        Err("No CLI available. Install Claude CLI or OpenCode CLI.".to_string())
    }
}
```

---

## Research Task 5: Frontend Polling Pattern (FR-007)

### Question

How should React frontend poll for analysis status (2-second intervals)?

### Options Evaluated

1. **Raw setInterval**
   - Pros: Simple, no dependencies, direct control
   - Cons: Manual cleanup, easy to leak, repetitive code
   - Pattern: `useEffect(() => { const id = setInterval(...); return () => clearInterval(id); })`

2. **React Query (TanStack Query)**
   - Pros: Built-in polling, caching, refetch strategies
   - Cons: Large dependency (40KB), overkill for simple polling
   - Pattern: `useQuery({ queryKey: [...], refetchInterval: 2000 })`

3. **Custom useAnalysis Hook**
   - Pros: Encapsulates logic, testable, no external deps, reusable
   - Cons: Must implement cleanup and edge cases
   - Pattern: Custom hook with setInterval + useEffect cleanup

### Decision: Custom useAnalysis Hook

**Rationale**:

- Project already minimizes dependencies (constitution: avoid over-engineering)
- Simple use case doesn't justify React Query complexity
- Custom hook provides exact behavior needed
- Better testing (can mock Tauri commands directly)
- 100% control over polling logic and cleanup

**Implementation Pattern**:

```typescript
import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SkillAnalysisResult } from '@/types/analysis';

interface UseAnalysisOptions {
  analysisId: string | null;
  interval?: number; // Default: 2000ms
  enabled?: boolean; // Default: true
}

export function useAnalysis(options: UseAnalysisOptions) {
  const { analysisId, interval = 2000, enabled = true } = options;
  const [result, setResult] = useState<SkillAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analysisId || !enabled) return;

    const poll = async () => {
      try {
        const status = await invoke<SkillAnalysisResult>('get_analysis_status', { analysisId });
        setResult(status);
        setError(null);

        // Stop polling when completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    // Poll immediately, then every interval
    poll();
    intervalRef.current = window.setInterval(poll, interval);

    // Cleanup on unmount or analysisId change
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [analysisId, interval, enabled]);

  return { result, error, isPolling: intervalRef.current !== null };
}

// Usage in component:
const { result, error, isPolling } = useAnalysis({
  analysisId: currentAnalysisId,
  interval: 2000,
  enabled: true,
});
```

---

## Additional Research: Dependencies

### Required Rust Crates

Add to `src-tauri/Cargo.toml`:

```toml
[dependencies]
# Existing
tauri = "2.x"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.35", features = ["full"] }

# New for Feature 021
dashmap = "6.1"        # Lock-free concurrent HashMap
which = "6.0"          # CLI detection
reqwest = { version = "0.11", features = ["blocking"] }  # Link validation (FR-006)
chrono = { version = "0.4", features = ["serde"] }  # DateTime handling
uuid = { version = "1.10", features = ["v4", "serde"] }  # Analysis IDs
```

### Required Frontend Packages

Already satisfied (no new npm dependencies needed):

- React 19.1.0
- Zustand 5.0.8
- @tauri-apps/api 2.x
- TypeScript 5.8.3

---

## Best Practices and Patterns

### Error Handling Pattern

```rust
// Consistent error type conversion
impl From<std::io::Error> for AnalysisError {
    fn from(err: std::io::Error) -> Self {
        AnalysisError::IoError(err.to_string())
    }
}

// Usage
pub async fn analyze_skill(skill_name: &str) -> Result<SkillAnalysisResult, AnalysisError> {
    let skill_path = find_skill(skill_name)?;  // Auto-converts errors
    let content = read_skill(skill_path)?;
    // ...
}
```

### Async Orchestration Pattern (from Feature 016)

```rust
use tokio::task::JoinSet;

pub async fn run_parallel_analyzers(skill: &Skill) -> AnalysisResult {
    let mut set = JoinSet::new();

    // Spawn all analyzers concurrently
    set.spawn(async move { validate_spec(skill.clone()) });
    set.spawn(async move { analyze_pda(skill.clone()) });
    set.spawn(async move { review_security(skill.clone()) });

    // Collect results
    let mut results = AnalysisResult::default();
    while let Some(res) = set.join_next().await {
        match res {
            Ok(Ok(analyzer_result)) => results.merge(analyzer_result),
            Ok(Err(e)) => results.add_error(e),
            Err(e) => results.add_error(format!("Task panic: {}", e)),
        }
    }

    results
}
```

---

## References

- tokio::process::Command docs: https://docs.rs/tokio/latest/tokio/process/struct.Command.html
- DashMap docs: https://docs.rs/dashmap/latest/dashmap/
- which crate docs: https://docs.rs/which/latest/which/
- Claude CLI documentation: https://docs.anthropic.com/en/docs/build-with-claude/claude-code-cli
- Tauri async commands: https://v2.tauri.app/develop/calling-rust/#async-commands

---

**Status**: ✅ All research tasks completed
**Next Step**: Create data-model.md (Phase 1)
