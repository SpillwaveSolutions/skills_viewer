# Phase 1: Data Model - Improved UI Layout with Top Tabs

**Feature**: 016-improved-ui-layout
**Date**: 2025-11-14
**Purpose**: Define core entities and their relationships

## Entity Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillViewer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            BreadcrumbNavigation                      │  │
│  │  segments: BreadcrumbSegment[]                       │  │
│  │  currentLocation: string                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            SkillHeader                               │  │
│  │  mode: LayoutMode                                    │  │
│  │  title: string                                       │  │
│  │  badge: string                                       │  │
│  │  inlineStats?: InlineStats                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            TabBar                                    │  │
│  │  tabs: TabConfig[]                                   │  │
│  │  activeIndex: number                                 │  │
│  │  onTabChange: (index: number) => void                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Tab Content (6 variants)                       │  │
│  │  - OverviewTab (consolidated metadata)               │  │
│  │  - ContentTab (markdown)                             │  │
│  │  - TriggersTab (trigger analysis)                    │  │
│  │  - DiagramTab (Mermaid visualization)                │  │
│  │  - ReferencesTab (cross-references)                  │  │
│  │  - ScriptsTab (embedded scripts)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

State Management:
┌──────────────────────────────────────────────────────────┐
│  layoutStore (Zustand)                                   │
│  - mode: LayoutMode                                      │
│  - setMode: (mode: LayoutMode) => void                   │
│  - toggleMode: () => void                                │
│  - [persists to localStorage]                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  keyboardStore (Zustand - existing)                      │
│  - activeTabIndex: number | null                         │
│  - setActiveTabIndex: (index: number) => void            │
│  - [already handles Cmd/Ctrl+1-6]                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  navigationStore (Zustand - existing)                    │
│  - history: NavigationEntry[]                            │
│  - navigateTo: (entry: NavigationEntry) => void          │
│  - [provides data for breadcrumb]                        │
└──────────────────────────────────────────────────────────┘
```

## Entities

### 1. LayoutMode

**Purpose**: Represents the current layout configuration (standard or compact)

**Type Definition**:

```typescript
// src/types/layout.ts

/**
 * Layout mode types
 * - standard: Full header with description section
 * - compact: Minimal header with inline stats only
 */
type LayoutMode = 'standard' | 'compact';

/**
 * Inline statistics shown in compact mode header
 */
interface InlineStats {
  references: number;
  scripts: number;
  triggers: number;
  lines: number;
}
```

**Attributes**:

- `mode`: Type of layout ('standard' | 'compact')
- `descriptionVisible`: Boolean (true in standard, false in compact)
- `inlineStatsVisible`: Boolean (false in standard, true in compact)
- `headerHeightOffset`: Number (0 in standard, -80 to -120px in compact)

**Business Rules**:

- Default mode is 'standard' on first load
- Mode persists to localStorage on change (key: 'layoutMode')
- Mode is restored from localStorage on app startup
- Switching modes does not change active tab
- Overview tab shows full description regardless of mode

**Referenced in**:

- FR-024 to FR-032 (Compact Layout Mode)
- SC-004 (Compact mode provides 80-120px additional space)

### 2. BreadcrumbNavigation

**Purpose**: Represents hierarchical navigation path and provides navigation handlers

**Type Definition**:

```typescript
// src/types/layout.ts

/**
 * Breadcrumb segment representing one level in the hierarchy
 */
interface BreadcrumbSegment {
  id: string; // 'home' | 'skill' | 'tab'
  label: string; // Display text (e.g., 'Home', skill name, tab name)
  clickable: boolean; // Can this segment be clicked?
  ariaLabel?: string; // Accessibility label (e.g., 'Navigate to home')
  onClick?: () => void; // Navigation handler
}

/**
 * Breadcrumb navigation state
 */
interface BreadcrumbState {
  segments: BreadcrumbSegment[];
  currentLocation: string; // Last segment label
  separator: string; // '›' character
}
```

**Attributes**:

- `segments`: Array of breadcrumb segments (1-3 items: Home, Skill?, Tab?)
- `currentLocation`: String representing current position (for ARIA announcements)
- `separator`: String character used between segments ('›')

**Segment Examples**:

```typescript
// Viewing skill list
segments = [{ id: 'home', label: 'Home', clickable: false }];

// Viewing skill's Content tab
segments = [
  { id: 'home', label: 'Home', clickable: true, onClick: navigateHome },
  { id: 'skill', label: 'My Skill', clickable: false },
  { id: 'tab', label: 'Content', clickable: false },
];
```

**Business Rules**:

- Home segment always present
- Skill segment appears when skill is selected
- Tab segment appears when skill is selected (shows active tab name)
- Last segment (current location) is not clickable
- Clicking "Home" calls `selectSkill(null)` to return to list
- Segments update within <50ms of tab change (FR-020)
- Long skill names truncate with ellipsis (FR-042)

**Referenced in**:

- FR-015 to FR-023 (Breadcrumb Navigation)
- FR-046, FR-047 (Breadcrumb Accessibility)
- SC-003 (Breadcrumb updates within 50ms)

### 3. TabConfiguration

**Purpose**: Represents the top tab bar structure and tab metadata

**Type Definition**:

```typescript
// src/types/layout.ts

/**
 * Individual tab configuration
 */
interface TabConfig {
  id: string; // 'overview' | 'content' | 'triggers' | 'diagram' | 'references' | 'scripts'
  label: string; // Display text (e.g., 'Overview', 'Content')
  icon: string; // Emoji icon (e.g., '📊', '📄')
  shortcutIndex: number; // Keyboard shortcut (1-6 for Cmd/Ctrl+1-6)
  ariaLabel: string; // Accessibility label (e.g., 'Overview tab')
}

/**
 * Tab bar state
 */
interface TabBarState {
  tabs: TabConfig[];
  activeIndex: number;
  visualState: 'active' | 'hover' | 'default';
  onTabChange: (index: number) => void;
}
```

**Tab Definitions** (FR-004):

```typescript
const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '📊', shortcutIndex: 1, ariaLabel: 'Overview tab' },
  { id: 'content', label: 'Content', icon: '📄', shortcutIndex: 2, ariaLabel: 'Content tab' },
  { id: 'triggers', label: 'Triggers', icon: '⚡', shortcutIndex: 3, ariaLabel: 'Triggers tab' },
  { id: 'diagram', label: 'Diagram', icon: '🔷', shortcutIndex: 4, ariaLabel: 'Diagram tab' },
  {
    id: 'references',
    label: 'References',
    icon: '📚',
    shortcutIndex: 5,
    ariaLabel: 'References tab',
  },
  { id: 'scripts', label: 'Scripts', icon: '📜', shortcutIndex: 6, ariaLabel: 'Scripts tab' },
];
```

**Business Rules**:

- Tab order is fixed (cannot be reordered by user)
- Active tab shows purple bottom border (FR-034)
- Inactive tabs show light gray background on hover (FR-033)
- Tab switching completes in <200ms (FR-037)
- Tabs use semantic HTML (role="tablist", role="tab") (FR-048)
- Keyboard shortcuts (Cmd/Ctrl+1-6) map to shortcutIndex (FR-052)

**Referenced in**:

- FR-001, FR-004 (Tab Positioning and Order)
- FR-033 to FR-040 (Visual Feedback)
- FR-048, FR-049, FR-052 (Accessibility)
- SC-005 (Tab switching <200ms)

### 4. HeaderState

**Purpose**: Represents skill header content and layout configuration

**Type Definition**:

```typescript
// src/types/layout.ts

/**
 * Skill header state (changes based on layout mode)
 */
interface HeaderState {
  title: string; // Skill name
  badge: string; // Location badge (e.g., 'user', 'system')
  mode: LayoutMode; // 'standard' | 'compact'
  description?: string; // Full description (standard mode only)
  inlineStats?: InlineStats; // Stats (compact mode only)
}

/**
 * Inline stats for compact mode
 */
interface InlineStats {
  references: number;
  scripts: number;
  triggers: number;
  lines: number;

  // Format: "refs: 3 | scripts: 4 | triggers: 9 | lines: 417"
  toString(): string;
}
```

**Rendering Rules**:

**Standard Mode** (FR-006):

```
┌─────────────────────────────────────────────────────┐
│  Skill Title                          [user badge]  │
│  Description text goes here...                      │
└─────────────────────────────────────────────────────┘
```

**Compact Mode** (FR-025, FR-026):

```
┌─────────────────────────────────────────────────────┐
│  Skill Title  [badge]  refs: 3 | scripts: 4 | ...  │
└─────────────────────────────────────────────────────┘
```

**Business Rules**:

- Standard mode: Shows title, badge, description (FR-006)
- Compact mode: Shows title, badge, inline stats (FR-025)
- Description only in standard mode (FR-026)
- Inline stats use monospace font (FR-031)
- Long titles truncate with ellipsis (FR-043)
- Header is always visible (does not scroll)

**Referenced in**:

- FR-006 (Header content in standard mode)
- FR-025, FR-026, FR-031 (Compact mode header)
- FR-043 (Title truncation)
- SC-004 (Header height difference 80-120px)

### 5. OverviewTabContent

**Purpose**: Represents consolidated metadata displayed in Overview tab

**Type Definition**:

```typescript
// src/types/layout.ts

/**
 * Overview tab content sections
 */
interface OverviewTabContent {
  description: string; // Skill description (FR-009)
  version?: string; // Version badge (FR-010)
  triggers: string[]; // Trigger keywords (first 5) (FR-011)
  stats: StatsGrid; // 4-column stats (FR-012)
  metadata: MetadataEntry[]; // Additional metadata (FR-013)
  tags?: string[]; // Skill tags (FR-014)
}

/**
 * Stats grid (4 columns)
 */
interface StatsGrid {
  references: number;
  scripts: number;
  triggers: number;
  lines: number;
}

/**
 * Metadata key-value pair
 */
interface MetadataEntry {
  label: string; // e.g., 'Author', 'Last Updated'
  value: string; // e.g., 'Claude', '2025-11-14'
}

/**
 * Trigger badge configuration
 */
interface TriggerBadge {
  keyword: string;
  confidence?: number; // 0-1 (optional)
  color: string; // Background color (default: #dbeafe)
}
```

**Layout Sections**:

```
┌─────────────────────────────────────────────────────┐
│  Description                                        │
│  Multi-line text content...                         │
├─────────────────────────────────────────────────────┤
│  Version: v1.2.3 (monospace)                        │
├─────────────────────────────────────────────────────┤
│  Triggers: [keyword1] [keyword2] [keyword3] ...     │
│  (light blue badges #dbeafe)                        │
├─────────────────────────────────────────────────────┤
│  Stats Grid (4 columns)                             │
│  References: 3    Scripts: 4    Triggers: 9         │
│  Lines: 417                                         │
├─────────────────────────────────────────────────────┤
│  Metadata Grid (2 columns)                          │
│  Author:         Claude                             │
│  Last Updated:   2025-11-14                         │
├─────────────────────────────────────────────────────┤
│  Tags: [tag1] [tag2] [tag3] (if tags exist)        │
└─────────────────────────────────────────────────────┘
```

**Business Rules**:

- All content appears ONLY in Overview tab (FR-007, FR-008)
- No duplicate content in header (FR-008)
- Version badge uses monospace font (FR-010)
- Trigger badges limited to first 5 (FR-011)
- Trigger badges have light blue background #dbeafe (FR-011)
- Stats grid always shows 4 columns (FR-012)
- Metadata grid shows 2 columns: label + value (FR-013)
- Tag cloud only shown if tags exist (FR-014)
- Content identical in both standard and compact modes (FR-030)

**Referenced in**:

- FR-007 to FR-014 (Consolidated Overview Content)
- FR-030 (Overview content same in both modes)
- SC-002 (Zero duplicate content verification)

## Entity Relationships

```
SkillViewer
├── uses → BreadcrumbNavigation (shows current location)
├── uses → SkillHeader (displays title, badge, mode-specific content)
├── uses → TabBar (manages 6 tabs, active state)
└── renders → Tab Content (based on activeTabIndex)
    ├── OverviewTab (uses OverviewTabContent)
    ├── ContentTab (existing)
    ├── TriggersTab (existing)
    ├── DiagramTab (existing)
    ├── ReferencesTab (existing)
    └── ScriptsTab (existing)

SkillHeader
└── depends on → LayoutMode (determines rendering variant)

BreadcrumbNavigation
├── depends on → navigationStore (history data)
└── depends on → keyboardStore (activeTabIndex for tab name)

TabBar
├── depends on → keyboardStore (activeTabIndex, setActiveTabIndex)
└── updates → BreadcrumbNavigation (when tab changes)

LayoutMode
├── managed by → layoutStore (Zustand)
└── persisted to → localStorage (key: 'layoutMode')
```

## State Flow

```
User Action: Click Tab
  │
  ├─> TabBar.onClick(index)
  │     └─> keyboardStore.setActiveTabIndex(index)
  │           └─> SkillViewer re-renders (new activeTab)
  │                 └─> BreadcrumbNavigation updates (<50ms)
  │
  └─> navigationStore.navigateTo({ type: 'skill', tab: ... })

User Action: Toggle Compact Mode
  │
  └─> layoutStore.toggleMode()
        ├─> mode changes ('standard' ↔ 'compact')
        ├─> localStorage.set('layoutMode', newMode)
        └─> SkillHeader re-renders (new layout variant)

User Action: Navigate Back (Breadcrumb)
  │
  └─> BreadcrumbSegment.onClick()
        └─> selectSkill(null)
              └─> SkillViewer unmounts
                    └─> Breadcrumb shows 'Home' only

App Startup
  │
  └─> layoutStore initialization
        └─> mode = localStorage.get('layoutMode', 'standard')
              └─> SkillHeader renders with restored mode
```

## Validation Rules

| Entity             | Validation                                                       | Enforcement Point                |
| ------------------ | ---------------------------------------------------------------- | -------------------------------- |
| LayoutMode         | Must be 'standard' or 'compact'                                  | TypeScript type system           |
| BreadcrumbSegment  | Clickable segments must have onClick handler                     | Component prop validation        |
| TabConfig          | shortcutIndex must be 1-6 (unique)                               | Compile-time constant validation |
| HeaderState        | Compact mode requires inlineStats, standard requires description | Component rendering logic        |
| OverviewTabContent | Trigger badges limited to max 5                                  | Array slice in component         |
| InlineStats        | All counts must be non-negative integers                         | Data transformation layer        |

## Data Sources

| Entity             | Data Source                                            | Transform/Compute                      |
| ------------------ | ------------------------------------------------------ | -------------------------------------- |
| LayoutMode         | localStorage → layoutStore                             | Parse JSON, default to 'standard'      |
| BreadcrumbSegment  | navigationStore.history                                | Map to segment format, limit to last 3 |
| TabConfig          | Static constant (TABS array)                           | None (compile-time)                    |
| HeaderState        | selectedSkill + layoutStore.mode                       | Conditional rendering based on mode    |
| OverviewTabContent | selectedSkill.metadata                                 | Parse YAML frontmatter, compute stats  |
| InlineStats        | selectedSkill (references, scripts, triggers, content) | Count arrays, count lines              |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
