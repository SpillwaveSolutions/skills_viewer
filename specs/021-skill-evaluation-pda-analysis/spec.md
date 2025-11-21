# Feature 021: Skill Evaluation & Progressive Disclosure Analysis

**Status**: Draft
**Priority**: P1 (High)
**Target Version**: v0.3.0
**Estimated Effort**: 12 days
**Dependencies**: Feature 016 (Improved UI Layout), Feature 020 (Test Backfill)

---

## Problem Statement

Currently, Skill Debugger provides read-only viewing of Claude Code skills but lacks intelligent analysis capabilities. Users cannot:

1. **Validate Spec Compliance**: No automated validation against [Anthropic Skills Specification](https://docs.anthropic.com/en/docs/build-with-claude/claude-code-skills)
2. **Assess Architecture Quality**: No Progressive Disclosure Architecture (PDA) scoring
3. **Review Security**: No permissions security analysis
4. **Optimize Triggers**: No trigger keyword suggestions based on skill content
5. **Verify References**: No validation of reference links and paths

This creates friction for skill developers who must manually review skills for compliance, architectural quality, and security issues.

## User Stories

### US-021-001: Spec Compliance Validation

**As a** skill developer
**I want** automated validation against Anthropic Skills Specification
**So that** I can ensure my skill follows official guidelines without manual review

**Acceptance Criteria**:

- System validates required frontmatter fields (name, description)
- System checks skill.md structure (triggers, usage-notes sections)
- System validates allowed-tools permissions syntax
- System provides actionable error messages for violations
- Results display in new "Evaluation" tab

### US-021-002: Progressive Disclosure Architecture Analysis

**As a** skill developer
**I want** PDA scoring with Claude/OpenCode CLI intelligence
**So that** I can optimize my skill's token efficiency and loading performance

**Acceptance Criteria**:

- System generates PDA score 0-100 using Claude/OpenCode CLI analysis
- System estimates token usage for skill loading
- System provides structural recommendations (metadata vs orchestrator vs resources)
- System suggests content that could be moved to references/
- Analysis runs asynchronously without blocking UI

### US-021-003: Security & Permissions Review

**As a** skill developer
**I want** automated permissions security analysis
**So that** I can identify overly broad tool permissions before deployment

**Acceptance Criteria**:

- System analyzes allowed-tools against actual skill content
- System flags unused permissions
- System warns about high-risk permissions (Bash, Write, Edit without constraints)
- System suggests minimum required permissions
- Results show security score 0-100

### US-021-004: Trigger Keyword Optimization

**As a** skill developer
**I want** AI-suggested trigger keywords based on skill content
**So that** I can improve skill discoverability and activation accuracy

**Acceptance Criteria**:

- System analyzes skill content to extract key concepts
- System suggests 5-10 trigger keywords not currently in frontmatter
- System explains why each keyword is relevant
- User can copy suggestions to clipboard
- Suggestions update when skill content changes

---

## Functional Requirements

### FR-001: Anthropic Spec Validation

**Requirement**: System shall validate skills against official Anthropic Skills Specification

**Details**:

- Validate required frontmatter: `name`, `description`
- Validate optional frontmatter: `version`, `tags`, `author`
- Check for `## Triggers` section in skill.md
- Check for `## Usage notes` section
- Validate `allowed-tools` syntax (comma-separated list)
- Detect common typos (e.g., "triggers" vs "trigger")

**Priority**: P1

### FR-002: PDA Analysis with AI

**Requirement**: System shall analyze Progressive Disclosure Architecture using Claude/OpenCode CLI

**Details**:

- Execute CLI command: `claude -p "Analyze PDA for this skill: [content]" --output-format json`
- Parse JSON response for PDA recommendations
- Calculate token estimates for current structure
- Identify content suitable for references/ directory
- Generate restructuring suggestions

**CLI Prompt Template**:

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

**Priority**: P1

### FR-003: PDA Scoring Algorithm

**Requirement**: System shall compute PDA score 0-100 based on analysis results

**Scoring Formula**:

```
PDA Score = (
  30% * (1 - metadata_bloat_ratio) +
  40% * orchestrator_clarity_score +
  20% * resource_organization_score +
  10% * token_efficiency_score
)

Where:
- metadata_bloat_ratio = metadata_tokens / total_tokens (lower is better)
- orchestrator_clarity_score = 0-100 from AI analysis
- resource_organization_score = 0-100 based on references/ usage
- token_efficiency_score = 100 * (1 - total_tokens / 10000) capped at 100
```

**Priority**: P1

### FR-004: Permissions Security Review

**Requirement**: System shall analyze allowed-tools for security risks

**Details**:

- Parse allowed-tools from frontmatter
- Cross-reference against skill content (detect unused permissions)
- Flag high-risk combinations (e.g., `Bash` + `Write` without sandboxing)
- Suggest minimum required permissions
- Generate security score 0-100

**Security Scoring**:

- 100: No tools or only Read/Glob/Grep
- 80: Write/Edit with clear constraints
- 60: Bash with specific use cases
- 40: Multiple write tools + Bash
- 20: Wildcard permissions or overly broad access
- 0: Critical security issues (e.g., `dangerouslyDisableSandbox`)

**Priority**: P1

### FR-005: Trigger Keyword Analysis

**Requirement**: System shall suggest optimal trigger keywords using AI

**Details**:

- Extract existing triggers from frontmatter
- Analyze skill content with Claude/OpenCode CLI
- Suggest 5-10 additional keywords
- Rank suggestions by relevance
- Explain why each keyword is suggested

**CLI Prompt Template**:

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

**Priority**: P1

### FR-006: Reference Link Validation

**Requirement**: System shall validate all reference links in skill content

**Details**:

- Extract markdown links from skill.md
- Check file:// links point to existing files
- Validate http/https URLs are reachable (HEAD request)
- Flag broken links with line numbers
- Suggest fixes (e.g., typos in file paths)

**Priority**: P2

### FR-007: Async Analysis Architecture

**Requirement**: System shall execute analysis asynchronously without blocking UI

**Architecture**:

1. User clicks "Analyze Skill" button in UI
2. Frontend sends Tauri command: `start_skill_analysis(skill_name)`
3. Backend spawns tokio task and returns analysis ID immediately
4. Frontend polls every 2 seconds: `get_analysis_status(analysis_id)`
5. Backend returns status: `{status: "running"|"completed"|"failed", progress: 0-100, result?: AnalysisResult}`
6. Frontend displays progress bar and updates "Evaluation" tab when complete

**Priority**: P1

### FR-008: CLI Detection & Fallback

**Requirement**: System shall detect available CLI tools and fallback gracefully

**Detection Order**:

1. Check for `claude` CLI: `which claude`
2. If not found, check for `opencode` CLI: `which opencode`
3. If neither found, show installation guide with links

**Fallback UI**:

```
⚠️ Claude/OpenCode CLI Not Found

To enable AI-powered analysis, install one of:

• Claude CLI: https://claude.com/claude-code
• OpenCode CLI: https://github.com/opencode/opencode

Installation instructions: [Show Guide]
```

**Priority**: P1

---

## Non-Functional Requirements

### NFR-001: Performance

- Analysis completes in <60 seconds for typical skills (<5000 tokens)
- UI polling interval: 2 seconds (configurable)
- Analysis results cached for 24 hours
- Support up to 5 concurrent analyses

### NFR-002: Reliability

- CLI execution timeout: 30 seconds
- Retry failed CLI calls once with exponential backoff
- Graceful degradation if CLI unavailable
- Store partial results if analysis fails mid-process

### NFR-003: Security

- Never execute arbitrary code from skill content
- Sandbox all CLI executions (no --dangerouslyDisableSandbox)
- Validate all file paths before access
- Rate limit analysis requests (max 10/minute per user)

### NFR-004: Testability

- > 80% test coverage for all analysis modules
- Unit tests for each scorer (PDA, security, triggers)
- Integration tests for CLI execution
- Mock CLI responses for frontend tests

### NFR-005: Usability

- Clear visual feedback during analysis (progress bar, spinner)
- Actionable error messages with fix suggestions
- Copy-to-clipboard for all suggestions
- Persistent analysis history (last 10 analyses)

---

## Success Criteria

### SC-001: Spec Validation Accuracy

- 100% accuracy detecting missing required frontmatter
- 95%+ accuracy detecting malformed skill.md structure
- Zero false positives for valid skills

### SC-002: PDA Scoring Consistency

- PDA scores correlate with manual expert review (>0.8 correlation)
- Reproducible scores for same skill content
- Score changes <5 points for minor content edits

### SC-003: Security Detection

- Detects 100% of high-risk permission combinations
- Suggests valid minimum permissions for all tested skills
- Zero false negatives for critical security issues

### SC-004: Trigger Suggestions Quality

- 80%+ of suggestions rated "useful" by test users
- Top 3 suggestions have >70% relevance score
- Explanations are clear and actionable

### SC-005: Performance Targets Met

- 95% of analyses complete within 60 seconds
- UI remains responsive during analysis
- Cache hit rate >70% for repeated analyses

### SC-006: CLI Integration Robustness

- Works with both Claude CLI and OpenCode CLI
- Graceful fallback when neither CLI available
- Clear error messages for all CLI failure modes

### SC-007: Test Coverage

- > 80% coverage for all Rust analysis modules
- > 80% coverage for async orchestration logic
- E2E tests verify complete analysis workflow

### SC-008: User Experience

- Users can start analysis in <2 clicks
- Analysis results display in <1 second after completion
- All suggestions copyable to clipboard

---

## Technical Context

### Existing Architecture (Reuse)

**From Feature 016**:

- `src/components/DiagramView.tsx` - Tab-based UI pattern
- `src/components/diagram/InteractiveDiagram.tsx` - SVG rendering with zoom/pan
- `src-tauri/src/commands/diagram.rs` - Async task execution pattern

**From Feature 020**:

- `src-tauri/src/commands/skill_scanner.rs` - Skill file reading
- `src-tauri/src/utils/yaml_parser.rs` - Frontmatter parsing
- Test patterns with tempfile::TempDir

### New Components Required

**Backend (Rust)**:

```
src-tauri/src/
├── commands/
│   └── skill_analysis.rs         # Async orchestrator (NEW)
├── analyzers/                     # NEW module
│   ├── mod.rs
│   ├── spec_validator.rs         # FR-001
│   ├── pda_scorer.rs             # FR-002, FR-003
│   ├── permissions_analyzer.rs   # FR-004
│   ├── trigger_analyzer.rs       # FR-005
│   └── link_validator.rs         # FR-006
├── utils/
│   └── cli_executor.rs           # FR-008 (NEW)
└── models/
    └── analysis.rs               # Data models (NEW)
```

**Frontend (React)**:

```
src/
├── components/
│   └── analysis/                 # NEW directory
│       ├── EvaluationTab.tsx     # Main analysis view
│       ├── SpecComplianceCard.tsx
│       ├── PDAScoreCard.tsx
│       ├── SecurityCard.tsx
│       ├── TriggerSuggestionsCard.tsx
│       └── AnalysisProgress.tsx  # Progress indicator
├── stores/
│   └── useAnalysisStore.ts       # State management (NEW)
└── types/
    └── analysis.ts               # TypeScript types (NEW)
```

### Data Models

**Rust Models** (`src-tauri/src/models/analysis.rs`):

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct SkillAnalysisResult {
    pub analysis_id: String,
    pub skill_name: String,
    pub timestamp: DateTime<Utc>,
    pub spec_compliance: SpecCompliance,
    pub pda_analysis: PDAAnalysis,
    pub security_review: SecurityReview,
    pub trigger_suggestions: Vec<TriggerSuggestion>,
    pub link_validation: Option<LinkValidation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SpecCompliance {
    pub score: u8,  // 0-100
    pub violations: Vec<Violation>,
    pub warnings: Vec<Warning>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PDAAnalysis {
    pub score: u8,  // 0-100
    pub token_estimate: usize,
    pub tier_breakdown: TierBreakdown,
    pub recommendations: Vec<String>,
    pub suggested_structure: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SecurityReview {
    pub score: u8,  // 0-100
    pub unused_permissions: Vec<String>,
    pub high_risk_permissions: Vec<RiskFlag>,
    pub minimum_required: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TriggerSuggestion {
    pub keyword: String,
    pub relevance_score: u8,  // 0-100
    pub explanation: String,
}
```

### Technology Stack

- **Rust 1.75+**: Backend analysis modules
- **tokio**: Async runtime for background tasks
- **serde_json**: JSON parsing for CLI responses
- **reqwest**: HTTP client for link validation (FR-006)
- **React 19.1.0**: Frontend UI
- **Zustand 5.0.8**: State management for analysis results
- **TailwindCSS 4.1.17**: Styling for new components

### CLI Execution Pattern

```rust
// src-tauri/src/utils/cli_executor.rs
use std::process::Command;
use std::time::Duration;
use tokio::time::timeout;

pub async fn execute_claude_cli(prompt: &str) -> Result<String, String> {
    let timeout_duration = Duration::from_secs(30);

    let output = timeout(
        timeout_duration,
        tokio::task::spawn_blocking(move || {
            Command::new("claude")
                .arg("-p")
                .arg(prompt)
                .arg("--output-format")
                .arg("json")
                .output()
        })
    ).await
    .map_err(|_| "CLI execution timeout".to_string())?
    .map_err(|e| format!("Spawn error: {}", e))?
    .map_err(|e| format!("Command error: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

---

## Dependencies

### Hard Dependencies

- Feature 016 (Improved UI Layout): Tab infrastructure for "Evaluation" tab
- Feature 020 (Test Backfill): Skill scanner and YAML parser modules
- Claude CLI or OpenCode CLI installation (runtime dependency)

### Soft Dependencies

- PlantUML/Mermaid CLI (for future diagram generation in Features 022-023)

### External Requirements

- User must have Claude CLI or OpenCode CLI installed
- Network access for link validation (FR-006)

---

## Out of Scope

**Not Included in v0.3.0**:

- Auto-fixing violations (read-only analysis only)
- Batch analysis of all skills
- Historical trend analysis (score changes over time)
- Custom validation rules (user-defined)
- Integration with CI/CD pipelines
- Mind map generation (Feature 022)
- Use case diagrams (Feature 023)
- Dependency report (Feature 024)

**Deferred to Future Versions**:

- AI chat interface for skill improvement
- Collaborative review with comments
- Skill marketplace integration
- Version control integration (git blame for skill changes)

---

## Implementation Phases

### Phase 1: Spec Validation (2 days)

- Implement `spec_validator.rs`
- Add unit tests (>80% coverage)
- Create `SpecComplianceCard.tsx` UI component

### Phase 2: CLI Integration (3 days)

- Implement `cli_executor.rs` with detection logic
- Test with both Claude CLI and OpenCode CLI
- Add timeout and retry logic
- Create fallback UI for missing CLI

### Phase 3: PDA Scoring (3 days)

- Implement `pda_scorer.rs` with scoring algorithm
- Integrate Claude/OpenCode CLI for analysis
- Add caching layer (24hr TTL)
- Create `PDAScoreCard.tsx` UI component

### Phase 4: Security & Triggers (2 days)

- Implement `permissions_analyzer.rs`
- Implement `trigger_analyzer.rs`
- Create `SecurityCard.tsx` and `TriggerSuggestionsCard.tsx`

### Phase 5: Frontend Integration (2 days)

- Implement `EvaluationTab.tsx` with async polling
- Create `useAnalysisStore.ts` Zustand store
- Add progress indicators
- E2E testing with Playwright

---

## Testing Strategy

### Unit Tests (Rust)

- `spec_validator.rs`: Test all violation types, edge cases
- `pda_scorer.rs`: Test scoring formula with known inputs
- `permissions_analyzer.rs`: Test security flag detection
- `trigger_analyzer.rs`: Test suggestion ranking
- `cli_executor.rs`: Mock CLI responses, test timeouts

### Integration Tests

- Full analysis workflow with real skill files
- CLI execution with mock responses (no actual CLI calls)
- Error handling for malformed CLI output

### E2E Tests (Playwright)

- User clicks "Analyze Skill" → sees progress → views results
- Test with skill that has violations
- Test with CLI unavailable (fallback UI)

### Manual Testing

- Real Claude CLI integration (manual QA)
- Performance testing with large skills (>5000 tokens)
- UI responsiveness during long analyses

---

## Success Metrics

- **Adoption**: 50%+ of skill developers use analysis feature within 1 month
- **Accuracy**: <5% false positive rate for spec violations
- **Performance**: 95%+ analyses complete in <60s
- **Reliability**: <1% CLI execution failures
- **Test Coverage**: >80% for all new modules
- **User Satisfaction**: >4.0/5.0 rating for usefulness

---

## References

- [Anthropic Skills Specification](https://docs.anthropic.com/en/docs/build-with-claude/claude-code-skills)
- [Progressive Disclosure Architecture](https://github.com/anthropics/skill-best-practices/blob/main/pda.md)
- Feature 016 Implementation: `specs/016-improved-ui-layout/IMPLEMENTATION_SUMMARY.md`
- Feature 020 Implementation: `specs/020-test-backfill-critical-paths/IMPLEMENTATION_SUMMARY.md`

---

**Spec Status**: ✅ Ready for /speckit.plan
**Next Steps**: Run `/speckit.plan` to create technical implementation plan
