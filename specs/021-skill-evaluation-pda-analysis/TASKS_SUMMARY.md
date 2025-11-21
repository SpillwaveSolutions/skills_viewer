# Feature 021: Task Breakdown - 25-Point Summary

**For**: Notion Upload
**Date**: 2025-11-18

---

## Task Organization (5 points)

1. **Total Task Count**: 289 tasks across 11 implementation phases spanning 12 days estimated duration
2. **MVP Scope**: 281 of 289 tasks (8 link validator tasks deferred as P2 priority)
3. **User Story Mapping**: Tasks explicitly tagged with US-021-001 (Spec Validation), US-021-002 (PDA Analysis), US-021-003 (Security Review), US-021-004 (Trigger Suggestions)
4. **Phase Structure**: Setup (10 tasks) → Data Models (31 tasks) → CLI Integration (14 tasks) → 4 Analyzer Modules (83 tasks) → Async Orchestration (34 tasks) → Frontend (81 tasks) → Testing (19 tasks) → Polish (17 tasks)
5. **Parallel Execution Opportunities**: Phase 4 & 5 can run in parallel (Spec Validator + PDA Scorer), Phase 6 has 3 independent analyzers, Phase 9 has 7 independent UI components

## Backend Implementation (8 points)

6. **Data Models (Phase 2, 31 tasks)**: Define 14 Rust structs in src-tauri/src/models/analysis.rs including SkillAnalysisResult, SpecCompliance (score, violations, warnings), PDAAnalysis (score, token_estimate, tier_breakdown), SecurityReview (score, unused_permissions, high_risk_permissions), TriggerSuggestion (keyword, relevance_score, explanation), plus 14 matching TypeScript interfaces
7. **CLI Integration (Phase 3, 14 tasks)**: Implement src-tauri/src/utils/cli_executor.rs with detect_available_clis() using which crate, execute_claude_cli() using tokio::process::Command with 30s timeout, fallback chain (claude → opencode → error), JSON response parsing with serde_json, retry logic (1 retry on failure)
8. **Spec Validator (Phase 4, US-021-001, 13 tasks)**: Implement src-tauri/src/analyzers/spec_validator.rs with validate_frontmatter() (check name/description required), check_required_sections() (## Triggers, ## Usage notes), validate_allowed_tools() syntax, detect_common_typos(), calculate_spec_score() (0-100), return SpecCompliance struct, >80% test coverage with 6 unit tests
9. **PDA Scorer (Phase 5, US-021-002, 15 tasks)**: Implement src-tauri/src/analyzers/pda_scorer.rs with estimate_tokens() (word count / 0.75), analyze_tier_breakdown() (metadata vs orchestrator vs resources), calculate_pda_score() using formula (30% metadata efficiency + 40% orchestrator clarity + 20% resource organization + 10% token efficiency), call_cli_for_pda_analysis() using cli_executor, parse CLI JSON into PDAAnalysis struct, >80% test coverage with 5 unit tests + 2 integration tests
10. **Permissions Analyzer (Phase 6, US-021-003, 12 tasks)**: Implement src-tauri/src/analyzers/permissions_analyzer.rs with parse_allowed_tools() from frontmatter, detect_unused_permissions() by cross-referencing skill content, flag_high_risk_permissions() (Bash + Write, wildcard "\*", dangerouslyDisableSandbox), calculate_security_score() (100=only Read/Grep, 80=Write with constraints, 20=wildcards, 0=critical issues), return SecurityReview struct, >80% test coverage with 5 unit tests
11. **Trigger Analyzer (Phase 6, US-021-004, 11 tasks)**: Implement src-tauri/src/analyzers/trigger_analyzer.rs with extract_current_triggers() from frontmatter, call_cli_for_triggers() using cli_executor with domain analysis prompt, parse CLI JSON into Vec<TriggerSuggestion>, filter by relevance_score >70, return top 5-10 ranked suggestions, >80% test coverage with 3 unit tests + 1 integration test
12. **Link Validator (Phase 6, FR-006, P2 deferred, 8 tasks)**: Implement src-tauri/src/analyzers/link_validator.rs with extract_markdown_links() using regex, validate_file_links() (check paths exist), validate_http_links() (HEAD request with reqwest), return LinkValidation with broken links array, >80% test coverage (deferred to post-MVP)
13. **Async Orchestration (Phase 7, FR-007, 34 tasks)**: Create AnalysisCache using DashMap with cache.get(analysis_id) checking 24hr TTL, cache.insert() with expiry timestamp, evict_oldest() for LRU (max 50 entries), implement run_parallel_analyzers() using tokio::task::JoinSet to spawn all 5 analyzers concurrently, collect results into SkillAnalysisResult, handle partial failures (continue if one analyzer errors), update progress field (0 → 20 → 40 → 60 → 80 → 100), >80% test coverage with 3 integration tests (success, partial failure, 5 concurrent)

## Tauri Commands & Frontend State (5 points)

14. **Tauri Commands (Phase 7, 16 tasks)**: Implement start_skill_analysis(skill_name) generating UUID v4 for analysis_id, spawning tokio task for run_parallel_analyzers(), returning analysis_id immediately (non-blocking), enforcing 5 concurrent limit with errors (SkillNotFound, AnalysisInProgress, MaxConcurrentReached), implement get_analysis_status(analysis_id) returning cached result from DashMap, implement cancel_analysis(analysis_id) terminating tokio task, register all commands in src-tauri/src/main.rs, >80% test coverage with start → poll → complete integration test
15. **Zustand Store (Phase 8, 13 tasks)**: Create src/stores/useAnalysisStore.ts with AnalysisState interface (currentAnalysisId, result, error, isPolling), implement startAnalysis(skillName) calling invoke('start_skill_analysis'), implement pollStatus(analysisId) calling invoke('get_analysis_status'), implement cancelAnalysis(analysisId), error handling for all Tauri command failures, >80% test coverage with mocked invoke calls
16. **Custom Polling Hook (Phase 8, 8 tasks)**: Create src/hooks/useAnalysis.ts implementing useAnalysis(analysisId, interval=2000) with setInterval polling logic, calling pollStatus() every 2 seconds, stopping when status='completed' or 'failed', cleanup interval on unmount (useEffect return), returning { result, error, isPolling }, >80% test coverage with mocked invoke and fake timers
17. **Frontend Types (Phase 2, 14 tasks)**: Create src/types/analysis.ts with 14 TypeScript interfaces mirroring Rust models: SkillAnalysisResult, AnalysisStatus ('running' | 'completed' | 'failed'), SpecCompliance, Violation, Warning, PDAAnalysis, TierBreakdown, SecurityReview, RiskFlag, RiskLevel ('critical' | 'high' | 'medium' | 'low'), TriggerSuggestion, LinkValidation, BrokenLink, CLIDetectionResult
18. **detect_cli Command (Phase 3, 3 tasks)**: Implement detect_cli() Tauri command calling detect_available_clis() from cli_executor, returning {claude_available, opencode_available, claude_path, opencode_path}, register in main.rs, integration test verifying CLI detection

## Frontend UI Components (6 points)

19. **EvaluationTab Component (Phase 9, US-021-001-004, 10 tasks)**: Create src/components/analysis/EvaluationTab.tsx with "Analyze Skill" button calling startAnalysis(), integrate useAnalysis hook for 2-second polling, display AnalysisProgress during analysis, conditionally render all 4 results cards when completed (SpecComplianceCard, PDAScoreCard, SecurityCard, TriggerSuggestionsCard), error handling UI for failed analyses, >90% test coverage (critical UI) with 3 component tests (button click, progress bar, results display)
20. **AnalysisProgress Component (Phase 9, 7 tasks)**: Create src/components/analysis/AnalysisProgress.tsx accepting {progress, status} props, render progress bar (0-100%), display status text ("Analyzing skill...", "Completed", "Failed"), spinning indicator during analysis, >80% test coverage with progress bar update test
21. **SpecComplianceCard Component (Phase 9, US-021-001, 8 tasks)**: Create src/components/analysis/SpecComplianceCard.tsx accepting {spec_compliance} prop, display score with color coding (green >80, yellow 60-80, red <60), render violations list with fix_suggestions, render warnings with recommendations, copy-to-clipboard for suggestions, >80% test coverage with violations display test
22. **PDAScoreCard Component (Phase 9, US-021-002, 10 tasks)**: Create src/components/analysis/PDAScoreCard.tsx accepting {pda_analysis} prop, display PDA score with progress ring visual, display token_estimate, render tier_breakdown chart (metadata vs orchestrator vs resources tokens), display recommendations array, display suggested_structure array, copy-to-clipboard for recommendations, >80% test coverage with score display test
23. **SecurityCard Component (Phase 9, US-021-003, 9 tasks)**: Create src/components/analysis/SecurityCard.tsx accepting {security_review} prop, display security score with shield icon, render unused_permissions list, render high_risk_permissions with severity badges (critical=red, high=orange, medium=yellow, low=blue), display minimum_required permissions, show mitigation advice for each RiskFlag, >80% test coverage with risk flags display test
24. **TriggerSuggestionsCard Component (Phase 9, US-021-004, 9 tasks)**: Create src/components/analysis/TriggerSuggestionsCard.tsx accepting {trigger_suggestions} prop, render suggestions list with relevance_scores (0-100), display explanation for each suggestion, copy-to-clipboard for each keyword, sort by relevance_score descending, highlight top 3 suggestions visually, >80% test coverage with suggestions display test

## Testing, Quality & Delivery (6 points)

25. **E2E Testing (Phase 10, 11 tasks)**: Create tests/e2e/analysis.spec.ts with Playwright tests covering: user clicks "Analyze Skill" → sees progress bar → progress updates 0% → 100% → results cards appear, spec violations display, PDA recommendations visible, security warnings render, trigger suggestions copyable, cancel button terminates analysis, CLI unavailable → installation guide shows, verify all E2E tests pass on CI
26. **Manual Testing Checklist (Phase 10, 8 tasks)**: Test CLI scenarios (no CLI → guide, Claude CLI → analysis, OpenCode CLI → analysis), test 5 concurrent analyses complete successfully, test 6th analysis → MaxConcurrentReached error, test large skill >5000 tokens completes <60s, verify UI responsive during analysis, verify cache hit on repeated analysis <100ms load time
27. **Test Coverage Requirements (Phase 11, 4 tasks)**: Run cargo llvm-cov --html and verify >80% backend coverage for all analyzers, run npm run test:coverage and verify >80% frontend coverage, verify >90% coverage for EvaluationTab (critical UI), identify untested edge cases and add tests
28. **Code Quality (Phase 11, 4 tasks)**: Run cargo clippy --all-targets and fix all warnings, run cargo fmt --all, run npm run lint and fix warnings, verify all console.log() removed from production code
29. **Performance Validation (Phase 11, 5 tasks)**: Profile analysis execution with cargo flamegraph, verify 95% of analyses complete <60s (NFR-001), verify cache hit rate >70% with metrics, verify UI polling overhead <10ms per cycle, optimize slow analyzers identified
30. **Accessibility (Phase 11, 5 tasks)**: Verify all buttons have ARIA labels, test keyboard navigation (Tab, Enter, Escape), verify focus indicators visible, test with screen reader (NVDA or VoiceOver), fix accessibility violations
31. **Security Audit (Phase 11, 4 tasks)**: Verify all file paths validated before access, verify CLI execution sandboxed (no arbitrary commands), verify no sensitive data logged, run cargo audit and fix warnings
32. **Final Integration (Phase 11, 5 tasks)**: Integrate EvaluationTab into main tab navigation (update DiagramView.tsx), add keyboard shortcut for Evaluation tab (Cmd/Ctrl+5), update tab numbering from Feature 019 keyboard shortcuts, verify tab switching works, test full workflow (open app → select skill → switch to Evaluation → analyze)
33. **Git & PR Workflow (Phase 11, 10 tasks)**: Create feature branch feature/021-skill-evaluation-pda-analysis, commit all changes with descriptive messages, push to remote, create PR with detailed description linking to Feature 021 spec, request review, address feedback, verify CI/CD passes, merge to main, update CHANGELOG.md with Feature 021 entry
34. **Documentation (Phase 11, 4 tasks)**: Create IMPLEMENTATION_SUMMARY.md documenting what was built, update specs/021.../README.md, document CLI installation in main README.md, add analysis feature section to docs/requirements/main.md

---

## Dependency Graph Summary

**Critical Path** (cannot parallelize):

1. Phase 1 (Setup) → 2 (Data Models) → 3 (CLI) → 7 (Async Orchestration) → 8 (Frontend State) → 9 (UI) → 10 (Testing) → 11 (Delivery)

**Parallel Opportunities**:

- Phase 4 & 5 in parallel (Spec Validator + PDA Scorer after CLI ready)
- Phase 6: 3 analyzers in parallel (Permissions + Triggers + Links)
- Phase 9: 7 UI components in parallel

**MVP Critical Path**: 281 tasks (excludes 8 P2 link validator tasks)

---

## Key Metrics

- **Total Tasks**: 289
- **Backend Tasks**: 136 (47%)
- **Frontend Tasks**: 95 (33%)
- **Testing Tasks**: 30 (10%)
- **Quality/Polish Tasks**: 28 (10%)
- **P1 High Priority**: 281 tasks (97%)
- **P2 Deferred**: 8 tasks (3%)
- **Test Coverage Requirement**: >80% all modules, >90% EvaluationTab

---

**Files Generated**:

- tasks.md (comprehensive 289-task breakdown with checklist format)
- TASKS_SUMMARY.md (this 25-point executive summary)

**Next Steps**:

1. Upload TASKS_SUMMARY.md to Notion
2. Run /speckit.analyze → Validate consistency across spec.md, plan.md, tasks.md, data-model.md, contracts/
3. Begin Phase 1 implementation (Project Setup, 10 tasks, 1 day)

**Constitutional Compliance**: ✅ TDD enforced (write tests BEFORE implementation), ✅ >80% coverage required, ✅ Real-time task tracking mandated
**Status**: ✅ Tasks Complete, Ready for Analysis Validation
