# Frontend Documentation: Skill Debugger

**Version**: 0.2.0
**Last Updated**: 2025-11-13
**Technology Stack**: React 19.1.0 + TypeScript 5.8.3 + Zustand 5.0.8 + TailwindCSS 4.1.17

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Catalog](#component-catalog)
3. [State Management (Zustand)](#state-management-zustand)
4. [Custom Hooks](#custom-hooks)
5. [TypeScript Types](#typescript-types)
6. [Utilities](#utilities)
7. [UI Patterns](#ui-patterns)
8. [Component Relationship Diagram](#component-relationship-diagram)

---

## Architecture Overview

### Technology Stack

- **UI Framework**: React 19.1.0 with TypeScript strict mode
- **State Management**: Zustand 5.0.8 (lightweight alternative to Redux)
- **Styling**: TailwindCSS 4.1.17 (utility-first CSS)
- **Markdown Rendering**: react-markdown 10.1.0 with syntax highlighting
- **Diagrams**: Mermaid 11.12.1 (flowcharts/architecture visualization)
- **Desktop Integration**: Tauri 2.x (Rust backend communication via IPC)

### Design Principles

1. **Read-only by design**: No file modifications, only safe reads
2. **Offline-first**: No network requests (all data from local filesystem)
3. **Desktop-native**: Tauri provides native OS integration
4. **Type-safe**: TypeScript strict mode + Rust type system
5. **Power-user focused**: Keyboard shortcuts, information density

### Project Structure

```
src/
├── components/           # React UI components (14 files)
│   ├── App.tsx          # Root component
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── SkillViewer.tsx  # Tab-based skill detail view
│   ├── SkillList.tsx    # Sidebar skill list with search
│   ├── SearchBar.tsx    # Search input with keyboard focus
│   ├── OverviewPanel.tsx    # Skill header with metadata
│   ├── ReferencesTab.tsx    # View reference files
│   ├── ScriptsTab.tsx       # View embedded scripts
│   ├── TriggerAnalysis.tsx  # Trigger keyword analysis
│   ├── DiagramView.tsx      # Mermaid diagram viewer
│   ├── KeyboardShortcutHelp.tsx  # ? key help modal
│   ├── DescriptionSection.tsx    # Skill description display
│   └── ErrorBoundary.tsx    # React error boundary
│
├── stores/              # Zustand state stores
│   ├── useSkillStore.ts      # Skill data and selection
│   └── keyboardStore.ts      # Keyboard shortcuts state
│
├── hooks/               # Custom React hooks
│   ├── useSkills.ts          # Load skills from backend
│   ├── useKeyboardShortcuts.ts  # Global keyboard handlers
│   ├── useListNavigation.ts     # Arrow key list navigation
│   └── usePlatformModifier.ts   # Detect macOS vs Windows/Linux
│
├── types/               # TypeScript type definitions
│   ├── skill.ts         # Skill, Reference, Script types
│   ├── keyboard.ts      # Keyboard shortcut types
│   ├── reference.ts     # Reference file types
│   └── script.ts        # Script types
│
├── utils/               # Utility functions
│   ├── triggerAnalyzer.ts   # Analyze skill trigger keywords
│   ├── diagramGenerator.ts  # Generate Mermaid diagrams
│   └── keyboardUtils.ts     # Keyboard shortcut utilities
│
└── main.tsx            # React entry point
```

---

## Component Catalog

### 1. App Component

**File**: `/Users/richardhightower/src/skill-debugger/src/App.tsx`

**Purpose**: Root application component that sets up global state and keyboard shortcuts.

**Responsibilities**:

- Initialize global keyboard shortcuts (`useKeyboardShortcuts` hook)
- Detect platform (macOS vs Windows/Linux) on mount
- Manage help modal state
- Render layout and main content

**Props**: None

**State Dependencies**:

- `keyboardStore`: Help modal visibility
- Platform detection

**Code Example**:

```tsx
function App() {
  useKeyboardShortcuts(); // Enable global keyboard shortcuts

  const isHelpModalOpen = useKeyboardStore((state) => state.isHelpModalOpen);
  const setHelpModalOpen = useKeyboardStore((state) => state.setHelpModalOpen);

  useEffect(() => {
    useKeyboardStore.getState().detectPlatform(); // Detect macOS vs Windows
  }, []);

  return (
    <>
      <Layout>
        <SkillViewer />
      </Layout>
      <KeyboardShortcutHelp isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}
```

**Key Features**:

- Platform-aware keyboard shortcuts (Cmd on Mac, Ctrl on Windows/Linux)
- Global ? key to show help modal
- Error boundary wrapper (in main.tsx)

---

### 2. Layout Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/Layout.tsx`

**Purpose**: Two-column layout with fixed sidebar and scrollable main content.

**Props**:

```tsx
interface LayoutProps {
  children: React.ReactNode; // Main content area (SkillViewer)
}
```

**Structure**:

```
┌─────────────────────────────────────────────┐
│  [Sidebar - 320px]  │  [Main Content]      │
│  ┌────────────────┐ │                      │
│  │ Title/Header   │ │                      │
│  ├────────────────┤ │                      │
│  │ SkillList      │ │  {children}          │
│  │ (scrollable)   │ │  (SkillViewer)       │
│  │                │ │                      │
│  │                │ │                      │
│  └────────────────┘ │                      │
└─────────────────────────────────────────────┘
```

**Styling**:

- Sidebar: `w-80` (320px), white background, fixed height
- Main: `flex-1` (takes remaining width), gray background

**Children**:

- `SkillList` (embedded in sidebar)
- Main content passed as `children` prop

---

### 3. SkillViewer Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/SkillViewer.tsx`

**Purpose**: Main content area that displays selected skill details across multiple tabs.

**Props**: None (uses Zustand store for state)

**State Dependencies**:

- `useSkillStore`: `selectedSkill`, `selectSkill`
- `useKeyboardStore`: `activeTabIndex` (for Cmd/Ctrl+1-6 shortcuts)

**Tab Structure**:

| Tab Index | Tab ID     | Icon | Keyboard   | Description                        |
| --------- | ---------- | ---- | ---------- | ---------------------------------- |
| 0         | overview   | 📊   | Cmd/Ctrl+1 | YAML frontmatter metadata          |
| 1         | content    | 📄   | Cmd/Ctrl+2 | Markdown content (full skill file) |
| 2         | triggers   | 🎯   | Cmd/Ctrl+3 | Trigger keyword analysis           |
| 3         | diagram    | 🔀   | Cmd/Ctrl+4 | Mermaid architecture diagram       |
| 4         | references | 📚   | Cmd/Ctrl+5 | Reference files viewer             |
| 5         | scripts    | 🔧   | Cmd/Ctrl+6 | Embedded scripts viewer            |

**Layout**:

```tsx
<div className="flex flex-col h-full">
  {/* Back Button */}
  <div className="px-6 py-3 bg-white border-b">
    <button onClick={handleBackClick}>← Back to Skills</button>
  </div>

  {/* Overview Panel (top banner with description/stats) */}
  <OverviewPanel skill={selectedSkill} />

  {/* Tab Navigation */}
  <div className="border-b bg-white">
    {TABS.map((tab, index) => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>

  {/* Tab Content */}
  <div className="flex-1 overflow-y-auto">
    {activeTab === 'overview' && <OverviewTab />}
    {activeTab === 'content' && <ContentTab />}
    {activeTab === 'references' && <ReferencesTab />}
    {/* ... other tabs ... */}
  </div>
</div>
```

**Key Features**:

- Keyboard shortcuts (Cmd/Ctrl+1-6) to switch tabs
- Syncs tab state with keyboard store for shortcut integration
- Shows welcome message when no skill selected
- Markdown rendering with syntax highlighting (react-markdown + rehype-highlight)

**Tab Content Renderers**:

- **Overview Tab**: Displays YAML frontmatter as formatted cards
- **Content Tab**: Renders clean markdown (without frontmatter)
- **Triggers Tab**: Shows `<TriggerAnalysis />` component
- **Diagram Tab**: Shows `<DiagramView />` component
- **References Tab**: Shows `<ReferencesTab />` component
- **Scripts Tab**: Shows `<ScriptsTab />` component

---

### 4. SkillList Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/SkillList.tsx`

**Purpose**: Sidebar list of all skills with search/filter and keyboard navigation.

**Props**: None (uses hooks for data)

**State Dependencies**:

- `useSkills()`: Load skills from backend
- `useSkillStore`: `selectedSkill`, `selectSkill`
- `useKeyboardStore`: `highlightedSkillIndex`, `visibleSkillCount`
- `useListNavigation()`: Arrow key navigation

**Layout**:

```tsx
<div className="flex flex-col h-full">
  {/* Search Bar */}
  <SearchBar value={searchQuery} onChange={setSearchQuery} />

  {/* Stats Header */}
  <div className="p-3 border-b">
    <span>42 of 50 skills</span>
    <button onClick={reload}>Refresh</button>
  </div>

  {/* Skill List (scrollable) */}
  <div className="flex-1 overflow-y-auto">
    {filteredSkills.map((skill, index) => (
      <SkillListItem
        skill={skill}
        index={index}
        isSelected={selectedSkill?.path === skill.path}
        isHighlighted={highlightedSkillIndex === index}
        onClick={() => selectSkill(skill)}
      />
    ))}
  </div>
</div>
```

**Key Features**:

- **Search/Filter**: Filters by name, description, or location
- **Keyboard Navigation**: Arrow keys to highlight, Enter to select
- **Visual States**:
  - Selected: Blue background with thick left border
  - Highlighted: Amber background with thin left border
  - Hover: Light gray background
- **Auto-scroll**: Highlighted item scrolls into view
- **Loading/Error States**: Shows spinner or error message

**SkillListItem Sub-component**:

```tsx
interface SkillListItemProps {
  skill: Skill;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}
```

**Item Layout**:

```
┌────────────────────────────────────┐
│ skill-creator          [claude]    │
│                                    │
└────────────────────────────────────┘
```

**Styling Classes**:

- Selected: `bg-blue-50 border-l-4 border-l-blue-500 pl-3.5`
- Highlighted: `bg-amber-50 border-l-2 border-l-amber-400`
- Hover: `hover:bg-gray-50`

---

### 5. SearchBar Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/SearchBar.tsx`

**Purpose**: Search input with keyboard focus support (Cmd/Ctrl+F).

**Props**:

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // Default: "Search skills..."
}
```

**State Dependencies**:

- `useKeyboardStore`: `searchFocusRequested`

**Key Features**:

- **Cmd/Ctrl+F Focus**: Automatically focuses input when shortcut pressed
- **Text Selection**: Selects existing text on focus for easy replacement
- **Escape to Clear**: Pressing Escape clears search and blurs input
- **Keyboard Shortcut Integration**: Resets `searchFocusRequested` flag after focusing

**Code Example**:

```tsx
useEffect(() => {
  if (searchFocusRequested && inputRef.current) {
    inputRef.current.focus();
    if (value) {
      inputRef.current.select(); // Select existing text
    }
    setSearchFocusRequested(false); // Reset flag
  }
}, [searchFocusRequested]);

function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Escape') {
    onChange(''); // Clear search
    inputRef.current?.blur(); // Remove focus
  }
}
```

---

### 6. OverviewPanel Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/OverviewPanel.tsx`

**Purpose**: Top banner in SkillViewer showing skill metadata, description, and quick stats.

**Props**:

```tsx
interface OverviewPanelProps {
  skill: Skill;
  onNavigateToTab?: (tab: string) => void; // Optional callback for quick navigation
}
```

**Layout**:

```
┌──────────────────────────────────────────────────────────┐
│ skill-creator                              [claude]      │
│ ─────────────────────────────────────────────────────── │
│ 📝 Description                                           │
│ Create new skills for Claude Code with best practices   │
│ ─────────────────────────────────────────────────────── │
│ 🎯 Common Triggers                                       │
│ [create] [skill] [documentation] [guide] +5 more         │
│ ─────────────────────────────────────────────────────── │
│ 📚 References: 3   🔧 Scripts: 2   🎯 Triggers: 12   📏 Lines: 450 │
└──────────────────────────────────────────────────────────┘
```

**Sections** (in order):

1. **Skill name + location badge**
2. **Description** (from YAML metadata or skill.description)
3. **Version** (if present in metadata)
4. **Common Triggers** (first 5 trigger keywords, clickable)
5. **Quick Stats Grid** (4 cards: References, Scripts, Triggers, Lines)
6. **Additional Metadata** (other YAML fields not already displayed)

**Key Features**:

- **Trigger Preview**: Shows first 5 trigger keywords with "+N more" indicator
- **Clickable Stats**: Clicking stats cards navigates to corresponding tab
- **Line Count**: Automatically counts lines in skill content
- **Metadata Filtering**: Excludes name/description/version from "Additional Metadata" section

**Stats Card Click Handlers**:

```tsx
<div onClick={() => onNavigateToTab?.('references')}>
  <div>📚 References</div>
  <div>{skill.references.length}</div>
</div>
```

---

### 7. ReferencesTab Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/ReferencesTab.tsx`

**Purpose**: Two-panel viewer for reference files (list + content).

**Props**:

```tsx
interface ReferencesTabProps {
  skill: Skill;
}
```

**Layout**:

```
┌────────────────────────────────────────────────┐
│ [Ref List 320px] │ [Content Panel]            │
│ ┌──────────────┐ │                            │
│ │ References(3)│ │  [Selected Reference]      │
│ ├──────────────┤ │                            │
│ │ 📄 file1.md  │ │  # Markdown Title          │
│ │ 🌐 *.json    │ │                            │
│ │ 📄 file2.md  │ │  Content rendered here...  │
│ └──────────────┘ │                            │
└────────────────────────────────────────────────┘
```

**Key Features**:

- **Two-Panel Layout**: References list (left) + content viewer (right)
- **File Loading**: Uses Tauri command `read_file_content` to load files
- **Loading State**: Shows spinner while loading
- **Error Handling**: Displays error message if file can't be read
- **Markdown Rendering**: Uses react-markdown with syntax highlighting
- **Selection Persistence**: Resets selection when switching skills
- **Empty State**: Shows message when skill has no references

**Reference List Item**:

```tsx
<div onClick={() => loadReferenceContent(ref.path, idx)}>
  <span>{ref.ref_type === 'glob' ? '🌐' : '📄'}</span>
  <div>
    <div>{ref.path.split('/').pop()}</div> {/* Filename */}
    <div>{ref.path}</div> {/* Full path */}
    {ref.required && <span>required</span>}
  </div>
</div>
```

**Tauri IPC Call**:

```tsx
const content = await invoke<string>('read_file_content', { path: ref.path });
```

---

### 8. ScriptsTab Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/ScriptsTab.tsx`

**Purpose**: Two-panel viewer for embedded scripts (list + code).

**Props**:

```tsx
interface ScriptsTabProps {
  skill: Skill;
}
```

**Layout**:

````
┌────────────────────────────────────────────────┐
│ [Script List 320px] │ [Code Viewer]          │
│ ┌─────────────────┐ │                        │
│ │ Scripts (2)     │ │  🐍 setup.py          │
│ ├─────────────────┤ │  python               │
│ │ 🐍 setup.py     │ │  45 lines             │
│ │ 🐚 install.sh   │ │  ───────────────      │
│ └─────────────────┘ │  ```python            │
│                     │  # Script content...  │
│                     │  ```                  │
└────────────────────────────────────────────────┘
````

**Key Features**:

- **Language Icons**: Emoji icons for different languages (🐍 Python, 🐚 Bash, etc.)
- **Syntax Highlighting**: Uses react-markdown + rehype-highlight
- **Line Count**: Shows number of lines for each script
- **Selection Persistence**: Resets selection when switching skills
- **Empty State**: Shows message when skill has no scripts

**Language Icon Mapping**:

```tsx
const icons: Record<string, string> = {
  py: '🐍',
  python: '🐍',
  js: '📜',
  javascript: '📜',
  ts: '🟦',
  typescript: '🟦',
  sh: '🐚',
  bash: '🐚',
  json: '📋',
  md: '📝',
  default: '📄',
};
```

**Script Rendering**:

```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
  {`\`\`\`${script.language}\n${script.content}\n\`\`\``}
</ReactMarkdown>
```

---

### 9. TriggerAnalysis Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/TriggerAnalysis.tsx`

**Purpose**: Analyze and display trigger keywords that would activate a skill.

**Props**:

```tsx
interface TriggerAnalysisProps {
  skill: Skill;
}
```

**Key Features**:

- **Trigger Pattern Analysis**: Uses `analyzeTriggers()` to extract keywords
- **Example Query Generation**: Uses `generateExampleQueries()` for suggestions
- **Category Color Coding**:
  - Action: Blue (`bg-blue-100 text-blue-700`)
  - Technology: Purple (`bg-purple-100 text-purple-700`)
  - Format: Green (`bg-green-100 text-green-700`)
  - Topic: Yellow (`bg-yellow-100 text-yellow-700`)
- **Statistics**: Shows count by category

**Layout**:

```
┌──────────────────────────────────────────────┐
│ Trigger Keywords                             │
│ [create (action)] [pdf (format)] [python]   │
│                                              │
│ Example Queries                              │
│ "create a pdf"                               │
│ "help me create pdf"                         │
│                                              │
│ Analysis Summary                             │
│ [5 Action Keywords] [3 Technology Keywords]  │
└──────────────────────────────────────────────┘
```

---

### 10. DiagramView Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/DiagramView.tsx`

**Purpose**: Interactive Mermaid diagram viewer with zoom/pan controls.

**Props**:

```tsx
interface DiagramViewProps {
  skill: Skill;
}
```

**State**:

```tsx
const [zoom, setZoom] = useState(1.0); // Zoom level (0.1 to 50)
const [position, setPosition] = useState({ x: 0, y: 0 }); // Pan position
const [isDragging, setIsDragging] = useState(false);
const [fontSize, setFontSize] = useState(48); // Base font size for diagram
```

**Key Features**:

- **Zoom Controls**: Zoom in/out/reset buttons + mouse wheel zoom
- **Pan/Drag**: Click and drag to move diagram
- **Font Size Control**: Input field to adjust diagram text size
- **Mermaid Integration**: Renders diagrams with `mermaid.run()`
- **Auto-regeneration**: Regenerates diagram when skill or fontSize changes

**Controls UI**:

```
┌────────────────────────────────────────────────┐
│ Skill Architecture                  [Controls] │
│ ┌────────────────────────────────────────────┐ │
│ │                                            │ │
│ │      [Mermaid Diagram Rendered Here]       │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘

Controls: [🔍−] [100%] [🔍+] [Reset] Font: [48] px
```

**Diagram Generation**:

```tsx
const diagram = generateSkillDiagram(skill); // Generate Mermaid syntax
containerRef.current.innerHTML = `<div class="mermaid">${diagram}</div>`;
mermaid.run({ nodes: [containerRef.current.querySelector('.mermaid')] });
```

---

### 11. KeyboardShortcutHelp Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/KeyboardShortcutHelp.tsx`

**Purpose**: Modal dialog showing all keyboard shortcuts (triggered by ? key).

**Props**:

```tsx
interface KeyboardShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Key Features**:

- **Platform-Aware Display**: Shows ⌘ on Mac, Ctrl on Windows/Linux
- **Grouped Shortcuts**: Organized by context (Search, Navigation, Tabs, List, Help)
- **Focus Trap**: Keeps Tab navigation within modal
- **Multiple Close Methods**:
  - Escape key
  - Close button (X)
  - Clicking overlay
- **Accessible**: Full ARIA attributes for screen readers

**Shortcut Groups**:

1. **Search**
   - `Cmd/Ctrl+F` - Focus search input
   - `Esc` - Clear search and unfocus

2. **Navigation**
   - `↓` - Move to next item
   - `↑` - Move to previous item
   - `Enter` - Select highlighted item
   - `Esc` - Clear selection

3. **Tabs**
   - `Cmd/Ctrl+1` - Overview tab
   - `Cmd/Ctrl+2` - Content tab
   - `Cmd/Ctrl+3` - Triggers tab
   - `Cmd/Ctrl+4` - Diagram tab
   - `Cmd/Ctrl+5` - References tab
   - `Cmd/Ctrl+6` - Scripts tab

4. **List**
   - `↓` - Highlight next skill
   - `↑` - Highlight previous skill
   - `Enter` - Select highlighted skill
   - `Esc` - Clear highlight

5. **Help**
   - `?` - Show this help
   - `Esc` - Close help

**Modal Layout**:

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="bg-white rounded-lg max-w-4xl">
    <div className="flex justify-between">
      <h2>Keyboard Shortcuts</h2>
      <button onClick={onClose}>X</button>
    </div>
    <div className="grid grid-cols-2 gap-8">
      {shortcutGroups.map((group) => (
        <div key={group.title}>
          <h3>{group.title}</h3>
          {group.shortcuts.map((shortcut) => (
            <div>
              <kbd>{shortcut.keys.join(' + ')}</kbd>
              <span>{shortcut.description}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
</div>
```

---

### 12. DescriptionSection Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/DescriptionSection.tsx`

**Purpose**: Display skill description (fallback component, now integrated into OverviewPanel).

**Props**:

```tsx
interface DescriptionSectionProps {
  skill: Skill;
}
```

**Note**: This component is currently standalone but its functionality has been absorbed into `OverviewPanel`. It extracts description from YAML metadata or `skill.description` field.

---

### 13. ErrorBoundary Component

**File**: `/Users/richardhightower/src/skill-debugger/src/components/ErrorBoundary.tsx`

**Purpose**: React error boundary to catch component errors and show fallback UI.

**Props**:

```tsx
interface Props {
  children: ReactNode;
}
```

**State**:

```tsx
interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}
```

**Key Features**:

- **Error Catching**: Uses `componentDidCatch` lifecycle method
- **Fallback UI**: Shows error message instead of blank screen
- **Error Details**: Expandable technical details (stack trace, component stack)
- **Recovery Options**:
  - Reload Application (full page reload)
  - Try Again (reset error boundary state)
- **Developer-Friendly**: Shows full error info for debugging

**Error UI Layout**:

```
┌────────────────────────────────────────┐
│          [Error Icon]                  │
│                                        │
│   Something Went Wrong                 │
│                                        │
│   The application encountered an       │
│   unexpected error...                  │
│                                        │
│   [Reload Application] [Try Again]     │
│                                        │
│   ▼ Technical Details (for debugging)  │
│     Error Message: ...                 │
│     Stack Trace: ...                   │
│     Component Stack: ...               │
└────────────────────────────────────────┘
```

---

## State Management (Zustand)

### Overview

Zustand is a minimal state management library (simpler than Redux). All state is stored in two stores:

1. **useSkillStore**: Skill data and selection
2. **useKeyboardStore**: Keyboard shortcuts state

### Store 1: useSkillStore

**File**: `/Users/richardhightower/src/skill-debugger/src/stores/useSkillStore.ts`

**Purpose**: Manage skill data, selection, loading, and errors.

**State Interface**:

```tsx
interface SkillStore {
  // State
  skills: Skill[]; // All loaded skills
  selectedSkill: Skill | null; // Currently selected skill
  isLoading: boolean; // Loading state
  error: string | null; // Error message

  // Actions
  setSkills: (skills: Skill[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

**Initial State**:

```tsx
{
  skills: [],
  selectedSkill: null,
  isLoading: false,
  error: null
}
```

**Usage Example**:

```tsx
// In a component
import { useSkillStore } from '../stores';

function MyComponent() {
  const skills = useSkillStore((state) => state.skills);
  const selectedSkill = useSkillStore((state) => state.selectedSkill);
  const selectSkill = useSkillStore((state) => state.selectSkill);

  return (
    <div>
      {skills.map((skill) => (
        <div onClick={() => selectSkill(skill)}>{skill.name}</div>
      ))}
    </div>
  );
}
```

**State Flow**:

```
useSkills hook (loads data)
  ↓
invoke('scan_skills') [Tauri backend]
  ↓
setSkills(result) [Update store]
  ↓
Components re-render (subscribed via useSkillStore)
```

---

### Store 2: useKeyboardStore

**File**: `/Users/richardhightower/src/skill-debugger/src/stores/keyboardStore.ts`

**Purpose**: Manage all keyboard shortcut state and platform detection.

**State Interface**:

```tsx
interface KeyboardState {
  // Focus state (US1: Search focus)
  searchFocusRequested: boolean;
  setSearchFocusRequested: (requested: boolean) => void;

  // List navigation state (US3: Arrow keys)
  highlightedSkillIndex: number | null;
  setHighlightedSkillIndex: (index: number | null) => void;
  visibleSkillCount: number;
  setVisibleSkillCount: (count: number) => void;

  // Tab navigation state (US2: Cmd/Ctrl+1-6)
  activeTabIndex: number | null;
  setActiveTabIndex: (index: number | null) => void;

  // Help modal state (US4: ? key)
  isHelpModalOpen: boolean;
  setHelpModalOpen: (open: boolean) => void;

  // Platform detection
  platform: PlatformType; // 'mac' | 'windows' | 'linux'
  modifierKey: ModifierKey; // 'Cmd' | 'Ctrl'
  modifierSymbol: ModifierSymbol; // '⌘' | 'Ctrl'
  detectPlatform: () => void;

  // Reset all keyboard state
  reset: () => void;
}
```

**Initial State**:

```tsx
{
  searchFocusRequested: false,
  highlightedSkillIndex: null,
  visibleSkillCount: 0,
  activeTabIndex: 0,
  isHelpModalOpen: false,
  platform: 'mac',
  modifierKey: 'Cmd',
  modifierSymbol: '⌘'
}
```

**Platform Detection**:

```tsx
detectPlatform: () => {
  const platformString = navigator.platform.toUpperCase();
  const isMac = platformString.indexOf('MAC') >= 0;
  const isWindows = platformString.indexOf('WIN') >= 0;

  const platform = isMac ? 'mac' : isWindows ? 'windows' : 'linux';
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  const modifierSymbol = isMac ? '⌘' : 'Ctrl';

  set({ platform, modifierKey, modifierSymbol });
};
```

**State Flow Example** (Search focus):

```
User presses Cmd/Ctrl+F
  ↓
useKeyboardShortcuts hook detects event
  ↓
setSearchFocusRequested(true)
  ↓
SearchBar component reacts to state change
  ↓
inputRef.current.focus()
  ↓
setSearchFocusRequested(false) [Reset flag]
```

---

## Custom Hooks

### 1. useSkills Hook

**File**: `/Users/richardhightower/src/skill-debugger/src/hooks/useSkills.ts`

**Purpose**: Load skills from backend and provide loading/error states.

**Returns**:

```tsx
{
  skills: Skill[];       // All loaded skills
  isLoading: boolean;    // Loading state
  error: string | null;  // Error message
  reload: () => void;    // Function to reload skills
}
```

**Implementation**:

```tsx
export function useSkills() {
  const { skills, isLoading, error, setSkills, setLoading, setError } = useSkillStore();

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Skill[]>('scan_skills'); // Tauri command
      setSkills(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills(); // Load on mount
  }, []);

  return { skills, isLoading, error, reload: loadSkills };
}
```

**Usage**:

```tsx
function SkillList() {
  const { skills, isLoading, error, reload } = useSkills();

  if (error)
    return (
      <div>
        {error} <button onClick={reload}>Retry</button>
      </div>
    );
  if (isLoading) return <div>Loading...</div>;

  return skills.map((skill) => <div>{skill.name}</div>);
}
```

---

### 2. useKeyboardShortcuts Hook

**File**: `/Users/richardhightower/src/skill-debugger/src/hooks/useKeyboardShortcuts.ts`

**Purpose**: Global keyboard event handler for all shortcuts.

**Returns**: void (side effects only)

**Shortcuts Handled**:

- `Cmd/Ctrl+F` - Focus search
- `Cmd/Ctrl+1-6` - Tab navigation
- `↓/↑` - List navigation
- `Escape` - Clear highlight/search
- `?` - Show help modal

**Implementation**:

```tsx
export function useKeyboardShortcuts(): void {
  const { isMac } = usePlatformModifier();
  const setSearchFocusRequested = useKeyboardStore((state) => state.setSearchFocusRequested);
  const setHelpModalOpen = useKeyboardStore((state) => state.setHelpModalOpen);
  const setActiveTabIndex = useKeyboardStore((state) => state.setActiveTabIndex);
  const setHighlightedSkillIndex = useKeyboardStore((state) => state.setHighlightedSkillIndex);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      const hasModifier = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl+F - Focus search
      if (key === 'f' && hasModifier) {
        event.preventDefault();
        setSearchFocusRequested(true);
        return;
      }

      // ? - Show help modal
      if (key === '?') {
        event.preventDefault();
        setHelpModalOpen(true);
        return;
      }

      // Cmd/Ctrl+1-6 - Tab navigation
      if (hasModifier && key >= '1' && key <= '6') {
        event.preventDefault();
        const tabIndex = parseInt(key, 10) - 1;
        setActiveTabIndex(tabIndex);
        return;
      }

      // Arrow keys - List navigation
      if (key === 'arrowdown' || key === 'arrowup') {
        event.preventDefault();
        const currentHighlight = useKeyboardStore.getState().highlightedSkillIndex;
        const currentCount = useKeyboardStore.getState().visibleSkillCount;
        // ... navigation logic
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac, ...otherDeps]);
}
```

**Usage**:

```tsx
function App() {
  useKeyboardShortcuts(); // Call once at root level

  return <Layout>...</Layout>;
}
```

---

### 3. useListNavigation Hook

**File**: `/Users/richardhightower/src/skill-debugger/src/hooks/useListNavigation.ts`

**Purpose**: Arrow key navigation for skill list.

**Props**:

```tsx
interface UseListNavigationProps {
  skillCount: number; // Total visible skills
  onSelectSkill: (index: number) => void; // Callback when Enter pressed
}
```

**Returns**:

```tsx
{
  highlightedIndex: number | null; // Currently highlighted index
}
```

**Key Features**:

- `↓` - Move to next item (wraps to first)
- `↑` - Move to previous item (wraps to last)
- `Enter` - Select highlighted item
- `Escape` - Clear highlight

**Implementation**:

```tsx
export const useListNavigation = ({ skillCount, onSelectSkill }: UseListNavigationProps) => {
  const highlightedIndex = useKeyboardStore((state) => state.highlightedSkillIndex);
  const setHighlightedIndex = useKeyboardStore((state) => state.setHighlightedSkillIndex);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (skillCount === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((current) => (current === null ? 0 : (current + 1) % skillCount));
          break;

        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((current) =>
            current === null ? skillCount - 1 : current === 0 ? skillCount - 1 : current - 1
          );
          break;

        case 'Enter':
          event.preventDefault();
          if (highlightedIndex !== null) {
            onSelectSkill(highlightedIndex);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setHighlightedIndex(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skillCount, onSelectSkill]);

  return { highlightedIndex };
};
```

---

### 4. usePlatformModifier Hook

**File**: `/Users/richardhightower/src/skill-debugger/src/hooks/usePlatformModifier.ts`

**Purpose**: Detect user's OS and return appropriate modifier key info.

**Returns**:

```tsx
interface PlatformModifier {
  platform: PlatformType; // 'mac' | 'windows' | 'linux'
  isMac: boolean; // True if macOS
  modifierKey: ModifierKey; // 'Cmd' | 'Ctrl'
  modifierSymbol: ModifierSymbol; // '⌘' | 'Ctrl'
}
```

**Implementation**:

```tsx
export function usePlatformModifier(): PlatformModifier {
  return useMemo(() => {
    const platformString = navigator.platform.toUpperCase();
    const isMac = platformString.indexOf('MAC') >= 0;
    const isWindows = platformString.indexOf('WIN') >= 0;

    const platform = isMac ? 'mac' : isWindows ? 'windows' : 'linux';
    const modifierKey = isMac ? 'Cmd' : 'Ctrl';
    const modifierSymbol = isMac ? '⌘' : 'Ctrl';

    return { platform, isMac, modifierKey, modifierSymbol };
  }, []); // Detect once on mount
}
```

**Usage**:

```tsx
function ShortcutDisplay() {
  const { modifierSymbol } = usePlatformModifier();
  return <div>{modifierSymbol} + F to search</div>;
}
```

---

## TypeScript Types

### Core Types

**File**: `/Users/richardhightower/src/skill-debugger/src/types/skill.ts`

```tsx
export interface Skill {
  name: string; // Skill name (from filename or metadata)
  description?: string; // Description from YAML or first paragraph
  location: string; // "claude" or "opencode"
  path: string; // Full filesystem path
  content: string; // Full markdown (including YAML frontmatter)
  content_clean: string; // Markdown without frontmatter
  references: Reference[]; // List of references
  scripts: Script[]; // List of scripts
  metadata?: Record<string, any>; // YAML frontmatter
}
```

**File**: `/Users/richardhightower/src/skill-debugger/src/types/reference.ts`

```tsx
export interface Reference {
  path: string; // File path or pattern
  ref_type: string; // "file", "glob", or "directory"
  required: boolean; // Whether this is a required reference
}
```

**File**: `/Users/richardhightower/src/skill-debugger/src/types/script.ts`

```tsx
export interface Script {
  name: string; // Script name or identifier
  language: string; // "bash", "python", "javascript", etc.
  content: string; // Script content
  line_number?: number; // Line number where script starts
}
```

---

### Keyboard Types

**File**: `/Users/richardhightower/src/skill-debugger/src/types/keyboard.ts`

```tsx
// Platform types
export type PlatformType = 'mac' | 'windows' | 'linux';
export type ModifierKey = 'Cmd' | 'Ctrl';
export type ModifierSymbol = '⌘' | 'Ctrl';

// Shortcut context
export type ShortcutContext = 'global' | 'list' | 'detail' | 'modal';

// Keyboard shortcut definition
export interface KeyboardShortcut {
  id: string; // Unique identifier
  label: string; // Human-readable label
  description: string; // What the shortcut does
  key: string; // Key code
  requiresModifier: boolean; // Cmd/Ctrl required
  requiresShift: boolean; // Shift required
  context: ShortcutContext; // Where shortcut is active
}

// Shortcut group for help modal
export interface ShortcutGroup {
  title: string; // Group title
  shortcuts: KeyboardShortcut[]; // Shortcuts in group
}

// Platform modifier info
export interface PlatformModifier {
  platform: PlatformType;
  isMac: boolean;
  modifierKey: ModifierKey;
  modifierSymbol: ModifierSymbol;
}
```

---

## Utilities

### 1. triggerAnalyzer.ts

**File**: `/Users/richardhightower/src/skill-debugger/src/utils/triggerAnalyzer.ts`

**Purpose**: Analyze skill content to extract trigger keywords and generate example queries.

**Exports**:

```tsx
export interface TriggerPattern {
  keyword: string; // Trigger keyword
  category: 'action' | 'topic' | 'technology' | 'format';
  confidence: 'high' | 'medium' | 'low';
}

export function analyzeTriggers(skill: Skill): TriggerPattern[];
export function generateExampleQueries(skill: Skill, patterns: TriggerPattern[]): string[];
```

**Algorithm**:

1. Combine skill name, description, and content
2. Search for action keywords (create, generate, build, analyze, etc.)
3. Extract technology keywords from skill name
4. Search for format keywords (pdf, excel, json, etc.)
5. Search for topic keywords in description
6. Remove duplicates and return patterns

**Usage**:

```tsx
const patterns = analyzeTriggers(skill);
// [{ keyword: 'create', category: 'action', confidence: 'high' }, ...]

const examples = generateExampleQueries(skill, patterns);
// ["create a pdf", "help me create pdf", ...]
```

---

### 2. diagramGenerator.ts

**File**: `/Users/richardhightower/src/skill-debugger/src/utils/diagramGenerator.ts`

**Purpose**: Generate Mermaid diagram syntax for skill architecture.

**Exports**:

```tsx
export function generateSkillDiagram(skill: Skill): string;
```

**Diagram Structure**:

```
graph TD
    SKILL[📦 skill-name]
    REFS[📚 References (3)]
    SKILL --> REFS
    REF0[📄 file1.md]
    REF1[📄 file2.md]
    REF2[📄 file3.md]
    REFS --> REF0
    REFS --> REF1
    REFS --> REF2
    SCRIPTS[⚙️ Scripts (2)]
    SKILL --> SCRIPTS
    SCRIPT0[🔧 setup.py]
    SCRIPT1[🔧 install.sh]
    SCRIPTS --> SCRIPT0
    SCRIPTS --> SCRIPT1
```

**Features**:

- Central skill node with custom styling
- Grouped references and scripts
- Color-coded nodes (blue for skill, green for references, orange for scripts)
- Horizontal grouping (3 items per row)
- Sanitizes text to prevent Mermaid syntax errors

---

### 3. keyboardUtils.ts

**File**: `/Users/richardhightower/src/skill-debugger/src/utils/keyboardUtils.ts`

**Purpose**: Keyboard shortcut utility functions.

**Exports**:

```tsx
export function groupShortcutsByContext(shortcuts: KeyboardShortcut[]): ShortcutGroup[];
export function formatKeyCombo(options: {
  key: string;
  requiresModifier: boolean;
  requiresShift: boolean;
  modifierSymbol: ModifierSymbol;
}): string;
export function checkKeyMatch(
  event: KeyboardEvent,
  shortcut: {
    key: string;
    requiresModifier: boolean;
    requiresShift: boolean;
    isMac: boolean;
  }
): boolean;
```

**Usage Examples**:

```tsx
// Group shortcuts by context
const grouped = groupShortcutsByContext(allShortcuts);
// [{ title: 'Global', shortcuts: [...] }, { title: 'List', shortcuts: [...] }]

// Format key combo for display
const formatted = formatKeyCombo({
  key: 'f',
  requiresModifier: true,
  requiresShift: false,
  modifierSymbol: '⌘',
});
// "⌘ F"

// Check if event matches shortcut
const matches = checkKeyMatch(event, {
  key: 'f',
  requiresModifier: true,
  requiresShift: false,
  isMac: true,
});
```

---

## UI Patterns

### 1. Tab Navigation System

**Implementation**: SkillViewer component

**Pattern**:

```tsx
const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'content', label: 'Content', icon: '📄' },
  // ... 6 tabs total
];

// Local state for active tab
const [activeTab, setActiveTab] = useState<TabType>('content');

// Sync with keyboard shortcuts
const activeTabIndex = useKeyboardStore((state) => state.activeTabIndex);
useEffect(() => {
  if (activeTabIndex !== null) {
    setActiveTab(TABS[activeTabIndex].id);
  }
}, [activeTabIndex]);

// Render tabs
<div className="flex gap-1">
  {TABS.map((tab, index) => (
    <button
      onClick={() => {
        setActiveTab(tab.id);
        setActiveTabIndex(index); // Update store for shortcuts
      }}
      className={activeTab === tab.id ? 'active' : 'inactive'}
    >
      {tab.icon} {tab.label}
    </button>
  ))}
</div>;
```

---

### 2. Search/Filter Functionality

**Implementation**: SkillList component

**Pattern**:

```tsx
const [searchQuery, setSearchQuery] = useState('');

// Filter skills with useMemo for performance
const filteredSkills = useMemo(() => {
  if (!searchQuery.trim()) return skills;

  const query = searchQuery.toLowerCase();
  return skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(query) ||
      skill.description?.toLowerCase().includes(query) ||
      skill.location.toLowerCase().includes(query)
  );
}, [skills, searchQuery]);

// Update visible count for keyboard navigation
useEffect(() => {
  setVisibleSkillCount(filteredSkills.length);
}, [filteredSkills.length]);

// Render search bar and filtered list
<SearchBar value={searchQuery} onChange={setSearchQuery} />;
{
  filteredSkills.map((skill) => <SkillListItem skill={skill} />);
}
```

---

### 3. Keyboard Shortcut Handling

**Implementation**: Multiple components + hooks

**Pattern**:

```tsx
// 1. Global handler (useKeyboardShortcuts hook)
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    // Check modifier key (Cmd on Mac, Ctrl on Windows)
    const hasModifier = isMac ? event.metaKey : event.ctrlKey;

    // Handle shortcut
    if (event.key === 'f' && hasModifier) {
      event.preventDefault();
      setSearchFocusRequested(true);
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isMac]);

// 2. Component reacts to state change
const searchFocusRequested = useKeyboardStore((state) => state.searchFocusRequested);
useEffect(() => {
  if (searchFocusRequested) {
    inputRef.current?.focus();
    setSearchFocusRequested(false); // Reset flag
  }
}, [searchFocusRequested]);
```

**Flow**:

```
User presses Cmd/Ctrl+F
  ↓
Global handler intercepts event
  ↓
Updates keyboard store: setSearchFocusRequested(true)
  ↓
SearchBar component reacts to state change
  ↓
Focuses input field
  ↓
Resets flag: setSearchFocusRequested(false)
```

---

### 4. Responsive Design Approach

**TailwindCSS Utility Classes**:

- **Flexbox Layouts**: `flex`, `flex-col`, `flex-1`
- **Spacing**: `p-4` (padding), `m-2` (margin), `gap-2` (flex gap)
- **Sizing**: `w-80` (fixed width), `h-full` (100% height)
- **Overflow**: `overflow-y-auto` (vertical scroll)
- **Colors**: `bg-blue-50`, `text-gray-900`, `border-gray-200`
- **States**: `hover:bg-gray-100`, `focus:ring-2`, `active:bg-blue-600`

**Layout Strategy**:

```tsx
// Full-height layout with fixed sidebar
<div className="flex h-screen bg-gray-50">
  <aside className="w-80 bg-white border-r flex flex-col">
    <div className="flex-shrink-0">Header</div>
    <div className="flex-1 overflow-y-auto">Scrollable Content</div>
  </aside>
  <main className="flex-1 flex flex-col">
    <div className="flex-shrink-0">Top Bar</div>
    <div className="flex-1 overflow-y-auto">Main Content</div>
  </main>
</div>
```

---

## Component Relationship Diagram

```
main.tsx
  ├─ <ErrorBoundary>
  │   └─ <App>
  │       ├─ useKeyboardShortcuts()  [Global keyboard handler]
  │       ├─ <Layout>
  │       │   ├─ Header (title/description)
  │       │   ├─ <SkillList>
  │       │   │   ├─ useSkills()  [Load skills from backend]
  │       │   │   ├─ <SearchBar>
  │       │   │   │   └─ Listens to keyboardStore.searchFocusRequested
  │       │   │   ├─ Stats Header (count, refresh)
  │       │   │   └─ <SkillListItem> (multiple)
  │       │   │       ├─ Highlights on hover/selection
  │       │   │       └─ Auto-scrolls when highlighted
  │       │   │
  │       │   └─ <SkillViewer>
  │       │       ├─ Back Button
  │       │       ├─ <OverviewPanel>
  │       │       │   ├─ Description
  │       │       │   ├─ Trigger Preview
  │       │       │   └─ Quick Stats (clickable)
  │       │       ├─ Tab Navigation (6 tabs)
  │       │       └─ Tab Content:
  │       │           ├─ Overview Tab (YAML metadata)
  │       │           ├─ Content Tab (Markdown)
  │       │           ├─ <TriggerAnalysis>
  │       │           ├─ <DiagramView>
  │       │           ├─ <ReferencesTab>
  │       │           └─ <ScriptsTab>
  │       │
  │       └─ <KeyboardShortcutHelp> (modal, conditional)
  │
  └─ Zustand Stores:
      ├─ useSkillStore (skills, selectedSkill, loading, error)
      └─ useKeyboardStore (focus, highlight, tabs, help, platform)
```

**Data Flow**:

```
Tauri Backend (Rust)
  ↓ [IPC: scan_skills command]
useSkills hook
  ↓ [Update store]
useSkillStore
  ↓ [Subscribe to state]
Components (SkillList, SkillViewer)
  ↓ [Render UI]
User Interactions
  ↓ [Keyboard shortcuts, clicks]
keyboardStore / skillStore
  ↓ [State updates]
Components re-render
```

---

## Performance Considerations

### 1. Memoization

**useMemo for expensive computations**:

```tsx
const filteredSkills = useMemo(() => {
  return skills.filter((skill) => skill.name.includes(query));
}, [skills, query]);

const triggerPatterns = useMemo(() => analyzeTriggers(skill), [skill]);
```

### 2. Zustand Subscriptions

**Subscribe to specific state slices** (not entire store):

```tsx
// Bad: Re-renders on any store change
const store = useSkillStore();

// Good: Only re-renders when selectedSkill changes
const selectedSkill = useSkillStore((state) => state.selectedSkill);
```

### 3. Lazy Loading

**Components render conditionally**:

```tsx
{
  activeTab === 'triggers' && <TriggerAnalysis skill={skill} />;
}
{
  activeTab === 'diagram' && <DiagramView skill={skill} />;
}
```

---

## Accessibility Features

1. **ARIA Attributes**:
   - `role="listbox"` on skill list
   - `role="option"` on skill items
   - `aria-selected` for selected items
   - `aria-activedescendant` for highlighted items
   - `role="dialog"` on modals

2. **Keyboard Navigation**:
   - Full keyboard support (no mouse required)
   - Focus management (Escape clears focus)
   - Tab trapping in modals

3. **Screen Reader Support**:
   - Semantic HTML (`<main>`, `<aside>`, `<button>`)
   - ARIA labels for icon-only buttons
   - Status announcements for loading/errors

---

## Testing Considerations

### Component Tests (Vitest + React Testing Library)

**Example test structure**:

```tsx
// SkillList.test.tsx
describe('SkillList', () => {
  it('filters skills by search query', () => {
    render(<SkillList />);
    const searchInput = screen.getByPlaceholderText('Search skills...');
    fireEvent.change(searchInput, { target: { value: 'pdf' } });
    expect(screen.getByText('pdf-skill')).toBeInTheDocument();
  });

  it('highlights skill on arrow down', () => {
    render(<SkillList />);
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(screen.getByTestId('skill-item-0')).toHaveAttribute('data-highlighted', 'true');
  });
});
```

### E2E Tests (Playwright)

**Example test flow**:

```typescript
test('search and select skill', async ({ page }) => {
  await page.goto('/');
  await page.fill('[placeholder="Search skills..."]', 'pdf');
  await page.keyboard.press('Enter');
  await expect(page.locator('text=PDF Skill')).toBeVisible();
});
```

---

## Future Enhancements

1. **Performance**:
   - Virtual scrolling for large skill lists (react-window)
   - Code splitting for tab components
   - Service worker for offline caching

2. **Features**:
   - Skill dependency graph visualization
   - Export skill data to JSON/CSV
   - Dark mode support
   - Customizable keyboard shortcuts

3. **Accessibility**:
   - High contrast mode
   - Font size adjustment
   - Screen reader optimization

---

## Conclusion

The Skill Debugger frontend is a well-structured React application with:

- **14 components** organized by responsibility
- **2 Zustand stores** for minimal, efficient state management
- **4 custom hooks** for reusable logic
- **Comprehensive TypeScript types** for type safety
- **Power-user features** including full keyboard navigation
- **Desktop-native performance** via Tauri integration

The architecture emphasizes developer experience, type safety, and keyboard-first workflows suitable for a developer tool.

---

**Document Version**: 1.0.0
**Last Review**: 2025-11-13
**Maintained By**: Skill Debugger Team
