# Feature Specification: Improved UI Layout with Top Tabs

**Feature Branch**: `016-improved-ui-layout`
**Created**: 2025-11-14
**Status**: Draft
**Input**: HTML mockups showing redesigned layout with top tabs, consolidated overview, breadcrumb navigation, and two layout variants (standard/compact)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Maximum Vertical Space for Diagrams (Priority: P0)

**As a** developer analyzing complex architecture diagrams
**I want** tabs positioned at the top of the content area (not bottom)
**So that** I get maximum vertical space for viewing large diagrams without scrolling

**Why this priority**: This is the most critical UX improvement. Current bottom-tab design wastes 200+ pixels of vertical space, making diagrams cramped. Top tabs are the industry standard (VS Code, Chrome DevTools, etc.) and provide better ergonomics.

**Independent Test**: Can be fully tested by opening any skill with a diagram, measuring the available vertical space for diagram content, and verifying it's 200+ pixels larger than the current implementation.

**Acceptance Scenarios**:

1. **Given** I am viewing a skill with a diagram, **When** I switch to the Diagram tab, **Then** the diagram rendering area extends from immediately below the tabs to the bottom of the window (no bottom tab bar consuming space)
2. **Given** I am viewing a diagram that previously required scrolling, **When** I view it in the new layout, **Then** more of the diagram is visible without scrolling (minimum 200px additional height)
3. **Given** I am viewing the Diagram tab, **When** I use zoom controls or font controls, **Then** they remain accessible at the top of the diagram area
4. **Given** I resize the window vertically, **When** the window shrinks, **Then** the diagram area shrinks proportionally (tabs remain at fixed position at top)

---

### User Story 2 - Consolidated Overview Content (Priority: P0)

**As a** user viewing skill details
**I want** all overview/metadata content consolidated into the Overview tab
**So that** I'm not confused by duplicate information in the header and tabs

**Why this priority**: Current design shows duplicate content (description appears in both header and Overview tab). This wastes space and confuses users. Consolidation improves information architecture.

**Independent Test**: Can be fully tested by selecting any skill, verifying the header shows only title + badge, and confirming all metadata/description appears only in the Overview tab.

**Acceptance Scenarios**:

1. **Given** I select a skill, **When** I view the header area, **Then** it shows only the skill title and location badge (no description, no stats)
2. **Given** I select a skill, **When** I view the Overview tab, **Then** it shows all metadata including description, version, triggers, stats grid, and additional metadata
3. **Given** I am viewing the Content tab, **When** I need to see skill description, **Then** I can switch to the Overview tab (description is not duplicated in header)
4. **Given** I am viewing any non-Overview tab, **When** I look at the header, **Then** I see consistent, minimal header (just title + badge)

---

### User Story 3 - Breadcrumb Navigation (Priority: P1)

**As a** user navigating between skills and tabs
**I want** breadcrumb navigation in the top bar
**So that** I understand my current location and can navigate back easily

**Why this priority**: Breadcrumbs improve spatial awareness and provide quick navigation. This is especially valuable when users navigate deep into skill details and want to return to the list or change tabs.

**Independent Test**: Can be fully tested by navigating through skills and tabs, verifying breadcrumb updates reflect current location, and clicking breadcrumb segments to navigate.

**Acceptance Scenarios**:

1. **Given** I am viewing the skill list, **When** I look at the top bar, **Then** I see "Home" as the breadcrumb
2. **Given** I select a skill, **When** I look at the top bar, **Then** I see "Home › [Skill Name] › [Active Tab]"
3. **Given** I am viewing a skill's Content tab, **When** I click "Home" in the breadcrumb, **Then** I return to the skill list
4. **Given** I am viewing the Diagram tab, **When** I view the breadcrumb, **Then** the active tab name is displayed (e.g., "Diagram")
5. **Given** I switch tabs, **When** I view the breadcrumb, **Then** the tab name updates immediately (<50ms)
6. **Given** I am viewing a skill, **When** I use the browser back button (or Escape key), **Then** the breadcrumb updates to reflect the new location
7. **Given** I navigate using keyboard shortcuts (Cmd/Ctrl+1-6), **When** the tab changes, **Then** the breadcrumb updates to show the new tab name

---

### User Story 4 - Compact Layout Mode (Priority: P2)

**As a** power user working with dense information
**I want** a compact layout mode with inline stats
**So that** I can maximize content area by minimizing header space

**Why this priority**: Power users viewing complex diagrams or long content benefit from maximum screen real estate. Compact mode provides inline stats in header (refs: 3 | scripts: 4 | triggers: 9 | lines: 417) instead of full description section.

**Independent Test**: Can be fully tested by toggling compact mode, verifying header shows inline stats, and measuring content area height increase.

**Acceptance Scenarios**:

1. **Given** I am viewing a skill in standard mode, **When** I toggle compact mode on, **Then** the header collapses to show title + inline stats only (description moves to Overview tab)
2. **Given** I am in compact mode, **When** I view the header, **Then** I see inline stats in format "refs: X | scripts: Y | triggers: Z | lines: N"
3. **Given** I am in compact mode, **When** I measure content area height, **Then** it is 80-120px taller than standard mode (header is smaller)
4. **Given** I toggle compact mode, **When** I refresh the application, **Then** my layout preference is persisted (stored in localStorage or settings)
5. **Given** I am in compact mode, **When** I want to see full description, **Then** I can switch to the Overview tab to view all details
6. **Given** I am viewing the Overview tab in compact mode, **When** I view the content, **Then** it shows the full description and all metadata (same as standard mode)

---

### User Story 5 - Visual Feedback for Tab Interaction (Priority: P1)

**As a** user navigating between tabs
**I want** clear visual feedback (icons, colors, hover states)
**So that** I know which tab is active and which tab I'm hovering over

**Why this priority**: Good visual feedback is essential for usability. Users need to understand the current state and preview actions before clicking.

**Independent Test**: Can be fully tested by hovering over tabs, clicking tabs, and using keyboard shortcuts to switch tabs while observing visual states.

**Acceptance Scenarios**:

1. **Given** I am viewing a skill, **When** I hover over an inactive tab, **Then** it shows a light gray background (#f3f4f6)
2. **Given** I am viewing a skill, **When** I view the active tab, **Then** it shows a purple bottom border (#7c3aed, 2px thick)
3. **Given** I am viewing a skill, **When** I click a tab, **Then** the active state transitions smoothly (<200ms)
4. **Given** I am using keyboard shortcuts (Cmd/Ctrl+1-6), **When** the tab switches, **Then** the visual active state updates immediately
5. **Given** I am viewing tabs, **When** I observe the tab design, **Then** each tab shows an icon + label (📊 Overview, 📄 Content, ⚡ Triggers, 🔷 Diagram, 📚 References, 📜 Scripts)
6. **Given** I am viewing tabs, **When** I measure the font, **Then** it is 14px with 500 weight (medium)
7. **Given** a tab has focus (keyboard navigation), **When** I view it, **Then** it shows a focus ring for accessibility

---

### Edge Cases

- What happens when the skill name is extremely long (100+ characters)?
- How does the breadcrumb behave when the skill name + tab name exceeds available width?
- What happens if a skill has no description (compact mode would show stats only)?
- How does the layout adapt on very small window sizes (minimum 800px width)?
- What happens when switching from standard to compact mode while viewing the Overview tab?
- How does the breadcrumb work when the user navigates back/forward using browser history?
- What happens if a skill has 0 references, scripts, or triggers (inline stats show "0")?
- How do tabs handle accessibility focus when switching via keyboard shortcuts vs mouse clicks?
- What happens when the Diagram tab is active and user switches to compact mode?

## Requirements _(mandatory)_

### Functional Requirements

#### Tab Positioning and Layout (US1)

- **FR-001**: System MUST position tabs horizontally immediately below the skill header (above content area)
- **FR-002**: System MUST remove bottom tab bar (tabs no longer appear at bottom of content area)
- **FR-003**: System MUST provide minimum 200px additional vertical space for content area compared to current implementation
- **FR-004**: System MUST maintain tab order: Overview (1), Content (2), Triggers (3), Diagram (4), References (5), Scripts (6)
- **FR-005**: System MUST render content area from below tabs to bottom of window with full-height scrolling

#### Consolidated Overview Content (US2)

- **FR-006**: System MUST display only skill title and location badge in the header (no description)
- **FR-007**: System MUST show all metadata (description, version, triggers, stats) only in the Overview tab
- **FR-008**: System MUST ensure no duplicate content between header and Overview tab
- **FR-009**: System MUST show description section in Overview tab when available
- **FR-010**: System MUST show version badge in Overview tab when available (monospace font)
- **FR-011**: System MUST show trigger badges (first 5) in Overview tab with light blue background (#dbeafe)
- **FR-012**: System MUST show stats grid (4 columns: References, Scripts, Triggers, Lines) in Overview tab
- **FR-013**: System MUST show metadata grid (2 columns: label + value) for additional metadata in Overview tab
- **FR-014**: System MUST show tag cloud for skill tags in Overview tab (if tags exist)

#### Breadcrumb Navigation (US3)

- **FR-015**: System MUST display breadcrumb navigation in top bar (dark background #2d2d2d)
- **FR-016**: System MUST show "Home" as breadcrumb when viewing skill list
- **FR-017**: System MUST show "Home › [Skill Name] › [Tab Name]" when viewing a skill
- **FR-018**: System MUST make breadcrumb segments clickable for navigation
- **FR-019**: System MUST navigate to skill list when "Home" breadcrumb is clicked
- **FR-020**: System MUST update breadcrumb tab name immediately when tab changes (<50ms)
- **FR-021**: System MUST update breadcrumb when navigating via keyboard shortcuts (Cmd/Ctrl+1-6)
- **FR-022**: System MUST update breadcrumb when navigating via browser back/forward buttons
- **FR-023**: System MUST include navigation arrows (← →) in breadcrumb bar for back/forward navigation

#### Compact Layout Mode (US4)

- **FR-024**: System MUST provide a compact layout mode toggle (accessible via settings or keyboard shortcut)
- **FR-025**: System MUST show inline stats in header when compact mode is enabled (format: "refs: X | scripts: Y | triggers: Z | lines: N")
- **FR-026**: System MUST hide description from header in compact mode (description only in Overview tab)
- **FR-027**: System MUST provide 80-120px additional vertical space in compact mode vs standard mode
- **FR-028**: System MUST persist layout mode preference in localStorage or user settings
- **FR-029**: System MUST restore layout mode preference on application restart
- **FR-030**: System MUST show full description and metadata in Overview tab regardless of layout mode
- **FR-031**: System MUST use monospace font for inline stats in compact mode
- **FR-032**: System MUST allow switching between standard and compact modes without losing current tab selection

#### Visual Feedback and Tab Design (US5)

- **FR-033**: System MUST show light gray background (#f3f4f6) on tab hover
- **FR-034**: System MUST show purple bottom border (#7c3aed, 2px) on active tab
- **FR-035**: System MUST show icon + label for each tab (📊 Overview, 📄 Content, ⚡ Triggers, 🔷 Diagram, 📚 References, 📜 Scripts)
- **FR-036**: System MUST use 14px font size with 500 weight (medium) for tab labels
- **FR-037**: System MUST show smooth transition (<200ms) when switching tabs
- **FR-038**: System MUST show focus ring on tabs when navigating via keyboard
- **FR-039**: System MUST update visual active state immediately when switching tabs via keyboard shortcuts
- **FR-040**: System MUST maintain consistent tab styling across all skill views

#### Responsive Design

- **FR-041**: System MUST support minimum window width of 800px
- **FR-042**: System MUST truncate breadcrumb text with ellipsis (...) when skill name + tab name exceeds available width
- **FR-043**: System MUST truncate skill name in header with ellipsis when it exceeds available width
- **FR-044**: System MUST maintain responsive sidebar width (240px default, collapsible)
- **FR-045**: System MUST adapt content area width when sidebar is collapsed/expanded

#### Accessibility

- **FR-046**: System MUST use semantic HTML for breadcrumb navigation (nav element with aria-label="breadcrumb")
- **FR-047**: System MUST provide ARIA labels for breadcrumb links ("Navigate to home", "Navigate to [skill]")
- **FR-048**: System MUST use role="tablist" and role="tab" for top tabs
- **FR-049**: System MUST announce tab changes to screen readers ("Content tab active")
- **FR-050**: System MUST provide keyboard navigation for breadcrumbs (Tab/Shift+Tab)
- **FR-051**: System MUST show visible focus indicators for all interactive elements (breadcrumbs, tabs)
- **FR-052**: System MUST maintain keyboard shortcut compatibility (Cmd/Ctrl+1-6 for tabs)

### Key Entities

- **Layout Mode**: Represents the current layout configuration (standard or compact), with attributes including mode type (standard/compact), inline stats visibility, description location (header/overview), and content area height offset

- **Breadcrumb Navigation**: Represents the hierarchical navigation path, with attributes including segments (Home, Skill Name, Tab Name), current location, clickable segment handlers, and ARIA labels for accessibility

- **Tab Configuration**: Represents the top tab bar structure, with attributes including tab list (6 tabs), active tab index, visual state (active/hover/default), icon + label pairs, and keyboard shortcut mappings (1-6)

- **Header State**: Represents the skill header content and layout, with attributes including skill title, location badge, layout mode (standard/compact), inline stats (in compact mode), and description visibility (standard mode only)

- **Overview Tab Content**: Represents the consolidated metadata displayed in Overview tab, with attributes including description section, version badge, trigger badges, stats grid (4 columns), metadata grid (2 columns), and tag cloud

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Diagram tab provides minimum 200px additional vertical space compared to current bottom-tab design (measured at 1080p resolution)
- **SC-002**: Zero duplicate content between header and Overview tab (automated test verifies description appears only once)
- **SC-003**: Breadcrumb updates within 50ms of tab change (measured via performance API)
- **SC-004**: Compact mode provides 80-120px additional vertical space compared to standard mode
- **SC-005**: Tab switching (click or keyboard) completes within 200ms (smooth transition)
- **SC-006**: 100% of tab interactions show correct visual feedback (hover, active, focus states)
- **SC-007**: Layout mode preference persists across application restarts (tested via localStorage)
- **SC-008**: Zero accessibility regressions detected via automated tools (axe DevTools, WAVE)
- **SC-009**: All breadcrumb segments are clickable and functional (automated E2E test)
- **SC-010**: UI adapts correctly to window resize (minimum 800px width, maximum 4K resolution)

## Constraints _(mandatory)_

### Technical Constraints

- Must integrate with existing React 19 + TypeScript 5.8.3 stack
- Must use existing TailwindCSS 4.1.17 utility classes (no custom CSS)
- Must use existing Zustand 5.0.8 store for state management (add layout mode state)
- Must maintain compatibility with existing keyboard shortcut system (Cmd/Ctrl+1-6)
- Must achieve >80% test coverage for all layout-related code (constitutional requirement)
- Must not break existing diagram interactivity (zoom, pan, font controls)

### Development Constraints

- Must follow Test-Driven Development (TDD) approach - write tests before implementation
- Must use SDD workflow (/speckit.specify, clarify, plan, tasks, implement)
- Must not skip or defer tests (learned from v0.1.0 mistakes)
- Must mark tasks in real-time during implementation
- All layout changes must be tested with both unit and E2E tests

### UX Constraints

- Top tabs must follow industry standards (VS Code, Chrome DevTools patterns)
- Breadcrumb must be visually distinct from other navigation elements
- Compact mode toggle must be easily discoverable (not hidden in deep settings)
- Visual feedback must be consistent with existing design language (purple accent color #7c3aed)
- All layout modes must work with existing search, filters, and navigation

### Browser Compatibility

- Must work in Chromium-based browsers (Tauri uses Chromium webview)
- Must handle Tauri window resize events correctly
- Must support high-DPI displays (2x, 3x scaling)

## Assumptions _(mandatory)_

### User Behavior Assumptions

- Users expect tabs at the top (industry standard pattern)
- Users expect breadcrumbs to show hierarchical location (common pattern in file explorers, documentation sites)
- Power users will prefer compact mode for maximum content density
- Users will understand inline stats format (refs: 3 | scripts: 4 | triggers: 9)
- Users will discover compact mode via settings or help documentation

### Technical Assumptions

- Existing OverviewPanel component can be refactored to work as Overview tab content
- Current tab system can be repositioned without breaking functionality
- Breadcrumb navigation can be implemented using existing navigation store
- Layout mode preference can be stored in localStorage (no backend required)
- Tauri desktop app provides consistent window resize events

### Design Assumptions

- Dark top bar (#2d2d2d) provides sufficient contrast for breadcrumb text
- Purple accent (#7c3aed) is the primary brand color for active states
- Light gray hover background (#f3f4f6) is subtle but noticeable
- Icons in tabs (📊📄⚡🔷📚📜) render consistently across platforms
- 14px font size is readable for tab labels

## Open Questions

None - all aspects of the feature are well-defined based on HTML mockups and current implementation analysis. The mockups provide clear visual specifications, and edge cases have been identified.

## Dependencies

### Internal Dependencies

- Existing SkillViewer component (must be refactored to use top tabs)
- Existing OverviewPanel component (must become Overview tab content)
- Existing tab system (Content, Triggers, Diagram, References, Scripts)
- Existing keyboard shortcut system (must integrate with breadcrumb updates)
- Existing navigation store (must track breadcrumb state)
- Existing Zustand stores (must add layout mode state)

### External Dependencies

- None - all functionality can be implemented using existing libraries and web APIs

## Out of Scope

The following are explicitly **not** included in this feature:

- Customizable tab order (user-defined tab arrangement)
- Collapsible header (auto-hide on scroll)
- Multi-level breadcrumb navigation (skills don't have nested structure)
- Breadcrumb history dropdown (showing previous navigation paths)
- Tab groups or tab categorization (current 6 tabs are final)
- Vertical tab layout option (always horizontal)
- Breadcrumb customization (color, font, icons)
- Layout mode per-skill (global setting only)
- Animation/transition customization
- Alternative tab designs (pills, underline-only, etc.)

## Notes

- This feature addresses critical UX issues identified in v0.1.0: bottom tabs waste space, duplicate content is confusing, diagrams don't get enough real estate
- HTML mockups provide pixel-perfect specifications for implementation
- Two layout variants (standard/compact) accommodate different user preferences
- Breadcrumb navigation improves spatial awareness and navigation efficiency
- Top tabs are the industry standard and provide better ergonomics
- This feature follows constitutional Principle VII requiring >80% test coverage
- TDD approach will be used: write failing tests first, then implement features
- This feature uses proper SDD workflow after v0.1.0 lessons learned

## Visual Reference

The HTML mockups provided by the user show:

1. **Top Bar**: Dark background (#2d2d2d) with breadcrumb "← → Home › skill › Tab"
2. **Header (Standard Mode)**: White background with skill title + location badge, description below
3. **Header (Compact Mode)**: Skill title + location badge + inline stats (refs: 3 | scripts: 4 | triggers: 9 | lines: 417)
4. **Tabs**: Horizontal row immediately below header with icons + labels, purple bottom border for active tab
5. **Overview Tab**: Description, version badge, trigger badges, stats grid (4 cols), metadata grid (2 cols), tag cloud
6. **Diagram Tab**: Full-height diagram area with controls at top, centered SVG rendering
7. **Sidebar**: 240px width with search, filters, skill list (unchanged)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Ready for**: /speckit.clarify or /speckit.plan
