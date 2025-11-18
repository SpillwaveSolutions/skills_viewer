# Feature 021: Skill Evaluation & PDA Analysis - Task Breakdown

**Generated**: 2025-11-18
**Feature**: Skill Evaluation & Progressive Disclosure Analysis
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

---

## Task Overview

**Total Tasks**: 89
**Estimated Duration**: 12 days
**Test Coverage Target**: >80% for all modules
**Dependencies**: Feature 016 (tab UI), Feature 020 (skill scanner)

---

## Phase 1: Project Setup & Foundations (1 day)

### Setup Tasks

- [ ] T001 [P1] Create project structure per implementation plan
- [ ] T002 [P1] Add Rust dependencies to src-tauri/Cargo.toml (dashmap, which, reqwest, chrono, uuid)
- [ ] T003 [P1] Create analyzers/ module directory in src-tauri/src/
- [ ] T004 [P1] Create models/analysis.rs with SkillAnalysisResult struct
- [ ] T005 [P1] Create utils/cli_executor.rs skeleton
- [ ] T006 [P1] Create frontend analysis/ components directory
- [ ] T007 [P1] Create src/types/analysis.ts with TypeScript types
- [ ] T008 [P1] Create src/stores/useAnalysisStore.ts skeleton
- [ ] T009 [P1] Verify all dependencies install successfully (cargo build)
- [ ] T010 [P1] Verify frontend dependencies install successfully (npm install)

---

## Phase 2: Backend Data Models & Contracts (1 day)

### Data Model Implementation (src-tauri/src/models/analysis.rs)

- [ ] T011 [P1] Define AnalysisStatus enum (Running, Completed, Failed)
- [ ] T012 [P1] Define SkillAnalysisResult struct with all fields
- [ ] T013 [P1] Define SpecCompliance struct (score, violations, warnings)
- [ ] T014 [P1] Define Violation struct (rule, message, fix_suggestion, line_number)
- [ ] T015 [P1] Define Warning struct (rule, message, recommendation)
- [ ] T016 [P1] Define PDAAnalysis struct (score, token_estimate, tier_breakdown, recommendations)
- [ ] T017 [P1] Define TierBreakdown struct (metadata_tokens, orchestrator_tokens, resource_tokens)
- [ ] T018 [P1] Define SecurityReview struct (score, unused_permissions, high_risk_permissions, minimum_required)
- [ ] T019 [P1] Define RiskFlag struct (permission, risk_level, explanation, mitigation)
- [ ] T020 [P1] Define RiskLevel enum (Critical, High, Medium, Low)
- [ ] T021 [P1] Define TriggerSuggestion struct (keyword, relevance_score, explanation)
- [ ] T022 [P1] Define LinkValidation struct (total_links, valid_links, broken_links)
- [ ] T023 [P1] Define BrokenLink struct (url, line_number, error)
- [ ] T024 [P1] Define CLIDetectionResult struct (claude_available, opencode_available, paths)
- [ ] T025 [P1] Define CachedResult struct (result, expires_at)
- [ ] T026 [P1] Add serde derive macros for all structs
- [ ] T027 [P1] Add unit tests for data model serialization/deserialization

### Frontend Type Definitions (src/types/analysis.ts)

- [ ] T028 [P1] Define AnalysisStatus type ('running' | 'completed' | 'failed')
- [ ] T029 [P1] Define SkillAnalysisResult interface
- [ ] T030 [P1] Define SpecCompliance interface
- [ ] T031 [P1] Define Violation interface
- [ ] T032 [P1] Define Warning interface
- [ ] T033 [P1] Define PDAAnalysis interface
- [ ] T034 [P1] Define TierBreakdown interface
- [ ] T035 [P1] Define SecurityReview interface
- [ ] T036 [P1] Define RiskFlag interface
- [ ] T037 [P1] Define RiskLevel type
- [ ] T038 [P1] Define TriggerSuggestion interface
- [ ] T039 [P1] Define LinkValidation interface
- [ ] T040 [P1] Define BrokenLink interface
- [ ] T041 [P1] Define CLIDetectionResult interface

---

## Phase 3: CLI Integration (FR-008) (2 days)

### CLI Detection & Execution (src-tauri/src/utils/cli_executor.rs)

- [ ] T042 [P1] [US-021-002] Implement detect_available_clis() using which crate
- [ ] T043 [P1] [US-021-002] Implement select_cli() with fallback chain (claude → opencode → error)
- [ ] T044 [P1] [US-021-002] Implement execute_claude_cli(prompt: &str) with tokio::process::Command
- [ ] T045 [P1] [US-021-002] Add 30-second timeout using tokio::time::timeout
- [ ] T046 [P1] [US-021-002] Add retry logic (1 retry on transient failures)
- [ ] T047 [P1] [US-021-002] Implement JSON response parsing with serde_json
- [ ] T048 [P1] [US-021-002] Add error handling for CLI not found, timeout, malformed JSON
- [ ] T049 [P1] [US-021-002] Write unit tests for detect_available_clis()
- [ ] T050 [P1] [US-021-002] Write unit tests for execute_claude_cli() with mocked responses
- [ ] T051 [P1] [US-021-002] Write unit tests for timeout scenarios
- [ ] T052 [P1] [US-021-002] Write unit tests for malformed JSON parsing

### Tauri Command: detect_cli

- [ ] T053 [P1] [US-021-002] Implement detect_cli() Tauri command in src-tauri/src/commands/skill_analysis.rs
- [ ] T054 [P1] [US-021-002] Register detect_cli command in src-tauri/src/main.rs
- [ ] T055 [P1] [US-021-002] Write integration test for detect_cli command

---

## Phase 4: Spec Validation Analyzer (FR-001, US-021-001) (2 days)

### Spec Validator Implementation (src-tauri/src/analyzers/spec_validator.rs)

- [ ] T056 [P1] [US-021-001] Create spec_validator.rs module
- [ ] T057 [P1] [US-021-001] Implement validate_frontmatter() function (check name, description required)
- [ ] T058 [P1] [US-021-001] Implement check_required_sections() (## Triggers, ## Usage notes)
- [ ] T059 [P1] [US-021-001] Implement validate_allowed_tools() (syntax validation)
- [ ] T060 [P1] [US-021-001] Implement detect_common_typos() (triggers vs trigger, etc.)
- [ ] T061 [P1] [US-021-001] Implement calculate_spec_score() (0-100 based on violations)
- [ ] T062 [P1] [US-021-001] Return SpecCompliance struct with violations and warnings
- [ ] T063 [P1] [US-021-001] Write unit test: missing name field → violation
- [ ] T064 [P1] [US-021-001] Write unit test: missing description field → violation
- [ ] T065 [P1] [US-021-001] Write unit test: missing Triggers section → warning
- [ ] T066 [P1] [US-021-001] Write unit test: malformed allowed-tools → violation
- [ ] T067 [P1] [US-021-001] Write unit test: valid skill → score 100, no violations
- [ ] T068 [P1] [US-021-001] Verify >80% test coverage for spec_validator module

---

## Phase 5: PDA Analyzer (FR-002, FR-003, US-021-002) (3 days)

### PDA Scorer Implementation (src-tauri/src/analyzers/pda_scorer.rs)

- [ ] T069 [P1] [US-021-002] Create pda_scorer.rs module
- [ ] T070 [P1] [US-021-002] Implement estimate_tokens() function (word count / 0.75)
- [ ] T071 [P1] [US-021-002] Implement analyze_tier_breakdown() (metadata vs orchestrator vs resources)
- [ ] T072 [P1] [US-021-002] Implement calculate_pda_score() using scoring formula from spec
- [ ] T073 [P1] [US-021-002] Implement generate_pda_prompt() for CLI analysis
- [ ] T074 [P1] [US-021-002] Implement call_cli_for_pda_analysis() using cli_executor
- [ ] T075 [P1] [US-021-002] Parse CLI JSON response into PDAAnalysis struct
- [ ] T076 [P1] [US-021-002] Generate recommendations based on score and tier breakdown
- [ ] T077 [P1] [US-021-002] Return PDAAnalysis struct with score, estimates, recommendations
- [ ] T078 [P1] [US-021-002] Write unit test: skill >5000 tokens → recommendation to split
- [ ] T079 [P1] [US-021-002] Write unit test: score calculation formula accuracy
- [ ] T080 [P1] [US-021-002] Write unit test: tier breakdown calculation
- [ ] T081 [P1] [US-021-002] Write integration test: CLI call with mocked response
- [ ] T082 [P1] [US-021-002] Write integration test: CLI timeout handling
- [ ] T083 [P1] [US-021-002] Verify >80% test coverage for pda_scorer module

---

## Phase 6: Security & Trigger Analyzers (FR-004, FR-005, US-021-003, US-021-004) (2 days)

### Permissions Analyzer (src-tauri/src/analyzers/permissions_analyzer.rs)

- [ ] T084 [P1] [US-021-003] Create permissions_analyzer.rs module
- [ ] T085 [P1] [US-021-003] Implement parse_allowed_tools() from frontmatter
- [ ] T086 [P1] [US-021-003] Implement detect_unused_permissions() (cross-reference with skill content)
- [ ] T087 [P1] [US-021-003] Implement flag_high_risk_permissions() (Bash + Write, wildcard, etc.)
- [ ] T088 [P1] [US-021-003] Implement suggest_minimum_permissions() based on content analysis
- [ ] T089 [P1] [US-021-003] Implement calculate_security_score() (0-100)
- [ ] T090 [P1] [US-021-003] Return SecurityReview struct with score, flags, suggestions
- [ ] T091 [P1] [US-021-003] Write unit test: allowed-tools: ["*"] → score <20, critical risk flag
- [ ] T092 [P1] [US-021-003] Write unit test: Bash + Write without constraints → high risk flag
- [ ] T093 [P1] [US-021-003] Write unit test: unused permissions detection
- [ ] T094 [P1] [US-021-003] Write unit test: only Read/Grep → score 100
- [ ] T095 [P1] [US-021-003] Verify >80% test coverage for permissions_analyzer module

### Trigger Analyzer (src-tauri/src/analyzers/trigger_analyzer.rs)

- [ ] T096 [P1] [US-021-004] Create trigger_analyzer.rs module
- [ ] T097 [P1] [US-021-004] Implement extract_current_triggers() from frontmatter
- [ ] T098 [P1] [US-021-004] Implement generate_trigger_prompt() for CLI analysis
- [ ] T099 [P1] [US-021-004] Implement call_cli_for_triggers() using cli_executor
- [ ] T100 [P1] [US-021-004] Parse CLI JSON response into Vec<TriggerSuggestion>
- [ ] T101 [P1] [US-021-004] Filter suggestions by relevance_score (>70 threshold)
- [ ] T102 [P1] [US-021-004] Return top 5-10 suggestions ranked by score
- [ ] T103 [P1] [US-021-004] Write unit test: skill about PDFs → suggests "pdf" keyword
- [ ] T104 [P1] [US-021-004] Write unit test: relevance_score filtering
- [ ] T105 [P1] [US-021-004] Write integration test: CLI call with mocked suggestions
- [ ] T106 [P1] [US-021-004] Verify >80% test coverage for trigger_analyzer module

### Link Validator (src-tauri/src/analyzers/link_validator.rs)

- [ ] T107 [P2] Create link_validator.rs module
- [ ] T108 [P2] Implement extract_markdown_links() using regex
- [ ] T109 [P2] Implement validate_file_links() (check file:// paths exist)
- [ ] T110 [P2] Implement validate_http_links() (HEAD request with reqwest)
- [ ] T111 [P2] Return LinkValidation struct with broken links
- [ ] T112 [P2] Write unit test: broken file link → BrokenLink entry
- [ ] T113 [P2] Write unit test: 404 URL → BrokenLink entry
- [ ] T114 [P2] Verify >80% test coverage for link_validator module

---

## Phase 7: Async Orchestration (FR-007) (2 days)

### Analysis Cache (src-tauri/src/commands/skill_analysis.rs)

- [ ] T115 [P1] Create AnalysisCache struct using DashMap
- [ ] T116 [P1] Implement cache.get(analysis_id) with TTL check (24hr)
- [ ] T117 [P1] Implement cache.insert(analysis_id, result) with expiry timestamp
- [ ] T118 [P1] Implement evict_oldest() for LRU eviction (max 50 entries)
- [ ] T119 [P1] Add unit tests for cache TTL expiry
- [ ] T120 [P1] Add unit tests for LRU eviction

### Async Orchestrator (src-tauri/src/commands/skill_analysis.rs)

- [ ] T121 [P1] Implement run_parallel_analyzers() using tokio::task::JoinSet
- [ ] T122 [P1] Spawn spec_validator task
- [ ] T123 [P1] Spawn pda_scorer task
- [ ] T124 [P1] Spawn permissions_analyzer task
- [ ] T125 [P1] Spawn trigger_analyzer task
- [ ] T126 [P1] Spawn link_validator task (if enabled)
- [ ] T127 [P1] Collect all results and merge into SkillAnalysisResult
- [ ] T128 [P1] Handle partial failures (continue if one analyzer errors)
- [ ] T129 [P1] Update progress field during execution (0 → 20 → 40 → 60 → 80 → 100)
- [ ] T130 [P1] Write integration test: all analyzers complete successfully
- [ ] T131 [P1] Write integration test: one analyzer fails, others succeed
- [ ] T132 [P1] Write integration test: concurrent execution (5 skills simultaneously)

### Tauri Commands

- [ ] T133 [P1] Implement start_skill_analysis(skill_name) command
- [ ] T134 [P1] Generate UUID v4 for analysis_id
- [ ] T135 [P1] Spawn tokio task for run_parallel_analyzers()
- [ ] T136 [P1] Return analysis_id immediately (non-blocking)
- [ ] T137 [P1] Enforce 5 concurrent analysis limit
- [ ] T138 [P1] Handle errors: SkillNotFound, AnalysisInProgress, MaxConcurrentReached
- [ ] T139 [P1] Implement get_analysis_status(analysis_id) command
- [ ] T140 [P1] Return cached result from AnalysisCache
- [ ] T141 [P1] Handle error: AnalysisNotFound
- [ ] T142 [P1] Implement cancel_analysis(analysis_id) command
- [ ] T143 [P1] Terminate tokio task for given analysis_id
- [ ] T144 [P1] Return success/failure based on cancellation
- [ ] T145 [P1] Register all commands in src-tauri/src/main.rs
- [ ] T146 [P1] Write integration test: start → poll → get completed result
- [ ] T147 [P1] Write integration test: start → cancel → verify terminated
- [ ] T148 [P1] Verify >80% test coverage for skill_analysis.rs module

---

## Phase 8: Frontend State Management (1 day)

### Zustand Store (src/stores/useAnalysisStore.ts)

- [ ] T149 [P1] Define AnalysisState interface (currentAnalysisId, result, error, isPolling)
- [ ] T150 [P1] Implement startAnalysis(skillName) action
- [ ] T151 [P1] Call invoke('start_skill_analysis', { skill_name })
- [ ] T152 [P1] Store returned analysis_id in state
- [ ] T153 [P1] Implement pollStatus(analysisId) action
- [ ] T154 [P1] Call invoke('get_analysis_status', { analysis_id })
- [ ] T155 [P1] Update result in state
- [ ] T156 [P1] Implement cancelAnalysis(analysisId) action
- [ ] T157 [P1] Call invoke('cancel_analysis', { analysis_id })
- [ ] T158 [P1] Clear state on cancellation
- [ ] T159 [P1] Add error handling for all Tauri command failures
- [ ] T160 [P1] Write unit tests for useAnalysisStore actions (mock invoke)
- [ ] T161 [P1] Verify >80% test coverage for useAnalysisStore

### Custom Polling Hook (src/hooks/useAnalysis.ts)

- [ ] T162 [P1] Create useAnalysis(analysisId, interval=2000) hook
- [ ] T163 [P1] Implement setInterval polling logic
- [ ] T164 [P1] Call pollStatus() every 2 seconds
- [ ] T165 [P1] Stop polling when status='completed' or 'failed'
- [ ] T166 [P1] Cleanup interval on unmount (useEffect return)
- [ ] T167 [P1] Return { result, error, isPolling } from hook
- [ ] T168 [P1] Write unit tests for useAnalysis hook (mock invoke, fake timers)
- [ ] T169 [P1] Verify >80% test coverage for useAnalysis

---

## Phase 9: Frontend UI Components (2 days)

### EvaluationTab Component (src/components/analysis/EvaluationTab.tsx)

- [ ] T170 [P1] Create EvaluationTab.tsx component
- [ ] T171 [P1] Add "Analyze Skill" button (calls startAnalysis)
- [ ] T172 [P1] Integrate useAnalysis hook for polling
- [ ] T173 [P1] Display AnalysisProgress component during analysis
- [ ] T174 [P1] Conditionally render results cards when completed
- [ ] T175 [P1] Add error handling UI for failed analyses
- [ ] T176 [P1] Write component test: button click starts analysis
- [ ] T177 [P1] Write component test: progress bar appears during analysis
- [ ] T178 [P1] Write component test: results display on completion
- [ ] T179 [P1] Verify >90% test coverage for EvaluationTab (critical UI)

### AnalysisProgress Component (src/components/analysis/AnalysisProgress.tsx)

- [ ] T180 [P1] Create AnalysisProgress.tsx component
- [ ] T181 [P1] Accept { progress, status } props
- [ ] T182 [P1] Render progress bar (0-100%)
- [ ] T183 [P1] Display status text ("Analyzing skill...", "Completed", "Failed")
- [ ] T184 [P1] Add spinning indicator during analysis
- [ ] T185 [P1] Write component test: progress bar updates correctly
- [ ] T186 [P1] Verify >80% test coverage

### SpecComplianceCard Component (src/components/analysis/SpecComplianceCard.tsx)

- [ ] T187 [P1] [US-021-001] Create SpecComplianceCard.tsx component
- [ ] T188 [P1] [US-021-001] Accept { spec_compliance } prop
- [ ] T189 [P1] [US-021-001] Display score with color coding (green >80, yellow 60-80, red <60)
- [ ] T190 [P1] [US-021-001] Render violations list with fix suggestions
- [ ] T191 [P1] [US-021-001] Render warnings list with recommendations
- [ ] T192 [P1] [US-021-001] Add copy-to-clipboard for fix suggestions
- [ ] T193 [P1] [US-021-001] Write component test: violations display correctly
- [ ] T194 [P1] [US-021-001] Verify >80% test coverage

### PDAScoreCard Component (src/components/analysis/PDAScoreCard.tsx)

- [ ] T195 [P1] [US-021-002] Create PDAScoreCard.tsx component
- [ ] T196 [P1] [US-021-002] Accept { pda_analysis } prop
- [ ] T197 [P1] [US-021-002] Display PDA score with progress ring
- [ ] T198 [P1] [US-021-002] Display token estimate
- [ ] T199 [P1] [US-021-002] Render tier breakdown chart (metadata vs orchestrator vs resources)
- [ ] T200 [P1] [US-021-002] Display recommendations list
- [ ] T201 [P1] [US-021-002] Display suggested structure changes
- [ ] T202 [P1] [US-021-002] Add copy-to-clipboard for recommendations
- [ ] T203 [P1] [US-021-002] Write component test: score displays correctly
- [ ] T204 [P1] [US-021-002] Verify >80% test coverage

### SecurityCard Component (src/components/analysis/SecurityCard.tsx)

- [ ] T205 [P1] [US-021-003] Create SecurityCard.tsx component
- [ ] T206 [P1] [US-021-003] Accept { security_review } prop
- [ ] T207 [P1] [US-021-003] Display security score with shield icon
- [ ] T208 [P1] [US-021-003] Render unused permissions list
- [ ] T209 [P1] [US-021-003] Render high-risk permissions with severity badges
- [ ] T210 [P1] [US-021-003] Display minimum required permissions
- [ ] T211 [P1] [US-021-003] Add mitigation advice for each risk flag
- [ ] T212 [P1] [US-021-003] Write component test: risk flags display correctly
- [ ] T213 [P1] [US-021-003] Verify >80% test coverage

### TriggerSuggestionsCard Component (src/components/analysis/TriggerSuggestionsCard.tsx)

- [ ] T214 [P1] [US-021-004] Create TriggerSuggestionsCard.tsx component
- [ ] T215 [P1] [US-021-004] Accept { trigger_suggestions } prop
- [ ] T216 [P1] [US-021-004] Render suggestions list with relevance scores
- [ ] T217 [P1] [US-021-004] Display explanation for each suggestion
- [ ] T218 [P1] [US-021-004] Add copy-to-clipboard for each keyword
- [ ] T219 [P1] [US-021-004] Sort suggestions by relevance_score descending
- [ ] T220 [P1] [US-021-004] Highlight top 3 suggestions
- [ ] T221 [P1] [US-021-004] Write component test: suggestions display correctly
- [ ] T222 [P1] [US-021-004] Verify >80% test coverage

### CLIInstallGuide Component (src/components/analysis/CLIInstallGuide.tsx)

- [ ] T223 [P1] Create CLIInstallGuide.tsx component
- [ ] T224 [P1] Display warning when no CLI available
- [ ] T225 [P1] Show installation links for Claude CLI and OpenCode CLI
- [ ] T226 [P1] Add "Retry Detection" button to re-run detect_cli
- [ ] T227 [P1] Write component test: installation links present
- [ ] T228 [P1] Verify >80% test coverage

---

## Phase 10: Integration & E2E Testing (1 day)

### E2E Tests (tests/e2e/analysis.spec.ts)

- [ ] T229 [P1] Create analysis.spec.ts Playwright test file
- [ ] T230 [P1] Test: User clicks "Analyze Skill" → sees progress bar
- [ ] T231 [P1] Test: Progress bar updates from 0% → 100%
- [ ] T232 [P1] Test: Results cards appear after completion
- [ ] T233 [P1] Test: Spec compliance violations display correctly
- [ ] T234 [P1] Test: PDA score and recommendations visible
- [ ] T235 [P1] Test: Security warnings render correctly
- [ ] T236 [P1] Test: Trigger suggestions copyable to clipboard
- [ ] T237 [P1] Test: Cancel button terminates analysis
- [ ] T238 [P1] Test: CLI unavailable → shows installation guide
- [ ] T239 [P1] Verify all E2E tests pass on CI

### Manual Testing Checklist

- [ ] T240 [P1] Manual test: Analyze skill with no CLI installed → installation guide shows
- [ ] T241 [P1] Manual test: Analyze skill with Claude CLI → PDA analysis completes
- [ ] T242 [P1] Manual test: Analyze skill with OpenCode CLI → PDA analysis completes
- [ ] T243 [P1] Manual test: Start 5 concurrent analyses → all complete successfully
- [ ] T244 [P1] Manual test: Start 6th analysis → MaxConcurrentReached error
- [ ] T245 [P1] Manual test: Analyze large skill (>5000 tokens) → completes <60s
- [ ] T246 [P1] Manual test: UI remains responsive during analysis
- [ ] T247 [P1] Manual test: Cache hit on repeated analysis (<100ms load)

---

## Phase 11: Polish & Cross-Cutting Concerns (1 day)

### Documentation

- [ ] T248 Create IMPLEMENTATION_SUMMARY.md documenting what was built
- [ ] T249 Update specs/021-skill-evaluation-pda-analysis/README.md
- [ ] T250 Document CLI installation in main README.md
- [ ] T251 Add analysis feature section to docs/requirements/main.md

### Code Quality

- [ ] T252 Run cargo clippy --all-targets and fix all warnings
- [ ] T253 Run cargo fmt --all and verify formatting
- [ ] T254 Run npm run lint and fix all warnings
- [ ] T255 Verify all console.log() statements removed from production code

### Test Coverage

- [ ] T256 Run cargo llvm-cov --html and verify >80% backend coverage
- [ ] T257 Run npm run test:coverage and verify >80% frontend coverage
- [ ] T258 Identify any untested edge cases and add tests
- [ ] T259 Verify all critical paths have integration tests

### Performance

- [ ] T260 Profile analysis execution time with cargo flamegraph
- [ ] T261 Verify 95% of analyses complete <60s
- [ ] T262 Verify cache hit rate >70% with metrics
- [ ] T263 Verify UI polling overhead <10ms per cycle
- [ ] T264 Optimize any slow analyzers identified

### Accessibility

- [ ] T265 Verify all buttons have ARIA labels
- [ ] T266 Test keyboard navigation (Tab, Enter, Escape)
- [ ] T267 Verify focus indicators visible
- [ ] T268 Test with screen reader (NVDA or VoiceOver)
- [ ] T269 Fix any accessibility violations found

### Security

- [ ] T270 Verify all file paths validated before access
- [ ] T271 Verify CLI execution sandboxed (no arbitrary commands)
- [ ] T272 Verify no sensitive data logged
- [ ] T273 Run security audit: cargo audit
- [ ] T274 Fix any security warnings

### Final Integration

- [ ] T275 Integrate EvaluationTab into main tab navigation (update DiagramView.tsx)
- [ ] T276 Add keyboard shortcut for Evaluation tab (Cmd/Ctrl+5)
- [ ] T277 Update tab numbering if needed (from Feature 019)
- [ ] T278 Verify tab switching works correctly
- [ ] T279 Test full workflow: open app → select skill → switch to Evaluation → analyze

### Git & PR

- [ ] T280 Create feature branch: feature/021-skill-evaluation-pda-analysis
- [ ] T281 Commit all changes with descriptive messages
- [ ] T282 Push branch to remote
- [ ] T283 Create pull request with detailed description
- [ ] T284 Link PR to Feature 021 spec in description
- [ ] T285 Request review from maintainers
- [ ] T286 Address all PR feedback
- [ ] T287 Verify CI/CD pipeline passes
- [ ] T288 Merge to main after approval
- [ ] T289 Update CHANGELOG.md with Feature 021 entry

---

## Dependency Graph

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Data Models)
                    ↓
Phase 3 (CLI Integration, US-021-002 foundation)
                    ↓
          ┌─────────┴──────────┐
          ↓                    ↓
Phase 4 (US-021-001)    Phase 5 (US-021-002)
  Spec Validation         PDA Scoring
          ↓                    ↓
Phase 6 (US-021-003 & US-021-004)
  Security + Triggers
          ↓
Phase 7 (Async Orchestration - integrates all analyzers)
          ↓
Phase 8 (Frontend State)
          ↓
Phase 9 (Frontend UI - implements all 4 user stories)
          ↓
Phase 10 (Testing - validates all stories)
          ↓
Phase 11 (Polish & Delivery)
```

### Parallel Execution Opportunities

**Phase 4 & 5 can run in parallel** after Phase 3 completes:

- Team member A: Implement Spec Validator (T056-T068)
- Team member B: Implement PDA Scorer (T069-T083)

**Phase 6 analyzers can run in parallel**:

- Team member A: Permissions Analyzer (T084-T095)
- Team member B: Trigger Analyzer (T096-T106)
- Team member C: Link Validator (T107-T114)

**Phase 9 UI components can run in parallel**:

- Team member A: EvaluationTab + AnalysisProgress (T170-T186)
- Team member B: SpecComplianceCard + PDAScoreCard (T187-T204)
- Team member C: SecurityCard + TriggerSuggestionsCard + CLIInstallGuide (T205-T228)

---

## MVP Scope Definition

**Minimum Viable Product** includes:

✅ **Core Analyzers**:

- Spec Validator (FR-001, US-021-001)
- PDA Scorer (FR-002/003, US-021-002)
- Permissions Analyzer (FR-004, US-021-003)
- Trigger Analyzer (FR-005, US-021-004)

✅ **Infrastructure**:

- CLI detection & fallback (FR-008)
- Async orchestration (FR-007)
- Analysis caching (24hr TTL)

✅ **Frontend**:

- EvaluationTab with all 4 result cards
- Progress tracking during analysis
- Error handling UI

✅ **Quality**:

- > 80% test coverage
- E2E tests for critical paths

❌ **Deferred to Post-MVP**:

- Link Validator (FR-006) - P2, not blocking
- Historical analysis tracking
- Batch analysis
- Custom validation rules

**MVP Task Count**: 281 of 289 tasks (8 link validator tasks deferred)

---

## Task Checklist Legend

- `[ ]` Not started
- `[~]` In progress or partially complete
- `[x]` Completed
- `[P1]` High priority (blocking)
- `[P2]` Medium priority (can defer)
- `[US-021-001]` Maps to User Story 021-001
- `[US-021-002]` Maps to User Story 021-002
- `[US-021-003]` Maps to User Story 021-003
- `[US-021-004]` Maps to User Story 021-004

---

## Notes

- **TDD Enforcement**: Write unit tests BEFORE implementation for all analyzers (constitutional requirement)
- **Real-time Tracking**: Mark tasks complete immediately after finishing (no batch marking)
- **Coverage Requirement**: >80% for backend modules, >90% for critical UI (EvaluationTab)
- **Checkpoint Validation**: Run /speckit.analyze after Phase 7, 9, and 11
- **CLI Dependency**: Some tests require Claude/OpenCode CLI installed (document in test setup)
- **Performance Targets**: Profile after Phase 7 to verify <60s analysis time

---

**Status**: ✅ Task Breakdown Complete
**Next Step**: Run /speckit.analyze to validate consistency across all artifacts
