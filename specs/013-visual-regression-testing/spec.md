# Feature Specification: Visual Regression Testing + Diagram Fixes

**Feature Branch**: `013-visual-regression-testing`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "Visual Regression Testing + Diagram Fixes - Comprehensive solution to prevent UI breakage from passing selector-based E2E tests. Implements screenshot capture + Claude vision API analysis at checkpoints. Includes fixing broken diagram zoom/pan functionality after react-zoom-pan-pinch v5 upgrade."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Fix Broken Diagram Interaction (Priority: P0)

**As a** skill debugger user
**I want** diagram zoom wheel and pan/drag to work correctly
**So that** I can effectively explore and interact with skill architecture diagrams

**Why this priority**: CRITICAL - diagram functionality is completely broken. Users cannot zoom or pan diagrams, making the Diagram tab unusable. This is a regression from the react-zoom-pan-pinch v5 upgrade that blocks primary feature usage.

**Independent Test**: Can be fully tested by loading any skill with a diagram (e.g., puml), clicking Diagram tab, attempting to zoom with mouse wheel and pan by dragging. Delivers immediate value by restoring lost functionality.

**Acceptance Scenarios**:

1. **Given** a skill with a diagram is selected, **When** user scrolls mouse wheel over diagram, **Then** diagram zooms in/out smoothly
2. **Given** a diagram is displayed, **When** user clicks and drags on diagram, **Then** diagram pans in the direction of drag
3. **Given** a diagram is zoomed/panned, **When** user clicks "Reset" button, **Then** diagram returns to original scale and position
4. **Given** a diagram is displayed, **When** user uses zoom controls (+/-), **Then** diagram zooms correctly around center point

---

### User Story 2 - Automated Screenshot Capture at Checkpoints (Priority: P0)

**As a** developer working on the skill debugger
**I want** automated screenshots captured for each panel/tab at checkpoint boundaries
**So that** I have visual evidence of UI correctness before proceeding to the next development phase

**Why this priority**: CRITICAL - addresses root cause of repeated UI breakage. Current E2E tests verify DOM elements exist but don't catch blank screens, broken rendering, or visual corruption. Screenshot capture is the foundation for visual verification.

**Independent Test**: Can be fully tested by running checkpoint script, verifying screenshots are captured for all 6 tabs (Overview, Content, Diagram, References, Scripts, Triggers) with proper naming and metadata. Delivers immediate documentation value even before vision analysis.

**Acceptance Scenarios**:

1. **Given** app is running with puml skill selected, **When** visual checkpoint script executes, **Then** 6 screenshots are captured (one per tab) with descriptive filenames
2. **Given** screenshot capture runs, **When** execution completes, **Then** JSON metadata files are created alongside each screenshot with expectations
3. **Given** checkpoint runs during E2E test, **When** any screenshot capture fails, **Then** test fails immediately with clear error message
4. **Given** screenshot directory exists from previous run, **When** new checkpoint executes, **Then** old screenshots are archived with timestamp, not overwritten

---

### User Story 3 - Claude Vision-Based Visual Verification (Priority: P1)

**As a** developer working on the skill debugger
**I want** Claude Code to analyze screenshots and verify visual correctness
**So that** UI regressions are caught automatically before I proceed to the next phase

**Why this priority**: HIGH - provides automated validation that "the app LOOKS correct to a human eye". This closes the gap between passing E2E selectors and actual visual correctness. Prevents time waste from late-discovered UI bugs.

**Independent Test**: Can be fully tested by providing Claude with a known-good screenshot and a known-broken screenshot (blank screen), verifying it correctly identifies the broken state. Delivers value by catching visual issues selector tests miss.

**Acceptance Scenarios**:

1. **Given** screenshots and expectations are captured, **When** Claude vision analysis runs, **Then** each screenshot is verified against its "should contain" criteria
2. **Given** a screenshot shows blank screen, **When** Claude analyzes it, **Then** analysis FAILS with specific description of what's missing
3. **Given** a screenshot shows correct UI, **When** Claude analyzes it, **Then** analysis PASSES and confirms all expected elements are visible
4. **Given** a screenshot shows broken diagram rendering, **When** Claude analyzes diagram tab screenshot, **Then** analysis FAILS describing the rendering issue
5. **Given** analysis completes, **When** results are available, **Then** clear pass/fail summary is generated with specific failures highlighted

---

### User Story 4 - Checkpoint Integration into SDD Workflow (Priority: P1)

**As a** developer following SDD methodology
**I want** visual verification integrated into phase completion checkpoints
**So that** I cannot proceed to the next phase with broken UI

**Why this priority**: HIGH - enforces quality gates in development workflow. Makes visual verification a mandatory step, not an optional manual check. Aligns with SDD principles of systematic, checkpoint-based progression.

**Independent Test**: Can be fully tested by completing a feature phase, running checkpoint script, and verifying it blocks progression if visual tests fail. Delivers workflow enforcement value.

**Acceptance Scenarios**:

1. **Given** developer completes Phase N tasks, **When** checkpoint script runs, **Then** visual tests execute automatically before phase is marked complete
2. **Given** visual tests detect UI breakage, **When** checkpoint completes, **Then** phase is NOT marked complete and specific failures are reported
3. **Given** visual tests all pass, **When** checkpoint completes, **Then** phase is marked complete and developer can proceed to Phase N+1
4. **Given** checkpoint runs, **When** execution time is measured, **Then** total checkpoint overhead is under 2 minutes (acceptable for quality gate)

---

### Edge Cases

- **What happens when Playwright cannot launch browser?** System should fail fast with clear error message directing user to run `npx playwright install chromium`
- **What happens when skill has no diagram content?** Diagram tab screenshot should verify "no diagram available" message is shown, not blank screen
- **What happens when screenshot capture fails mid-execution?** System should save partial results, report which screenshots succeeded, and allow retry of failed captures only
- **What happens when Claude vision API is unavailable?** System should fall back to saving screenshots with expectations for manual review, and clearly indicate automatic verification was skipped
- **What happens when expected UI changes legitimately?** Developer can update expectation JSON files to reflect new expected state (with required justification in commit message)
- **What happens when app is not running during checkpoint?** System should auto-start app in background, wait for ready state, capture screenshots, then optionally shut down
- **What happens when multiple skills need visual testing?** System should support parallel execution across multiple agents to test different skills concurrently (future enhancement)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restore diagram zoom wheel functionality to zoom in/out when scrolling over diagram area
- **FR-002**: System MUST restore diagram pan/drag functionality to allow clicking and dragging to move diagram viewport
- **FR-003**: System MUST provide Playwright-based screenshot capture for all 6 tabs: Overview, Content, Diagram, References, Scripts, Triggers
- **FR-004**: System MUST save screenshots with descriptive filenames including test name and timestamp (e.g., `puml-diagram-1699900000.png`)
- **FR-005**: System MUST generate JSON metadata files alongside screenshots containing visual expectations (should/shouldNot criteria)
- **FR-006**: System MUST provide Claude Code integration to analyze screenshots against expectations using vision API
- **FR-007**: System MUST report clear pass/fail results for each screenshot with specific descriptions of failures
- **FR-008**: System MUST integrate visual verification into checkpoint workflow as mandatory quality gate
- **FR-009**: System MUST complete full checkpoint visual verification (6 screenshots + analysis) in under 2 minutes
- **FR-010**: System MUST archive previous screenshots before capturing new ones to prevent data loss
- **FR-011**: System MUST detect and report blank screen scenarios specifically (high-priority failure case)
- **FR-012**: System MUST detect and report broken diagram rendering (SVG/Mermaid failures)
- **FR-013**: System MUST provide npm script commands for running visual tests: `npm run test:visual` and `npm run test:visual:analyze`
- **FR-014**: System MUST fail fast with actionable error messages when prerequisites are missing (browser, app not running, etc.)
- **FR-015**: System MUST support updating visual expectations when legitimate UI changes occur

### Key Entities _(include if feature involves data)_

- **VisualExpectation**: Represents expected visual state for a screenshot
  - `should`: Array of strings describing what MUST be visible (e.g., "Skill name displayed prominently", "Diagram renders as SVG")
  - `shouldNot`: Array of strings describing what MUST NOT be visible (e.g., "Blank white screen", "Error messages")
  - `description`: Human-readable summary of expected state (e.g., "Overview panel showing puml skill metadata")

- **VisualTestResult**: Represents captured screenshot + metadata
  - `screenshot`: File path to PNG screenshot
  - `expectation`: Associated VisualExpectation object
  - `timestamp`: ISO 8601 timestamp of capture
  - `testName`: Identifier for the test (e.g., "puml-diagram")

- **VisualAnalysisReport**: Represents Claude vision API analysis result
  - `testName`: Identifier linking to VisualTestResult
  - `passed`: Boolean pass/fail status
  - `findings`: Array of specific observations (what was found)
  - `failures`: Array of specific failures (expected but missing, or unexpected present)
  - `confidence`: Confidence level of analysis (high/medium/low)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Diagram zoom wheel zooms in/out smoothly on all tested browsers (Chrome, Firefox, Safari)
- **SC-002**: Diagram pan/drag moves viewport in all 4 directions without lag or jitter
- **SC-003**: All 6 tabs (Overview, Content, Diagram, References, Scripts, Triggers) have automated screenshot capture
- **SC-004**: Visual verification catches 100% of blank screen scenarios in test runs
- **SC-005**: Visual verification catches 100% of broken diagram rendering scenarios in test runs
- **SC-006**: Checkpoint visual verification completes in under 2 minutes for single skill (6 screenshots + analysis)
- **SC-007**: Zero false positives - visual tests do not fail when UI is correct
- **SC-008**: Zero false negatives - visual tests do not pass when UI is broken (primary success criterion)
- **SC-009**: Developer can update visual expectations in under 5 minutes when legitimate UI changes occur
- **SC-010**: Visual test failure messages include specific, actionable descriptions (not generic "failed" messages)

### Quality Gates

- **QG-001**: All diagram interaction tests pass before merging
- **QG-002**: Visual verification infrastructure is documented in project README
- **QG-003**: At least 1 known-broken UI state (e.g., blank screen) is verified to fail visual tests
- **QG-004**: Visual verification is integrated into at least one SDD checkpoint (e.g., end of Phase 3)
- **QG-005**: Test coverage includes all 6 tabs for at least 1 reference skill (puml recommended)

## Non-Functional Requirements

- **NFR-001**: Screenshot capture must not require manual browser interaction (fully automated)
- **NFR-002**: Screenshot files must be under 500KB each for efficient storage and transmission
- **NFR-003**: Visual verification must work in CI/CD environments (headless browser support)
- **NFR-004**: System must gracefully handle Claude API rate limits or unavailability
- **NFR-005**: Screenshot directory structure must be organized by date/feature for easy cleanup

## Out of Scope (Future Enhancements)

- **OS-001**: Parallel visual testing across multiple skills using Task agents (Phase 3 of original proposal)
- **OS-002**: Background visual monitoring during development (continuous verification)
- **OS-003**: Automated visual diff reports comparing baseline vs current screenshots
- **OS-004**: Visual regression testing for component-level changes (currently feature-level only)
- **OS-005**: Mobile/responsive visual testing (desktop only for v1)
- **OS-006**: Video recording of user interactions (screenshots only for v1)

## Dependencies

- **Playwright** (already installed) - screenshot capture
- **Chromium browser** - must be installed via `npx playwright install chromium`
- **Claude Code vision API** - multimodal analysis capability (already available)
- **Running app instance** - app must be running on localhost:1420 for screenshot capture
- **react-zoom-pan-pinch library** - understanding of v5 API changes required for diagram fix

## Risks & Mitigations

| Risk                                      | Impact | Likelihood | Mitigation                                                                             |
| ----------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------- |
| Diagram fix breaks other diagram features | High   | Medium     | Comprehensive manual testing of all diagram interactions before checkpoint             |
| Screenshot capture too slow (>2 min)      | Medium | Low        | Optimize by capturing only changed tabs, use parallel capture if needed                |
| Claude vision API false negatives         | High   | Medium     | Start with strict expectations, refine based on actual failures, allow manual override |
| Storage bloat from screenshots            | Low    | High       | Automated cleanup of screenshots older than 30 days, archive strategy                  |
| CI/CD environment differences             | Medium | Medium     | Test in headless mode locally before CI integration                                    |

## Timeline Estimate

**Total: 7-10 hours**

- **Diagram Fix (US1)**: 2-3 hours
  - Investigate react-zoom-pan-pinch v5 API changes
  - Implement zoom wheel handler fix
  - Implement pan/drag handler fix
  - Test all diagram interactions

- **Screenshot Infrastructure (US2)**: 2-3 hours
  - Create `visual-verification.ts` helper
  - Create `visual-regression.spec.ts` test suite
  - Implement archive strategy
  - Add npm scripts

- **Claude Vision Integration (US3)**: 2-3 hours
  - Create `analyze-visual-tests.ts` script
  - Implement vision API integration
  - Implement pass/fail reporting
  - Test with known-good and known-bad screenshots

- **Checkpoint Integration (US4)**: 1-2 hours
  - Update checkpoint scripts
  - Add visual verification step
  - Document workflow
  - Test full checkpoint execution

## Validation Checklist

Before moving to plan.md, verify:

- [x] All user stories are independently testable
- [x] User stories are prioritized (P0, P1)
- [x] Each story has clear acceptance scenarios in Given/When/Then format
- [x] Functional requirements are specific and testable (MUST statements)
- [x] Success criteria are measurable and technology-agnostic
- [x] Edge cases cover failure scenarios
- [x] Dependencies are clearly listed
- [x] Timeline estimate is realistic based on scope
- [x] Out of scope items are explicitly documented

## Clarification Questions

None at this time - specification is clear and actionable based on:

- Historical issues documented (blank screens, broken diagrams)
- User's explicit requirements for screenshot + vision workflow
- Existing VISUAL_REGRESSION_TESTING_PROPOSAL.md provides detailed implementation guidance
- Clear technical constraint: react-zoom-pan-pinch v5 API changes broke zoom/pan
