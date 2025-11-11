# UI/UX Requirements

## Overview

This document defines the user interface and user experience requirements for the Skill Debugger desktop application. The application provides an intuitive, professional interface for browsing, analyzing, and debugging Claude Code skills with emphasis on visual clarity, information hierarchy, and responsive interactions.

## Purpose and Scope

The Skill Debugger UI enables users to:
- Browse and search through available Claude Code skills
- View comprehensive skill details including metadata, content, and dependencies
- Analyze trigger keywords that activate skills
- Visualize skill architecture through interactive diagrams
- Explore reference documents and embedded scripts
- Understand skill relationships and usage patterns

## Design Principles

### 1. Visual Hierarchy
- **Primary Focus**: Skill identification (name, location, quick stats) presented prominently
- **Secondary Focus**: Descriptive information and trigger analysis displayed contextually
- **Tertiary Focus**: Detailed content accessed through tabbed navigation

### 2. Information Density
- **Scannable Interface**: Users can quickly assess skills at a glance through overview panels
- **Progressive Disclosure**: Show summaries first, details on demand via tab navigation
- **Whitespace Management**: Generous spacing reduces cognitive load and improves readability

### 3. Professional Appearance
- **Modern Design**: Clean, contemporary design language with consistent styling
- **Visual Consistency**: Uniform spacing, typography, and color usage throughout
- **Polish**: Attention to details including shadows, borders, hover states, and smooth transitions

### 4. Usability
- **Clear Navigation**: Intuitive movement between skills and content views
- **Responsive Feedback**: Instant visual feedback on user interactions
- **Accessible Design**: Good contrast ratios, readable fonts, clear affordances

## Layout Structure

### Two-Column Layout with Top Overview Panel

The application uses a **two-column layout with a horizontal overview banner**:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Main Content Area]                               │
│  320px     │                                                     │
│            │  ┌───────────────────────────────────────────────┐ │
│ Header     │  │ Overview Panel (Top Banner)                   │ │
│ Search     │  │ - Skill name and location badge               │ │
│ Filter     │  │ - Quick stats grid (4 cards)                  │ │
│ Skills     │  │ - Common trigger preview                      │ │
│  List      │  └───────────────────────────────────────────────┘ │
│            │                                                     │
│            │  ┌───────────────────────────────────────────────┐ │
│            │  │ Description Section                           │ │
│            │  │ - YAML-derived description                    │ │
│            │  └───────────────────────────────────────────────┘ │
│            │                                                     │
│            │  [Tab Navigation]                                  │
│            │  ┌───────────────────────────────────────────────┐ │
│            │  │ Tab Content Area                              │ │
│            │  │ - Overview / Content / References / Scripts   │ │
│            │  │ - Triggers / Diagram                          │ │
│            │  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Benefits
1. **Full-width content area**: Comfortable reading experience for documentation and code
2. **Contextual overview**: Top banner provides quick stats without stealing vertical space
3. **Efficient navigation**: Sidebar enables quick skill switching while viewing details
4. **Flexible detail space**: Main area adapts to different content types (text, code, diagrams)

## Functional Requirements

### FR-UI-001: Sidebar Navigation

**Priority**: High

**Description**: The sidebar provides persistent access to skill navigation and filtering capabilities.

**Components**:
- Application branding header
- Search input field with real-time filtering
- Skill count indicator showing "X of Y skills"
- Refresh button for reloading skills
- Scrollable skill list with visual selection indicators

**Acceptance Criteria**:
- AC-UI-001.1: Sidebar remains visible and fixed at 320px width
- AC-UI-001.2: Search filters skills in real-time as user types
- AC-UI-001.3: Selected skill is visually highlighted with background color and left border
- AC-UI-001.4: Skill count updates dynamically based on search filter
- AC-UI-001.5: Refresh button reloads skills from filesystem

### FR-UI-002: Skill List Items

**Priority**: High

**Description**: Individual skill entries in the sidebar display essential information for quick identification.

**Information Displayed**:
- Skill name (font-medium, 14px)
- Location badge (claude/opencode) with color coding

**Visual States**:
- Default: White background, gray-100 bottom border
- Hover: Gray-50 background with smooth transition
- Selected: Blue-50 background with 4px left border in blue-500

**Acceptance Criteria**:
- AC-UI-002.1: Skill name truncates with ellipsis if exceeds container width
- AC-UI-002.2: Location badge uses purple for "claude", green for "opencode"
- AC-UI-002.3: Hover state applies within 150ms
- AC-UI-002.4: Selected state persists until different skill is chosen

### FR-UI-003: Overview Panel (Top Banner)

**Priority**: High

**Description**: Horizontal panel at the top of the main content area providing at-a-glance skill information.

**Layout**:
- Height: Auto (minimum 180px)
- Full width of main content area
- White background with bottom border

**Components**:
1. **Skill Header**
   - Skill name (24px, font-bold)
   - Location badge (right-aligned)

2. **Quick Stats Grid** (2x2 grid)
   - References count (clickable, navigates to References tab)
   - Scripts count (clickable, navigates to Scripts tab)
   - Triggers count (clickable, navigates to Triggers tab)
   - Lines count (non-interactive)

3. **Trigger Preview**
   - Section title: "Common Triggers"
   - Top 5 trigger keywords as badges
   - "+N more" indicator if additional triggers exist

**Acceptance Criteria**:
- AC-UI-003.1: Overview panel displays immediately when skill is selected
- AC-UI-003.2: Quick stat cards are clickable and navigate to relevant tab
- AC-UI-003.3: Hover state on clickable stats shows gray-100 background
- AC-UI-003.4: Trigger badges use blue-50 background with blue-700 text
- AC-UI-003.5: Panel layout remains consistent across different skill types

### FR-UI-004: Description Section

**Priority**: Medium

**Description**: Displays the skill description extracted from YAML frontmatter metadata.

**Layout**:
- Positioned directly below overview panel
- Full width with white background and bottom border
- Padding: 24px horizontal, 16px vertical

**Content**:
- Section icon and title: "📝 Description"
- Description text from metadata (gray-800, 16px, line-height 1.6)

**Behavior**:
- Section hidden if no description metadata exists
- Text wraps naturally with generous line spacing

**Acceptance Criteria**:
- AC-UI-004.1: Description renders from `skill.metadata.description` or `skill.description`
- AC-UI-004.2: Section does not display if description is null/undefined
- AC-UI-004.3: Text uses comfortable reading width and line spacing
- AC-UI-004.4: Section provides visual separation from tabs below

### FR-UI-005: Tab Navigation

**Priority**: High

**Description**: Multi-tab interface for organizing different views of skill information.

**Tabs**:
1. **Overview** (📊): YAML frontmatter metadata display
2. **Content** (📄): Clean markdown rendering without YAML
3. **References** (📚): List and preview of reference documents
4. **Scripts** (🔧): Embedded scripts with syntax highlighting
5. **Triggers** (🎯): Keyword analysis and example queries
6. **Diagram** (🔀): Visual architecture with Mermaid

**Visual Design**:
- Tabs positioned in white bar with bottom border
- Active tab: blue-500 bottom border (2px), blue-600 text
- Inactive tabs: transparent border, gray-600 text
- Hover state: gray-900 text, gray-300 border

**Acceptance Criteria**:
- AC-UI-005.1: Clicking tab changes active content with smooth transition
- AC-UI-005.2: Active tab is visually distinct with color and border
- AC-UI-005.3: Content area updates without page reload
- AC-UI-005.4: Tab icons display consistently on all tabs
- AC-UI-005.5: Default tab is "Content" when skill is first opened

### FR-UI-006: Overview Tab (YAML Metadata Display)

**Priority**: Medium

**Description**: Displays parsed YAML frontmatter metadata in structured, readable format.

**Layout**:
- Maximum width: 4xl (896px), centered
- Padding: 24px

**Content Display**:
- Section title: "YAML Frontmatter" (24px, font-bold)
- Each metadata field displayed as a card:
  - Field name (uppercase, 12px, gray-700, font-semibold)
  - Field value (14px, gray-800, monospace for complex values)
  - Background: gray-50, rounded corners, border

**Acceptance Criteria**:
- AC-UI-006.1: All YAML fields from frontmatter are displayed
- AC-UI-006.2: Complex values (arrays, objects) render as formatted JSON
- AC-UI-006.3: Empty state message displays if no metadata exists
- AC-UI-006.4: Cards maintain consistent spacing and alignment

### FR-UI-007: Content Tab (Markdown Rendering)

**Priority**: High

**Description**: Displays skill documentation as clean, formatted markdown without YAML frontmatter.

**Content Processing**:
- YAML frontmatter stripped before rendering
- Uses `skill.content_clean` field (YAML removed by backend)
- ReactMarkdown with remark-gfm and rehype-highlight plugins

**Rendering Features**:
- Syntax highlighting for code blocks (GitHub theme)
- GitHub Flavored Markdown support (tables, task lists, strikethrough)
- Proper heading hierarchy (H1-H6)
- Inline code with monospace font
- Blockquotes, lists, and links styled appropriately

**Layout**:
- Maximum width: 4xl (896px), centered
- Padding: 32px
- Prose styling for optimal readability

**Acceptance Criteria**:
- AC-UI-007.1: YAML frontmatter never appears in rendered content
- AC-UI-007.2: Code blocks have syntax highlighting based on language
- AC-UI-007.3: Markdown renders with proper heading hierarchy
- AC-UI-007.4: Links are clickable and styled distinctly
- AC-UI-007.5: Content scrolls vertically within tab area
- AC-UI-007.6: Images in markdown render correctly (if present)

### FR-UI-008: References Tab (Master-Detail View)

**Priority**: High

**Description**: Two-column layout for browsing and viewing reference documents.

**Layout**:
- Left column (320px): Reference list with selection
- Right column (flexible): Selected reference content

**Reference List Features**:
- Header showing total count
- Each reference displays:
  - Icon (🌐 for glob, 📄 for file)
  - Filename (truncated with ellipsis)
  - Full path (gray-500, truncated)
  - "required" badge if reference.required is true
- Selected reference: blue-100 background with blue-300 border
- Hover state: gray-100 background

**Content Display**:
- Reference header with filename and full path
- Markdown rendering with syntax highlighting
- Loading state with spinner while fetching content
- Empty state: "Select a reference to view its content"

**Acceptance Criteria**:
- AC-UI-008.1: References load via Tauri IPC command `read_file_content`
- AC-UI-008.2: Selected reference remains highlighted in list
- AC-UI-008.3: Content area shows loading spinner during fetch
- AC-UI-008.4: Error message displays if file cannot be read
- AC-UI-008.5: Empty state displays if skill has no references
- AC-UI-008.6: List scrolls independently from content area

### FR-UI-009: Scripts Tab (Master-Detail View)

**Priority**: High

**Description**: Two-column layout for viewing embedded scripts with syntax highlighting.

**Layout**:
- Left column (320px): Script list with metadata
- Right column (flexible): Selected script content

**Script List Features**:
- Header showing total count
- Each script displays:
  - Language icon (🐍 for Python, 📜 for JS, 🟦 for TS, 🐚 for Bash, etc.)
  - Script name
  - Language label
  - Line count
- Selected script: blue-100 background with blue-300 border
- Hover state: gray-100 background

**Content Display**:
- Script header with icon, name, language, and line count
- Code block with syntax highlighting (highlight.js)
- Language-specific highlighting for:
  - Python, JavaScript, TypeScript
  - Bash, Shell scripts
  - JSON, Markdown
- Horizontal scroll for long lines

**Acceptance Criteria**:
- AC-UI-009.1: Language icons match script file extension
- AC-UI-009.2: Syntax highlighting applies automatically on selection
- AC-UI-009.3: Code preserves indentation and formatting
- AC-UI-009.4: Empty state displays if skill has no scripts
- AC-UI-009.5: Script content uses monospace font (Monaco, Courier New)
- AC-UI-009.6: Code blocks have gray-50 background for readability

### FR-UI-010: Triggers Tab (Keyword Analysis)

**Priority**: High

**Description**: Displays categorized trigger keywords and example queries that would activate the skill.

**Layout**:
- Maximum width: 4xl (896px), centered
- Padding: 24px

**Content Sections**:

1. **Trigger Keywords**
   - Section title and description
   - Keywords displayed as colored badges by category:
     - Action: blue-100 background, blue-700 text
     - Technology: purple-100 background, purple-700 text
     - Format: green-100 background, green-700 text
     - Topic: yellow-100 background, yellow-700 text
   - Category label shown in badge with opacity

2. **Example Queries**
   - Auto-generated query examples
   - Each query in gray-50 card with code styling
   - Queries use detected trigger keywords

3. **Analysis Summary**
   - Grid of stat cards showing keyword counts by category
   - Color-coded matching badge colors

**Acceptance Criteria**:
- AC-UI-010.1: Triggers are analyzed using `analyzeTriggers()` utility
- AC-UI-010.2: Keywords are correctly categorized (action, technology, format, topic)
- AC-UI-010.3: Example queries are generated using `generateExampleQueries()`
- AC-UI-010.4: Badge colors match category semantics
- AC-UI-010.5: Summary stats calculate correct category counts
- AC-UI-010.6: Keywords wrap to multiple lines if needed

### FR-UI-011: Diagram Tab (Interactive Visualization)

**Priority**: High

**Description**: Displays Mermaid diagram showing skill architecture with zoom and pan controls.

**Features**:
- Mermaid diagram generated from skill data
- Shows relationships between skill, references, and scripts
- Interactive controls:
  - Zoom in/out buttons
  - Reset view button
  - Font size adjuster (8-200px)
  - Mouse wheel zoom
  - Click-and-drag pan
- Zoom level indicator (percentage display)

**Layout**:
- Header with title and controls bar
- Full-height diagram viewport with gray-50 background
- Controls: white buttons with gray borders, hover states

**Diagram Content**:
- Central skill node
- Reference nodes connected to skill
- Script nodes connected to skill
- Clear node labels and relationship lines

**Acceptance Criteria**:
- AC-UI-011.1: Diagram generates using `generateSkillDiagram()` utility
- AC-UI-011.2: Mermaid renders diagram correctly with theme settings
- AC-UI-011.3: Zoom controls adjust scale from 10% to 5000%
- AC-UI-011.4: Reset button fits diagram to visible area
- AC-UI-011.5: Mouse wheel scrolling zooms in/out
- AC-UI-011.6: Click-and-drag pans the diagram view
- AC-UI-011.7: Font size control adjusts diagram text size
- AC-UI-011.8: Cursor changes to "grab" when hovering, "grabbing" when dragging

### FR-UI-012: Search and Filtering

**Priority**: High

**Description**: Real-time search filtering of skills in the sidebar.

**Search Behavior**:
- Search input in sidebar header
- Filters as user types (no submit required)
- Searches across:
  - Skill name
  - Description
  - Location

**Visual Feedback**:
- Skill count updates: "X of Y skills"
- Filtered list updates instantly
- Empty state message if no matches
- Refresh button to reload all skills

**Acceptance Criteria**:
- AC-UI-012.1: Search filters skills without delay
- AC-UI-012.2: Filtering is case-insensitive
- AC-UI-012.3: Empty search shows all skills
- AC-UI-012.4: Count displays filtered vs. total skills
- AC-UI-012.5: Empty state shows: "No skills match '[query]'"
- AC-UI-012.6: Refresh clears search and reloads from filesystem

### FR-UI-013: Loading and Error States

**Priority**: Medium

**Description**: User-friendly feedback during async operations and error conditions.

**Loading States**:

1. **Initial Skills Load**
   - Spinner animation in sidebar
   - Message: "Loading skills..."
   - Centered in skill list area

2. **Reference Content Load**
   - Spinner in content area
   - Message: "Loading reference..."
   - Displayed until fetch completes

3. **Skill Selection**
   - Instant transition (no loader needed)
   - Content updates immediately from loaded data

**Error States**:

1. **Skills Load Error**
   - Error message in red-600
   - Displays error text from backend
   - "Retry" button to re-attempt load

2. **Reference Load Error**
   - Error message in content area
   - Shows file path and error details
   - User can select different reference

3. **No Skills Found**
   - Empty state message in sidebar
   - Helpful text: "Skills should be in ~/.claude/skills or ~/.config/opencode/skills"

**Acceptance Criteria**:
- AC-UI-013.1: Loading spinners animate smoothly
- AC-UI-013.2: Error messages are clear and actionable
- AC-UI-013.3: Retry buttons re-invoke failed operations
- AC-UI-013.4: Empty states provide helpful guidance
- AC-UI-013.5: Loading states don't block other UI interactions

### FR-UI-014: Back Navigation

**Priority**: Medium

**Description**: Navigation control to return to empty state from skill view.

**Location**: Top of main content area, above overview panel

**Design**:
- Back arrow icon and "Back to Skills" text
- Gray-600 color, hover changes to gray-900
- Smooth color transition (150ms)

**Behavior**:
- Clears selected skill
- Returns to welcome/empty state
- Does not affect search or sidebar state

**Acceptance Criteria**:
- AC-UI-014.1: Back button appears when skill is selected
- AC-UI-014.2: Clicking deselects current skill
- AC-UI-014.3: Welcome message displays after navigation
- AC-UI-014.4: Hover state provides visual feedback

### FR-UI-015: Welcome / Empty State

**Priority**: Low

**Description**: Initial view shown when no skill is selected.

**Content**:
- Centered in main content area
- Heading: "Welcome to Skill Debugger" (24px, gray-700, font-semibold)
- Subtext: "Select a skill from the sidebar to view details" (gray-600)
- Simple, clean design

**Acceptance Criteria**:
- AC-UI-015.1: Empty state displays on application start
- AC-UI-015.2: Empty state displays after back navigation
- AC-UI-015.3: Message is centered vertically and horizontally
- AC-UI-015.4: Text is readable and welcoming

## Non-Functional Requirements

### NFR-UI-001: Responsiveness and Performance

**Priority**: High

**Performance Targets**:
- Initial render: < 100ms
- Skill selection: < 50ms
- Search filtering: < 100ms
- Tab switching: < 100ms
- Diagram rendering: < 500ms

**Smooth Interactions**:
- Hover states apply within 150ms
- Color transitions: 150-200ms
- Tab content fade-in: 150ms
- No janky scrolling or layout shifts

**Acceptance Criteria**:
- AC-NFR-UI-001.1: All interactions feel instant and responsive
- AC-NFR-UI-001.2: No visible lag when typing in search
- AC-NFR-UI-001.3: Animations are smooth at 60fps
- AC-NFR-UI-001.4: Large diagrams don't freeze UI

### NFR-UI-002: Visual Consistency

**Priority**: High

**Design System**:
- Consistent color palette across all components
- Uniform spacing using 4px/8px grid system
- Typography scale applied consistently
- Component styling follows Tailwind conventions

**Consistency Areas**:
- Badge colors (location, categories)
- Border styles and colors
- Card shadows and rounded corners
- Hover and active states

**Acceptance Criteria**:
- AC-NFR-UI-002.1: All badges use defined color palette
- AC-NFR-UI-002.2: Spacing follows 4px/8px increments
- AC-NFR-UI-002.3: Typography sizes match specification
- AC-NFR-UI-002.4: All interactive elements have consistent hover states

### NFR-UI-003: Accessibility

**Priority**: Medium

**Keyboard Navigation**:
- Tab through interactive elements
- Enter/Space to activate buttons
- Arrow keys for list navigation
- Escape to close modals (future)

**Visual Accessibility**:
- Text meets WCAG AA contrast standards (4.5:1)
- Interactive elements have 3:1 contrast with background
- Focus indicators are visible and high-contrast

**Screen Reader Support**:
- Semantic HTML structure
- Proper heading hierarchy (h1-h6)
- Alt text for icons (where applicable)

**Acceptance Criteria**:
- AC-NFR-UI-003.1: All text passes WCAG AA contrast checks
- AC-NFR-UI-003.2: Tab order is logical and intuitive
- AC-NFR-UI-003.3: Focus indicators are clearly visible
- AC-NFR-UI-003.4: Screen readers can navigate structure

### NFR-UI-004: Cross-Platform Consistency

**Priority**: Medium

**Platform Support**:
- macOS (primary development platform)
- Windows
- Linux

**Consistency Requirements**:
- UI looks and behaves identically across platforms
- Font rendering is consistent
- Tauri window controls integrate naturally
- No platform-specific UI bugs

**Acceptance Criteria**:
- AC-NFR-UI-004.1: Application tested on macOS, Windows, Linux
- AC-NFR-UI-004.2: Layout renders consistently across OSes
- AC-NFR-UI-004.3: Fonts fall back gracefully if system fonts unavailable
- AC-NFR-UI-004.4: Native window controls work correctly

## Design System Specifications

### Color Palette

#### Primary Colors
- **Primary Blue**: `#4F46E5` (Indigo-600) - Active states, primary actions
- **Primary Blue Hover**: `#4338CA` (Indigo-700) - Hover states

#### Background Colors
- **App Background**: `#F9FAFB` (Gray-50) - Main app background
- **Card Background**: `#FFFFFF` (White) - Cards, panels, surfaces
- **Hover Background**: `#F3F4F6` (Gray-100) - Hover states
- **Selected Background**: `#EEF2FF` (Indigo-50) - Selected items
- **Description Background**: `#F8FAFC` (Slate-50) - Description section

#### Text Colors
- **Primary Text**: `#111827` (Gray-900) - Headings, primary content
- **Secondary Text**: `#6B7280` (Gray-500) - Supporting text
- **Muted Text**: `#9CA3AF` (Gray-400) - Hints, metadata

#### Border Colors
- **Default Border**: `#E5E7EB` (Gray-200) - Standard borders
- **Hover Border**: `#D1D5DB` (Gray-300) - Hover state borders
- **Focus Border**: `#4F46E5` (Indigo-600) - Focus ring

#### Badge Colors
- **Claude Location**: Purple-500 (`#8B5CF6`) background, White text
- **OpenCode Location**: Green-500 (`#10B981`) background, White text
- **Action Keywords**: Blue-500 (`#3B82F6`) background, White text
- **Technology Keywords**: Purple-500 (`#8B5CF6`) background, White text
- **Format Keywords**: Green-500 (`#10B981`) background, White text
- **Topic Keywords**: Yellow-500 (`#EAB308`) background, White text

### Typography Scale

#### Headings
- **H1** (Page Title): 24px, font-weight 700, line-height 1.2
- **H2** (Section Title): 20px, font-weight 600, line-height 1.3
- **H3** (Subsection): 16px, font-weight 600, line-height 1.4

#### Body Text
- **Large**: 16px, font-weight 400, line-height 1.6
- **Medium**: 14px, font-weight 400, line-height 1.5
- **Small**: 12px, font-weight 400, line-height 1.4

#### Code
- **Inline Code**: 14px, monospace (Monaco, Courier New)
- **Code Block**: 13px, monospace (Monaco, Courier New)

#### Font Families
- **Sans-serif**: System font stack (Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Monospace**: Monaco, Courier New, monospace

### Spacing System

Based on 4px/8px grid:
- **xs**: 4px - Tight spacing within components
- **sm**: 8px - Component internal spacing
- **md**: 16px - Between related elements
- **lg**: 24px - Between sections
- **xl**: 32px - Large section spacing
- **2xl**: 48px - Major layout divisions

### Shadows

- **Card Shadow**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
- **Hover Shadow**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Modal Shadow**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Border Radius
- **sm**: 4px - Small elements (badges)
- **md**: 6px - Medium elements (buttons, inputs)
- **lg**: 8px - Large elements (cards)
- **full**: 9999px - Pills and rounded badges

## User Interaction Patterns

### Hover States
All interactive elements must have visible hover states:
- Background color changes (typically 100 lightness value darker)
- Border color changes for outlined elements
- Cursor changes to pointer for clickable items
- Cursor changes to grab/grabbing for draggable items
- Transition duration: 150ms ease

### Click/Tap Interactions
- Visual feedback within 50ms
- State changes (selection, navigation) feel instant
- No double-click required for any action
- Active states provide clear visual confirmation

### Focus States
- Focus ring: 2px blue-500 with offset
- Focus visible on all keyboard-navigable elements
- Focus trap in modal contexts (future)
- Focus returns to trigger after modal close (future)

### Transitions and Animations
- Tab content: opacity fade 150ms
- List item hover: background color 150ms
- Button hover: scale 1.02, duration 100ms
- Card hover: shadow transition 150ms
- Loading spinners: continuous rotation animation

## Implementation Components

### Component Tree

```
App.tsx
├── Layout.tsx
│   ├── Sidebar (320px fixed)
│   │   ├── Header (branding)
│   │   ├── SearchBar
│   │   └── SkillList
│   │       └── SkillListItem[] (conditional rendering)
│   │
│   └── MainContent (flex: 1)
│       └── SkillViewer
│           ├── BackNavigation
│           ├── OverviewPanel (top banner)
│           │   ├── SkillHeader
│           │   ├── QuickStatsGrid
│           │   └── TriggerPreview
│           ├── DescriptionSection
│           ├── TabNavigation
│           └── TabContent
│               ├── OverviewTab (metadata)
│               ├── ContentTab (markdown)
│               ├── ReferencesTab (master-detail)
│               ├── ScriptsTab (master-detail)
│               ├── TriggerAnalysis
│               └── DiagramView
```

### Key React Components

#### Layout.tsx
- Manages overall application structure
- Two-column layout with sidebar and main content
- Renders sidebar and children (SkillViewer)

#### SkillList.tsx
- Displays searchable list of skills
- Integrates SearchBar component
- Handles selection and filtering logic
- Renders SkillListItem for each skill

#### SearchBar.tsx
- Controlled input component
- Real-time value updates via onChange
- Placeholder text customizable

#### SkillViewer.tsx
- Main skill detail view container
- Manages active tab state
- Renders overview panel, description, tabs, and content
- Handles back navigation

#### OverviewPanel.tsx
- Top banner with skill summary
- Quick stats grid (clickable cards)
- Trigger preview section
- Calculates line count and trigger patterns

#### DescriptionSection.tsx
- Displays YAML description metadata
- Conditional rendering (hidden if no description)
- Clean typography and spacing

#### TriggerAnalysis.tsx
- Categorized trigger keyword display
- Color-coded badges
- Example query generation
- Summary statistics grid

#### DiagramView.tsx
- Interactive Mermaid diagram rendering
- Zoom and pan controls
- Font size adjustment
- Mouse wheel and drag support

#### ReferencesTab.tsx
- Master-detail layout
- Reference list with selection
- Async content loading via Tauri IPC
- Loading and error states

#### ScriptsTab.tsx
- Master-detail layout
- Script list with metadata
- Syntax highlighting with highlight.js
- Language-specific rendering

## Visual Mockups Reference

The following mockups illustrate the implemented design:

### Main Layout (Two-Column + Top Banner)
- **File**: `docs/mockups/05_revised_layout_v2.png`
- **Shows**: Complete application layout with sidebar, overview panel, description section, and tabbed content

### Content Tab View
- **File**: `docs/mockups/02_content_tab.png`
- **Shows**: Markdown rendering with proper formatting and syntax highlighting

### Triggers Tab View
- **File**: `docs/mockups/03_triggers_tab.png`
- **Shows**: Categorized trigger keywords and example queries

### Diagram Tab View
- **File**: `docs/mockups/04_diagram_tab.png`
- **Shows**: Interactive Mermaid diagram with zoom controls

## Acceptance Criteria Summary

### Must Have (MVP)
- Two-column layout with sidebar and main content area
- Skill list with search and filtering
- Overview panel showing quick stats and triggers
- Content tab with clean markdown rendering (no YAML)
- References and Scripts tabs with master-detail views
- Triggers tab with keyword analysis
- Diagram tab with interactive visualization
- Professional styling with consistent design system

### Should Have (Post-MVP)
- Dark mode theme toggle
- Customizable sidebar width
- Export functionality (PDF, markdown, JSON)
- Keyboard shortcuts for navigation
- Skill comparison view (side-by-side)

### Could Have (Future Enhancements)
- Skill editing capabilities
- Custom skill collections/favorites
- Version history for skills
- Usage analytics and statistics
- Collaborative skill sharing

## Testing Requirements

### Visual Regression Testing
- Screenshot comparisons for each major component
- Cross-browser visual consistency checks
- Dark mode visual testing (future)

### Interaction Testing
- Tab switching functionality
- Search filtering accuracy
- Skill selection and navigation
- Diagram zoom and pan controls
- Reference and script loading

### Accessibility Testing
- Keyboard navigation flows
- Screen reader compatibility
- Color contrast validation
- Focus indicator visibility

### Performance Testing
- Initial load time
- Search responsiveness
- Large diagram rendering
- Memory usage with many skills
- Smooth scrolling with long content

## Maintenance and Future Considerations

### Design System Maintenance
- Document all color changes in this file
- Update component library when adding new patterns
- Maintain consistency with Tailwind utility classes
- Keep mockups synchronized with implementation

### Scalability Considerations
- Layout should support 100+ skills without performance degradation
- Virtualized scrolling for large skill lists (future optimization)
- Lazy loading for reference and script content
- Efficient re-rendering with React memoization

### Extensibility
- Design system supports easy theme switching
- Component structure allows for plugin extensions
- Tab system can accommodate new content types
- Diagram supports multiple visualization types (future)

## Related Documents

- **UI Specifications**: `docs/UI_SPECIFICATION.md`, `docs/UI_SPECIFICATION_V2.md`
- **Visual Mockups**: `docs/mockups/README.md`
- **Functional Requirements**: `docs/requirements/functional-requirements.md`
- **Technical Architecture**: `docs/requirements/technical-architecture.md`
- **User Stories**: `docs/requirements/user-stories.md`

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-10 | Requirements Documenter | Initial comprehensive UI/UX requirements based on implemented components and specifications |
