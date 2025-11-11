# UI Component Hierarchy Diagram

This diagram illustrates the component hierarchy and data flow of the Skill Debugger user interface.

## Component Tree

```mermaid
graph TD
    App[App.tsx]
    App --> Layout[Layout.tsx]

    Layout --> Sidebar[Sidebar - 320px Fixed]
    Layout --> MainContent[Main Content Area]

    Sidebar --> SidebarHeader[Sidebar Header<br/>Branding & Title]
    Sidebar --> SearchBar[SearchBar<br/>Real-time Filter]
    Sidebar --> SkillCount[Skill Count<br/>X of Y skills]
    Sidebar --> SkillList[SkillList<br/>Scrollable Container]

    SkillList --> SkillListItem1[SkillListItem<br/>Skill 1]
    SkillList --> SkillListItem2[SkillListItem<br/>Skill 2]
    SkillList --> SkillListItemN[SkillListItem<br/>Skill N...]

    MainContent --> EmptyState[Empty State<br/>Welcome Message]
    MainContent --> SkillViewer[SkillViewer<br/>When Skill Selected]

    SkillViewer --> BackNav[Back Navigation<br/>Return to Empty State]
    SkillViewer --> OverviewPanel[Overview Panel<br/>Top Banner]
    SkillViewer --> DescriptionSection[Description Section<br/>YAML Metadata]
    SkillViewer --> TabNav[Tab Navigation<br/>6 Tabs]
    SkillViewer --> TabContent[Tab Content Area<br/>Dynamic Content]

    OverviewPanel --> SkillHeader[Skill Header<br/>Name + Location Badge]
    OverviewPanel --> QuickStats[Quick Stats Grid<br/>2x2 Cards]
    OverviewPanel --> TriggerPreview[Trigger Preview<br/>Top 5 Keywords]

    QuickStats --> RefCard[References Card<br/>Clickable]
    QuickStats --> ScriptCard[Scripts Card<br/>Clickable]
    QuickStats --> TriggerCard[Triggers Card<br/>Clickable]
    QuickStats --> LinesCard[Lines Card<br/>Display Only]

    TabNav --> OverviewTab[Overview Tab<br/>YAML Display]
    TabNav --> ContentTab[Content Tab<br/>Markdown]
    TabNav --> ReferencesTab[References Tab<br/>Master-Detail]
    TabNav --> ScriptsTab[Scripts Tab<br/>Master-Detail]
    TabNav --> TriggersTab[Triggers Tab<br/>Analysis]
    TabNav --> DiagramTab[Diagram Tab<br/>Mermaid]

    TabContent --> ActiveTab[Active Tab Content<br/>Rendered Based on Selection]

    ReferencesTab --> RefList[Reference List<br/>Left Column 320px]
    ReferencesTab --> RefContent[Reference Content<br/>Right Column Flex]

    ScriptsTab --> ScriptList[Script List<br/>Left Column 320px]
    ScriptsTab --> ScriptContent[Script Content<br/>Right Column Flex]

    TriggersTab --> TriggerKeywords[Trigger Keywords<br/>Color-coded Badges]
    TriggersTab --> ExampleQueries[Example Queries<br/>Generated Examples]
    TriggersTab --> AnalysisSummary[Analysis Summary<br/>Category Counts]

    DiagramTab --> DiagramControls[Diagram Controls<br/>Zoom, Pan, Font Size]
    DiagramTab --> DiagramCanvas[Diagram Canvas<br/>Mermaid Rendering]

    style App fill:#e1f5ff
    style Layout fill:#fff4e6
    style Sidebar fill:#f3e5f5
    style MainContent fill:#e8f5e9
    style SkillViewer fill:#fff9c4
    style OverviewPanel fill:#ffe0b2
    style TabNav fill:#ffccbc
    style TabContent fill:#d7ccc8
```

## Data Flow

```mermaid
graph LR
    FS[File System<br/>~/.claude/skills<br/>~/.config/opencode/skills]
    FS -->|Tauri IPC| Backend[Rust Backend<br/>Tauri Commands]

    Backend -->|discover_skills| Frontend[React Frontend<br/>State Management]
    Backend -->|read_file_content| Frontend

    Frontend --> Zustand[Zustand Store<br/>useSkillStore]

    Zustand -->|skills array| SkillList[SkillList Component]
    Zustand -->|selectedSkill| SkillViewer[SkillViewer Component]

    SkillList -->|selectSkill| Zustand
    SearchBar[SearchBar] -->|filter query| SkillList

    SkillViewer --> OverviewPanel[Overview Panel]
    SkillViewer --> Tabs[Tab Components]

    OverviewPanel -->|analyzeTriggers| TriggerAnalyzer[Trigger Analyzer Utility]
    Tabs -->|generateSkillDiagram| DiagramGenerator[Diagram Generator Utility]

    style FS fill:#f8bbd0
    style Backend fill:#c5cae9
    style Frontend fill:#b2dfdb
    style Zustand fill:#fff9c4
    style SkillList fill:#e1bee7
    style SkillViewer fill:#c5e1a5
```

## User Interaction Flow

```mermaid
stateDiagram-v2
    [*] --> EmptyState: Application Launch

    EmptyState --> SkillListLoading: Load Skills
    SkillListLoading --> SkillListDisplayed: Skills Loaded
    SkillListLoading --> SkillListError: Load Failed

    SkillListError --> SkillListLoading: Retry

    SkillListDisplayed --> Searching: User Types in Search
    Searching --> SkillListFiltered: Filter Applied
    SkillListFiltered --> SkillListDisplayed: Clear Search

    SkillListDisplayed --> SkillSelected: Click Skill
    SkillListFiltered --> SkillSelected: Click Skill

    SkillSelected --> ViewingOverview: Display Overview Panel
    ViewingOverview --> ViewingContent: Default Tab = Content

    ViewingContent --> ViewingOverview: Click Overview Tab
    ViewingContent --> ViewingReferences: Click References Tab
    ViewingContent --> ViewingScripts: Click Scripts Tab
    ViewingContent --> ViewingTriggers: Click Triggers Tab
    ViewingContent --> ViewingDiagram: Click Diagram Tab

    ViewingReferences --> ViewingContent: Click Content Tab
    ViewingScripts --> ViewingContent: Click Content Tab
    ViewingTriggers --> ViewingContent: Click Content Tab
    ViewingDiagram --> ViewingContent: Click Content Tab

    ViewingReferences --> ReferenceSelected: Click Reference
    ReferenceSelected --> RefLoading: Load Content
    RefLoading --> RefDisplayed: Content Loaded
    RefDisplayed --> ViewingReferences: Select Another Reference

    ViewingScripts --> ScriptSelected: Click Script
    ScriptSelected --> ScriptDisplayed: Display with Highlighting
    ScriptDisplayed --> ViewingScripts: Select Another Script

    ViewingDiagram --> DiagramZoom: Zoom In/Out
    ViewingDiagram --> DiagramPan: Pan Diagram
    DiagramZoom --> ViewingDiagram: Action Complete
    DiagramPan --> ViewingDiagram: Action Complete

    ViewingContent --> EmptyState: Click Back Button
    ViewingOverview --> EmptyState: Click Back Button
    ViewingReferences --> EmptyState: Click Back Button
    ViewingScripts --> EmptyState: Click Back Button
    ViewingTriggers --> EmptyState: Click Back Button
    ViewingDiagram --> EmptyState: Click Back Button
```

## Layout Structure

```mermaid
graph TD
    Window[Application Window]
    Window --> Container[Main Container<br/>Flex Row, Full Height]

    Container --> Sidebar[Sidebar<br/>w-80, Fixed Width<br/>bg-white, border-right]
    Container --> MainArea[Main Area<br/>flex-1, Flexible Width<br/>bg-gray-50]

    Sidebar --> SidebarContent[Sidebar Content<br/>Flex Column]
    SidebarContent --> Header[Header Section<br/>p-4, border-bottom]
    SidebarContent --> ListArea[List Area<br/>flex-1, overflow-y-auto]

    MainArea --> EmptyOrViewer{Skill Selected?}
    EmptyOrViewer -->|No| Empty[Empty State<br/>Centered Message]
    EmptyOrViewer -->|Yes| ViewerLayout[Viewer Layout<br/>Flex Column]

    ViewerLayout --> BackButton[Back Button<br/>px-6, py-3]
    ViewerLayout --> Overview[Overview Panel<br/>Full Width, border-bottom]
    ViewerLayout --> Description[Description Section<br/>Full Width, border-bottom]
    ViewerLayout --> Tabs[Tab Navigation<br/>border-bottom]
    ViewerLayout --> Content[Tab Content<br/>flex-1, overflow-y-auto]

    Overview --> OverviewLayout[Overview Layout<br/>Grid, p-6]
    OverviewLayout --> HeaderRow[Header Row<br/>flex, justify-between]
    OverviewLayout --> StatsGrid[Stats Grid<br/>grid-cols-4, gap-4]
    OverviewLayout --> TriggerSection[Trigger Section<br/>flex-wrap, gap-2]

    style Window fill:#e3f2fd
    style Container fill:#fff3e0
    style Sidebar fill:#f3e5f5
    style MainArea fill:#e8f5e9
    style ViewerLayout fill:#fff9c4
    style Overview fill:#ffe0b2
```

## State Management Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant Store as Zustand Store
    participant Tauri as Tauri Backend
    participant FS as File System

    User->>UI: Launch Application
    UI->>Store: Initialize Store
    UI->>Tauri: discover_skills()
    Tauri->>FS: Scan skill directories
    FS-->>Tauri: Return skill files
    Tauri-->>UI: Return Skill[]
    UI->>Store: setSkills(skills)
    Store-->>UI: Re-render with skills

    User->>UI: Type in Search Bar
    UI->>UI: Filter skills locally
    UI-->>User: Display filtered list

    User->>UI: Click Skill in List
    UI->>Store: selectSkill(skill)
    Store-->>UI: Re-render with selectedSkill
    UI-->>User: Show Skill Viewer

    User->>UI: Click References Tab
    UI->>UI: Change active tab
    UI-->>User: Display References List

    User->>UI: Click Reference Item
    UI->>Tauri: read_file_content(path)
    Tauri->>FS: Read file
    FS-->>Tauri: Return content
    Tauri-->>UI: Return file content
    UI-->>User: Display reference content

    User->>UI: Click Back Button
    UI->>Store: setSelectedSkill(null)
    Store-->>UI: Re-render without selection
    UI-->>User: Show Empty State
```

## Component Responsibilities

| Component | Primary Responsibility | State Management | User Interactions |
|-----------|------------------------|------------------|-------------------|
| **Layout** | Overall app structure | None (presentation) | None |
| **SkillList** | Display and filter skills | Local filter state | Search input, skill selection |
| **SearchBar** | Search input field | Controlled by parent | Text input |
| **SkillViewer** | Skill detail container | Active tab state | Tab switching, back navigation |
| **OverviewPanel** | Quick stats display | None (props-based) | Navigate to tabs via stats |
| **DescriptionSection** | Metadata display | None (props-based) | None |
| **TriggerAnalysis** | Trigger keyword analysis | None (computed) | None |
| **DiagramView** | Interactive diagram | Local zoom/pan state | Zoom, pan, font adjust |
| **ReferencesTab** | Reference browser | Selection state, content cache | Select reference, load content |
| **ScriptsTab** | Script browser | Selection state | Select script |

## Key Design Patterns

### Pattern 1: Master-Detail Layout
- Used in References and Scripts tabs
- Left column (320px): List of items
- Right column (flex): Selected item content
- Independent scrolling for each column

### Pattern 2: Tab-Based Navigation
- Single active tab at a time
- Content area updates without page reload
- Tab state managed by SkillViewer parent
- Smooth transitions between tabs

### Pattern 3: Progressive Disclosure
- Overview Panel → Quick summary
- Description Section → Key details
- Tab Content → Deep dive
- User chooses depth of exploration

### Pattern 4: Async Data Loading
- Initial skill list from backend
- Reference content loaded on-demand
- Loading states provide feedback
- Error states allow recovery

### Pattern 5: Real-time Filtering
- Search filters locally (no backend calls)
- Instant results as user types
- Filtered count updates dynamically
- No submit button required

## Related Documents

- **[UI/UX Requirements](../ui-ux-requirements.md)** - Detailed UI requirements
- **[Technical Architecture](../technical-architecture.md)** - System architecture
- **[Component Specifications](../../UI_SPECIFICATION_V2.md)** - UI design specifications
