# Tasks: Keyboard Shortcuts

**Input**: Design documents from `/specs/019-keyboard-shortcuts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature follows TDD methodology. All test tasks are REQUIRED and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow the structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install Radix UI Dialog dependency (`npm install @radix-ui/react-dialog@^1.0.5`)
- [x] T002 Install Tauri OS plugin dependency (`npm install @tauri-apps/plugin-os@^2.0.0`)
- [x] T003 [P] Install vitest-axe for accessibility testing (`npm install -D vitest-axe@^0.1.0` - used latest stable)
- [x] T004 [P] Verify Playwright is installed for E2E tests (v1.56.1 already installed)

**Checkpoint**: Dependencies installed, ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core keyboard infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Utility Functions & Platform Detection

- [ ] T005 Create platform detection utilities in `src/utils/keyboardUtils.ts`
- [ ] T006 Implement `getPlatform()` function using `navigator.userAgentData` with Tauri fallback
- [ ] T007 Implement `matchesModifiers()` function for cross-platform key matching (Cmd/Ctrl)
- [ ] T008 Write unit tests for `keyboardUtils.ts` in `src/utils/__tests__/keyboardUtils.test.ts`

### Core Hook Implementation

- [ ] T009 Create TypeScript types in `src/types/keyboard.ts` (KeyboardShortcut, Modifier, ShortcutCategory, PlatformInfo)
- [ ] T010 Create `useKeyboardShortcuts` hook skeleton in `src/hooks/useKeyboardShortcuts.ts`
- [ ] T011 Implement shortcut registry (Map-based) with O(1) lookup by key
- [ ] T012 Implement `registerShortcut()` function with validation (duplicate ID check, description length)
- [ ] T013 Implement `unregisterShortcut()` function
- [ ] T014 Implement `isShortcutActive()` function (checks condition if present)
- [ ] T015 Implement `getAllShortcuts()` function returning Map<ShortcutCategory, KeyboardShortcut[]>
- [ ] T016 Implement `handleKeyDown()` event handler with shortcut matching logic
- [ ] T017 Add preventDefault() and stopPropagation() to prevent browser conflicts
- [ ] T018 Write comprehensive unit tests for `useKeyboardShortcuts.ts` in `src/hooks/__tests__/useKeyboardShortcuts.test.ts`

### ARIA Live Announcer Component

- [ ] T019 Create `AriaLiveAnnouncer.tsx` component in `src/components/AriaLiveAnnouncer.tsx`
- [ ] T020 Implement role="status", aria-live="polite", aria-atomic="true" attributes
- [ ] T021 Add 100ms delay for screen reader detection
- [ ] T022 Add sr-only Tailwind class for visual hiding
- [ ] T023 Write unit tests for `AriaLiveAnnouncer.tsx` in `src/components/__tests__/AriaLiveAnnouncer.test.tsx`

### Global Keyboard Listener Setup

- [ ] T024 Integrate `useKeyboardShortcuts` hook into `src/App.tsx`
- [ ] T025 Add global window.addEventListener('keydown', handleKeyDown) in useEffect
- [ ] T026 Ensure cleanup with removeEventListener in useEffect return

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Search Access (Priority: P1) 🎯 MVP

**Goal**: Press Cmd/Ctrl+F to instantly focus search field with text selected for easy replacement

**Independent Test**: From any location in app, press Cmd/Ctrl+F → search input receives focus and existing text is selected

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL)

- [ ] T027 [P] [US1] Write unit test: "should focus search on Cmd/Ctrl+F" in `src/components/__tests__/SearchBar.test.tsx`
- [ ] T028 [P] [US1] Write unit test: "should select existing text when focusing via shortcut" in `src/components/__tests__/SearchBar.test.tsx`
- [ ] T029 [P] [US1] Write integration test: "search focus works from Skills tab" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T030 [P] [US1] Write integration test: "search focus works from Diagram tab" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T031 [P] [US1] Write E2E test: "Cmd/Ctrl+F focuses search in running app" in `tests/e2e/keyboard-shortcuts.spec.ts`
- [ ] T032 [P] [US1] Write accessibility test: "search focus announces to screen reader" in `src/components/__tests__/SearchBar.a11y.test.tsx`

**Run tests - ALL should FAIL**

### Implementation for User Story 1

- [ ] T033 [US1] Add searchInputRef (useRef<HTMLInputElement>) to `src/components/SearchBar.tsx`
- [ ] T034 [US1] Register "search-focus" shortcut in `src/App.tsx` (id: "search-focus", key: "f", modifiers: ["ctrl", "cmd"])
- [ ] T035 [US1] Implement handler: focus search input using searchInputRef.current?.focus()
- [ ] T036 [US1] Implement handler: select existing text using searchInputRef.current?.select()
- [ ] T037 [US1] Add ARIA live announcement "Search field focused" on Cmd/Ctrl+F
- [ ] T038 [US1] Test manually on macOS (Cmd+F) and verify focus + text selection
- [ ] T039 [US1] Test manually on Windows/Linux (Ctrl+F) and verify focus + text selection
- [ ] T040 [US1] Verify all tests from T027-T032 now PASS

**Checkpoint**: Search focus shortcut (Cmd/Ctrl+F) fully functional and tested

---

## Phase 4: User Story 2 - Rapid Tab Switching (Priority: P1)

**Goal**: Press Cmd/Ctrl+1-6 to instantly switch between tabs when skill is selected

**Independent Test**: Select a skill, press Cmd/Ctrl+2 → Details tab activates, press Cmd/Ctrl+6 → Diagram tab activates

### Tests for User Story 2 (TDD - Write FIRST, ensure FAIL)

- [ ] T041 [P] [US2] Write unit test: "should switch to Details tab on Cmd/Ctrl+2 when skill selected" in `src/components/__tests__/SkillViewer.test.tsx`
- [ ] T042 [P] [US2] Write unit test: "should switch to Diagram tab on Cmd/Ctrl+6 when skill selected" in `src/components/__tests__/SkillViewer.test.tsx`
- [ ] T043 [P] [US2] Write unit test: "should NOT switch tabs when no skill selected (Cmd/Ctrl+2-6)" in `src/components/__tests__/SkillViewer.test.tsx`
- [ ] T044 [P] [US2] Write unit test: "should always switch to Skills tab on Cmd/Ctrl+1" in `src/components/__tests__/SkillViewer.test.tsx`
- [ ] T045 [P] [US2] Write integration test: "tab switching works on macOS (Cmd+2-6)" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T046 [P] [US2] Write integration test: "tab switching works on Windows (Ctrl+2-6)" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T047 [P] [US2] Write E2E test: "Cmd/Ctrl+1-6 switches tabs in running app" in `tests/e2e/keyboard-shortcuts.spec.ts`
- [ ] T048 [P] [US2] Write accessibility test: "tab switch announces to screen reader" in `src/components/__tests__/SkillViewer.a11y.test.tsx`

**Run tests - ALL should FAIL**

### Implementation for User Story 2

- [ ] T049 [P] [US2] Register "tab-skills" shortcut (key: "1", modifiers: ["ctrl", "cmd"], no condition) in `src/App.tsx`
- [ ] T050 [P] [US2] Register "tab-details" shortcut (key: "2", modifiers: ["ctrl", "cmd"], condition: selectedSkill !== null) in `src/App.tsx`
- [ ] T051 [P] [US2] Register "tab-triggers" shortcut (key: "3", modifiers: ["ctrl", "cmd"], condition: selectedSkill !== null) in `src/App.tsx`
- [ ] T052 [P] [US2] Register "tab-references" shortcut (key: "4", modifiers: ["ctrl", "cmd"], condition: selectedSkill !== null) in `src/App.tsx`
- [ ] T053 [P] [US2] Register "tab-scripts" shortcut (key: "5", modifiers: ["ctrl", "cmd"], condition: selectedSkill !== null) in `src/App.tsx`
- [ ] T054 [P] [US2] Register "tab-diagram" shortcut (key: "6", modifiers: ["ctrl", "cmd"], condition: selectedSkill !== null) in `src/App.tsx`
- [ ] T055 [US2] Integrate shortcuts with Zustand store `setActiveTab()` function
- [ ] T056 [US2] Add ARIA live announcement "{Tab Name} tab active" on tab switch
- [ ] T057 [US2] Test manually: Cmd/Ctrl+1 works without skill selected
- [ ] T058 [US2] Test manually: Cmd/Ctrl+2-6 only work when skill selected
- [ ] T059 [US2] Verify all tests from T041-T048 now PASS

**Checkpoint**: Tab switching shortcuts (Cmd/Ctrl+1-6) fully functional and tested

---

## Phase 5: User Story 3 - Keyboard-Driven Skill Selection (Priority: P2)

**Goal**: Navigate skill list with arrow keys (Up/Down/Home/End) and select with Enter, all without touching mouse

**Independent Test**: Focus skill list, press Down arrow → next skill highlights, press Enter → skill selects and Details tab opens

### Tests for User Story 3 (TDD - Write FIRST, ensure FAIL)

- [ ] T060 [P] [US3] Write unit test: "should highlight next skill on ArrowDown" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T061 [P] [US3] Write unit test: "should highlight previous skill on ArrowUp" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T062 [P] [US3] Write unit test: "should jump to first skill on Home key" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T063 [P] [US3] Write unit test: "should jump to last skill on End key" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T064 [P] [US3] Write unit test: "should select highlighted skill on Enter" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T065 [P] [US3] Write unit test: "should stay at bottom when ArrowDown at end of list" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T066 [P] [US3] Write unit test: "should stay at top when ArrowUp at start of list" in `src/components/__tests__/SkillList.test.tsx`
- [ ] T067 [P] [US3] Write integration test: "arrow navigation works with filtered search results" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T068 [P] [US3] Write E2E test: "arrow keys navigate and Enter selects in running app" in `tests/e2e/keyboard-shortcuts.spec.ts`
- [ ] T069 [P] [US3] Write accessibility test: "skill navigation announces to screen reader" in `src/components/__tests__/SkillList.a11y.test.tsx`

**Run tests - ALL should FAIL**

### Implementation for User Story 3

- [ ] T070 [US3] Add focusedIndex state (useState<number>) to `src/components/SkillList.tsx`
- [ ] T071 [US3] Add keyboard event handler to skill list container (onKeyDown)
- [ ] T072 [US3] Implement ArrowDown handler: increment focusedIndex (clamp to list length)
- [ ] T073 [US3] Implement ArrowUp handler: decrement focusedIndex (clamp to 0)
- [ ] T074 [US3] Implement Home handler: set focusedIndex to 0
- [ ] T075 [US3] Implement End handler: set focusedIndex to skills.length - 1
- [ ] T076 [US3] Implement Enter handler: call Zustand setSelectedSkill(skills[focusedIndex])
- [ ] T077 [US3] Add visual focus indicator (border or background highlight) on focused skill
- [ ] T078 [US3] Add ARIA live announcement "{Skill Name}, {index + 1} of {total}" on navigation
- [ ] T079 [US3] Ensure keyboard navigation works with filtered search results
- [ ] T080 [US3] Test manually: arrow keys navigate without wrapping at boundaries
- [ ] T081 [US3] Test manually: Enter selects skill and opens Details tab
- [ ] T082 [US3] Verify all tests from T060-T069 now PASS

**Checkpoint**: Skill list keyboard navigation fully functional and tested

---

## Phase 6: User Story 4 - Quick Search Clear (Priority: P2)

**Goal**: Press Escape to quickly clear search text and restore full skill list

**Independent Test**: Enter search text "react", press Escape → search clears, all skills shown again

### Tests for User Story 4 (TDD - Write FIRST, ensure FAIL)

- [ ] T083 [P] [US4] Write unit test: "should clear search text on Escape" in `src/components/__tests__/SearchBar.test.tsx`
- [ ] T084 [P] [US4] Write unit test: "should restore full skill list on Escape" in `src/components/__tests__/SearchBar.test.tsx`
- [ ] T085 [P] [US4] Write unit test: "should blur search field if empty on Escape" in `src/components/__tests__/SearchBar.test.tsx`
- [ ] T086 [P] [US4] Write integration test: "Escape clears search and shows all skills" in `tests/integration/keyboard-shortcuts.test.tsx`
- [ ] T087 [P] [US4] Write E2E test: "Escape clears search in running app" in `tests/e2e/keyboard-shortcuts.spec.ts`
- [ ] T088 [P] [US4] Write accessibility test: "search clear announces to screen reader" in `src/components/__tests__/SearchBar.a11y.test.tsx`

**Run tests - ALL should FAIL**

### Implementation for User Story 4

- [ ] T089 [US4] Add keyboard event handler to `src/components/SearchBar.tsx` (onKeyDown)
- [ ] T090 [US4] Implement Escape handler: clear search input value (set to empty string)
- [ ] T091 [US4] Implement Escape handler: trigger search update to restore full skill list
- [ ] T092 [US4] Implement Escape handler: if search was empty, blur input and restore previous focus
- [ ] T093 [US4] Add ARIA live announcement "Search cleared" on Escape
- [ ] T094 [US4] Test manually: Escape clears search text and restores all skills
- [ ] T095 [US4] Test manually: Escape blurs search if already empty
- [ ] T096 [US4] Verify all tests from T083-T088 now PASS

**Checkpoint**: Search clear shortcut (Escape) fully functional and tested

---

## Phase 7: User Story 5 - Keyboard Shortcut Help (Priority: P3)

**Goal**: Press Cmd/Ctrl+/ to view all available keyboard shortcuts in a help overlay

**Independent Test**: From anywhere in app, press Cmd/Ctrl+/ → help overlay appears with all shortcuts grouped by category, press Escape → overlay closes

### Tests for User Story 5 (TDD - Write FIRST, ensure FAIL)

- [ ] T097 [P] [US5] Write unit test: "should open help overlay on Cmd/Ctrl+/" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T098 [P] [US5] Write unit test: "should close help overlay on Escape" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T099 [P] [US5] Write unit test: "should close help overlay on outside click" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T100 [P] [US5] Write unit test: "should display shortcuts grouped by category" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T101 [P] [US5] Write unit test: "should format shortcuts with platform-specific modifiers (Cmd vs Ctrl)" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T102 [P] [US5] Write unit test: "should restore focus to trigger element on close" in `src/components/__tests__/KeyboardShortcutsHelp.test.tsx`
- [ ] T103 [P] [US5] Write E2E test: "Cmd/Ctrl+/ opens help overlay in running app" in `tests/e2e/keyboard-shortcuts.spec.ts`
- [ ] T104 [P] [US5] Write accessibility test: "help overlay has no axe violations" in `src/components/__tests__/KeyboardShortcutsHelp.a11y.test.tsx`
- [ ] T105 [P] [US5] Write accessibility test: "help overlay announces to screen reader" in `src/components/__tests__/KeyboardShortcutsHelp.a11y.test.tsx`

**Run tests - ALL should FAIL**

### Implementation for User Story 5

- [ ] T106 [US5] Create `KeyboardShortcutsHelp.tsx` component in `src/components/KeyboardShortcutsHelp.tsx`
- [ ] T107 [US5] Implement Radix Dialog.Root with isOpen prop and onOpenChange callback
- [ ] T108 [US5] Implement Dialog.Portal with Overlay and Content
- [ ] T109 [US5] Add Dialog.Title "Keyboard Shortcuts"
- [ ] T110 [US5] Add Dialog.Description for screen readers (sr-only)
- [ ] T111 [US5] Fetch shortcuts using `getAllShortcuts()` from useKeyboardShortcuts hook
- [ ] T112 [US5] Render shortcuts grouped by category (Navigation, Search, Selection, Help)
- [ ] T113 [US5] Create `formatShortcut()` helper function for platform-specific display (Cmd vs Ctrl)
- [ ] T114 [US5] Implement special key formatting (ArrowDown → ↓, ArrowUp → ↑, Escape → Esc)
- [ ] T115 [US5] Style shortcuts with <kbd> elements (px-2 py-1 bg-gray-100 rounded text-sm font-mono)
- [ ] T116 [US5] Add Dialog.Close button at bottom
- [ ] T117 [US5] Add isHelpOpen state to `src/App.tsx`
- [ ] T118 [US5] Register "help-toggle" shortcut (key: "/", modifiers: ["ctrl", "cmd"]) in `src/App.tsx`
- [ ] T119 [US5] Implement handler: setIsHelpOpen(true)
- [ ] T120 [US5] Render KeyboardShortcutsHelp component in `src/App.tsx` with isOpen and onClose props
- [ ] T121 [US5] Test manually: Cmd/Ctrl+/ opens help overlay
- [ ] T122 [US5] Test manually: Escape closes help overlay
- [ ] T123 [US5] Test manually: Click outside closes help overlay
- [ ] T124 [US5] Test manually: macOS shows "Cmd" in shortcuts, Windows/Linux show "Ctrl"
- [ ] T125 [US5] Verify all tests from T097-T105 now PASS

**Checkpoint**: Help overlay (Cmd/Ctrl+/) fully functional, accessible, and tested

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance Optimization

- [ ] T126 [P] Verify keyboard event processing <10ms using Performance.now() measurements
- [ ] T127 [P] Verify search focus time <100ms
- [ ] T128 [P] Verify tab switch time <100ms
- [ ] T129 [P] Verify help overlay render time <50ms
- [ ] T130 Profile with React DevTools and optimize any hotspots

### Accessibility Validation

- [ ] T131 [P] Run axe DevTools scan on entire app with keyboard shortcuts active (target: zero violations)
- [ ] T132 Manual VoiceOver testing on macOS (all user stories)
- [ ] T133 Manual NVDA testing on Windows (all user stories) - if Windows available
- [ ] T134 Verify focus indicators meet WCAG 2.1 AA contrast requirements
- [ ] T135 Verify no keyboard traps exist (can always Tab away from any element)

### Documentation Updates

- [ ] T136 [P] Update README.md with keyboard shortcuts section
- [ ] T137 [P] Add keyboard shortcuts to in-app help or onboarding (if exists)
- [ ] T138 [P] Update CHANGELOG.md with Feature 019 entry

### Code Quality

- [ ] T139 Run ESLint and fix any warnings in keyboard-related files
- [ ] T140 Run Prettier and format all new files
- [ ] T141 Verify 100% test coverage for `src/hooks/useKeyboardShortcuts.ts`
- [ ] T142 Verify >90% test coverage for `src/components/KeyboardShortcutsHelp.tsx`
- [ ] T143 Remove any debug console.log statements
- [ ] T144 Add JSDoc comments to all public functions

### Final Validation

- [ ] T145 Run full test suite: `npm test` (all tests must pass)
- [ ] T146 Run E2E test suite: `npm run test:e2e` (all tests must pass)
- [ ] T147 Run accessibility tests: `npm test -- --grep "accessibility"` (all must pass)
- [ ] T148 Verify quickstart.md instructions work (manual walkthrough)
- [ ] T149 Test all user stories on macOS (Cmd modifier)
- [ ] T150 Test all user stories on Windows or Linux (Ctrl modifier) - if available

**Checkpoint**: All tests passing, accessibility validated, documentation updated, ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Search Focus): Can start after Foundational - No dependencies on other stories
  - US2 (Tab Switching): Can start after Foundational - No dependencies on other stories
  - US3 (Skill Navigation): Can start after Foundational - No dependencies on other stories
  - US4 (Search Clear): Depends on US1 (shares SearchBar.tsx)
  - US5 (Help Overlay): Can start after Foundational - No dependencies on other stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Search Focus)**: Independent - can implement and test alone
- **User Story 2 (P1 - Tab Switching)**: Independent - can implement and test alone
- **User Story 3 (P2 - Skill Navigation)**: Independent - can implement and test alone
- **User Story 4 (P2 - Search Clear)**: Depends on US1 (modifies SearchBar.tsx)
- **User Story 5 (P3 - Help Overlay)**: Independent - can implement and test alone

### Within Each User Story (TDD Workflow)

1. Write ALL tests for the story FIRST
2. Run tests - verify they all FAIL
3. Implement models/components (if any)
4. Implement core functionality
5. Add accessibility features (ARIA announcements)
6. Run tests - verify they all PASS
7. Test manually on both platforms (macOS Cmd, Windows/Linux Ctrl)

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks (T001-T004) can run in parallel

**Phase 2 (Foundational)**:

- T005-T008 (Platform detection) can run in parallel
- T009-T018 (Core hook) must run sequentially
- T019-T023 (ARIA component) can run in parallel with hook after T009 complete
- T024-T026 (Global listener) depends on hook completion

**User Stories - Can be parallelized by different developers**:

- US1, US2, US3, US5 can all proceed in parallel after Foundational complete
- US4 must wait for US1 to complete (shares SearchBar.tsx)

**Within Each User Story**:

- All test tasks marked [P] can run in parallel (different test files)
- All registration tasks in US2 (T049-T054) can run in parallel
- Implementation tasks within a story are mostly sequential

**Phase 8 (Polish)**: Most tasks can run in parallel (different concerns)

---

## Parallel Example: User Story 1 (Search Focus)

```bash
# Step 1: Launch all tests for User Story 1 together (they will all FAIL):
Task T027: "Write unit test: 'should focus search on Cmd/Ctrl+F'"
Task T028: "Write unit test: 'should select existing text when focusing'"
Task T029: "Write integration test: 'search focus works from Skills tab'"
Task T030: "Write integration test: 'search focus works from Diagram tab'"
Task T031: "Write E2E test: 'Cmd/Ctrl+F focuses search in running app'"
Task T032: "Write accessibility test: 'search focus announces to screen reader'"

# Step 2: Verify all tests FAIL

# Step 3: Implement functionality (sequential):
Task T033: "Add searchInputRef to SearchBar.tsx"
Task T034: "Register 'search-focus' shortcut in App.tsx"
Task T035: "Implement handler: focus search input"
Task T036: "Implement handler: select existing text"
Task T037: "Add ARIA live announcement"

# Step 4: Manual testing (can be parallel):
Task T038: "Test manually on macOS (Cmd+F)"
Task T039: "Test manually on Windows/Linux (Ctrl+F)"

# Step 5: Verify all tests PASS
Task T040: "Verify all tests from T027-T032 now PASS"
```

---

## Parallel Example: User Story 2 (Tab Switching)

```bash
# Step 1: Launch all tests for User Story 2 together (they will all FAIL):
Task T041-T048: All 8 test tasks can run in parallel

# Step 2: Verify all tests FAIL

# Step 3: Launch all shortcut registrations in parallel (different shortcuts):
Task T049: "Register 'tab-skills' shortcut"
Task T050: "Register 'tab-details' shortcut"
Task T051: "Register 'tab-triggers' shortcut"
Task T052: "Register 'tab-references' shortcut"
Task T053: "Register 'tab-scripts' shortcut"
Task T054: "Register 'tab-diagram' shortcut"

# Step 4: Integration and validation (sequential):
Task T055: "Integrate with Zustand setActiveTab()"
Task T056: "Add ARIA announcements"
Task T057-T058: Manual testing
Task T059: "Verify all tests PASS"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T026) - CRITICAL
3. Complete Phase 3: User Story 1 - Search Focus (T027-T040)
4. **STOP and VALIDATE**: Test US1 independently
5. Complete Phase 4: User Story 2 - Tab Switching (T041-T059)
6. **STOP and VALIDATE**: Test US1 + US2 together
7. Deploy/demo if ready

**Rationale**: US1 (search focus) and US2 (tab switching) are both P1 priority and provide the highest impact for keyboard-first users. These two stories alone constitute a valuable MVP.

### Incremental Delivery (All User Stories)

1. Setup + Foundational (T001-T026) → Foundation ready
2. Add US1: Search Focus (T027-T040) → Test independently → Deploy/Demo
3. Add US2: Tab Switching (T041-T059) → Test independently → Deploy/Demo
4. Add US3: Skill Navigation (T060-T082) → Test independently → Deploy/Demo
5. Add US4: Search Clear (T083-T096) → Test independently → Deploy/Demo (depends on US1)
6. Add US5: Help Overlay (T097-T125) → Test independently → Deploy/Demo
7. Phase 8: Polish (T126-T150) → Final validation → Release

**Rationale**: Each user story adds independent value. Users get progressively more keyboard shortcuts without breaking existing functionality.

### Parallel Team Strategy (Multiple Developers)

With 2-3 developers:

1. **Together**: Complete Setup + Foundational (T001-T026)
2. **Once Foundational is done**:
   - Developer A: US1 (Search Focus) + US4 (Search Clear) - sequential, same component
   - Developer B: US2 (Tab Switching)
   - Developer C: US3 (Skill Navigation) + US5 (Help Overlay) - parallel, different components
3. **Stories integrate independently** - no merge conflicts (different files)
4. **Together**: Phase 8 (Polish & validation)

---

## Success Metrics

Based on spec.md success criteria:

- **SC-001**: Tab navigation <1s ✅ Validate with Performance API in T128
- **SC-002**: Skill selection <3s ✅ Measure during US3 manual testing
- **SC-003**: Search focus <100ms ✅ Validate with Performance API in T127
- **SC-004**: Cross-platform consistency ✅ Test on macOS (T038, T057, T121, T149) and Windows/Linux (T039, T058, T124, T150)
- **SC-005**: Zero accessibility violations ✅ axe DevTools scan in T131
- **SC-006**: 100% test coverage ✅ Validate in T141-T142
- **SC-007**: Documentation complete ✅ Complete in T136-T138
- **SC-008**: E2E tests passing ✅ Validate in T146
- **SC-009**: Visible focus indicators ✅ Validate in T134
- **SC-010**: No keyboard traps ✅ Validate in T135

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **TDD methodology**: Write tests FIRST (they must FAIL), then implement (tests must PASS)
- **Each user story should be independently completable and testable**
- **Verify tests fail before implementing** (Red → Green → Refactor)
- **Commit after each logical group of tasks** (e.g., after each user story phase)
- **Stop at any checkpoint to validate story independently**
- **Total tasks**: 150 tasks
  - Phase 1 (Setup): 4 tasks
  - Phase 2 (Foundational): 22 tasks
  - Phase 3 (US1): 14 tasks
  - Phase 4 (US2): 19 tasks
  - Phase 5 (US3): 23 tasks
  - Phase 6 (US4): 14 tasks
  - Phase 7 (US5): 29 tasks
  - Phase 8 (Polish): 25 tasks

**Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence, implementing before tests fail

---

**Status**: ✅ Tasks Generated | ⏭️ Ready for `/speckit.analyze` validation
