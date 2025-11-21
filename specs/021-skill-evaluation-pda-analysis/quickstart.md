# Quickstart: Feature 021 - Skill Evaluation & PDA Analysis

**For**: Developers implementing or maintaining Feature 021
**Last Updated**: 2025-11-18

---

## 🚀 Quick Commands

```bash
# Backend development
cd src-tauri
cargo test                          # Run all Rust tests
cargo test spec_validator           # Test specific module
cargo llvm-cov --html               # Generate coverage report
cargo run                           # Run app in development

# Frontend development
npm run dev                         # Start Vite dev server + Tauri
npm test                            # Run all frontend tests
npm test useAnalysisStore           # Test specific file
npm run test:e2e                    # Run Playwright E2E tests

# Full project
task build                          # Build entire project
task test                           # Run all tests
task test:coverage                  # Generate coverage reports
```

---

## 📁 Key Files

### Implementation Files

**Backend (Rust)**:

```
src-tauri/src/
├── commands/skill_analysis.rs     # ⭐ Main orchestrator (FR-007)
├── analyzers/
│   ├── spec_validator.rs          # ⭐ FR-001: Spec validation
│   ├── pda_scorer.rs              # ⭐ FR-002/003: PDA scoring
│   ├── permissions_analyzer.rs    # ⭐ FR-004: Security review
│   ├── trigger_analyzer.rs        # ⭐ FR-005: Trigger suggestions
│   └── link_validator.rs          # FR-006: Link validation
├── utils/cli_executor.rs          # ⭐ FR-008: CLI integration
└── models/analysis.rs             # ⭐ Data models
```

**Frontend (React)**:

```
src/components/analysis/
├── EvaluationTab.tsx              # ⭐ Main tab component
├── AnalysisProgress.tsx           # Progress indicator
├── SpecComplianceCard.tsx         # FR-001 UI
├── PDAScoreCard.tsx               # FR-002/003 UI
├── SecurityCard.tsx               # FR-004 UI
├── TriggerSuggestionsCard.tsx     # FR-005 UI
└── CLIInstallGuide.tsx            # FR-008 fallback UI

src/stores/useAnalysisStore.ts     # ⭐ State management
src/hooks/useAnalysis.ts           # ⭐ Polling hook
src/types/analysis.ts              # ⭐ TypeScript types
```

### Specification Files

```
specs/021-skill-evaluation-pda-analysis/
├── spec.md              # User stories, requirements
├── plan.md              # This is the implementation plan ⭐
├── research.md          # Technology decisions
├── data-model.md        # Data structures
├── contracts/           # API contracts
│   ├── analysis.yaml    # Command definitions
│   └── types.yaml       # Type definitions
├── quickstart.md        # This file
└── tasks.md             # Task breakdown (from /speckit.tasks)
```

---

## 🏗️ Architecture at a Glance

```
User clicks "Analyze"
        ↓
EvaluationTab.tsx
        ↓
useAnalysisStore.startAnalysis(skillName)
        ↓
Tauri: start_skill_analysis(skillName)
        ↓
skill_analysis.rs spawns tokio task
        ↓ (async)
Run analyzers in parallel:
├── spec_validator.rs → SpecCompliance
├── pda_scorer.rs → PDAAnalysis (via Claude/OpenCode CLI)
├── permissions_analyzer.rs → SecurityReview
├── trigger_analyzer.rs → TriggerSuggestion[]
└── link_validator.rs → LinkValidation
        ↓
Store result in DashMap cache
        ↓
Frontend polls every 2s: get_analysis_status(analysisId)
        ↓
useAnalysis hook updates state
        ↓
EvaluationTab displays results
```

---

## 🔧 Development Workflow

### 1. Adding a New Analyzer

```bash
# 1. Create analyzer module
touch src-tauri/src/analyzers/my_analyzer.rs

# 2. Add to analyzers/mod.rs
echo "pub mod my_analyzer;" >> src-tauri/src/analyzers/mod.rs

# 3. Implement analyzer trait
# See spec_validator.rs for pattern

# 4. Integrate in skill_analysis.rs orchestrator
# Add to parallel execution in run_parallel_analyzers()

# 5. Write unit tests
touch src-tauri/tests/unit/my_analyzer_test.rs

# 6. Run tests
cargo test my_analyzer
```

### 2. Adding a UI Card

```bash
# 1. Create component
touch src/components/analysis/MyCard.tsx

# 2. Define props interface
# export interface MyCardProps { data: MyData }

# 3. Add to EvaluationTab.tsx
# Import and render: <MyCard data={result.my_data} />

# 4. Write component tests
touch tests/unit/components/analysis/MyCard.test.tsx

# 5. Run tests
npm test MyCard
```

### 3. Testing Strategy

**Unit Tests (Rust)**:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_my_analyzer() {
        let temp_dir = TempDir::new().unwrap();
        // Create test fixtures
        // Run analyzer
        // Assert results
    }
}
```

**Unit Tests (TypeScript)**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useAnalysis', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should poll every 2 seconds', async () => {
    // Test polling logic
  });
});
```

**E2E Tests (Playwright)**:

```typescript
import { test, expect } from '@playwright/test';

test('analyze skill workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="analyze-button"]');
  await expect(page.locator('.progress-bar')).toBeVisible();
  // Wait for completion
});
```

---

## 🐛 Debugging Tips

### Backend Debugging

```bash
# Run with debug logging
RUST_LOG=debug npm run tauri dev

# Check specific module
RUST_LOG=skill_debugger::analyzers::pda_scorer=trace npm run tauri dev

# Test single module
cargo test --package skill-debugger --test unit -- spec_validator --nocapture
```

### Frontend Debugging

```bash
# React DevTools
# Install extension: https://chrome.google.com/webstore/detail/react-developer-tools

# Check Zustand state
# Use Redux DevTools: https://github.com/zalmoxisus/redux-devtools-extension

# Console logging
# Add: console.log('[useAnalysis]', { result, error });
```

### CLI Integration Debugging

```bash
# Test CLI manually
claude -p "Analyze this skill..." --output-format json

# Check CLI detection
which claude
which opencode

# Verify PATH
echo $PATH

# Test from Rust
cd src-tauri
cargo run --bin check-cli  # (if implemented)
```

---

## 📊 Coverage Requirements

**Constitutional Principle VII**: >80% test coverage

### Check Coverage

```bash
# Backend
cargo llvm-cov --html
open target/llvm-cov/html/index.html

# Frontend
npm run test:coverage
open coverage/index.html
```

### Target Modules

- ✅ **>80%**: spec_validator.rs, pda_scorer.rs, permissions_analyzer.rs, trigger_analyzer.rs, cli_executor.rs
- ✅ **>80%**: useAnalysisStore.ts, useAnalysis.ts
- ✅ **>90%**: EvaluationTab.tsx (critical UI)

---

## 🚨 Common Issues

### Issue: CLI Not Found

**Symptom**: `detect_cli()` returns `{ claude_available: false, opencode_available: false }`

**Solutions**:

1. Install Claude CLI: https://claude.com/claude-code
2. Install OpenCode CLI: https://github.com/opencode/opencode
3. Check PATH: `which claude` or `which opencode`
4. Restart app after installation

### Issue: Analysis Timeout

**Symptom**: Analysis stuck at `status: 'running'` for >60s

**Solutions**:

1. Check CLI timeout (30s default in cli_executor.rs)
2. Increase timeout: `timeout_duration = Duration::from_secs(60)`
3. Check CLI output: `claude -p "test" --output-format json`
4. Review logs: `RUST_LOG=debug`

### Issue: Test Failures

**Symptom**: `cargo test` or `npm test` fails

**Solutions**:

1. Check fixtures: Ensure test skills exist in `tests/fixtures/`
2. Update snapshots: `npm test -- -u` (if using snapshot testing)
3. Clean build: `cargo clean && cargo build`
4. Check imports: Verify paths in test files

### Issue: High Memory Usage

**Symptom**: App uses >500MB RAM

**Solutions**:

1. Check cache size: DashMap limited to 50 entries
2. Verify TTL: Entries expire after 24 hours
3. Manual eviction: Implement LRU in CachedResult
4. Profile: Use `cargo flamegraph` or Chrome DevTools

---

## 📚 Reference Documentation

### External Docs

- **Anthropic Skills Spec**: https://docs.anthropic.com/en/docs/build-with-claude/claude-code-skills
- **PDA Guide**: https://github.com/anthropics/skill-best-practices/blob/main/pda.md
- **Tauri Commands**: https://v2.tauri.app/develop/calling-rust/#async-commands
- **tokio Docs**: https://docs.rs/tokio/latest/tokio/
- **Zustand Docs**: https://docs.pmnd.rs/zustand/getting-started/introduction

### Internal Docs

- **Constitution**: `.specify/memory/constitution.md`
- **Feature 016 (Tab Pattern)**: `specs/016-improved-ui-layout/`
- **Feature 020 (Skill Scanner)**: `specs/020-test-backfill-critical-paths/`
- **SDD Skill**: `~/.claude/skills/sdd/`

---

## 🎯 Performance Targets

| Metric              | Target          | How to Measure                      |
| ------------------- | --------------- | ----------------------------------- |
| Analysis Time       | <60s for 95%    | Log timestamps in skill_analysis.rs |
| UI Polling Overhead | <10ms per cycle | Chrome DevTools Performance tab     |
| Cache Hit Rate      | >70%            | Add metrics to DashMap wrapper      |
| Memory Usage        | <50MB for cache | Chrome DevTools Memory profiler     |
| Test Execution      | <5s total       | `time cargo test && time npm test`  |

---

## 🔄 Update Checklist

When modifying this feature:

- [ ] Update data models in `data-model.md`
- [ ] Update API contracts in `contracts/`
- [ ] Add tests (>80% coverage)
- [ ] Update this quickstart if workflow changes
- [ ] Run full test suite: `task test`
- [ ] Check constitutional compliance
- [ ] Update CHANGELOG.md
- [ ] Update plan.md if architecture changes

---

## 🤝 Getting Help

1. **Read the spec**: `specs/021-skill-evaluation-pda-analysis/spec.md`
2. **Check the plan**: `specs/021-skill-evaluation-pda-analysis/plan.md`
3. **Review tests**: See existing tests for patterns
4. **Ask maintainer**: Reference this quickstart in questions
5. **Check constitution**: `.specify/memory/constitution.md`

---

**Status**: ✅ Ready for implementation
**Last Updated**: 2025-11-18
**Maintainer**: Feature 021 implementation team
