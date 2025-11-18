# Implementation Plan: Feature 021 - Skill Evaluation & PDA Analysis

**Branch**: `021-skill-evaluation-pda-analysis` | **Date**: 2025-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Implement AI-powered skill analysis system that validates Claude Code skills against Anthropic specifications, scores Progressive Disclosure Architecture (PDA) compliance (0-100), reviews security permissions, suggests trigger keywords, and validates reference links. Uses async architecture with Claude/OpenCode CLI integration, 2-second polling intervals, and 24-hour result caching to support up to 5 concurrent analyses.

**Technical Approach**: Rust backend with tokio async orchestration, specialized analyzer modules, CLI executor with fallback chain (claude → opencode → installation guide), React frontend with Zustand state management, reuses Feature 016 tab infrastructure and Feature 020 skill scanner patterns.

---

## Technical Context

**Language/Version**: Rust 1.75+ (backend), TypeScript 5.8.3 strict mode (frontend)
**Primary Dependencies**:

- Backend: tokio 1.35 (async runtime), serde_json 1.0 (CLI response parsing), reqwest 0.11 (link validation), tauri 2.x (commands)
- Frontend: React 19.1.0, Zustand 5.0.8 (state), TailwindCSS 4.1.17 (styling)

**Storage**: In-memory cache with 24-hour TTL (DashMap for thread-safe concurrent access)
**Testing**: cargo test (Rust >80% coverage), Vitest 2.1.8 + V8 provider (TypeScript >80%), Playwright (E2E)
**Target Platform**: Cross-platform desktop (macOS, Linux, Windows via Tauri 2.x)
**Project Type**: Desktop application (Tauri hybrid - Rust backend, React frontend)
**Performance Goals**:

- Analysis completion: <60s for 95% of skills
- UI polling: 2-second intervals
- CLI timeout: 30 seconds per call
- Cache hit rate: >70%
- Concurrent analyses: 5 simultaneous

**Constraints**:

- No network requests except link validation (FR-006) and CLI execution
- Read-only file access (constitution Principle III)
- > 80% test coverage (constitution Principle VII)
- Cross-platform CLI detection (claude/opencode availability varies)

**Scale/Scope**:

- Typical skills: 2000-5000 tokens
- Large skills: up to 10,000 tokens
- User skill collections: 20-50 skills typical, 200 max
- Analysis cache: 50 results max in memory

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Principle I: Native Desktop Experience

- **Compliance**: Uses Tauri 2.x native framework, async polling prevents UI blocking
- **Validation**: Progress indicators maintain 60fps, analysis runs in background tokio tasks

### ✅ Principle II: Developer-First Design

- **Compliance**: Analysis features serve skill debugging (validation, PDA scoring, security review)
- **Validation**: Results presented in scannable cards, keyboard-accessible, copy-to-clipboard support

### ✅ Principle III: Read-Only Safety

- **Compliance**: All analysis operations are read-only (no file modifications)
- **Validation**: CLI calls use read-only flags, no write permissions requested

### ✅ Principle IV: Cross-Platform Consistency

- **Compliance**: CLI detection works across platforms, file path handling respects OS conventions
- **Validation**: Tests run on macOS, Linux, Windows in CI

### ✅ Principle V: Performance and Efficiency

- **Compliance**: Async architecture prevents blocking, caching reduces redundant work
- **Validation**: Performance metrics:
  - Analysis: <60s target (NFR-001)
  - Polling overhead: <10ms per cycle
  - Memory: <50MB for cache (50 analyses × ~1MB each)

### ✅ Principle VI: Visualization-First Understanding

- **Compliance**: Future features (022, 023) will add mind maps and diagrams
- **Note**: This feature (021) focuses on text-based analysis; visualization comes in F022/F023

### ✅ Principle VII: Testability and Quality

- **Compliance**: >80% coverage required for all new modules
- **Validation**:
  - Unit tests: spec_validator.rs, pda_scorer.rs, permissions_analyzer.rs, trigger_analyzer.rs, cli_executor.rs
  - Integration tests: Full analysis workflow with mocked CLI
  - E2E tests: User interaction with Playwright

**GATE STATUS**: ✅ **PASS** - All principles satisfied or explicitly deferred (Principle VI visualization in F022/F023)

---

## Project Structure

### Documentation (this feature)

```text
specs/021-skill-evaluation-pda-analysis/
├── spec.md              # User stories, FRs, NFRs, success criteria
├── SPEC_SUMMARY.md      # 25-point executive summary (uploaded to Notion)
├── plan.md              # This file (technical implementation plan)
├── research.md          # Phase 0 output: Technology decisions and patterns
├── data-model.md        # Phase 1 output: Rust/TypeScript data structures
├── quickstart.md        # Phase 1 output: Developer quick reference
├── contracts/           # Phase 1 output: API contracts (Tauri commands)
│   ├── analysis.yaml    # start_skill_analysis, get_analysis_status commands
│   └── types.yaml       # Shared types (SkillAnalysisResult, etc.)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src-tauri/                           # Rust backend
├── src/
│   ├── commands/
│   │   ├── skill_analysis.rs        # NEW: Async orchestrator (FR-007)
│   │   ├── skill_scanner.rs         # EXISTING: Reused from F020
│   │   └── diagram.rs               # EXISTING: Reused async pattern from F016
│   ├── analyzers/                   # NEW module
│   │   ├── mod.rs                   # Module exports
│   │   ├── spec_validator.rs        # NEW: FR-001 implementation
│   │   ├── pda_scorer.rs            # NEW: FR-002, FR-003 implementation
│   │   ├── permissions_analyzer.rs  # NEW: FR-004 implementation
│   │   ├── trigger_analyzer.rs      # NEW: FR-005 implementation
│   │   └── link_validator.rs        # NEW: FR-006 implementation
│   ├── utils/
│   │   ├── cli_executor.rs          # NEW: FR-008 CLI detection/execution
│   │   ├── yaml_parser.rs           # EXISTING: Reused from F020
│   │   └── mod.rs                   # Module exports
│   ├── models/
│   │   ├── analysis.rs              # NEW: SkillAnalysisResult, PDAAnalysis, etc.
│   │   ├── skill.rs                 # EXISTING: Reused from F020
│   │   └── mod.rs                   # Module exports
│   └── lib.rs                       # Register new commands
└── tests/
    ├── unit/
    │   ├── spec_validator_test.rs   # NEW: FR-001 tests
    │   ├── pda_scorer_test.rs       # NEW: FR-002/003 tests
    │   ├── permissions_test.rs      # NEW: FR-004 tests
    │   ├── trigger_analyzer_test.rs # NEW: FR-005 tests
    │   └── cli_executor_test.rs     # NEW: FR-008 tests
    └── integration/
        └── analysis_workflow_test.rs # NEW: Full workflow tests

src/                                  # React frontend
├── components/
│   ├── analysis/                    # NEW directory
│   │   ├── EvaluationTab.tsx        # Main tab component
│   │   ├── AnalysisProgress.tsx     # Progress indicator (polling)
│   │   ├── SpecComplianceCard.tsx   # FR-001 UI
│   │   ├── PDAScoreCard.tsx         # FR-002/003 UI
│   │   ├── SecurityCard.tsx         # FR-004 UI
│   │   ├── TriggerSuggestionsCard.tsx # FR-005 UI
│   │   └── CLIInstallGuide.tsx      # FR-008 fallback UI
│   └── DiagramView.tsx              # EXISTING: Tab pattern from F016
├── stores/
│   ├── useAnalysisStore.ts          # NEW: Analysis state management
│   └── useSkillStore.ts             # EXISTING: Reused from F020
├── types/
│   ├── analysis.ts                  # NEW: TypeScript types
│   └── skill.ts                     # EXISTING: Reused
└── hooks/
    └── useAnalysis.ts               # NEW: Analysis polling hook

tests/                                # Frontend tests
├── unit/
│   ├── stores/
│   │   └── useAnalysisStore.test.ts # NEW: Store tests
│   └── hooks/
│       └── useAnalysis.test.ts      # NEW: Hook tests
└── e2e/
    └── skill-analysis.spec.ts       # NEW: Playwright E2E tests
```

**Structure Decision**: Desktop application structure (Tauri hybrid). Backend uses modular analyzers/ directory for clean separation of concerns (spec validation, PDA scoring, security analysis, etc.). Frontend follows Feature 016 tab pattern with new analysis/ subdirectory. Reuses existing skill scanner (F020) and async patterns (F016).

---

## Complexity Tracking

> **Constitution Check violations requiring justification**

**No violations detected.** Feature aligns with all constitutional principles:

- Native desktop: Tauri 2.x framework
- Developer-first: Debugging/optimization features
- Read-only: No file modifications
- Cross-platform: CLI detection handles platform differences
- Performance: Async architecture, caching, <60s target
- Testability: >80% coverage requirement

**Complexity justification not required.**

---

## Phase 0: Research & Technology Decisions

### Research Tasks

1. **CLI Integration Patterns** (FR-008)
   - Research: Rust std::process::Command vs tokio::process::Command
   - Decision: Use tokio::process::Command for non-blocking execution
   - Rationale: Prevents CLI timeouts from blocking other analyses

2. **JSON Response Parsing** (FR-002)
   - Research: Structured vs unstructured Claude CLI output
   - Decision: Use `--output-format json` flag, parse with serde_json
   - Rationale: Reliable parsing, structured error handling

3. **Async State Management** (FR-007)
   - Research: DashMap vs tokio::sync::RwLock<HashMap>
   - Decision: DashMap for lock-free concurrent cache access
   - Rationale: Better performance under concurrent load (5 analyses)

4. **CLI Detection Best Practices** (FR-008)
   - Research: `which` command vs std::env::var("PATH") scanning
   - Decision: Use `which` command via std::process::Command
   - Rationale: Cross-platform, respects PATH configuration

5. **Frontend Polling Pattern** (FR-007)
   - Research: setInterval vs React Query vs custom hook
   - Decision: Custom useAnalysis hook with setInterval + cleanup
   - Rationale: Simple, predictable, no external dependencies

**Output**: Research findings documented in `research.md` (generated below)

---

## Phase 1: Design & Contracts

### Data Models

**Rust Backend** (`src-tauri/src/models/analysis.rs`):

```rust
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillAnalysisResult {
    pub analysis_id: String,          // UUID v4
    pub skill_name: String,            // Skill directory name
    pub skill_path: String,            // Absolute path to SKILL.md
    pub timestamp: DateTime<Utc>,     // Analysis start time
    pub status: AnalysisStatus,       // running | completed | failed
    pub progress: u8,                 // 0-100
    pub spec_compliance: Option<SpecCompliance>,
    pub pda_analysis: Option<PDAAnalysis>,
    pub security_review: Option<SecurityReview>,
    pub trigger_suggestions: Option<Vec<TriggerSuggestion>>,
    pub link_validation: Option<LinkValidation>,
    pub error: Option<String>,        // Error message if failed
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AnalysisStatus {
    Running,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecCompliance {
    pub score: u8,                    // 0-100
    pub violations: Vec<Violation>,
    pub warnings: Vec<Warning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    pub rule: String,                 // e.g., "missing_required_field"
    pub message: String,              // Human-readable error
    pub fix_suggestion: Option<String>,
    pub line_number: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warning {
    pub rule: String,
    pub message: String,
    pub recommendation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PDAAnalysis {
    pub score: u8,                    // 0-100
    pub token_estimate: usize,        // Total tokens in skill
    pub tier_breakdown: TierBreakdown,
    pub recommendations: Vec<String>,
    pub suggested_structure: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierBreakdown {
    pub metadata_tokens: usize,       // Frontmatter size
    pub orchestrator_tokens: usize,   // Main skill.md content
    pub resource_tokens: usize,       // references/ directory
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityReview {
    pub score: u8,                    // 0-100 (100=most secure)
    pub unused_permissions: Vec<String>,
    pub high_risk_permissions: Vec<RiskFlag>,
    pub minimum_required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFlag {
    pub permission: String,           // e.g., "Bash"
    pub risk_level: RiskLevel,        // critical | high | medium | low
    pub explanation: String,
    pub mitigation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RiskLevel {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerSuggestion {
    pub keyword: String,
    pub relevance_score: u8,          // 0-100
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkValidation {
    pub total_links: usize,
    pub valid_links: usize,
    pub broken_links: Vec<BrokenLink>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenLink {
    pub url: String,
    pub line_number: usize,
    pub error: String,                // e.g., "404 Not Found"
}
```

**TypeScript Frontend** (`src/types/analysis.ts`):

```typescript
export type AnalysisStatus = 'running' | 'completed' | 'failed';

export interface SkillAnalysisResult {
  analysis_id: string;
  skill_name: string;
  skill_path: string;
  timestamp: string; // ISO 8601 DateTime
  status: AnalysisStatus;
  progress: number; // 0-100
  spec_compliance?: SpecCompliance;
  pda_analysis?: PDAAnalysis;
  security_review?: SecurityReview;
  trigger_suggestions?: TriggerSuggestion[];
  link_validation?: LinkValidation;
  error?: string;
}

export interface SpecCompliance {
  score: number;
  violations: Violation[];
  warnings: Warning[];
}

export interface Violation {
  rule: string;
  message: string;
  fix_suggestion?: string;
  line_number?: number;
}

export interface Warning {
  rule: string;
  message: string;
  recommendation?: string;
}

export interface PDAAnalysis {
  score: number;
  token_estimate: number;
  tier_breakdown: TierBreakdown;
  recommendations: string[];
  suggested_structure: string[];
}

export interface TierBreakdown {
  metadata_tokens: number;
  orchestrator_tokens: number;
  resource_tokens: number;
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface SecurityReview {
  score: number;
  unused_permissions: string[];
  high_risk_permissions: RiskFlag[];
  minimum_required: string[];
}

export interface RiskFlag {
  permission: string;
  risk_level: RiskLevel;
  explanation: string;
  mitigation?: string;
}

export interface TriggerSuggestion {
  keyword: string;
  relevance_score: number;
  explanation: string;
}

export interface LinkValidation {
  total_links: number;
  valid_links: number;
  broken_links: BrokenLink[];
}

export interface BrokenLink {
  url: string;
  line_number: number;
  error: string;
}
```

### API Contracts (Tauri Commands)

**Contract File**: `contracts/analysis.yaml`

```yaml
commands:
  start_skill_analysis:
    description: Start asynchronous skill analysis
    input:
      skill_name: string # Skill directory name (e.g., "my-skill")
    output:
      analysis_id: string # UUID v4 for polling
    errors:
      - SkillNotFound: Skill directory does not exist
      - AnalysisInProgress: Analysis already running for this skill
      - MaxConcurrentReached: Cannot start (5 concurrent limit)

  get_analysis_status:
    description: Poll for analysis progress and results
    input:
      analysis_id: string # UUID from start_skill_analysis
    output:
      result: SkillAnalysisResult # Complete result object
    errors:
      - AnalysisNotFound: Invalid or expired analysis_id

  cancel_analysis:
    description: Cancel a running analysis
    input:
      analysis_id: string
    output:
      success: boolean
    errors:
      - AnalysisNotFound: Invalid analysis_id
      - AnalysisCompleted: Already finished

  detect_cli:
    description: Detect available CLI tools (claude/opencode)
    input: null
    output:
      claude_available: boolean
      opencode_available: boolean
      claude_path: string | null
      opencode_path: string | null
    errors: null

types:
  # Reference: See data-model.md for complete type definitions
  # All types defined in src-tauri/src/models/analysis.rs
```

**Rust Command Signatures** (`src-tauri/src/commands/skill_analysis.rs`):

```rust
#[tauri::command]
pub async fn start_skill_analysis(skill_name: String) -> Result<String, String> {
    // Returns analysis_id (UUID v4)
}

#[tauri::command]
pub async fn get_analysis_status(analysis_id: String) -> Result<SkillAnalysisResult, String> {
    // Returns current analysis state
}

#[tauri::command]
pub async fn cancel_analysis(analysis_id: String) -> Result<bool, String> {
    // Returns success status
}

#[tauri::command]
pub async fn detect_cli() -> Result<CLIDetectionResult, String> {
    // Returns CLI availability
}
```

### Frontend Store Contract

**Zustand Store** (`src/stores/useAnalysisStore.ts`):

```typescript
interface AnalysisStore {
  // State
  currentAnalysis: SkillAnalysisResult | null;
  analyses: Map<string, SkillAnalysisResult>; // analysis_id -> result
  pollingActive: boolean;
  cliAvailable: { claude: boolean; opencode: boolean };

  // Actions
  startAnalysis: (skillName: string) => Promise<string>; // Returns analysis_id
  pollStatus: (analysisId: string) => void; // Start polling
  stopPolling: () => void; // Stop polling
  cancelAnalysis: (analysisId: string) => Promise<void>;
  detectCLI: () => Promise<void>;
  clearAnalysis: (analysisId: string) => void;
  reset: () => void; // Clear all state
}
```

---

## Phase 2: Implementation Sequence

_Note: Phase 2 breakdown will be generated by `/speckit.tasks` command (not part of /speckit.plan)_

**High-Level Sequence** (from spec.md):

1. **Phase 1**: Spec Validation (2 days) - FR-001
2. **Phase 2**: CLI Integration (3 days) - FR-008, FR-002 setup
3. **Phase 3**: PDA Scoring (3 days) - FR-002, FR-003
4. **Phase 4**: Security & Triggers (2 days) - FR-004, FR-005
5. **Phase 5**: Frontend Integration (2 days) - FR-007, all UI components

**Total**: 12 days

---

## Testing Strategy

### Unit Tests (Rust) - >80% Coverage Required

**spec_validator.rs** (FR-001):

- Test missing required fields (name, description)
- Test malformed frontmatter delimiters
- Test invalid allowed-tools syntax
- Test UTF-8 handling
- Test edge cases (empty files, no frontmatter)

**pda_scorer.rs** (FR-002, FR-003):

- Test scoring formula with known inputs
- Test token counting accuracy
- Test tier breakdown calculation
- Test CLI response parsing (mocked)
- Test error handling for malformed JSON

**permissions_analyzer.rs** (FR-004):

- Test unused permission detection
- Test high-risk combination flagging (Bash + Write)
- Test security scoring edge cases (no tools, wildcard, dangerouslyDisableSandbox)
- Test minimum required suggestions

**trigger_analyzer.rs** (FR-005):

- Test keyword extraction from skill content
- Test relevance scoring algorithm
- Test CLI response parsing (mocked)
- Test deduplication with existing triggers

**cli_executor.rs** (FR-008):

- Test CLI detection (claude, opencode, neither)
- Test command execution with timeout
- Test retry logic on transient failures
- Test error message parsing
- Mock all CLI calls (no actual execution in tests)

### Integration Tests (Rust)

**analysis_workflow_test.rs**:

- Test full analysis workflow with real skill files
- Test concurrent analysis handling (5 simultaneous)
- Test cache behavior (hit/miss/expiry)
- Test error propagation from analyzers to orchestrator

### Frontend Tests (Vitest) - >80% Coverage Required

**useAnalysisStore.test.ts**:

- Test startAnalysis action
- Test polling lifecycle (start, update, stop)
- Test concurrent analysis tracking
- Test CLI detection state updates
- Test store reset

**useAnalysis.test.ts** (custom hook):

- Test polling interval (2 seconds)
- Test cleanup on unmount
- Test status updates during polling

### E2E Tests (Playwright)

**skill-analysis.spec.ts**:

- User clicks "Analyze Skill" → sees analysis ID
- Progress bar updates during polling
- Results display in EvaluationTab when complete
- CLI unavailable shows installation guide (mock CLI absence)
- Concurrent analysis: start 2 analyses, both complete

---

## Risk Mitigation

### Risk: CLI Unavailability

**Mitigation**:

- Fallback chain (claude → opencode)
- Clear installation UI with links
- Graceful degradation (FR-008 tests)

### Risk: CLI Timeout

**Mitigation**:

- 30-second timeout enforced
- Retry once with exponential backoff
- User-visible timeout error message

### Risk: Malformed CLI Output

**Mitigation**:

- JSON schema validation with serde_json
- Fallback to partial results if sections fail
- Comprehensive error logging

### Risk: Cache Memory Growth

**Mitigation**:

- LRU eviction policy (50 results max)
- 24-hour TTL
- Manual cache clear option in UI

### Risk: Concurrent Analysis Race Conditions

**Mitigation**:

- DashMap for lock-free cache access
- UUID-based analysis IDs prevent collisions
- tokio task isolation

---

## Success Metrics

- **Test Coverage**: >80% for all new Rust and TypeScript modules
- **Performance**: 95% analyses complete <60s
- **Reliability**: <1% CLI execution failures (excluding user environment issues)
- **Usability**: 2-click analysis start, <1s result display after completion
- **Constitutional Compliance**: All 7 principles satisfied (documented above)

---

## Appendices

### A. CLI Prompt Templates

**PDA Analysis Prompt** (FR-002):

```
You are an expert in Anthropic's Progressive Disclosure Architecture (PDA) for Claude Code skills.

Analyze this skill for PDA compliance:

---
[SKILL_CONTENT]
---

Provide JSON with:
{
  "pda_score": 0-100,
  "token_estimate": number,
  "tier_breakdown": {
    "metadata": { "tokens": number, "content": [...] },
    "orchestrator": { "tokens": number, "content": [...] },
    "resources": { "tokens": number, "content": [...] }
  },
  "recommendations": [
    "Move X to references/ to reduce initial load",
    "Inline Y for faster skill activation"
  ],
  "violations": [...],
  "suggested_structure": [...]
}
```

**Trigger Suggestion Prompt** (FR-005):

```
Analyze this Claude Code skill and suggest trigger keywords:

Existing triggers: [CURRENT_TRIGGERS]

Skill content:
---
[SKILL_CONTENT]
---

Provide JSON with:
{
  "suggestions": [
    {
      "keyword": "string",
      "relevance_score": 0-100,
      "explanation": "why this keyword is relevant"
    }
  ],
  "missing_critical": ["keywords that should definitely be added"]
}
```

### B. References

- Anthropic Skills Specification: https://docs.anthropic.com/en/docs/build-with-claude/claude-code-skills
- Progressive Disclosure Architecture: https://github.com/anthropics/skill-best-practices/blob/main/pda.md
- Feature 016 (Tab Pattern): `specs/016-improved-ui-layout/IMPLEMENTATION_SUMMARY.md`
- Feature 020 (Skill Scanner): `specs/020-test-backfill-critical-paths/IMPLEMENTATION_SUMMARY.md`
- SDD Skill: `~/.claude/skills/sdd/`
- Constitution: `.specify/memory/constitution.md`

---

**Plan Status**: ✅ Complete
**Constitution Check**: ✅ PASS
**Next Step**: Generate `research.md` (Phase 0), then `data-model.md`, `contracts/`, `quickstart.md` (Phase 1)
