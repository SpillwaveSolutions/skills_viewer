# Feature Specification: Diagram Toolbar Redesign

**Feature Branch**: `018-diagram-toolbar-redesign`
**Created**: 2025-11-16
**Status**: Draft
**Input**: User description: "Feature 017: Diagram Toolbar Redesign - Polish the diagram toolbar with professional button grouping, visual hierarchy, and modern design patterns"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Quick Diagram Layout Switching (Priority: P1)

As a developer analyzing skill architecture, I want to quickly switch between Top-Down and Left-Right diagram layouts so that I can view the architecture in the orientation that makes most sense for the current skill structure.

**Why this priority**: Core functionality that already exists - must be preserved and enhanced with better visual design. Layout choice significantly impacts diagram comprehension for different skill structures.

**Independent Test**: Can be fully tested by clicking the layout selector dropdown, choosing an option, and verifying the diagram re-renders in the selected orientation. Delivers immediate value by allowing users to choose optimal visualization.

**Acceptance Scenarios**:

1. **Given** a skill diagram is displayed in Top-Down layout, **When** user clicks layout selector and chooses "Left-Right", **Then** diagram re-renders in Left-Right orientation within 200ms
2. **Given** user has selected a layout preference, **When** user navigates away and returns to diagram tab, **Then** previously selected layout is preserved
3. **Given** a very wide skill diagram in Top-Down layout, **When** user switches to Left-Right, **Then** diagram fits better in viewport with less horizontal scrolling

---

### User Story 2 - Intuitive Zoom Controls (Priority: P1)

As a developer examining diagram details, I want visually grouped zoom controls with clear percentage display so that I can easily zoom in/out and understand current zoom level at a glance.

**Why this priority**: Essential for diagram usability, especially for complex skills with many nodes. Integrated button group design makes zoom controls feel professional and intuitive.

**Independent Test**: Can be tested by clicking zoom in (+), zoom out (−), and percentage display to reset. Delivers value by providing precise control over diagram magnification with clear visual feedback.

**Acceptance Scenarios**:

1. **Given** diagram at 100% zoom, **When** user clicks zoom in (+) button, **Then** diagram zooms to 125% and percentage display updates
2. **Given** diagram at 150% zoom, **When** user clicks percentage display, **Then** diagram resets to 100% zoom
3. **Given** diagram at 50% zoom, **When** user clicks zoom out (−) button, **Then** button becomes disabled (minimum zoom reached)
4. **Given** diagram at 200% zoom, **When** user clicks zoom in (+) button, **Then** button becomes disabled (maximum zoom reached)
5. **Given** user is zoomed in or out, **When** user hovers over zoom buttons, **Then** tooltips indicate action ("Zoom In", "Zoom Out", "Reset to 100%")

---

### User Story 3 - One-Click Fit to View (Priority: P2)

As a developer viewing diagrams of varying sizes, I want a "Fit to View" button that automatically scales the diagram to fit the viewport so that I don't have to manually adjust zoom for each skill.

**Why this priority**: High-value convenience feature that saves time when switching between skills. Especially useful for very large or very small diagrams.

**Independent Test**: Can be tested by loading diagrams of different sizes and clicking "Fit to View" button. Delivers value by eliminating manual zoom adjustment.

**Acceptance Scenarios**:

1. **Given** a very large diagram requiring scrolling, **When** user clicks "Fit to View", **Then** diagram scales down to fit entirely in viewport
2. **Given** a very small diagram (lots of whitespace), **When** user clicks "Fit to View", **Then** diagram scales up to use available viewport space efficiently
3. **Given** user has manually zoomed to 150%, **When** user clicks "Fit to View", **Then** zoom resets to calculated fit percentage (e.g., 80%)

---

### User Story 4 - Professional Export Options (Priority: P2)

As a developer documenting skills, I want clearly grouped export buttons to download diagrams in different formats so that I can include diagrams in external documentation.

**Why this priority**: Valuable for sharing and documentation workflows. Visual grouping makes export options discoverable and professional.

**Independent Test**: Can be tested by clicking each export button and verifying downloaded file format and content. Delivers value by enabling diagram reuse outside the application.

**Acceptance Scenarios**:

1. **Given** a skill diagram is displayed, **When** user clicks "Download SVG" button, **Then** browser downloads a .svg file with current diagram
2. **Given** a skill diagram is displayed, **When** user clicks "Download Mermaid" button, **Then** browser downloads a .mmd file with Mermaid source code
3. **Given** user has zoomed/panned the diagram, **When** user exports SVG, **Then** exported file contains full diagram (not just visible portion)
4. **Given** user hovers over export buttons, **When** tooltip appears, **Then** tooltip indicates format and purpose (e.g., "Download as SVG - vector format for scaling")

---

### User Story 5 - Cache-Busting Regenerate (Priority: P3)

As a developer troubleshooting diagram generation issues, I want a prominent "Regenerate" button with visual accent so that I can force-refresh the diagram bypassing cache when needed.

**Why this priority**: Lower priority utility feature for edge cases (cache issues, diagram not updating). Purple accent makes it discoverable without being distracting.

**Independent Test**: Can be tested by modifying skill file, using Regenerate button, and verifying diagram reflects latest changes. Delivers value by providing escape hatch when cache causes stale diagrams.

**Acceptance Scenarios**:

1. **Given** a cached diagram is displayed, **When** user clicks "Regenerate" button, **Then** diagram is re-rendered from skill file (bypassing cache)
2. **Given** user clicks Regenerate, **When** regeneration is in progress, **Then** button shows loading indicator and is disabled
3. **Given** regeneration completes, **When** user views diagram, **Then** timestamp indicates fresh generation

---

### Edge Cases

- What happens when user rapidly clicks zoom in/out buttons? (Debounce to prevent performance issues)
- How does system handle export failures (network issues, permission errors)? (Show user-friendly error message with retry option)
- What happens when diagram is too large to fit even at minimum zoom? (Enable scrolling and pan controls)
- How does toolbar respond on narrow windows (<800px width)? (Gracefully stack or hide less critical buttons with overflow menu)
- What happens when user clicks Regenerate during an existing regeneration? (Disable button until current regeneration completes)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Toolbar MUST preserve all existing functionality from Feature 016 (layout selector, zoom controls, fit to view, SVG export, Mermaid export, regenerate)
- **FR-002**: Toolbar MUST group related controls visually (Layout group, Zoom group, View group, Actions group)
- **FR-003**: Zoom controls MUST display as integrated button group: [− | 100% | +] with no visible separation between elements
- **FR-004**: Zoom percentage display MUST be clickable and reset zoom to 100% when activated
- **FR-005**: All toolbar buttons MUST have ARIA labels for screen reader accessibility
- **FR-006**: All toolbar buttons MUST support keyboard navigation (Tab, Enter, Space keys)
- **FR-007**: Toolbar buttons MUST show hover states (background color change to light gray #f3f4f6)
- **FR-008**: Regenerate button MUST have purple accent color (#7c3aed or similar) to indicate primary action
- **FR-009**: Icon-only buttons (if implemented) MUST show tooltips on hover
- **FR-010**: Toolbar MUST render in single horizontal row on viewports ≥800px width
- **FR-011**: Toolbar MUST maintain responsive layout on viewports <800px width without breaking functionality
- **FR-012**: Zoom in/out buttons MUST disable at maximum/minimum zoom levels respectively
- **FR-013**: Toolbar interactions MUST feel instant (<100ms response time)
- **FR-014**: Toolbar component MUST render in <50ms (performance requirement)
- **FR-015**: All toolbar functionality MUST work on macOS, Linux, and Windows platforms
- **FR-016**: Toolbar MUST use only TailwindCSS utility classes (no custom CSS files)
- **FR-017**: Export functionality MUST download files with appropriate filenames (e.g., "skill-name-diagram.svg", "skill-name-diagram.mmd")

### Key Entities

Not applicable - this is a pure UI redesign feature with no data model changes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can identify toolbar button groups visually without reading labels (measured by 5-second recognition test)
- **SC-002**: Toolbar controls respond to user input in under 100ms (measured by performance profiling)
- **SC-003**: Toolbar component renders in under 50ms (measured by React DevTools profiler)
- **SC-004**: Users can complete zoom operations in 1-2 clicks (zoom in/out = 1 click, reset = 1 click on percentage)
- **SC-005**: Toolbar passes axe DevTools accessibility audit with zero violations
- **SC-006**: Toolbar maintains full functionality on windows as narrow as 800px without horizontal scrolling
- **SC-007**: Users report improved toolbar usability compared to Feature 016 baseline (subjective user feedback)
- **SC-008**: Export operations complete in under 2 seconds for typical diagrams (<100 nodes)
- **SC-009**: Toolbar achieves >80% test coverage (unit + integration tests)
- **SC-010**: Zero functional regressions from Feature 016 (verified by regression test suite)
