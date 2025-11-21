# Feature 021: Implementation Plan - 25-Point Summary

**For**: Notion Upload
**Date**: 2025-11-18

---

## Technical Context (5 points)

1. **Technology Stack**: Rust 1.75+ backend with tokio async runtime, TypeScript 5.8.3 strict mode frontend with React 19.1.0 and Zustand 5.0.8 state management
2. **Dependencies**: Backend uses tokio 1.35 (async), serde_json 1.0 (JSON parsing), reqwest 0.11 (link validation), DashMap 6.1 (concurrent cache), which 6.0 (CLI detection), chrono 0.4 (DateTime), uuid 1.10 (analysis IDs)
3. **Performance Goals**: <60s analysis completion for 95% of skills, 2-second UI polling intervals, 30-second CLI timeout, >70% cache hit rate, support 5 concurrent analyses
4. **Constraints**: Read-only file access (constitutional Principle III), >80% test coverage (Principle VII), cross-platform CLI detection (claude/opencode availability varies by platform)
5. **Storage**: In-memory cache with 24-hour TTL using DashMap for lock-free concurrent HashMap access, LRU eviction at 50 results maximum

## Constitution Check (4 points)

6. **Principle I (Native Desktop)**: Uses Tauri 2.x framework, async polling prevents UI blocking, background tokio tasks maintain 60fps
7. **Principle II (Developer-First)**: Analysis features serve skill debugging (validation, PDA scoring, security review), results in scannable cards with keyboard access and copy-to-clipboard
8. **Principle III (Read-Only Safety)**: All analysis operations read-only, no file modifications, CLI calls use read-only flags
9. **Principle VII (Testability)**: >80% coverage required for all new Rust/TypeScript modules, unit tests for all analyzers, integration tests for workflows, E2E tests with Playwright

## Architecture & Structure (5 points)

10. **Backend Modules**: New `analyzers/` directory with 5 specialized modules (spec_validator, pda_scorer, permissions_analyzer, trigger_analyzer, link_validator), new `cli_executor.rs` utility, new `models/analysis.rs` data structures
11. **Frontend Components**: New `analysis/` directory with 7 components (EvaluationTab, AnalysisProgress, SpecComplianceCard, PDAScoreCard, SecurityCard, TriggerSuggestionsCard, CLIInstallGuide), new useAnalysisStore.ts Zustand store, new useAnalysis.ts custom polling hook
12. **Reuse Patterns**: Feature 016's tab-based UI and async task execution, Feature 020's skill scanner and YAML parser, existing DiagramView.tsx tab pattern
13. **Async Workflow**: User clicks Analyze → returns UUID immediately → spawns tokio task → frontend polls every 2s → displays progress bar → shows results when status='completed'
14. **CLI Integration**: Detection chain (claude → opencode → installation guide), tokio::process::Command for non-blocking execution, 30s timeout with retry once, JSON response parsing with serde_json structured deserialization

## Data Models (4 points)

15. **SkillAnalysisResult**: Main container with analysis_id (UUID v4), skill_name, skill_path, timestamp (DateTime<Utc>), status (Running|Completed|Failed), progress (0-100), 5 optional analysis results (spec_compliance, pda_analysis, security_review, trigger_suggestions, link_validation), optional error string
16. **SpecCompliance**: Score (0-100), violations array (rule, message, fix_suggestion, line_number), warnings array (rule, message, recommendation) - implements FR-001
17. **PDAAnalysis**: Score (0-100), token_estimate, tier_breakdown (metadata_tokens, orchestrator_tokens, resource_tokens), recommendations array, suggested_structure array - implements FR-002/FR-003
18. **SecurityReview**: Score (0-100 where 100=most secure), unused_permissions array, high_risk_permissions array (permission, risk_level, explanation, mitigation), minimum_required array - implements FR-004

## API Contracts (3 points)

19. **start_skill_analysis**: Input skill_name → Returns analysis_id (UUID v4), spawns async tokio task, errors: SkillNotFound (404), AnalysisInProgress (409), MaxConcurrentReached (429)
20. **get_analysis_status**: Input analysis_id → Returns SkillAnalysisResult, poll every 2 seconds until status='completed' or 'failed', error: AnalysisNotFound (404)
21. **detect_cli**: No input → Returns {claude_available, opencode_available, claude_path, opencode_path}, called once on app startup, no errors

## Research Decisions (4 points)

22. **CLI Integration Pattern**: Decision: tokio::process::Command over std::process for non-blocking async execution, Rationale: Prevents CLI timeouts from blocking other analyses, integrates with existing Tauri async patterns, timeout support via tokio::time::timeout
23. **Async State Management**: Decision: DashMap for analysis cache over tokio::sync::RwLock, Rationale: Lock-free concurrent HashMap eliminates contention bottleneck under 5 concurrent analyses, no async overhead for get/insert, supports TTL with custom expiry logic
24. **CLI Detection**: Decision: which crate (6.0.3) over manual PATH scanning, Rationale: Cross-platform abstraction handles Windows/Unix differences, respects executable permissions, 10M+ downloads well-tested, simple API: which::which("claude").is_ok()
25. **Frontend Polling**: Decision: Custom useAnalysis hook over React Query, Rationale: Project minimizes dependencies (constitution: avoid over-engineering), simple use case doesn't justify 40KB React Query dependency, 100% control over polling logic and cleanup with setInterval + useEffect pattern

---

**Files Generated**:

- plan.md (comprehensive implementation plan with all details)
- research.md (5 technology decisions with rationale)
- data-model.md (complete Rust and TypeScript type definitions)
- contracts/analysis.yaml (4 Tauri command definitions)
- contracts/types.yaml (14 shared type definitions)
- quickstart.md (developer quick reference guide)

**Next Steps**:

1. /speckit.tasks → Generate granular task breakdown
2. /speckit.analyze → Validate consistency across all artifacts
3. Begin Phase 1 implementation (Spec Validation - 2 days)

**Constitutional Compliance**: ✅ All 7 principles satisfied
**Status**: ✅ Plan Complete, Ready for Tasks Generation
