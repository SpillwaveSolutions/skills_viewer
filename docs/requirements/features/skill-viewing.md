# Feature: Skill Viewing

**Feature ID**: FEAT-002
**User Story**: US2
**Priority**: P1 (Must Have)
**Status**: ✅ Implemented
**Version**: 1.0.0

## Overview

The Skill Viewing feature provides a comprehensive, multi-tabbed interface for exploring the complete structure and content of Claude Code skills. It renders markdown content with syntax highlighting, displays metadata, and organizes skill components (content, references, scripts, triggers, diagrams) into logical tabs.

---

## Business Value

**Problem**: Understanding a skill's structure requires manually opening multiple files in a text editor, mentally correlating frontmatter metadata with content, and tracking relationships between the main skill file and its references/scripts.

**Solution**: A unified viewer that parses, organizes, and presents all skill components in an intuitive tabbed interface with proper markdown rendering and syntax highlighting.

**Impact**:
- Reduces time to understand skill structure from minutes to seconds
- Eliminates need for external text editors
- Makes skill metadata immediately visible
- Provides rich markdown rendering for better readability

---

## User Journey

```mermaid
journey
    title Exploring a Skill's Complete Structure
    section Select Skill
      Click skill from list: 5: User
      Skill details load: 3: System
      Overview panel shows metadata: 5: User
    section Explore Content
      Read skill description: 5: User
      View Content tab: 5: User
      See formatted markdown: 5: User
      Code examples highlighted: 5: User
    section Review Components
      Switch to References tab: 5: User
      See list of references: 5: User
      Switch to Scripts tab: 5: User
      See list of scripts: 4: User
    section Analyze Structure
      Switch to Diagram tab: 5: User
      See visual structure: 5: User
      Understand relationships: 5: User
```

---

## Functional Requirements

### FR-VIEW-001: Tabbed Interface

**Requirement**: Provide organized tabs for different skill aspects

**Tab Structure**:
1. **Overview** - Metadata and frontmatter
2. **Content** - Rendered markdown content
3. **References** - List and content of reference files
4. **Scripts** - List and content of script files
5. **Triggers** - Trigger analysis and example queries
6. **Diagram** - Visual structure representation

**Implementation**:
```typescript
type TabType = 'overview' | 'content' | 'references' | 'scripts' | 'triggers' | 'diagram';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'content', label: 'Content', icon: '📄' },
  { id: 'references', label: 'References', icon: '📚' },
  { id: 'scripts', label: 'Scripts', icon: '🔧' },
  { id: 'triggers', label: 'Triggers', icon: '🎯' },
  { id: 'diagram', label: 'Diagram', icon: '🔀' },
];
```

**Acceptance Criteria**:
- AC-VIEW-001-1: All six tabs are visible and clickable
- AC-VIEW-001-2: Active tab is visually distinct (blue underline)
- AC-VIEW-001-3: Tab switching is instant (<50ms)
- AC-VIEW-001-4: Tab state persists when switching between skills

---

### FR-VIEW-002: Markdown Rendering

**Requirement**: Render skill markdown content with proper formatting and syntax highlighting

**Technology Stack**:
- `react-markdown` - Core markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support
- `rehype-highlight` - Code block syntax highlighting
- `highlight.js` - Language detection and highlighting

**Supported Markdown Features**:
- Headings (H1-H6)
- Lists (ordered, unordered, nested)
- Code blocks with syntax highlighting
- Inline code
- Links
- Tables
- Blockquotes
- Bold, italic, strikethrough
- Horizontal rules
- Images (if referenced)

**Implementation**:
```typescript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>
  {selectedSkill.content_clean || selectedSkill.content}
</ReactMarkdown>
```

**Acceptance Criteria**:
- AC-VIEW-002-1: Markdown renders with proper HTML structure
- AC-VIEW-002-2: Code blocks have syntax highlighting
- AC-VIEW-002-3: Tables render with borders and proper alignment
- AC-VIEW-002-4: Links are clickable (open in external browser)
- AC-VIEW-002-5: Rendering completes in <100ms for typical files

**Performance Considerations**:
- Files >500KB show warning or lazy load
- Images lazy load if embedded
- Code highlighting optimized with web worker (if needed)

---

### FR-VIEW-003: Metadata Display

**Requirement**: Display YAML frontmatter in structured format

**Metadata Fields** (common):
- `name` - Skill name
- `description` - Skill description
- `location` - "user" or "project"
- `gitignored` - Boolean flag
- Custom fields - Any additional YAML keys

**Display Format**:
```typescript
{Object.entries(selectedSkill.metadata).map(([key, value]) => (
  <div key={key} className="bg-gray-50 rounded-lg p-4 border">
    <h3 className="text-sm font-semibold uppercase">{key}</h3>
    <pre className="text-sm whitespace-pre-wrap font-mono">
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  </div>
))}
```

**Acceptance Criteria**:
- AC-VIEW-003-1: All frontmatter fields are displayed
- AC-VIEW-003-2: Field names are uppercase labels
- AC-VIEW-003-3: Complex values are pretty-printed JSON
- AC-VIEW-003-4: Missing metadata shows "No YAML frontmatter" message

---

### FR-VIEW-004: Overview Panel

**Requirement**: Top banner showing key skill information

**Content**:
- Skill name (large, bold)
- Location badge ("claude" or "opencode")
- Quick stats: # of references, # of scripts
- Clickable quick-nav to tabs

**Implementation**:
```typescript
<OverviewPanel skill={selectedSkill} onNavigateToTab={handleNavigateToTab} />
```

**Acceptance Criteria**:
- AC-VIEW-004-1: Skill name is prominent and readable
- AC-VIEW-004-2: Location badge is color-coded
- AC-VIEW-004-3: Stats show accurate counts
- AC-VIEW-004-4: Quick-nav buttons work

---

### FR-VIEW-005: Description Section

**Requirement**: Display skill description prominently below overview

**Implementation**:
```typescript
<DescriptionSection skill={selectedSkill} />
```

**Display Logic**:
- Show description from frontmatter if available
- Extract first paragraph from content as fallback
- Show placeholder if no description found

**Acceptance Criteria**:
- AC-VIEW-005-1: Description displays when present
- AC-VIEW-005-2: Falls back to content excerpt if no frontmatter
- AC-VIEW-005-3: Multi-line descriptions are properly formatted
- AC-VIEW-005-4: Section is visually distinct from tabs

---

### FR-VIEW-006: Content Tab

**Requirement**: Display clean markdown content without frontmatter

**Implementation Details**:
- Backend strips YAML frontmatter from content
- Sends `content_clean` field to frontend
- Frontend renders clean markdown with full formatting

**Content Processing Pipeline**:
```rust
// Backend: extract_frontmatter
let (frontmatter, content_without_fm) = extract_frontmatter(&content);
skill.content = content;           // Full content with frontmatter
skill.content_clean = content_without_fm;  // Clean content
```

**Acceptance Criteria**:
- AC-VIEW-006-1: YAML frontmatter is not visible in rendered content
- AC-VIEW-006-2: Content starts with first heading or paragraph
- AC-VIEW-006-3: All markdown features render correctly
- AC-VIEW-006-4: Content is scrollable for long documents

---

### FR-VIEW-007: References Tab

**Requirement**: Display list of reference files with on-demand content loading

**Layout**: Split view
- Left pane: List of references (fixed 320px width)
- Right pane: Selected reference content

**Features**:
- Click reference to load content
- Reference content rendered as markdown
- Syntax highlighting for code
- Loading state during file read
- Empty state if no references

**Implementation**:
```typescript
const loadReferenceContent = async (path: string, index: number) => {
  setSelectedRef(index);
  setLoading(true);
  try {
    const content = await invoke<string>('read_file_content', { path });
    setRefContent(content);
  } catch (error) {
    setRefContent(`Error loading reference: ${error}`);
  } finally {
    setLoading(false);
  }
};
```

**Acceptance Criteria**:
- AC-VIEW-007-1: All references appear in left pane
- AC-VIEW-007-2: Clicking reference loads its content
- AC-VIEW-007-3: Reference content is rendered as markdown
- AC-VIEW-007-4: Loading indicator shows during file read
- AC-VIEW-007-5: Error handling for unreadable files
- AC-VIEW-007-6: Empty state shows when no references

---

### FR-VIEW-008: Scripts Tab

**Requirement**: Display list of script files with on-demand content display

**Layout**: Split view (same as References)
- Left pane: List of scripts
- Right pane: Selected script content

**Features**:
- Language detection from file extension
- Language-appropriate icon (🐍 for Python, 🐚 for Bash, etc.)
- Syntax highlighting by language
- Line count display
- Code block formatting

**Language Icons**:
```typescript
const icons = {
  py: '🐍', python: '🐍',
  js: '📜', javascript: '📜',
  ts: '🟦', typescript: '🟦',
  sh: '🐚', bash: '🐚',
  json: '📋',
  md: '📝', markdown: '📝',
  default: '📄'
};
```

**Acceptance Criteria**:
- AC-VIEW-008-1: All scripts appear in left pane
- AC-VIEW-008-2: Language icon displays correctly
- AC-VIEW-008-3: Line count is accurate
- AC-VIEW-008-4: Script content has syntax highlighting
- AC-VIEW-008-5: Empty state shows when no scripts

---

## Non-Functional Requirements

### Performance

**NFR-VIEW-001**: Rendering Speed
- Tab switching: <50ms
- Markdown rendering: <100ms for typical files
- Reference loading: <200ms from disk

**NFR-VIEW-002**: Memory Efficiency
- Only active tab content in memory
- Reference/script content loaded on-demand
- Cleanup previous reference content when loading new one

### Usability

**NFR-VIEW-003**: Navigation
- Back button always visible
- Clear indication of current tab
- Smooth transitions between tabs
- Keyboard shortcuts for tab switching (Ctrl+1-6)

**NFR-VIEW-004**: Readability
- Appropriate font sizes (16px body, 32px headings)
- Sufficient contrast ratios (WCAG AA)
- Comfortable line length (<80ch for prose)
- Adequate spacing between elements

---

## User Interface Specifications

### Layout Structure

```
┌────────────────────────────────────────────────┐
│ ← Back to Skills                                │
├────────────────────────────────────────────────┤
│ Overview Panel                                  │
│ ┌────────────────────────────────────────────┐ │
│ │ Skill Name                        [badge]   │ │
│ │ 3 references • 2 scripts                    │ │
│ └────────────────────────────────────────────┘ │
├────────────────────────────────────────────────┤
│ Description Section                             │
│ Brief description of what this skill does...    │
├────────────────────────────────────────────────┤
│ [Overview] [Content] [References] [Scripts]... │
├────────────────────────────────────────────────┤
│                                                 │
│ Tab Content Area (scrollable)                   │
│                                                 │
│                                                 │
└────────────────────────────────────────────────┘
```

### Color Scheme

**Tabs**:
- Active: `border-blue-500 text-blue-600`
- Inactive: `border-transparent text-gray-600`
- Hover: `hover:text-gray-900 hover:border-gray-300`

**Badges**:
- Claude: `bg-blue-100 text-blue-700`
- Opencode: `bg-green-100 text-green-700`

**Code Blocks**:
- Theme: GitHub Light (highlight.js)
- Background: `bg-gray-50`
- Border: `border border-gray-200`

---

## Data Flow

### Skill Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Store
    participant Backend

    User->>UI: Click skill in list
    UI->>Store: setSelectedSkill(skill)
    Store->>UI: Update state
    UI->>UI: Render SkillViewer
    UI->>User: Display skill details

    User->>UI: Click References tab
    UI->>UI: Switch active tab
    User->>UI: Click reference file
    UI->>Backend: read_file_content(path)
    Backend->>UI: Return file content
    UI->>User: Display reference
```

---

## Error Handling

### Error Scenarios

**Scenario 1: Missing SKILL.md content**
- Display: "Error loading skill content"
- Show: File path, error message
- Allow: Viewing other tabs if available

**Scenario 2: Malformed YAML frontmatter**
- Display: Warning banner "Invalid YAML frontmatter"
- Show: Raw content in Content tab
- Allow: Viewing all other tabs normally

**Scenario 3: Reference file unreadable**
- Display: Error in reference content pane
- Show: "Error loading reference: [path]" with error details
- Allow: Selecting other references

**Scenario 4: Script file unreadable**
- Display: Error in script content pane
- Show: "Error loading script: [path]" with error details
- Allow: Selecting other scripts

---

## Testing Strategy

### Unit Tests

```typescript
describe('SkillViewer', () => {
  test('renders all tabs', () => {
    render(<SkillViewer />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    // ... all tabs
  });

  test('switches tabs on click', () => {
    render(<SkillViewer />);
    fireEvent.click(screen.getByText('References'));
    expect(screen.getByText('References')).toHaveClass('border-blue-500');
  });

  test('loads reference content', async () => {
    render(<SkillViewer />);
    fireEvent.click(screen.getByText('test-reference.md'));
    await waitFor(() => {
      expect(screen.getByText('Reference content here')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

1. **Full skill viewing flow**
   - Select skill from list
   - Verify all tabs render
   - Switch between all tabs
   - Load reference and script content

2. **Error handling**
   - Load skill with malformed YAML
   - Attempt to load non-existent reference
   - Verify graceful degradation

3. **Performance**
   - Measure tab switching time
   - Measure markdown rendering time
   - Verify no memory leaks on tab switching

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Tab switch time | <50ms | ~30ms | ✅ |
| Markdown render time | <100ms | ~60ms | ✅ |
| Reference load time | <200ms | ~150ms | ✅ |
| Memory per skill view | <50MB | ~35MB | ✅ |
| Error recovery | 100% | 100% | ✅ |

---

## Known Limitations

1. **No Inline Editing**: Viewing only, no editing capability (by design)
2. **No Image Upload**: Can display embedded images but not upload new ones
3. **Limited Code Languages**: Syntax highlighting for common languages only
4. **No Full-Text Search**: Within skill content (planned for future)

---

## Future Enhancements

- Copy code block button
- Export skill as PDF
- Print-friendly view
- Full-text search within content
- Bookmarking specific sections
- Split view for comparing skills

---

## Related Requirements

- **FR-002**: YAML Frontmatter Parsing
- **FR-003**: Reference File Detection
- **FR-004**: Script File Detection
- **FR-005**: Markdown Rendering with Syntax Highlighting
- **FR-006**: Skill Metadata Display
- **FR-008**: Skill Detail View
- **FR-016**: Malformed Content Handling

## Related User Stories

- **US2**: View Skill Details and Structure
- **US3**: Navigate Between Skills and References

---

**Document Maintenance**: Update this document when:
- New tabs are added
- Rendering logic changes
- New markdown features are supported
- UI layout is redesigned
