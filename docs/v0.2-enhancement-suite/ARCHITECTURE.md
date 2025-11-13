# Technical Architecture - Skill Debugger v0.2

## Overview

This document defines the technical architecture for the v0.2 enhancement suite, covering CLI integration, write operations safety, and new component structures.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Analysis    │  │   Quality    │  │    Sync      │      │
│  │     Tab      │  │     Tab      │  │     Tab      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼─────────┐                      │
│                   │  Zustand Stores  │                      │
│                   └────────┬─────────┘                      │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ Tauri IPC
┌────────────────────────────▼─────────────────────────────────┐
│                    Backend (Rust + Tauri)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     CLI      │  │   Quality    │  │    Sync      │      │
│  │  Integration │  │   Analyzer   │  │   Manager    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼─────────┐                      │
│                   │   File System    │                      │
│                   └──────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│               External Systems                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Claude Code  │  │   OpenCode   │  │    Gemini    │      │
│  │     CLI      │  │     CLI      │  │     CLI      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  GH Copilot  │  │  Perplexity  │                        │
│  │     CLI      │  │     MCP      │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

## Multi-CLI Integration Architecture

### CLI Detection System

**Rust Backend** (`src-tauri/src/commands/cli_detector.rs`)

```rust
use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CLIProvider {
    pub name: String,
    pub command: String,
    pub version: Option<String>,
    pub available: bool,
    pub detected_path: Option<String>,
}

#[tauri::command]
pub async fn detect_available_clis() -> Result<Vec<CLIProvider>, String> {
    let cli_candidates = vec![
        ("claude", vec!["--version"]),
        ("opencode", vec!["--version"]),
        ("gemini", vec!["--version"]),
        ("gh", vec!["copilot", "--version"]),
    ];

    let mut providers = Vec::new();

    for (name, version_args) in cli_candidates {
        let mut cmd = Command::new(name);
        cmd.args(&version_args);

        match cmd.output() {
            Ok(output) if output.status.success() => {
                let version = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .map(|s| s.to_string());

                let path = which::which(name)
                    .ok()
                    .map(|p| p.to_string_lossy().to_string());

                providers.push(CLIProvider {
                    name: name.to_string(),
                    command: name.to_string(),
                    version,
                    available: true,
                    detected_path: path,
                });
            }
            _ => {
                providers.push(CLIProvider {
                    name: name.to_string(),
                    command: name.to_string(),
                    version: None,
                    available: false,
                    detected_path: None,
                });
            }
        }
    }

    Ok(providers)
}
```

### CLI Invocation Layer

**Rust Backend** (`src-tauri/src/commands/cli_analyzer.rs`)

```rust
use tokio::process::Command as AsyncCommand;
use tokio::time::{timeout, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub trigger_score: f32,
    pub recommendations: Vec<String>,
    pub example_queries: Vec<String>,
    pub false_positives: Vec<String>,
    pub execution_time_ms: u64,
}

#[tauri::command]
pub async fn analyze_skill_with_cli(
    cli_name: String,
    skill_path: String,
    prompt_template: String,
) -> Result<AnalysisResult, String> {
    let start_time = std::time::Instant::now();

    // Read skill directory contents
    let skill_content = read_skill_directory(&skill_path)?;

    // Format prompt with skill content
    let prompt = format_analysis_prompt(&prompt_template, &skill_content);

    // Build CLI-specific command
    let mut cmd = build_cli_command(&cli_name, &prompt)?;

    // Execute with 30s timeout
    let output = timeout(Duration::from_secs(30), cmd.output())
        .await
        .map_err(|_| "CLI execution timed out".to_string())?
        .map_err(|e| format!("CLI execution failed: {}", e))?;

    // Parse CLI output
    let result = parse_cli_output(&cli_name, &output)?;

    Ok(AnalysisResult {
        trigger_score: result.trigger_score,
        recommendations: result.recommendations,
        example_queries: result.example_queries,
        false_positives: result.false_positives,
        execution_time_ms: start_time.elapsed().as_millis() as u64,
    })
}

fn build_cli_command(cli_name: &str, prompt: &str) -> Result<AsyncCommand, String> {
    let mut cmd = match cli_name {
        "claude" => {
            let mut c = AsyncCommand::new("claude");
            c.args(&["--prompt", prompt]);
            c
        }
        "opencode" => {
            let mut c = AsyncCommand::new("opencode");
            c.args(&[prompt]);
            c
        }
        "gemini" => {
            let mut c = AsyncCommand::new("gemini");
            c.args(&["--prompt", prompt]);
            c
        }
        "gh" => {
            let mut c = AsyncCommand::new("gh");
            c.args(&["copilot", "explain", prompt]);
            c
        }
        _ => return Err(format!("Unsupported CLI: {}", cli_name)),
    };

    cmd.stdin(std::process::Stdio::null());
    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    Ok(cmd)
}

fn read_skill_directory(path: &str) -> Result<String, String> {
    let mut content = String::new();

    // Read SKILL.md
    let skill_md_path = PathBuf::from(path).join("SKILL.md");
    if skill_md_path.exists() {
        content.push_str(&fs::read_to_string(&skill_md_path)
            .map_err(|e| e.to_string())?);
    }

    // List references/
    let refs_path = PathBuf::from(path).join("references");
    if refs_path.exists() {
        content.push_str("\n\n## References Directory:\n");
        for entry in fs::read_dir(&refs_path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            content.push_str(&format!("- {}\n", entry.file_name().to_string_lossy()));
        }
    }

    // List scripts/
    let scripts_path = PathBuf::from(path).join("scripts");
    if scripts_path.exists() {
        content.push_str("\n\n## Scripts Directory:\n");
        for entry in fs::read_dir(&scripts_path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            content.push_str(&format!("- {}\n", entry.file_name().to_string_lossy()));
        }
    }

    Ok(content)
}
```

### Analysis Prompt Templates

**Shared Prompt** (works across CLIs):

```
You are analyzing a Claude Code skill to assess its trigger effectiveness.

Skill directory contents:
{skill_content}

Please analyze this skill and provide:

1. **Trigger Effectiveness Score** (0-100): How likely is this skill to trigger for appropriate user queries?

2. **Top 3 Recommendations**: Specific improvements to make the skill more discoverable.

3. **Example Queries** (3-5): Sample queries that SHOULD trigger this skill.

4. **False Positive Scenarios** (2-3): Queries that might incorrectly trigger this skill.

Format your response as JSON:
{
  "trigger_score": 0-100,
  "recommendations": ["...", "...", "..."],
  "example_queries": ["...", "...", "..."],
  "false_positives": ["...", "..."]
}
```

## Write Operations Safety Architecture

### SafeWriteOperation Pattern

**Rust Backend** (`src-tauri/src/commands/safe_write.rs`)

```rust
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperationType {
    Copy,
    Delete,
    Update,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperationStatus {
    Pending,
    Executing,
    Completed,
    Failed,
    RolledBack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafeWriteOperation {
    pub operation_id: String,
    pub operation_type: OperationType,
    pub target_path: PathBuf,
    pub backup_path: Option<PathBuf>,
    pub timestamp: DateTime<Utc>,
    pub status: OperationStatus,
    pub dry_run: bool,
}

impl SafeWriteOperation {
    pub fn new(
        operation_type: OperationType,
        target_path: PathBuf,
        dry_run: bool,
    ) -> Self {
        Self {
            operation_id: uuid::Uuid::new_v4().to_string(),
            operation_type,
            target_path,
            backup_path: None,
            timestamp: Utc::now(),
            status: OperationStatus::Pending,
            dry_run,
        }
    }

    pub async fn execute(&mut self) -> Result<(), String> {
        if self.dry_run {
            return self.validate();
        }

        self.status = OperationStatus::Executing;

        // Step 1: Create backup
        self.backup_path = Some(self.create_backup().await?);

        // Step 2: Execute operation
        match self.operation_type {
            OperationType::Copy => self.execute_copy().await?,
            OperationType::Delete => self.execute_delete().await?,
            OperationType::Update => self.execute_update().await?,
        }

        // Step 3: Verify integrity
        self.verify_integrity().await?;

        // Step 4: Mark complete
        self.status = OperationStatus::Completed;

        // Step 5: Log to operation history
        log_operation(self.clone()).await?;

        Ok(())
    }

    async fn create_backup(&self) -> Result<PathBuf, String> {
        let timestamp = self.timestamp.format("%Y%m%d_%H%M%S");
        let backup_path = self.target_path
            .with_extension(format!("bak.{}", timestamp));

        if self.target_path.is_file() {
            fs::copy(&self.target_path, &backup_path)
                .map_err(|e| format!("Backup failed: {}", e))?;
        } else if self.target_path.is_dir() {
            copy_dir_recursive(&self.target_path, &backup_path)
                .await
                .map_err(|e| format!("Backup failed: {}", e))?;
        }

        Ok(backup_path)
    }

    async fn execute_copy(&self) -> Result<(), String> {
        // Implementation for copy operation
        Ok(())
    }

    async fn execute_delete(&self) -> Result<(), String> {
        // Implementation for delete operation
        Ok(())
    }

    async fn execute_update(&self) -> Result<(), String> {
        // Implementation for update operation
        Ok(())
    }

    async fn verify_integrity(&self) -> Result<(), String> {
        // Verify operation completed successfully
        if !self.target_path.exists() && self.operation_type != OperationType::Delete {
            return Err("Target path does not exist after operation".to_string());
        }
        Ok(())
    }

    fn validate(&self) -> Result<(), String> {
        // Dry-run validation
        if !self.target_path.exists() {
            return Err(format!("Target path does not exist: {:?}", self.target_path));
        }
        Ok(())
    }

    pub async fn rollback(&self) -> Result<(), String> {
        if let Some(backup) = &self.backup_path {
            if backup.exists() {
                if self.target_path.is_file() {
                    fs::copy(backup, &self.target_path)
                        .map_err(|e| format!("Rollback failed: {}", e))?;
                } else if self.target_path.is_dir() {
                    copy_dir_recursive(backup, &self.target_path)
                        .await
                        .map_err(|e| format!("Rollback failed: {}", e))?;
                }
                return Ok(());
            }
        }
        Err("No backup available for rollback".to_string())
    }
}

#[tauri::command]
pub async fn execute_safe_operation(
    operation_type: OperationType,
    target_path: String,
    dry_run: bool,
) -> Result<SafeWriteOperation, String> {
    let mut operation = SafeWriteOperation::new(
        operation_type,
        PathBuf::from(target_path),
        dry_run,
    );

    operation.execute().await?;

    Ok(operation)
}

#[tauri::command]
pub async fn rollback_operation(operation_id: String) -> Result<(), String> {
    let operation = get_operation_from_history(&operation_id)?;
    operation.rollback().await
}
```

### Operation History Storage

**Rust Backend** (`src-tauri/src/storage/operation_history.rs`)

```rust
use serde_json;
use std::fs;
use std::path::PathBuf;

const MAX_HISTORY_SIZE: usize = 10;

pub struct OperationHistory {
    storage_path: PathBuf,
}

impl OperationHistory {
    pub fn new() -> Self {
        let storage_path = dirs::data_local_dir()
            .unwrap()
            .join("skill-debugger")
            .join("operation_history.json");

        Self { storage_path }
    }

    pub fn add_operation(&self, operation: SafeWriteOperation) -> Result<(), String> {
        let mut history = self.load_history()?;

        history.push(operation);

        // Keep only last MAX_HISTORY_SIZE operations
        if history.len() > MAX_HISTORY_SIZE {
            history.drain(0..history.len() - MAX_HISTORY_SIZE);
        }

        self.save_history(&history)
    }

    pub fn get_operation(&self, operation_id: &str) -> Result<SafeWriteOperation, String> {
        let history = self.load_history()?;
        history
            .into_iter()
            .find(|op| op.operation_id == operation_id)
            .ok_or_else(|| "Operation not found".to_string())
    }

    pub fn get_recent_operations(&self, count: usize) -> Result<Vec<SafeWriteOperation>, String> {
        let history = self.load_history()?;
        let start = history.len().saturating_sub(count);
        Ok(history[start..].to_vec())
    }

    fn load_history(&self) -> Result<Vec<SafeWriteOperation>, String> {
        if !self.storage_path.exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&self.storage_path)
            .map_err(|e| e.to_string())?;

        serde_json::from_str(&content)
            .map_err(|e| e.to_string())
    }

    fn save_history(&self, history: &[SafeWriteOperation]) -> Result<(), String> {
        let json = serde_json::to_string_pretty(history)
            .map_err(|e| e.to_string())?;

        fs::create_dir_all(self.storage_path.parent().unwrap())
            .map_err(|e| e.to_string())?;

        fs::write(&self.storage_path, json)
            .map_err(|e| e.to_string())
    }
}
```

## Frontend Component Architecture

### New Zustand Stores

**Analysis Store** (`src/stores/analysisStore.ts`)

```typescript
import { create } from 'zustand';

interface CLIProvider {
  name: string;
  command: string;
  version?: string;
  available: boolean;
  detectedPath?: string;
}

interface AnalysisResult {
  triggerScore: number;
  recommendations: string[];
  exampleQueries: string[];
  falsePositives: string[];
  executionTimeMs: number;
}

interface AnalysisStore {
  availableCLIs: CLIProvider[];
  selectedCLI: string | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;

  loadAvailableCLIs: () => Promise<void>;
  selectCLI: (name: string) => void;
  analyzeSkill: (skillPath: string) => Promise<void>;
  clearResult: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  availableCLIs: [],
  selectedCLI: null,
  isAnalyzing: false,
  analysisResult: null,
  error: null,

  loadAvailableCLIs: async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const clis = await invoke<CLIProvider[]>('detect_available_clis');
      set({ availableCLIs: clis });

      // Auto-select first available CLI
      const available = clis.find(cli => cli.available);
      if (available) {
        set({ selectedCLI: available.name });
      }
    } catch (error) {
      set({ error: String(error) });
    }
  },

  selectCLI: (name) => {
    set({ selectedCLI: name, analysisResult: null, error: null });
  },

  analyzeSkill: async (skillPath) => {
    const { selectedCLI } = get();
    if (!selectedCLI) {
      set({ error: 'No CLI selected' });
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke<AnalysisResult>('analyze_skill_with_cli', {
        cliName: selectedCLI,
        skillPath,
        promptTemplate: ANALYSIS_PROMPT_TEMPLATE,
      });
      set({ analysisResult: result, isAnalyzing: false });
    } catch (error) {
      set({ error: String(error), isAnalyzing: false });
    }
  },

  clearResult: () => {
    set({ analysisResult: null, error: null });
  },
}));

const ANALYSIS_PROMPT_TEMPLATE = `...`; // From earlier section
```

**Sync Store** (`src/stores/syncStore.ts`)

```typescript
import { create } from 'zustand';

interface SkillDiff {
  skillName: string;
  inClaude: boolean;
  inOpenCode: boolean;
  different: boolean;
  claudePath?: string;
  openCodePath?: string;
}

interface SyncOperation {
  operationId: string;
  type: 'copy' | 'delete' | 'update';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  targetPath: string;
  backupPath?: string;
}

interface SyncStore {
  skillDiffs: SkillDiff[];
  operations: SyncOperation[];
  isLoading: boolean;
  error: string | null;

  loadSkillDiffs: () => Promise<void>;
  copySkill: (from: string, to: string, dryRun: boolean) => Promise<void>;
  rollbackOperation: (operationId: string) => Promise<void>;
}

export const useSyncStore = create<SyncStore>((set) => ({
  skillDiffs: [],
  operations: [],
  isLoading: false,
  error: null,

  loadSkillDiffs: async () => {
    set({ isLoading: true });
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const diffs = await invoke<SkillDiff[]>('get_skill_diffs');
      set({ skillDiffs: diffs, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  copySkill: async (from, to, dryRun) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const operation = await invoke<SyncOperation>('execute_safe_operation', {
        operationType: 'Copy',
        targetPath: to,
        dryRun,
      });
      set((state) => ({
        operations: [...state.operations, operation],
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  rollbackOperation: async (operationId) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('rollback_operation', { operationId });
      set((state) => ({
        operations: state.operations.map(op =>
          op.operationId === operationId
            ? { ...op, status: 'failed' }
            : op
        ),
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },
}));
```

## Performance Considerations

### CLI Execution
- **Timeout**: 30s max per CLI call
- **Caching**: Cache CLI detection results for session
- **Concurrency**: Limit to 1 concurrent CLI analysis

### File Operations
- **Streaming**: Use streaming for large file reads
- **Batch Operations**: Group multiple file ops into transactions
- **Progress**: Show progress for operations >1s

### UI Responsiveness
- **Debouncing**: 300ms for trigger tester input
- **Virtual Scrolling**: For large skill lists
- **Lazy Loading**: Load tabs on-demand

## Security Considerations

### CLI Injection Prevention
- Never pass unsanitized user input to CLI commands
- Use structured arguments, not shell strings
- Whitelist allowed CLI executables

### File System Safety
- Validate all paths before operations
- Prevent directory traversal attacks
- Require user confirmation for all writes
- Automatic backups before modifications

### Data Integrity
- Hash verification after copy operations
- Rollback on any integrity check failure
- Audit log of all write operations

---

**Document Version**: 1.0
**Last Updated**: 2025-01-12
**Status**: Ready for Implementation
