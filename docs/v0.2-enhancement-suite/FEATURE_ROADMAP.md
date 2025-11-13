# Skill Debugger Feature Roadmap - Complete Enhancement Suite

## Vision

Transform Skill Debugger from a basic skill viewer into a comprehensive skill intelligence platform with analysis, quality assessment, and management capabilities.

## GitHub Repository

- **Main Repository**: [SpillwaveSolutions/skills_viewer](https://github.com/SpillwaveSolutions/skills_viewer)
- **Current Version**: v0.1.0
- **Target Version**: v0.2.0

## Feature Groups

### Feature 004: UI/UX Polish & Fixes
**Priority**: P0 (Foundational - Must be done first)
**Status**: Planned
**Estimated Effort**: 1-2 days
**Lines of Code**: ~500

#### Problem Statement
Current UI has significant usability issues:
- Text crowded against borders (no margins)
- Inconsistent spacing between components
- Overview tab information order is illogical
- Duplicate descriptions displayed
- Text overflow in labels and buttons
- Python syntax highlighting breaks after first visit

#### User Stories

**US1: Proper Margins & Spacing**
- As a user, I want all text to have proper margins from borders so it's easier to read
- Acceptance: All text has ≥8px margin from borders/lines

**US2: Logical Overview Layout**
- As a user, I want the Overview tab to show information in logical order: name → description → version → triggers → stats
- Acceptance: Overview follows specified order, no duplicate descriptions

**US3: Text Overflow Prevention**
- As a user, I want labels and buttons to handle long text gracefully with ellipsis truncation
- Acceptance: No text overflow, ellipsis appears when needed

**US4: Persistent Syntax Highlighting**
- As a user, I want Python syntax highlighting to work every time I visit the Scripts tab
- Acceptance: Highlighting works on all visits, not just first

#### Technical Approach
- TailwindCSS class updates for margins (p-4 → p-6, add mx-auto)
- OverviewPanel component restructuring
- CSS text-overflow: ellipsis for labels
- Fix highlight.js re-initialization bug in ScriptsTab

#### Success Metrics
- Visual regression tests pass
- User testing shows improved readability
- Zero text overflow issues
- Syntax highlighting works 100% of visits

---

### Feature 005: AI-Powered Skill Analysis
**Priority**: P1 (High Value)
**Status**: Planned
**Estimated Effort**: 4-5 days
**Lines of Code**: ~2000
**New Tauri Commands**: 3

#### Problem Statement
Users have no way to understand:
- Whether their skill will actually trigger for user queries
- How to improve trigger keywords for better matching
- What makes a skill description effective
- How their skill compares to best practices

#### User Stories

**US1: Multi-CLI Skill Analysis**
- As a user, I want to analyze my entire skill directory using different AI CLIs (claude code, opencode, gemini, gh copilot)
- Acceptance: Can select CLI from dropdown, analysis completes in <30s, results show in UI

**US2: Enhanced Trigger Analysis**
- As a user, I want to see intelligent analysis of my skill's trigger effectiveness with LLM-powered insights
- Acceptance: Shows current triggers, suggests improvements, explains reasoning

**US3: Interactive Trigger Tester**
- As a user, I want to type a sample query and see if my skill would likely trigger
- Acceptance: Real-time prediction with confidence score (0-100%)

**US4: YAML Metadata Display**
- As a user, I want to see the actual triggers from my skill's YAML frontmatter clearly displayed
- Acceptance: Triggers shown as badges with categories (action, technology, format, topic)

**US5: Perplexity Best Practices**
- As a user, I want to see research-backed recommendations for improving my skill triggers
- Acceptance: Uses Perplexity MCP to fetch latest best practices, shows top 5 recommendations

#### Technical Architecture

**CLI Integration Layer**
```typescript
interface CLIProvider {
  name: 'claude' | 'opencode' | 'gemini' | 'gh-copilot';
  command: string;
  args: string[];
  available: boolean;
}
```

**Analysis Prompt Template**
```
Analyze this skill directory and provide:
1. Trigger effectiveness score (0-100)
2. Top 3 improvement recommendations
3. Example queries that should trigger this skill
4. Potential false positive scenarios

Skill directory: {skill_path}
Focus on SKILL.md, references/, and scripts/
```

**New Tauri Commands**
1. `detect_available_clis() -> Vec<CLIProvider>`
2. `analyze_skill_with_cli(cli_name, skill_path, prompt) -> AnalysisResult`
3. `test_trigger_match(skill_metadata, user_query) -> MatchPrediction`

#### UI Components

**New "Analysis" Tab**
- CLI selector dropdown (shows only available CLIs)
- Analysis trigger button
- Loading state with progress indicator
- Results panel with:
  - Trigger effectiveness score (circular progress)
  - Recommendations list (prioritized)
  - Example queries (copyable)
  - False positive warnings

**Enhanced "Triggers" Tab**
- Current triggers displayed as colored badges
- Interactive trigger tester (text input + test button)
- Match prediction with confidence meter
- Perplexity recommendations section

#### Success Metrics
- CLI detection accuracy: 100%
- Analysis completion rate: >95%
- User satisfaction with recommendations: >80%
- Trigger tester accuracy vs actual behavior: >85%

---

### Feature 006: Skill Quality Wizard
**Priority**: P2 (High Value)
**Status**: Planned
**Estimated Effort**: 2-3 days
**Lines of Code**: ~1000

#### Problem Statement
Users don't know:
- Whether their skill follows best practices
- When to break up large SKILL.md files
- How to structure references/ and scripts/ effectively
- What constitutes a "good" skill

#### User Stories

**US1: Quality Score Dashboard**
- As a user, I want to see an overall quality score for my skill with breakdown by criterion
- Acceptance: Shows 0-100 score with radar chart visualization

**US2: Detailed Grading Report**
- As a user, I want to see scores for each quality criterion with explanations
- Acceptance: 6-8 criteria shown, each with score, status (✓/⚠/✗), and description

**US3: Actionable Recommendations**
- As a user, I want specific suggestions for improving my skill's quality
- Acceptance: Shows top 3-5 recommendations, prioritized by impact

**US4: Refactoring Suggestions**
- As a user, I want the wizard to suggest when and how to break up large files
- Acceptance: Identifies sections that should move to references/, provides file names

#### Quality Scoring Rubric

**Criterion 1: SKILL.md Size (Weight: 25%)**
- Score: `max(0, 100 - (word_count - 5000) / 50)` if > 5000 words
- Score: 100 if ≤ 5000 words
- Rationale: Large files consume context budget inefficiently

**Criterion 2: References Usage (Weight: 20%)**
- Score: 0 if no references/ directory
- Score: 50 if references/ exists but empty
- Score: 100 if ≥3 reference files with meaningful content
- Rationale: Progressive disclosure is key to good skills

**Criterion 3: Scripts Usage (Weight: 20%)**
- Score: 0 if no scripts/ directory
- Score: 50 if scripts/ exists but empty
- Score: 100 if ≥1 working script
- Rationale: Scripts offload deterministic work from LLM

**Criterion 4: Clear Triggers (Weight: 15%)**
- Score: 0 if no triggers in YAML
- Score: 50 if triggers exist but <3 keywords
- Score: 100 if ≥5 unambiguous trigger keywords
- Rationale: Explicit triggers improve skill matching

**Criterion 5: Description Clarity (Weight: 15%)**
- Score: 0 if no description
- Score: 50 if description exists but lacks "when to use"
- Score: 100 if includes purpose + when to use + examples
- Rationale: Clear descriptions help users and LLM match intent

**Criterion 6: Progressive Disclosure (Weight: 10%)**
- Score: Ratio of SKILL.md size to references/ total size
- Score: 100 if references/ > SKILL.md (good)
- Score: 50 if references/ ≈ SKILL.md (okay)
- Score: 0 if no references/ (bad)
- Rationale: Main file should be concise guide, details in references

**Overall Score**
```
total_score = (
  size_score * 0.25 +
  references_score * 0.20 +
  scripts_score * 0.20 +
  triggers_score * 0.15 +
  description_score * 0.15 +
  disclosure_score * 0.10
)
```

#### UI Components

**New "Quality" Tab**
- Overall score display (large circular progress, color-coded)
- Radar chart showing 6 criteria
- Detailed breakdown table:
  - Criterion name
  - Score (0-100)
  - Status icon (✓ green, ⚠ yellow, ✗ red)
  - Description
  - Recommendation
- "Refactor Suggestions" expandable panel
- "Export Report" button (markdown format)

#### Recommendations Logic

**If SKILL.md > 5000 words:**
- "Consider moving detailed examples to `references/examples.md`"
- "Break up long sections into separate reference files"
- Suggest specific sections to extract (based on heading analysis)

**If no references/:**
- "Create a `references/` directory for detailed documentation"
- "Move API documentation to `references/api.md`"
- "Add `references/quickstart.md` for common use cases"

**If no scripts/:**
- "Consider adding helper scripts for common tasks"
- "Offload deterministic operations to Python/Bash scripts"
- Suggest scripts based on skill type (e.g., PDF skill → rotation script)

**If <3 triggers:**
- "Add more specific trigger keywords"
- "Include action verbs (create, generate, convert, etc.)"
- "Add file format keywords if applicable"

#### Success Metrics
- Score accuracy vs manual assessment: ±10%
- Recommendations implemented by users: >60%
- Users agree with quality assessment: >80%

---

### Feature 007: Skill Sync & Management
**Priority**: P3 (Nice to Have)
**Status**: Planned
**Estimated Effort**: 5-7 days
**Lines of Code**: ~2500
**New Tauri Commands**: 5

#### Problem Statement
Users have skills scattered across:
- `~/.claude/skills` (Claude Code)
- `~/.config/opencode/skills` (OpenCode)

There's no way to:
- See which skills exist where
- Copy skills between systems
- Ensure consistency across environments
- Navigate from SKILL.md links to actual references/scripts

#### User Stories

**US1: Skill Diff Viewer**
- As a user, I want to see which skills exist in Claude but not OpenCode (and vice versa)
- Acceptance: Shows table with skill name, claude status, opencode status

**US2: Safe Skill Copy**
- As a user, I want to copy skills from one location to another with safety guarantees
- Acceptance: Dry-run preview, automatic backup, confirmation dialog, rollback capability

**US3: Conflict Resolution**
- As a user, I want to see diffs when a skill exists in both locations with different content
- Acceptance: Shows side-by-side diff, lets me choose which to keep

**US4: Clickable Links in SKILL.md**
- As a user, I want to click references/ and scripts/ links in SKILL.md and navigate to them
- Acceptance: Clicking `references/api.md` opens References tab filtered to that file

**US5: Bidirectional Sync**
- As a user, I want to sync all missing skills in both directions automatically
- Acceptance: One-click sync with preview of all operations

#### Constitutional Amendment Required

Current constitution states:
> "Read-only by design: No file modifications, only safe reads"

Proposed amendment:
> "Write operations allowed with safety guardrails:
> 1. All writes require explicit user confirmation
> 2. Automatic backups created before modifications
> 3. Dry-run mode shows preview before execution
> 4. Rollback capability for last 10 operations
> 5. File integrity checks after writes"

#### Success Metrics
- Zero data loss during sync operations
- Backup/restore works 100% of time
- Users feel confident using sync features
- Link navigation works for all reference/script links
- Sync completion time <5s for typical skill

---

## Implementation Strategy

### Phase 1: High-Level Design (Week 1, Days 1-2)
1. Create FEATURE_ROADMAP.md
2. Create ARCHITECTURE.md (technical details)
3. Create QUALITY_RUBRIC.md (detailed scoring algorithms)
4. Constitutional amendment for write operations

### Phase 2: Feature 004 - UI/UX Polish (Week 1, Days 3-5)
1. Run `/speckit.specify` with UI/UX requirements
2. Run `/speckit.plan` for technical breakdown
3. Run `/speckit.tasks` for implementation checklist
4. Implement following SDD workflow
5. Test, verify, deploy

### Phase 3-6: Remaining Features (Weeks 2-5)
- Follow SDD workflow for each feature
- Test, verify, deploy incrementally

## Success Criteria (Overall)

### Technical
- ✅ All tests pass (>90% coverage)
- ✅ No performance regression (<3s response times)
- ✅ Zero data loss incidents
- ✅ All 4 CLIs integrate successfully
- ✅ Cross-platform compatibility (macOS, Linux, Windows)

### User Experience
- ✅ Users rate UI improvements >4/5
- ✅ Analysis features used by >70% of users
- ✅ Quality scores match manual assessment (±10%)
- ✅ Sync operations complete without user intervention >95% of time

---

**Document Version**: 1.0
**Last Updated**: 2025-01-12
**Owner**: Richard Hightower
**Status**: Approved for Implementation
