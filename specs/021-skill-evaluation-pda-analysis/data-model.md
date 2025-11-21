# Data Model: Feature 021 - Skill Evaluation & PDA Analysis

**Date**: 2025-11-18

---

## Overview

This document defines all data structures for the Skill Evaluation & PDA Analysis feature, covering both Rust backend models and TypeScript frontend types.

---

## Rust Backend Models

**Location**: `src-tauri/src/models/analysis.rs`

### Core Analysis Types

```rust
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Main analysis result container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillAnalysisResult {
    /// Unique identifier for this analysis (UUID v4)
    pub analysis_id: String,

    /// Skill directory name (e.g., "my-skill")
    pub skill_name: String,

    /// Absolute path to SKILL.md file
    pub skill_path: String,

    /// Analysis start timestamp (UTC)
    pub timestamp: DateTime<Utc>,

    /// Current analysis status
    pub status: AnalysisStatus,

    /// Progress percentage (0-100)
    pub progress: u8,

    /// Spec compliance results (FR-001)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spec_compliance: Option<SpecCompliance>,

    /// PDA analysis results (FR-002, FR-003)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pda_analysis: Option<PDAAnalysis>,

    /// Security review results (FR-004)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security_review: Option<SecurityReview>,

    /// Trigger keyword suggestions (FR-005)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger_suggestions: Option<Vec<TriggerSuggestion>>,

    /// Link validation results (FR-006)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub link_validation: Option<LinkValidation>,

    /// Error message if analysis failed
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// Analysis execution status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AnalysisStatus {
    /// Analysis is currently running
    Running,

    /// Analysis completed successfully
    Completed,

    /// Analysis failed with error
    Failed,
}
```

### Spec Compliance Models (FR-001)

```rust
/// Anthropic Skills Specification compliance results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecCompliance {
    /// Overall compliance score (0-100, 100=fully compliant)
    pub score: u8,

    /// List of specification violations (errors)
    pub violations: Vec<Violation>,

    /// List of warnings (non-critical issues)
    pub warnings: Vec<Warning>,
}

/// A specification violation (error)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    /// Machine-readable rule identifier (e.g., "missing_required_field")
    pub rule: String,

    /// Human-readable error message
    pub message: String,

    /// Optional suggestion for fixing the violation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fix_suggestion: Option<String>,

    /// Line number in SKILL.md where violation occurs
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_number: Option<usize>,
}

/// A specification warning (non-critical)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warning {
    /// Machine-readable rule identifier
    pub rule: String,

    /// Human-readable warning message
    pub message: String,

    /// Optional recommendation for improvement
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recommendation: Option<String>,
}
```

### PDA Analysis Models (FR-002, FR-003)

```rust
/// Progressive Disclosure Architecture analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PDAAnalysis {
    /// PDA compliance score (0-100, 100=optimal)
    pub score: u8,

    /// Estimated token count for entire skill
    pub token_estimate: usize,

    /// Token breakdown by PDA tier
    pub tier_breakdown: TierBreakdown,

    /// Recommendations for improving PDA compliance
    pub recommendations: Vec<String>,

    /// Suggested structural changes
    pub suggested_structure: Vec<String>,
}

/// Token distribution across PDA tiers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierBreakdown {
    /// Tokens in frontmatter (metadata tier)
    pub metadata_tokens: usize,

    /// Tokens in main SKILL.md content (orchestrator tier)
    pub orchestrator_tokens: usize,

    /// Tokens in references/ directory (resource tier)
    pub resource_tokens: usize,
}
```

### Security Review Models (FR-004)

```rust
/// Permissions security analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityReview {
    /// Security score (0-100, 100=most secure)
    pub score: u8,

    /// Permissions declared but never used in skill
    pub unused_permissions: Vec<String>,

    /// High-risk permission combinations detected
    pub high_risk_permissions: Vec<RiskFlag>,

    /// Minimum required permissions for skill functionality
    pub minimum_required: Vec<String>,
}

/// A security risk flag
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFlag {
    /// Permission name (e.g., "Bash", "Write")
    pub permission: String,

    /// Severity level
    pub risk_level: RiskLevel,

    /// Explanation of why this is risky
    pub explanation: String,

    /// Optional mitigation advice
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mitigation: Option<String>,
}

/// Risk severity levels
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RiskLevel {
    /// Critical security issue (e.g., dangerouslyDisableSandbox)
    Critical,

    /// High risk (e.g., Bash + Write without constraints)
    High,

    /// Medium risk (e.g., Bash alone)
    Medium,

    /// Low risk (e.g., Edit with constraints)
    Low,
}
```

### Trigger Suggestions Models (FR-005)

```rust
/// A suggested trigger keyword
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerSuggestion {
    /// Suggested keyword
    pub keyword: String,

    /// Relevance score (0-100, 100=highly relevant)
    pub relevance_score: u8,

    /// Explanation of why this keyword is relevant
    pub explanation: String,
}
```

### Link Validation Models (FR-006)

```rust
/// Link validation results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkValidation {
    /// Total number of links found in skill
    pub total_links: usize,

    /// Number of valid (reachable) links
    pub valid_links: usize,

    /// List of broken links
    pub broken_links: Vec<BrokenLink>,
}

/// A broken link
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenLink {
    /// URL or file path that is broken
    pub url: String,

    /// Line number in SKILL.md where link appears
    pub line_number: usize,

    /// Error message (e.g., "404 Not Found", "File not found")
    pub error: String,
}
```

### CLI Detection Models (FR-008)

```rust
/// CLI tool detection results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CLIDetectionResult {
    /// Whether Claude CLI is available
    pub claude_available: bool,

    /// Whether OpenCode CLI is available
    pub opencode_available: bool,

    /// Path to claude binary (if available)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub claude_path: Option<String>,

    /// Path to opencode binary (if available)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opencode_path: Option<String>,
}
```

### Internal Cache Models

```rust
/// Cached analysis result with expiry
pub(crate) struct CachedResult {
    /// The analysis result
    pub result: SkillAnalysisResult,

    /// Expiry timestamp (24 hours from creation)
    pub expires_at: DateTime<Utc>,
}
```

---

## TypeScript Frontend Types

**Location**: `src/types/analysis.ts`

### Core Analysis Types

```typescript
/**
 * Analysis execution status
 */
export type AnalysisStatus = 'running' | 'completed' | 'failed';

/**
 * Main analysis result container
 */
export interface SkillAnalysisResult {
  /** Unique identifier for this analysis (UUID v4) */
  analysis_id: string;

  /** Skill directory name */
  skill_name: string;

  /** Absolute path to SKILL.md */
  skill_path: string;

  /** Analysis start timestamp (ISO 8601) */
  timestamp: string;

  /** Current analysis status */
  status: AnalysisStatus;

  /** Progress percentage (0-100) */
  progress: number;

  /** Spec compliance results (FR-001) */
  spec_compliance?: SpecCompliance;

  /** PDA analysis results (FR-002, FR-003) */
  pda_analysis?: PDAAnalysis;

  /** Security review results (FR-004) */
  security_review?: SecurityReview;

  /** Trigger keyword suggestions (FR-005) */
  trigger_suggestions?: TriggerSuggestion[];

  /** Link validation results (FR-006) */
  link_validation?: LinkValidation;

  /** Error message if analysis failed */
  error?: string;
}
```

### Spec Compliance Types (FR-001)

```typescript
/**
 * Anthropic Skills Specification compliance results
 */
export interface SpecCompliance {
  /** Overall compliance score (0-100) */
  score: number;

  /** List of specification violations */
  violations: Violation[];

  /** List of warnings */
  warnings: Warning[];
}

/**
 * A specification violation
 */
export interface Violation {
  /** Machine-readable rule identifier */
  rule: string;

  /** Human-readable error message */
  message: string;

  /** Optional fix suggestion */
  fix_suggestion?: string;

  /** Line number where violation occurs */
  line_number?: number;
}

/**
 * A specification warning
 */
export interface Warning {
  /** Machine-readable rule identifier */
  rule: string;

  /** Human-readable warning message */
  message: string;

  /** Optional recommendation */
  recommendation?: string;
}
```

### PDA Analysis Types (FR-002, FR-003)

```typescript
/**
 * Progressive Disclosure Architecture analysis results
 */
export interface PDAAnalysis {
  /** PDA compliance score (0-100) */
  score: number;

  /** Estimated token count */
  token_estimate: number;

  /** Token breakdown by tier */
  tier_breakdown: TierBreakdown;

  /** Recommendations for improvement */
  recommendations: string[];

  /** Suggested structural changes */
  suggested_structure: string[];
}

/**
 * Token distribution across PDA tiers
 */
export interface TierBreakdown {
  /** Tokens in frontmatter */
  metadata_tokens: number;

  /** Tokens in main SKILL.md */
  orchestrator_tokens: number;

  /** Tokens in references/ */
  resource_tokens: number;
}
```

### Security Review Types (FR-004)

```typescript
/**
 * Risk severity levels
 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Permissions security analysis results
 */
export interface SecurityReview {
  /** Security score (0-100) */
  score: number;

  /** Unused permissions */
  unused_permissions: string[];

  /** High-risk permission combinations */
  high_risk_permissions: RiskFlag[];

  /** Minimum required permissions */
  minimum_required: string[];
}

/**
 * A security risk flag
 */
export interface RiskFlag {
  /** Permission name */
  permission: string;

  /** Severity level */
  risk_level: RiskLevel;

  /** Explanation of risk */
  explanation: string;

  /** Optional mitigation advice */
  mitigation?: string;
}
```

### Trigger Suggestions Types (FR-005)

```typescript
/**
 * A suggested trigger keyword
 */
export interface TriggerSuggestion {
  /** Suggested keyword */
  keyword: string;

  /** Relevance score (0-100) */
  relevance_score: number;

  /** Explanation of relevance */
  explanation: string;
}
```

### Link Validation Types (FR-006)

```typescript
/**
 * Link validation results
 */
export interface LinkValidation {
  /** Total links found */
  total_links: number;

  /** Valid (reachable) links */
  valid_links: number;

  /** Broken links */
  broken_links: BrokenLink[];
}

/**
 * A broken link
 */
export interface BrokenLink {
  /** Broken URL or file path */
  url: string;

  /** Line number in SKILL.md */
  line_number: number;

  /** Error message */
  error: string;
}
```

### CLI Detection Types (FR-008)

```typescript
/**
 * CLI tool detection results
 */
export interface CLIDetectionResult {
  /** Whether Claude CLI is available */
  claude_available: boolean;

  /** Whether OpenCode CLI is available */
  opencode_available: boolean;

  /** Path to claude binary */
  claude_path?: string;

  /** Path to opencode binary */
  opencode_path?: string;
}
```

---

## Validation Rules

### SkillAnalysisResult

- `analysis_id`: Must be valid UUID v4
- `progress`: Must be 0-100 inclusive
- `status`: Must be one of: running, completed, failed
- `timestamp`: Must be valid ISO 8601 DateTime
- All scores (spec_compliance.score, pda_analysis.score, security_review.score): Must be 0-100 inclusive
- `relevance_score` in TriggerSuggestion: Must be 0-100 inclusive

### State Transitions

Valid status transitions:

1. `null` → `running` (analysis started)
2. `running` → `completed` (analysis succeeded)
3. `running` → `failed` (analysis error)

Invalid transitions (enforced by backend):

- `completed` → `running` (cannot restart)
- `failed` → `running` (cannot restart)
- `null` → `completed` (must go through running)

### Optional Fields

Fields that may be `null`/`undefined`:

- All analysis results (spec_compliance, pda_analysis, etc.) are optional until analysis completes
- `error` is only present when `status === 'failed'`
- `fix_suggestion`, `line_number`, `recommendation`, `mitigation` are optional detail fields

---

## Relationship Diagram

```
SkillAnalysisResult
├── analysis_id: String (UUID v4)
├── skill_name: String
├── skill_path: String
├── timestamp: DateTime
├── status: AnalysisStatus (enum)
├── progress: u8 (0-100)
├── spec_compliance?: SpecCompliance
│   ├── score: u8 (0-100)
│   ├── violations: Vec<Violation>
│   │   ├── rule: String
│   │   ├── message: String
│   │   ├── fix_suggestion?: String
│   │   └── line_number?: usize
│   └── warnings: Vec<Warning>
│       ├── rule: String
│       ├── message: String
│       └── recommendation?: String
├── pda_analysis?: PDAAnalysis
│   ├── score: u8 (0-100)
│   ├── token_estimate: usize
│   ├── tier_breakdown: TierBreakdown
│   │   ├── metadata_tokens: usize
│   │   ├── orchestrator_tokens: usize
│   │   └── resource_tokens: usize
│   ├── recommendations: Vec<String>
│   └── suggested_structure: Vec<String>
├── security_review?: SecurityReview
│   ├── score: u8 (0-100)
│   ├── unused_permissions: Vec<String>
│   ├── high_risk_permissions: Vec<RiskFlag>
│   │   ├── permission: String
│   │   ├── risk_level: RiskLevel (enum)
│   │   ├── explanation: String
│   │   └── mitigation?: String
│   └── minimum_required: Vec<String>
├── trigger_suggestions?: Vec<TriggerSuggestion>
│   ├── keyword: String
│   ├── relevance_score: u8 (0-100)
│   └── explanation: String
├── link_validation?: LinkValidation
│   ├── total_links: usize
│   ├── valid_links: usize
│   └── broken_links: Vec<BrokenLink>
│       ├── url: String
│       ├── line_number: usize
│       └── error: String
└── error?: String
```

---

## Serialization Notes

### Rust → JSON (serde)

- Enums serialize with `#[serde(rename_all = "lowercase")]` (e.g., `Running` → `"running"`)
- Optional fields use `#[serde(skip_serializing_if = "Option::is_none")]` to omit nulls
- DateTime serializes to ISO 8601 string with chrono's serde feature

### JSON → TypeScript

- Rust enums map to TypeScript union types (e.g., `'running' | 'completed' | 'failed'`)
- Optional fields map to `field?: Type` syntax
- DateTime strings remain strings in TypeScript (parsed by Date constructor if needed)

---

**Status**: ✅ Complete
**Next Step**: Create contracts/ API definitions
